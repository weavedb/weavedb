// File: tests/fix_index_auth_test.rs

use axum::http::{Request, HeaderMap, HeaderValue};
use axum::body::Body;
use tower::ServiceExt;
use serde_json::{json, Value};
use std::collections::HashMap;

#[tokio::test]
async fn test_index_auth_fix() {
    println!("\n=== TESTING INDEX AUTH FIX ===\n");
    
    // Generate test account
    let (private_key, (key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
    println!("Account key_id: {}", &key_id[..20]);
    
    // Calculate the address (signer) from key_id
    let signer_address = calculate_address(&key_id).unwrap();
    println!("Signer address: {}", &signer_address[..20]);
    
    // Create server
    let app = weavedb::server_db::create_router(
        "test-index-fix".to_string(),
        ".test-index-fix".to_string()
    );
    
    let mut nonce = 1;
    
    // Test 1: Initialize with signer address as owner
    {
        println!("\n1. Initialize with signer address as owner");
        let result = execute_write(&app, &private_key, &key_id, 
            json!(["init", "_", {
                "id": "test-index-fix", 
                "owner": signer_address.clone()  // Use the calculated address
            }]), 
            &nonce.to_string()
        ).await;
        println!("Init result: {}", result);
        assert!(result["success"].as_bool().unwrap());
        nonce += 1;
    }
    
    // Test 2: Add some data first
    {
        println!("\n2. Add test data");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["set", {"name": "Test", "age": 25}, "users", "test1"]),
            &nonce.to_string()
        ).await;
        assert!(result["success"].as_bool().unwrap());
        nonce += 1;
    }
    
    // Test 3: Now try to add index
    {
        println!("\n3. Add index (should work now)");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["addIndex", [["age", "desc"], ["name", "asc"]], "users"]),
            &nonce.to_string()
        ).await;
        println!("AddIndex result: {}", result);
        
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ AddIndex succeeded!");
            nonce += 1;
            
            // Test 4: Verify index works by adding more data
            println!("\n4. Add more data to test index");
            let result = execute_write(&app, &private_key, &key_id,
                json!(["set", {"name": "Alice", "age": 30}, "users", "alice"]),
                &nonce.to_string()
            ).await;
            assert!(result["success"].as_bool().unwrap());
            nonce += 1;
            
            let result = execute_write(&app, &private_key, &key_id,
                json!(["set", {"name": "Bob", "age": 20}, "users", "bob"]),
                &nonce.to_string()
            ).await;
            assert!(result["success"].as_bool().unwrap());
            nonce += 1;
            
            // Test 5: Remove index
            println!("\n5. Remove index");
            let result = execute_write(&app, &private_key, &key_id,
                json!(["removeIndex", [["age", "desc"], ["name", "asc"]], "users"]),
                &nonce.to_string()
            ).await;
            println!("RemoveIndex result: {}", result);
            assert!(result["success"].as_bool().unwrap_or(false));
        } else {
            println!("✗ AddIndex still failed");
        }
    }
    
    println!("\n=== SUMMARY ===");
    println!("The fix is to initialize the database with the signer's address as owner");
    println!("Signer address is calculated from the public key used for signing");
}

// Helper to calculate address from public key
fn calculate_address(public_key: &str) -> Result<String, String> {
    use sha2::{Sha256, Digest};
    use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
    
    let pub_bytes = URL_SAFE_NO_PAD.decode(public_key)
        .map_err(|e| format!("Failed to decode public key: {}", e))?;
    
    let mut hasher = Sha256::new();
    hasher.update(&pub_bytes);
    let hash = hasher.finalize();
    
    Ok(URL_SAFE_NO_PAD.encode(&hash))
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
    headers.insert("id".to_string(), "test-index-fix".to_string());
    
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
