// File: tests/diagnose_signer_test.rs

use axum::http::{Request, HeaderMap, HeaderValue};
use axum::body::Body;
use tower::ServiceExt;
use serde_json::{json, Value};
use std::collections::HashMap;

#[tokio::test]
async fn diagnose_signer_address() {
    println!("\n=== DIAGNOSE SIGNER ADDRESS ===\n");
    
    // Generate test account
    let (private_key, (key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
    println!("Key ID: {}", key_id);
    
    // Create server
    let app = weavedb::server_db::create_router(
        "test-signer-diag".to_string(),
        ".test-signer-diag".to_string()
    );
    
    // First, let's see what happens with a simple operation
    {
        println!("\n1. Testing what signer address the system sees");
        
        // Use a custom init that will capture the signer
        let result = execute_write(&app, &private_key, &key_id, 
            json!(["init", "_", {
                "id": "test-signer-diag", 
                "owner": "PLACEHOLDER_WILL_BE_REPLACED"
            }]), 
            "1"
        ).await;
        
        println!("Init result: {}", result);
        
        // Now let's try an operation that will fail with auth
        // This should show us the actual signer value
        let result = execute_write(&app, &private_key, &key_id,
            json!(["addIndex", [["test", "asc"]], "users"]),
            "2"
        ).await;
        
        println!("\nAddIndex result: {}", result);
        
        // The error message should reveal something
        if let Some(error) = result.get("error").and_then(|e| e.as_str()) {
            println!("Error details: {}", error);
        }
    }
    
    // Let's also test different address calculation methods
    {
        println!("\n2. Testing different address calculations:");
        
        // Method 1: SHA256 of the public key
        use sha2::{Sha256, Digest};
        use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
        
        let pub_bytes = URL_SAFE_NO_PAD.decode(&key_id).unwrap();
        let mut hasher = Sha256::new();
        hasher.update(&pub_bytes);
        let hash = hasher.finalize();
        let address1 = URL_SAFE_NO_PAD.encode(&hash);
        println!("SHA256(pubkey) address: {}", address1);
        
        // Method 2: Direct use of key_id
        println!("Direct key_id: {}", key_id);
        
        // Method 3: Try to match Arweave address format
        // Arweave uses SHA256 of the 'n' component of RSA key
        println!("Testing with calculated address as owner...");
        
        // Create a new instance
        let app2 = weavedb::server_db::create_router(
            "test-signer-diag2".to_string(),
            ".test-signer-diag2".to_string()
        );
        
        // Try with the calculated address
        let result = execute_write(&app2, &private_key, &key_id, 
            json!(["init", "_", {
                "id": "test-signer-diag2", 
                "owner": address1.clone()
            }]), 
            "1"
        ).await;
        
        if result["success"].as_bool().unwrap_or(false) {
            // Now try addIndex
            let result = execute_write(&app2, &private_key, &key_id,
                json!(["addIndex", [["test", "asc"]], "users"]),
                "2"
            ).await;
            
            println!("\nWith calculated address as owner:");
            println!("AddIndex result: {}", result);
        }
    }
    
    // Let's examine the actual verification process
    {
        println!("\n3. Manual signature verification test");
        
        // Create headers manually
        let mut headers = HashMap::new();
        headers.insert("query".to_string(), json!(["get", "test"]).to_string());
        headers.insert("nonce".to_string(), "1".to_string());
        headers.insert("id".to_string(), "test".to_string());
        
        // Sign them
        let signed = weavedb::sign::sign_headers(
            headers.clone(),
            &["query".to_string(), "nonce".to_string(), "id".to_string()],
            &private_key,
            &key_id,
            "sig1"
        ).unwrap();
        
        println!("\nSigned headers:");
        for (k, v) in &signed {
            if k == "signature" || k.contains("signature") {
                println!("  {}: {}", k, &v[..50.min(v.len())]);
            } else {
                println!("  {}: {}", k, v);
            }
        }
        
        // Extract keyid from signature-input
        if let Some(sig_input) = signed.get("signature-input") {
            if let Some(keyid_start) = sig_input.find("keyid=\"") {
                let keyid_end = sig_input[keyid_start+7..].find("\"").unwrap_or(0);
                let extracted_keyid = &sig_input[keyid_start+7..keyid_start+7+keyid_end];
                println!("\nExtracted keyid from signature: {}", extracted_keyid);
                
                // This should match our key_id
                println!("Original key_id: {}", key_id);
                println!("Keys match: {}", extracted_keyid == key_id);
            }
        }
    }
    
    println!("\n=== DIAGNOSIS COMPLETE ===");
    println!("The issue is likely in how the signer address is calculated from the signature");
}

// Helper functions
async fn execute_write(
    app: &axum::Router,
    private_key: &str,
    key_id: &str,
    query: Value,
    nonce: &str
) -> Value {
    let headers = create_signed_headers(private_key, key_id, query.to_string(), nonce);
    
    let request = Request::builder()
        .method("POST")
        .uri("/~weavedb@1.0/set")
        .body(Body::empty())
        .unwrap();
    
    let request = add_headers(request, headers);
    
    let response = app.clone()
        .oneshot(request)
        .await
        .unwrap();
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    serde_json::from_slice(&body).unwrap()
}

fn create_signed_headers(
    private_key: &str,
    key_id: &str,
    query: String,
    nonce: &str
) -> HashMap<String, String> {
    let mut headers = HashMap::new();
    headers.insert("query".to_string(), query);
    headers.insert("nonce".to_string(), nonce.to_string());
    headers.insert("id".to_string(), "test-signer-diag".to_string());
    
    weavedb::sign::sign_headers(
        headers,
        &["query".to_string(), "nonce".to_string(), "id".to_string()],
        private_key,
        key_id,
        "sig1"
    ).unwrap()
}

fn add_headers(mut request: Request<Body>, headers: HashMap<String, String>) -> Request<Body> {
    let headers_mut = request.headers_mut();
    for (key, value) in headers {
        headers_mut.insert(
            axum::http::HeaderName::from_bytes(key.as_bytes()).unwrap(),
            HeaderValue::from_str(&value).unwrap()
        );
    }
    request
}
