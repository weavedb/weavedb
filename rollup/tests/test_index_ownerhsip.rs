// File: tests/test_index_ownership.rs

use axum::http::{Request, HeaderMap, HeaderValue};
use axum::body::Body;
use tower::ServiceExt;
use serde_json::{json, Value};
use std::collections::HashMap;

#[tokio::test]
async fn test_index_ownership() {
    println!("\n=== TEST INDEX OWNERSHIP ===\n");
    
    // Generate test account
    let (private_key, (key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
    println!("Account key_id: {}", key_id);
    
    // Calculate the address from the key_id
    use sha2::{Sha256, Digest};
    use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
    
    let pub_bytes = URL_SAFE_NO_PAD.decode(&key_id).unwrap();
    let mut hasher = Sha256::new();
    hasher.update(&pub_bytes);
    let hash = hasher.finalize();
    let address = URL_SAFE_NO_PAD.encode(&hash);
    
    println!("Account address: {}", address);
    
    // Create server
    let app = weavedb::server_db::create_router(
        "test-index-db".to_string(),
        ".test-index".to_string()
    );
    
    let mut nonce = 1;
    
    // Initialize with the address as owner
    {
        println!("\n1. Initializing DB with owner = {}", address);
        let result = execute_write(&app, &private_key, &key_id, 
            json!(["init", "_", {"id": "test-index-db", "owner": address.clone()}]), 
            &nonce.to_string()
        ).await;
        println!("Init result: {}", result);
        assert!(result["success"].as_bool().unwrap());
        nonce += 1;
    }
    
    // Try to add an index
    {
        println!("\n2. Attempting to add index as owner");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["addIndex", [["age", "desc"]], "users"]),
            &nonce.to_string()
        ).await;
        println!("AddIndex result: {}", result);
        
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ AddIndex succeeded as owner!");
            nonce += 1;
        } else {
            println!("✗ AddIndex failed even as owner");
            println!("Error: {}", result["error"].as_str().unwrap_or("unknown"));
        }
    }
    
    // Let's also test with a different approach - use key_id as owner
    {
        println!("\n3. Try another DB with key_id as owner");
        let app2 = weavedb::server_db::create_router(
            "test-index-db2".to_string(),
            ".test-index2".to_string()
        );
        
        let result = execute_write(&app2, &private_key, &key_id, 
            json!(["init", "_", {"id": "test-index-db2", "owner": key_id.clone()}]), 
            "1"
        ).await;
        println!("Init result: {}", result);
        
        if result["success"].as_bool().unwrap() {
            let result = execute_write(&app2, &private_key, &key_id,
                json!(["addIndex", [["age", "desc"]], "users"]),
                "2"
            ).await;
            println!("AddIndex with key_id owner result: {}", result);
        }
    }
    
    println!("\nConclusion:");
    println!("The auth module is checking if signer == owner");
    println!("But signer is derived from the signature, which gives an address");
    println!("While owner might be set as key_id during init");
    println!("These need to match for index operations to work");
}

// Helper functions (same as before)
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
    headers.insert("id".to_string(), headers.get("id").unwrap_or(&"test-index-db".to_string()).clone());
    
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
