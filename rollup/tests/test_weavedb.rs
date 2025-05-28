// File: tests/test_weavedb.rs

use axum::http::{Request, StatusCode, HeaderMap, HeaderValue};
use axum::body::Body;
use serde_json::{json, Value};
use tower::util::ServiceExt;

// Import the server module - need to make sure it's exported in lib.rs
use weavedb::server_db::create_router;

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

/// Helper function to create test headers with required fields
fn create_test_headers(query: &str, nonce: &str) -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert("query", HeaderValue::from_str(query).unwrap());
    headers.insert("nonce", HeaderValue::from_str(nonce).unwrap());
    headers.insert("signature", HeaderValue::from_str("test-signature").unwrap());
    headers.insert("signature-input", HeaderValue::from_str(
        r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#
    ).unwrap());
    headers.insert("id", HeaderValue::from_str("test-db").unwrap());
    headers
}

#[tokio::test]
async fn test_health_endpoint() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/health")
                .body(Body::empty())
                .unwrap()
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    
    assert_eq!(json["status"], "ok");
    assert_eq!(json["service"], "weavedb");
}

#[tokio::test]
async fn test_init_database() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    let query = json!(["init", "_", {"id": "test-db", "owner": "test-owner"}]).to_string();
    let headers = create_test_headers(&query, "1");
    
    let request = build_request("POST", "/~weavedb@1.0/set", headers);
    
    let response = app
        .clone()
        .oneshot(request)
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    
    println!("Init response: {:?}", json);
    if json["success"] == false {
        println!("Init failed with error: {:?}", json["error"]);
    }
    
    assert_eq!(json["success"], true);
}

#[tokio::test]
async fn test_set_and_get_document() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    // First, initialize the database
    let init_query = json!(["init", "_", {"id": "test-db", "owner": "test-owner"}]).to_string();
    let init_headers = create_test_headers(&init_query, "1");
    let init_request = build_request("POST", "/~weavedb@1.0/set", init_headers);
    
    let init_response = app
        .clone()
        .oneshot(init_request)
        .await
        .unwrap();
    
    let init_body = axum::body::to_bytes(init_response.into_body(), usize::MAX).await.unwrap();
    let init_json: Value = serde_json::from_slice(&init_body).unwrap();
    println!("Init response: {:?}", init_json);
    
    // Set a document
    let set_query = json!(["set", {"name": "Alice", "age": 30}, "users", "user1"]).to_string();
    let set_headers = create_test_headers(&set_query, "2");
    let set_request = build_request("POST", "/~weavedb@1.0/set", set_headers);
    
    let set_response = app
        .clone()
        .oneshot(set_request)
        .await
        .unwrap();
    
    assert_eq!(set_response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(set_response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    println!("Set response: {:?}", json);
    
    if json["success"] == false {
        println!("Set failed with error: {:?}", json["error"]);
    }
    assert_eq!(json["success"], true);
    
    // Get the document
    let get_query = json!(["users", "user1"]).to_string();
    let get_headers = create_test_headers(&get_query, "12345");
    let get_request = build_request("GET", "/~weavedb@1.0/get", get_headers);
    
    let get_response = app
        .oneshot(get_request)
        .await
        .unwrap();
    
    assert_eq!(get_response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(get_response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    println!("Get response: {:?}", json);
    
    assert_eq!(json["success"], true);
    // The actual data would be in json["res"]
}

#[tokio::test]
async fn test_query_endpoint() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    // Test read query
    let query = json!(["get", "users", "user1"]).to_string();
    let headers = create_test_headers(&query, "12345");
    let request = build_request("POST", "/query", headers);
    
    let response = app
        .clone()
        .oneshot(request)
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    
    // Should have success field
    assert!(json.get("success").is_some());
}

#[tokio::test]
async fn test_missing_headers() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    // Request without required headers
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/~weavedb@1.0/set")
                .body(Body::empty())
                .unwrap()
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    
    assert_eq!(json["success"], false);
    assert!(json["error"].as_str().unwrap().contains("Missing"));
}

#[tokio::test]
async fn test_invalid_query_json() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    let headers = create_test_headers("invalid json", "12345");
    let request = build_request("POST", "/query", headers);
    
    let response = app
        .oneshot(request)
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_update_operation() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    // Initialize and set a document first
    let init_query = json!(["init", "_", {"id": "test-db", "owner": "test-owner"}]).to_string();
    let init_headers = create_test_headers(&init_query, "1");
    let init_request = build_request("POST", "/~weavedb@1.0/set", init_headers);
    
    let _ = app
        .clone()
        .oneshot(init_request)
        .await
        .unwrap();
    
    // Set initial document
    let set_query = json!(["set", {"name": "Alice", "age": 30}, "users", "user1"]).to_string();
    let set_headers = create_test_headers(&set_query, "2");
    let set_request = build_request("POST", "/~weavedb@1.0/set", set_headers);
    
    let _ = app
        .clone()
        .oneshot(set_request)
        .await
        .unwrap();
    
    // Update the document
    let update_query = json!(["update", {"age": 31}, "users", "user1"]).to_string();
    let update_headers = create_test_headers(&update_query, "3");
    let update_request = build_request("POST", "/~weavedb@1.0/set", update_headers);
    
    let update_response = app
        .oneshot(update_request)
        .await
        .unwrap();
    
    assert_eq!(update_response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(update_response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    
    assert_eq!(json["success"], true);
}

#[tokio::test]
async fn test_delete_operation() {
    let app = create_router("test-db".to_string(), ".test-db".to_string());
    
    // Initialize and set a document first
    let init_query = json!(["init", "_", {"id": "test-db", "owner": "test-owner"}]).to_string();
    let init_headers = create_test_headers(&init_query, "1");
    let init_request = build_request("POST", "/~weavedb@1.0/set", init_headers);
    
    let _ = app
        .clone()
        .oneshot(init_request)
        .await
        .unwrap();
    
    // Set a document
    let set_query = json!(["set", {"name": "Bob", "age": 25}, "users", "user2"]).to_string();
    let set_headers = create_test_headers(&set_query, "2");
    let set_request = build_request("POST", "/~weavedb@1.0/set", set_headers);
    
    let _ = app
        .clone()
        .oneshot(set_request)
        .await
        .unwrap();
    
    // Delete the document
    let delete_query = json!(["del", "users", "user2"]).to_string();
    let delete_headers = create_test_headers(&delete_query, "3");
    let delete_request = build_request("POST", "/~weavedb@1.0/set", delete_headers);
    
    let delete_response = app
        .oneshot(delete_request)
        .await
        .unwrap();
    
    assert_eq!(delete_response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(delete_response.into_body(), usize::MAX).await.unwrap();
    let json: Value = serde_json::from_slice(&body).unwrap();
    
    assert_eq!(json["success"], true);
}
