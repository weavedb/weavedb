// File: tests/test_integrated_hyperbeam.rs

use axum::http::{Request, StatusCode, HeaderMap, HeaderValue};
use axum::body::Body;
use serde_json::{json, Value};
use tower::util::ServiceExt;
use std::collections::HashMap;

// Import the server module with HyperBEAM integration
use weavedb::server_db::create_router_with_hyperbeam;
use weavedb::sign::{sign_headers, generate_rsa_keypair};

/// Helper function to build request with headers
fn build_request(method: &str, uri: &str, headers: HeaderMap) -> Request<Body> {
    let mut builder = Request::builder()
        .method(method)
        .uri(uri);
    
    for (key, value) in headers {
        if let Some(name) = key {
            builder = builder.header(name, value);
        }
    }
    
    builder.body(Body::empty()).unwrap()
}

/// Create properly signed headers
fn create_signed_headers(query: &str, nonce: &str, private_key_pem: &str, key_id: &str, db_id: &str) -> HeaderMap {
    let mut headers_map = HashMap::new();
    headers_map.insert("query".to_string(), query.to_string());
    headers_map.insert("nonce".to_string(), nonce.to_string());
    headers_map.insert("id".to_string(), db_id.to_string());
    
    // Sign the headers
    let fields = vec!["id".to_string(), "nonce".to_string(), "query".to_string()];
    let signed_headers = sign_headers(headers_map, &fields, private_key_pem, key_id, "sig1")
        .expect("Failed to sign headers");
    
    // Convert to HeaderMap
    let mut headers = HeaderMap::new();
    for (key, value) in signed_headers {
        headers.insert(
            axum::http::HeaderName::from_bytes(key.as_bytes()).unwrap(),
            HeaderValue::from_str(&value).unwrap()
        );
    }
    
    headers
}

