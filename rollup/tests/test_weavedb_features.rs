// File: tests/working_index_test.rs

use axum::http::{Request, HeaderMap, HeaderValue};
use axum::body::Body;
use tower::ServiceExt;
use serde_json::{json, Value};
use std::collections::HashMap;

#[tokio::test]
async fn test_working_index_operations() {
    println!("\n=== WORKING INDEX OPERATIONS TEST ===\n");
    
    // Generate test account
    let (private_key, (key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
    println!("Key ID length: {} chars", key_id.len());
    
    // Calculate the signer address using the same method as normalize.rs
    let signer_address = calculate_signer_address(&key_id).unwrap();
    println!("Signer address: {}", signer_address);
    
    // Create server
    let app = weavedb::server_db::create_router(
        "test-working-index".to_string(),
        ".test-working-index".to_string()
    );
    
    let mut nonce = 1;
    
    // 1. Initialize with correct owner
    {
        println!("\n1. Initialize with signer address as owner");
        let result = execute_write(&app, &private_key, &key_id, 
            json!(["init", "_", {
                "id": "test-working-index", 
                "owner": signer_address.clone()
            }]), 
            &nonce.to_string()
        ).await;
        println!("Init result: {}", result);
        assert!(result["success"].as_bool().unwrap());
        nonce += 1;
    }
    
    // 2. Add some test data
    {
        println!("\n2. Add test data");
        let users = vec![
            ("alice", json!({"name": "Alice", "age": 30, "city": "NYC"})),
            ("bob", json!({"name": "Bob", "age": 25, "city": "LA"})),
            ("charlie", json!({"name": "Charlie", "age": 35, "city": "Chicago"})),
        ];
        
        for (id, data) in users {
            let result = execute_write(&app, &private_key, &key_id,
                json!(["set", data, "users", id]),
                &nonce.to_string()
            ).await;
            assert!(result["success"].as_bool().unwrap(), "Failed to add {}", id);
            nonce += 1;
        }
    }
    
    // 3. Add index
    {
        println!("\n3. Add compound index [age desc, name asc]");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["addIndex", [["age", "desc"], ["name", "asc"]], "users"]),
            &nonce.to_string()
        ).await;
        println!("AddIndex result: {}", result);
        assert!(result["success"].as_bool().unwrap(), "AddIndex failed");
        nonce += 1;
        println!("✓ Index added successfully!");
    }
    
    // 4. Add another index
    {
        println!("\n4. Add single field index [city asc]");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["addIndex", [["city", "asc"]], "users"]),
            &nonce.to_string()
        ).await;
        println!("AddIndex result: {}", result);
        assert!(result["success"].as_bool().unwrap(), "AddIndex failed");
        nonce += 1;
    }
    
    // 5. Update data (should update indexes)
    {
        println!("\n5. Update user data");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["update", {"age": 40}, "users", "bob"]),
            &nonce.to_string()
        ).await;
        assert!(result["success"].as_bool().unwrap(), "Update failed");
        nonce += 1;
        println!("✓ Updated Bob's age to 40");
    }
    
    // 6. Remove an index
    {
        println!("\n6. Remove city index");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["removeIndex", [["city", "asc"]], "users"]),
            &nonce.to_string()
        ).await;
        println!("RemoveIndex result: {}", result);
        assert!(result["success"].as_bool().unwrap(), "RemoveIndex failed");
        nonce += 1;
        println!("✓ Index removed successfully!");
    }
    
    // 7. Test with a different user (should fail)
    {
        println!("\n7. Test with different user (should fail)");
        let (other_private_key, (other_key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
        let other_signer = calculate_signer_address(&other_key_id).unwrap();
        println!("Other signer address: {}", other_signer);
        
        let result = execute_write(&app, &other_private_key, &other_key_id,
            json!(["addIndex", [["name", "asc"]], "users"]),
            "1"  // nonce 1 for new user
        ).await;
        println!("AddIndex with different user: {}", result);
        assert!(!result["success"].as_bool().unwrap_or(false));
        assert!(result["error"].as_str().unwrap_or("").contains("only owner"));
        println!("✓ Correctly rejected non-owner");
    }
    
    println!("\n=== ALL INDEX OPERATIONS WORKING! ===");
    println!("\nKey insights:");
    println!("1. Owner must be set to the signer's address (SHA256 of public key)");
    println!("2. Only the owner can add/remove indexes");
    println!("3. Index operations work correctly when auth passes");
}

// Calculate signer address exactly like normalize.rs does
fn calculate_signer_address(keyid: &str) -> Result<String, String> {
    use sha2::{Sha256, Digest};
    use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
    
    let pub_bytes = URL_SAFE_NO_PAD.decode(keyid)
        .map_err(|e| format!("Base64 decode error: {}", e))?;
    
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
    headers.insert("id".to_string(), "test-working-index".to_string());
    
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
