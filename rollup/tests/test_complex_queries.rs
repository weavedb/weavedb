// File: tests/test_complex_queries.rs

use axum::http::{Request, HeaderMap, HeaderValue};
use axum::body::Body;
use tower::ServiceExt;
use serde_json::{json, Value};
use std::collections::HashMap;

// Test data
fn get_test_users() -> (Value, Value, Value, Value) {
    let bob = json!({
        "name": "Bob",
        "age": 20,
        "favs": ["apple", "orange", "grape"]
    });
    
    let alice = json!({
        "name": "Alice",
        "age": 30,
        "favs": ["apple", "peach"]
    });
    
    let mike = json!({
        "name": "Mike",
        "age": 40,
        "favs": ["lemon", "peach"]
    });
    
    let beth = json!({
        "name": "Beth",
        "age": 50,
        "favs": ["peach", "kiwi"]
    });
    
    (bob, alice, mike, beth)
}

#[tokio::test]
async fn test_complex_queries_with_indexes() {
    println!("\n=== COMPLEX QUERIES AND INDEXER TEST ===\n");
    
    // Get test data
    let (bob, alice, mike, beth) = get_test_users();
    
    // Generate test account
    let (private_key, (key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
    let signer_address = calculate_signer_address(&key_id).unwrap();
    println!("Generated test account with address: {}", signer_address);
    
    // Create server
    let app = weavedb::server_db::create_router(
        "test-complex-db".to_string(),
        ".test-complex".to_string()
    );
    
    let mut nonce = 1;
    
    // Initialize database with correct owner
    {
        println!("Step 1: Initialize database");
        let init_query = json!(["init", "_", {
            "id": "test-complex-db", 
            "owner": signer_address.clone()
        }]);
        println!("Init query: {}", init_query);
        
        let result = execute_write(&app, &private_key, &key_id, 
            init_query,
            &nonce.to_string()
        ).await;
        
        println!("Init result: {}", result);
        
        // Check what's in the result
        if let Some(success) = result.get("success") {
            assert!(success.as_bool().unwrap_or(false), "Init failed with success=false");
        } else if let Some(error) = result.get("error") {
            panic!("Init failed with error: {}", error);
        } else {
            panic!("Init returned unexpected format: {}", result);
        }
        
        nonce += 1;
    }
    
    // Batch insert users
    {
        println!("\nStep 2: Batch insert users");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["batch",
                ["set", bob.clone(), "users", "bob"],
                ["set", alice.clone(), "users", "alice"],
                ["set", mike.clone(), "users", "mike"],
                ["set", beth.clone(), "users", "beth"]
            ]),
            &nonce.to_string()
        ).await;
        println!("Batch result: {}", result);
        assert!(result["success"].as_bool().unwrap_or(false), "Batch operation failed");
        nonce += 1;
    }
    
    // Verify basic get
    {
        println!("\nStep 3: Verify basic get operations");
        
        // Get all users
        let result = execute_get(&app, &private_key, &key_id, json!(["get", "users"]), &nonce.to_string()).await;
        println!("All users result: {}", result);
        
        if let Some(users) = result.get("res")
            .and_then(|r| r.get("state"))
            .and_then(|s| s.get("read_result"))
            .and_then(|r| r.as_array()) {
            
            println!("Found {} users", users.len());
            
            // Verify we have 4 unique users
            let names: Vec<&str> = users.iter()
                .filter_map(|u| u.get("name")?.as_str())
                .collect();
            
            println!("User names: {:?}", names);
            
            // Check that we have all 4 users
            assert!(names.contains(&"Bob"), "Bob not found");
            assert!(names.contains(&"Alice"), "Alice not found");
            assert!(names.contains(&"Mike"), "Mike not found");
            assert!(names.contains(&"Beth"), "Beth not found");
        }
        
        // Get specific user
        let result = execute_get(&app, &private_key, &key_id, json!(["get", "users", "bob"]), &nonce.to_string()).await;
        println!("Bob: {}", result);
        
        if let Some(bob_data) = result.get("res")
            .and_then(|r| r.get("state"))
            .and_then(|s| s.get("read_result")) {
            
            assert_eq!(bob_data.get("name"), Some(&json!("Bob")));
            assert_eq!(bob_data.get("age"), Some(&json!(20)));
        }
    }
    
    // Add compound index
    {
        println!("\nStep 4: Add compound index [age desc, name asc]");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["addIndex", [
                ["age", "desc"],
                ["name", "asc"]
            ], "users"]),
            &nonce.to_string()
        ).await;
        println!("AddIndex result: {}", result);
        assert!(result["success"].as_bool().unwrap(), "Failed to add index");
        nonce += 1;
    }
    
    // Test queries with indexes
    {
        println!("\nStep 5: Test complex queries after indexing");
        
        // Query with sort
        let query = json!(["get", "users", ["age", "desc"]]);
        println!("Query with sort: {:?}", query);
        let result = execute_get(&app, &private_key, &key_id, query, &nonce.to_string()).await;
        println!("Sort result: {}", result);
        
        if let Some(users) = result.get("res")
            .and_then(|r| r.get("state"))
            .and_then(|s| s.get("read_result"))
            .and_then(|r| r.as_array()) {
            
            // Verify sort order (desc by age)
            let ages: Vec<i64> = users.iter()
                .filter_map(|u| u.get("age")?.as_i64())
                .collect();
            
            println!("Ages in result: {:?}", ages);
            
            // Should be sorted descending
            for i in 1..ages.len() {
                assert!(ages[i-1] >= ages[i], "Results not sorted by age desc");
            }
        }
        
        // Range query
        let query = json!(["get", "users", ["age", ">", 25], ["age", "<=", 45]]);
        println!("Range query: {:?}", query);
        let result = execute_get(&app, &private_key, &key_id, query, &nonce.to_string()).await;
        println!("Range result: {}", result);
        
        if let Some(users) = result.get("res")
            .and_then(|r| r.get("state"))
            .and_then(|s| s.get("read_result"))
            .and_then(|r| r.as_array()) {
            
            // Should have Alice (30) and Mike (40)
            let names: Vec<&str> = users.iter()
                .filter_map(|u| u.get("name")?.as_str())
                .collect();
            
            println!("Names in range result: {:?}", names);
            assert!(names.contains(&"Alice"));
            assert!(names.contains(&"Mike"));
            assert!(!names.contains(&"Bob")); // age 20, too young
            assert!(!names.contains(&"Beth")); // age 50, too old
        }
    }
    
    // Update document
    {
        println!("\nStep 6: Update document and verify");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["update", {"age": 60}, "users", "bob"]),
            &nonce.to_string()
        ).await;
        println!("Update result: {}", result);
        assert!(result["success"].as_bool().unwrap_or(false), "Update failed");
        nonce += 1;
        
        // Verify update
        let result = execute_get(&app, &private_key, &key_id, json!(["get", "users", "bob"]), &nonce.to_string()).await;
        if let Some(bob_data) = result.get("res")
            .and_then(|r| r.get("state"))
            .and_then(|s| s.get("read_result")) {
            
            assert_eq!(bob_data.get("age"), Some(&json!(60)));
        }
    }
    
    // Delete document
    {
        println!("\nStep 7: Delete document and verify");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["del", "users", "beth"]),
            &nonce.to_string()
        ).await;
        println!("Delete result: {}", result);
        assert!(result["success"].as_bool().unwrap_or(false), "Delete failed");
        nonce += 1;
        
        // Verify deletion
        let result = execute_get(&app, &private_key, &key_id, json!(["get", "users"]), &nonce.to_string()).await;
        if let Some(users) = result.get("res")
            .and_then(|r| r.get("state"))
            .and_then(|s| s.get("read_result"))
            .and_then(|r| r.as_array()) {
            
            let names: Vec<&str> = users.iter()
                .filter_map(|u| u.get("name")?.as_str())
                .collect();
            
            assert!(!names.contains(&"Beth"), "Beth should be deleted");
        }
    }
    
    println!("\n✅ Complex query test completed!");
}

// Calculate signer address from key ID
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

// Helper function to execute write operations
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

// Helper function to execute get operations
async fn execute_get(
    app: &axum::Router, 
    private_key: &str,
    key_id: &str,
    query: Value,
    nonce: &str
) -> Value {
    let headers = create_signed_headers(private_key, key_id, query.to_string(), nonce);
    
    let mut header_map = HeaderMap::new();
    for (key, value) in headers {
        header_map.insert(
            axum::http::HeaderName::from_bytes(key.as_bytes()).unwrap(),
            HeaderValue::from_str(&value).unwrap()
        );
    }
    
    let request = Request::builder()
        .method("GET")
        .uri("/~weavedb@1.0/get")
        .body(Body::empty())
        .unwrap();
    
    let request = add_header_map(request, header_map);
    
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
    headers.insert("id".to_string(), "test-complex-db".to_string());
    
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

fn add_header_map(mut request: Request<Body>, headers: HeaderMap) -> Request<Body> {
    let headers_mut = request.headers_mut();
    for (key, value) in headers {
        if let Some(key) = key {
            headers_mut.insert(key, value);
        }
    }
    request
}
