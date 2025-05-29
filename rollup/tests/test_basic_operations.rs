// File: tests/test_basic_operations.rs

use axum::http::{Request, HeaderMap, HeaderValue};
use axum::body::Body;
use tower::ServiceExt;
use serde_json::{json, Value};
use std::collections::HashMap;

#[tokio::test]
async fn test_basic_operations() {
    println!("\n=== BASIC OPERATIONS TEST ===\n");
    
    // Generate test account
    let (private_key, (key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
    
    // Create server
    let app = weavedb::server_db::create_router(
        "test-basic-db".to_string(),
        ".test-basic-ops".to_string()
    );
    
    let mut nonce = 1;
    
    // Initialize database
    {
        println!("1. Testing init operation");
        let result = execute_write(&app, &private_key, &key_id, 
            json!(["init", "_", {"id": "test-basic-db", "owner": "test"}]), 
            &nonce.to_string()
        ).await;
        println!("Init result: {}", result);
        assert!(result["success"].as_bool().unwrap_or(false), "Init failed");
        nonce += 1;
    }
    
    // Test different operation formats
    let test_doc = json!({ "name": "Test", "age": 25 });
    
    // Test plain set
    {
        println!("\n2. Testing plain 'set' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["set", test_doc.clone(), "users", "test1"]),
            &nonce.to_string()
        ).await;
        println!("Plain set result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ Plain 'set' works!");
            nonce += 1;
        }
    }
    
    // Test typed set
    {
        println!("\n3. Testing typed 'set:user' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["set:user", test_doc.clone(), "users", "test2"]),
            &nonce.to_string()
        ).await;
        println!("Typed set result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ Typed 'set:user' works!");
            nonce += 1;
        }
    }
    
    // Test add
    {
        println!("\n4. Testing 'add' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["add", test_doc.clone(), "users"]),
            &nonce.to_string()
        ).await;
        println!("Add result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ 'add' works!");
            nonce += 1;
        }
    }
    
    // Test typed add
    {
        println!("\n5. Testing typed 'add:user' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["add:user", test_doc.clone(), "users"]),
            &nonce.to_string()
        ).await;
        println!("Typed add result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ Typed 'add:user' works!");
            nonce += 1;
        }
    }
    
    // Test update
    {
        println!("\n6. Testing 'update' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["update", {"age": 30}, "users", "test1"]),
            &nonce.to_string()
        ).await;
        println!("Update result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ 'update' works!");
            nonce += 1;
        }
    }
    
    // Test batch
    {
        println!("\n7. Testing 'batch' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["batch",
                ["set", {"name": "Alice", "age": 30}, "users", "alice"],
                ["set", {"name": "Bob", "age": 25}, "users", "bob"]
            ]),
            &nonce.to_string()
        ).await;
        println!("Batch result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ 'batch' works!");
            nonce += 1;
        }
    }
    
    // Test get operations
    {
        println!("\n8. Testing GET operations");
        
        // Get all
        let result = execute_get(&app, json!(["get", "users"])).await;
        println!("Get all users: {}", result);
        
        // Get specific
        let result = execute_get(&app, json!(["get", "users", "test1"])).await;
        println!("Get specific user: {}", result);
    }
    
    // Test addIndex
    {
        println!("\n9. Testing 'addIndex' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["addIndex", [["age", "desc"]], "users"]),
            &nonce.to_string()
        ).await;
        println!("AddIndex result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ 'addIndex' works!");
            nonce += 1;
        }
    }
    
    // Test delete
    {
        println!("\n10. Testing 'del' operation");
        let result = execute_write(&app, &private_key, &key_id,
            json!(["del", "users", "test1"]),
            &nonce.to_string()
        ).await;
        println!("Del result: {}", result);
        if result["success"].as_bool().unwrap_or(false) {
            println!("✓ 'del' works!");
            nonce += 1;
        }
    }
    
    println!("\n=== OPERATION DISCOVERY COMPLETE ===");
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

async fn execute_get(app: &axum::Router, query: Value) -> Value {
    let mut headers = HeaderMap::new();
    headers.insert("query", HeaderValue::from_str(&query.to_string()).unwrap());
    headers.insert("id", HeaderValue::from_static("test-basic-db"));
    
    let request = Request::builder()
        .method("GET")
        .uri("/~weavedb@1.0/get")
        .body(Body::empty())
        .unwrap();
    
    let request = add_header_map(request, headers);
    
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
    headers.insert("id".to_string(), "test-basic-db".to_string());
    
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