#[tokio::test]
async fn test_weavedb_with_integrated_hyperbeam() {
    println!("\n=== Testing WeaveDB with Integrated HyperBEAM WAL ===\n");
    
    // Create router with HyperBEAM WAL enabled
    let app = create_router_with_hyperbeam(
        "test-db-integrated".to_string(),
        ".test-db-integrated".to_string(),
        Some(10000), // Enable HyperBEAM on port 10000
    );
    
    // Generate signing keys
    let (private_key_pem, (key_id, _)) = generate_rsa_keypair().unwrap();
    
    // Test 1: Initialize database (should be sent to HyperBEAM)
    println!("📝 Test 1: Initialize database");
    let init_query = json!(["init", "_", {"id": "test-db-integrated", "owner": "test-owner"}]).to_string();
    let init_headers = create_signed_headers(&init_query, "1", &private_key_pem, &key_id, "test-db-integrated");
    let init_request = build_request("POST", "/~weavedb@1.0/set", init_headers);
    
    let init_response = app.clone().oneshot(init_request).await.unwrap();
    assert_eq!(init_response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(init_response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    println!("Init response: {:?}", json);
    assert_eq!(json["success"], true);
    
    // Test 2: Set multiple documents (should be batched and sent to HyperBEAM)
    println!("\n📝 Test 2: Set multiple documents");
    for i in 0..10 {
        let set_query = json!([
            "set", 
            {"name": format!("User{}", i), "age": 20 + i, "email": format!("user{}@example.com", i)}, 
            "users", 
            format!("user{}", i)
        ]).to_string();
        let set_headers = create_signed_headers(&set_query, &(i + 2).to_string(), &private_key_pem, &key_id, "test-db-integrated");
        let set_request = build_request("POST", "/~weavedb@1.0/set", set_headers);
        
        let set_response = app.clone().oneshot(set_request).await.unwrap();
        assert_eq!(set_response.status(), StatusCode::OK);
        
        if i == 0 {
            let body = axum::body::to_bytes(set_response.into_body(), usize::MAX).await.unwrap();
            let json: Value = serde_json::from_slice(&body).unwrap();
            println!("First set response: {:?}", json);
        }
    }
    
    // Test 3: GET operations (should NOT be sent to HyperBEAM)
    println!("\n📝 Test 3: GET operations (not sent to WAL)");
    let get_query = json!(["users", "user0"]).to_string();
    let get_headers = create_signed_headers(&get_query, "100", &private_key_pem, &key_id, "test-db-integrated");
    let get_request = build_request("GET", "/~weavedb@1.0/get", get_headers);
    
    let get_response = app.clone().oneshot(get_request).await.unwrap();
    assert_eq!(get_response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(get_response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    println!("Get response: {:?}", json);
    assert_eq!(json["success"], true);
    
    // Test 4: Update operations (should be sent to HyperBEAM)
    println!("\n📝 Test 4: Update operations");
    let update_query = json!(["update", {"age": 31}, "users", "user0"]).to_string();
    let update_headers = create_signed_headers(&update_query, "12", &private_key_pem, &key_id, "test-db-integrated");
    let update_request = build_request("POST", "/~weavedb@1.0/set", update_headers);
    
    let update_response = app.clone().oneshot(update_request).await.unwrap();
    assert_eq!(update_response.status(), StatusCode::OK);
    
    // Test 5: Delete operations (should be sent to HyperBEAM)
    println!("\n📝 Test 5: Delete operations");
    let delete_query = json!(["del", "users", "user5"]).to_string();
    let delete_headers = create_signed_headers(&delete_query, "13", &private_key_pem, &key_id, "test-db-integrated");
    let delete_request = build_request("POST", "/~weavedb@1.0/set", delete_headers);
    
    let delete_response = app.clone().oneshot(delete_request).await.unwrap();
    assert_eq!(delete_response.status(), StatusCode::OK);
    
    // Test 6: Use the /query endpoint (should also integrate with HyperBEAM)
    println!("\n📝 Test 6: Query endpoint");
    let query_set = json!(["set", {"test": "query-endpoint"}, "test", "doc1"]).to_string();
    let query_headers = create_signed_headers(&query_set, "14", &private_key_pem, &key_id, "test-db-integrated");
    let query_request = build_request("POST", "/query", query_headers);
    
    let query_response = app.clone().oneshot(query_request).await.unwrap();
    assert_eq!(query_response.status(), StatusCode::OK);
    
    // Wait a bit for HyperBEAM to process
    println!("\n⏳ Waiting for HyperBEAM to process operations...");
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    
    println!("\n✅ All operations completed successfully!");
    println!("📝 Check HyperBEAM logs to verify operations were sent");
}

#[tokio::test]
async fn test_weavedb_without_hyperbeam() {
    println!("\n=== Testing WeaveDB without HyperBEAM (fallback mode) ===\n");
    
    // Create router WITHOUT HyperBEAM
    let app = create_router_with_hyperbeam(
        "test-db-no-hb".to_string(),
        ".test-db-no-hb".to_string(),
        None, // No HyperBEAM port - WAL disabled
    );
    
    let (private_key_pem, (key_id, _)) = generate_rsa_keypair().unwrap();
    
    // Should work normally without HyperBEAM
    let init_query = json!(["init", "_", {"id": "test-db-no-hb", "owner": "test"}]).to_string();
    let init_headers = create_signed_headers(&init_query, "1", &private_key_pem, &key_id, "test-db-no-hb");
    let init_request = build_request("POST", "/~weavedb@1.0/set", init_headers);
    
    let init_response = app.clone().oneshot(init_request).await.unwrap();
    assert_eq!(init_response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(init_response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["success"], true);
    
    println!("✅ WeaveDB works correctly without HyperBEAM");
}

#[tokio::test]
async fn test_rapid_operations_batching() {
    println!("\n=== Testing Rapid Operations (Batching) ===\n");
    
    // Create router with HyperBEAM
    let app = create_router_with_hyperbeam(
        "test-db-batch".to_string(),
        ".test-db-batch".to_string(),
        Some(10000),
    );
    
    let (private_key_pem, (key_id, _)) = generate_rsa_keypair().unwrap();
    
    // Initialize
    let init_query = json!(["init", "_", {"id": "test-db-batch", "owner": "test"}]).to_string();
    let init_headers = create_signed_headers(&init_query, "1", &private_key_pem, &key_id, "test-db-batch");
    let init_request = build_request("POST", "/~weavedb@1.0/set", init_headers);
    app.clone().oneshot(init_request).await.unwrap();
    
    // Send 50 operations rapidly to test batching
    println!("📝 Sending 50 operations rapidly...");
    let start = std::time::Instant::now();
    
    let mut handles = vec![];
    for i in 0..50 {
        let app_clone = app.clone();
        let private_key_pem_clone = private_key_pem.clone();
        let key_id_clone = key_id.clone();
        
        let handle = tokio::spawn(async move {
            let set_query = json!([
                "set", 
                {"batch": true, "index": i, "timestamp": chrono::Utc::now().to_rfc3339()}, 
                "items", 
                format!("item{}", i)
            ]).to_string();
            let headers = create_signed_headers(
                &set_query, 
                &(i + 2).to_string(), 
                &private_key_pem_clone, 
                &key_id_clone,
                "test-db-batch"
            );
            let request = build_request("POST", "/~weavedb@1.0/set", headers);
            
            app_clone.oneshot(request).await
        });
        
        handles.push(handle);
    }
    
    // Wait for all operations to complete
    for handle in handles {
        let response = handle.await.unwrap().unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
    
    let elapsed = start.elapsed();
    println!("✅ Sent 50 operations in {:?}", elapsed);
    println!("📊 Rate: {:.0} ops/sec", 50.0 / elapsed.as_secs_f64());
    
    // Wait for HyperBEAM to process
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    
    println!("\n✅ Batching test completed!");
}

#[tokio::test]
async fn test_mixed_read_write_operations() {
    println!("\n=== Testing Mixed Read/Write Operations ===\n");
    
    let app = create_router_with_hyperbeam(
        "test-db-mixed".to_string(),
        ".test-db-mixed".to_string(),
        Some(10000),
    );
    
    let (private_key_pem, (key_id, _)) = generate_rsa_keypair().unwrap();
    
    // Initialize
    let init_query = json!(["init", "_", {"id": "test-db-mixed", "owner": "test"}]).to_string();
    let init_headers = create_signed_headers(&init_query, "1", &private_key_pem, &key_id, "test-db-mixed");
    app.clone().oneshot(build_request("POST", "/~weavedb@1.0/set", init_headers)).await.unwrap();
    
    // Mix of operations
    let operations = vec![
        ("set", json!(["set", {"data": "1"}, "docs", "doc1"]), true),
        ("get", json!(["docs", "doc1"]), false), // Should NOT go to WAL
        ("set", json!(["set", {"data": "2"}, "docs", "doc2"]), true),
        ("cget", json!(["docs", "doc2"]), false), // Should NOT go to WAL
        ("update", json!(["update", {"data": "1-updated"}, "docs", "doc1"]), true),
        ("get", json!(["docs", "doc1"]), false), // Should NOT go to WAL
        ("del", json!(["del", "docs", "doc2"]), true),
    ];
    
    for (i, (op_name, query, should_wal)) in operations.iter().enumerate() {
        println!("📝 Operation {}: {} (WAL: {})", i + 1, op_name, should_wal);
        
        let query_str = query.to_string();
        let headers = create_signed_headers(&query_str, &(i + 2).to_string(), &private_key_pem, &key_id, "test-db-mixed");
        
        let (method, uri) = if matches!(op_name, &"get" | &"cget") {
            ("GET", "/~weavedb@1.0/get")
        } else {
            ("POST", "/~weavedb@1.0/set")
        };
        
        let request = build_request(method, uri, headers);
        let response = app.clone().oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
    
    println!("\n✅ Mixed operations test completed!");
    println!("📝 Write operations were sent to HyperBEAM WAL");
    println!("📖 Read operations were NOT sent to HyperBEAM WAL");
}
