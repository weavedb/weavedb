// File: src/server_db.rs

use axum::{
    extract::{Request, State},
    body::{self, Body},
    routing::post,
    Json, Router,
    http::{StatusCode, HeaderMap},
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tokio::sync::{RwLock, mpsc};

use crate::weavedb_device::{WeaveDB, wdb};
use super::hb_client::HyperBeamClient;

/// Shared application state
pub struct AppState {
    /// The WeaveDB instance
    db: Arc<RwLock<WeaveDB>>,
    /// Database ID
    db_id: String,
    /// HyperBEAM channel for sending operations (if enabled)
    hb_tx: Option<mpsc::UnboundedSender<Value>>,
}

/// Response structure for WeaveDB operations
#[derive(Debug, Serialize)]
pub struct WeaveDBResponse {
    /// Success flag
    success: bool,
    /// Result data (for read operations)
    #[serde(skip_serializing_if = "Option::is_none")]
    res: Option<Value>,
    /// Error message (if any)
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    /// Query (for debugging)
    #[serde(skip_serializing_if = "Option::is_none")]
    query: Option<Vec<Value>>,
}

/// Convert headers to the format expected by WeaveDB
fn prepare_msg_from_headers(headers: &HeaderMap) -> Result<Value, (StatusCode, String)> {
    let mut headers_map = serde_json::Map::new();
    
    // Extract all headers and convert to lowercase keys
    for (key, value) in headers {
        let key_str = key.as_str().to_lowercase();
        if let Ok(value_str) = value.to_str() {
            headers_map.insert(key_str, json!(value_str));
        }
    }
    
    // Ensure required headers exist
    if !headers_map.contains_key("query") {
        return Err((StatusCode::BAD_REQUEST, "Missing 'query' header".to_string()));
    }
    if !headers_map.contains_key("nonce") {
        return Err((StatusCode::BAD_REQUEST, "Missing 'nonce' header".to_string()));
    }
    if !headers_map.contains_key("signature") {
        return Err((StatusCode::BAD_REQUEST, "Missing 'signature' header".to_string()));
    }
    if !headers_map.contains_key("signature-input") {
        return Err((StatusCode::BAD_REQUEST, "Missing 'signature-input' header".to_string()));
    }
    
    Ok(json!({ "headers": headers_map }))
}

/// Send operation to HyperBEAM if enabled
fn send_to_hyperbeam(headers: &HeaderMap, hb_tx: &Option<mpsc::UnboundedSender<Value>>) {
    if let Some(tx) = hb_tx {
        let mut headers_map = serde_json::Map::new();
        
        for (key, value) in headers {
            if let Ok(value_str) = value.to_str() {
                headers_map.insert(key.to_string(), json!(value_str));
            }
        }
        
        let operation = json!({ "headers": headers_map });
        let _ = tx.send(operation);
    }
}

/// Handle GET requests - matches JS: app.get("/~weavedb@1.0/get", ...)
pub async fn get_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Json<WeaveDBResponse> {
    // Parse query from headers
    let query_str = match headers.get("query") {
        Some(q) => match q.to_str() {
            Ok(s) => s,
            Err(_) => {
                return Json(WeaveDBResponse {
                    success: false,
                    res: None,
                    error: Some("Invalid query header".to_string()),
                    query: None,
                });
            }
        },
        None => {
            return Json(WeaveDBResponse {
                success: false,
                res: None,
                error: Some("Missing query header".to_string()),
                query: None,
            });
        }
    };
    
    let query: Vec<Value> = match serde_json::from_str(query_str) {
        Ok(q) => q,
        Err(e) => {
            return Json(WeaveDBResponse {
                success: false,
                res: None,
                error: Some(format!("Invalid query JSON: {}", e)),
                query: None,
            });
        }
    };
    
    // Call db.get(...query).val() - just like in JS
    let mut db = state.db.write().await;
    match db.get(query.clone()) {
        Ok(res) => Json(WeaveDBResponse {
            success: true,
            res: Some(res),
            error: None,
            query: Some(query),
        }),
        Err(e) => Json(WeaveDBResponse {
            success: false,
            res: None,
            error: Some(e),
            query: Some(query),
        }),
    }
}

/// Handle POST requests - matches JS: app.post("/~weavedb@1.0/set", ...)
pub async fn set_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: String,
) -> Json<WeaveDBResponse> {
    // Send to HyperBEAM
    send_to_hyperbeam(&headers, &state.hb_tx);
    
    // Prepare message from headers
    let msg = match prepare_msg_from_headers(&headers) {
        Ok(m) => m,
        Err((_, e)) => {
            return Json(WeaveDBResponse {
                success: false,
                res: None,
                error: Some(e),
                query: None,
            });
        }
    };
    
    // Parse query for response
    let query: Vec<Value> = if let Some(query_str) = headers.get("query") {
        if let Ok(s) = query_str.to_str() {
            serde_json::from_str(s).unwrap_or_default()
        } else {
            vec![]
        }
    } else {
        vec![]
    };
    
    // Call db.write(req) - just like in JS
    let mut db = state.db.write().await;
    match db.write(msg) {
        Ok(_) => Json(WeaveDBResponse {
            success: true,
            res: None,
            error: None,
            query: Some(query),
        }),
        Err(e) => Json(WeaveDBResponse {
            success: false,
            res: None,
            error: Some(e),
            query: Some(query),
        }),
    }
}

/// Generic query handler for both GET and POST
pub async fn query_handler(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: String,
) -> Result<Json<WeaveDBResponse>, (StatusCode, String)> {
    // Prepare message from headers
    let msg = prepare_msg_from_headers(&headers)?;
    
    // Parse query to determine operation type
    let query_str = headers.get("query")
        .ok_or((StatusCode::BAD_REQUEST, "Missing query header".to_string()))?
        .to_str()
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid query header".to_string()))?;
    
    let query: Vec<Value> = serde_json::from_str(query_str)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid query JSON: {}", e)))?;
    
    if query.is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Query array cannot be empty".to_string()));
    }
    
    // Get operation type
    let op = query[0].as_str()
        .ok_or((StatusCode::BAD_REQUEST, "Operation must be a string".to_string()))?;
    
    // Route based on operation type
    match op {
        "get" | "cget" => {
            // Read operation
            let db = state.db.read().await;
            match db.read(msg) {
                Ok(result) => {
                    // Extract actual result from state
                    if let Some(state_obj) = result.get("state").and_then(|s| s.as_object()) {
                        if let Some(read_result) = state_obj.get("read_result") {
                            Ok(Json(WeaveDBResponse {
                                success: true,
                                res: Some(read_result.clone()),
                                error: None,
                                query: Some(query),
                            }))
                        } else {
                            Ok(Json(WeaveDBResponse {
                                success: true,
                                res: Some(Value::Null),
                                error: None,
                                query: Some(query),
                            }))
                        }
                    } else {
                        Ok(Json(WeaveDBResponse {
                            success: true,
                            res: Some(result),
                            error: None,
                            query: Some(query),
                        }))
                    }
                }
                Err(e) => Ok(Json(WeaveDBResponse {
                    success: false,
                    res: None,
                    error: Some(e),
                    query: Some(query),
                }))
            }
        }
        _ => {
            // Write operation - send to HyperBEAM
            send_to_hyperbeam(&headers, &state.hb_tx);
            
            // Write to database
            let mut db = state.db.write().await;
            match db.write(msg) {
                Ok(_) => Ok(Json(WeaveDBResponse {
                    success: true,
                    res: None,
                    error: None,
                    query: Some(query),
                })),
                Err(e) => Ok(Json(WeaveDBResponse {
                    success: false,
                    res: None,
                    error: Some(e),
                    query: Some(query),
                }))
            }
        }
    }
}

/// Health check endpoint
pub async fn health_handler() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "service": "weavedb",
        "version": "0.1.0"
    }))
}

/// Setup HyperBEAM background task
async fn setup_hyperbeam(hb_port: u16, db_id: &str) -> Option<mpsc::UnboundedSender<Value>> {
    // Initialize client
    let client = match HyperBeamClient::new_with_keys(hb_port) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("⚠️  Failed to connect to HyperBEAM: {}", e);
            return None;
        }
    };
    
    // Get scheduler and create process
    let scheduler = client.get_scheduler().await.ok()?;
    let process_id = client.spawn_process().await.ok()?;
    
    println!("🔄 HyperBEAM WAL enabled for DB: {}", db_id);
    println!("📝 Process ID: {}", process_id);
    
    // Create channel
    let (tx, mut rx) = mpsc::unbounded_channel::<Value>();
    
    // Spawn background task
    tokio::spawn(async move {
        let mut bundle = Vec::new();
        
        while let Some(op) = rx.recv().await {
            bundle.push(op);
            
            // Batch operations
            let deadline = tokio::time::sleep(tokio::time::Duration::from_millis(10));
            tokio::pin!(deadline);
            
            loop {
                tokio::select! {
                    Some(op) = rx.recv() => {
                        bundle.push(op);
                        if bundle.len() >= 50 {
                            break;
                        }
                    }
                    _ = &mut deadline => {
                        break;
                    }
                }
            }
            
            // Send bundle
            if !bundle.is_empty() {
                match client.schedule_message_with_digest(&process_id, json!(bundle)).await {
                    Ok((_, slot)) => {
                        if let Some(s) = slot {
                            println!("[{}] {} ops sent to HyperBEAM", s, bundle.len());
                        }
                    }
                    Err(e) => eprintln!("Failed to send to HyperBEAM: {}", e),
                }
                bundle.clear();
            }
        }
    });
    
    Some(tx)
}

/// Setup HyperBEAM and process messages
async fn setup_hyperbeam_and_process(
    hb_port: u16, 
    db_id: &str, 
    mut rx: mpsc::UnboundedReceiver<Value>
) -> Result<(), Box<dyn std::error::Error>> {
    // Initialize client
    let client = HyperBeamClient::new_with_keys(hb_port)?;
    
    // Get scheduler and create process
    let scheduler = client.get_scheduler().await?;
    let process_id = client.spawn_process().await?;
    
    println!("🔄 HyperBEAM WAL enabled for DB: {}", db_id);
    println!("📝 Process ID: {}", process_id);
    
    // Process messages
    let mut bundle = Vec::new();
    
    while let Some(op) = rx.recv().await {
        bundle.push(op);
        
        // Batch operations
        let deadline = tokio::time::sleep(tokio::time::Duration::from_millis(10));
        tokio::pin!(deadline);
        
        loop {
            tokio::select! {
                Some(op) = rx.recv() => {
                    bundle.push(op);
                    if bundle.len() >= 50 {
                        break;
                    }
                }
                _ = &mut deadline => {
                    break;
                }
            }
        }
        
        // Send bundle
        if !bundle.is_empty() {
            match client.schedule_message_with_digest(&process_id, json!(bundle)).await {
                Ok((_, slot)) => {
                    if let Some(s) = slot {
                        println!("[{}] {} ops sent to HyperBEAM", s, bundle.len());
                    }
                }
                Err(e) => eprintln!("Failed to send to HyperBEAM: {}", e),
            }
            bundle.clear();
        }
    }
    
    Ok(())
}

/// Create the server router with WeaveDB integration
pub fn create_router(db_id: String, db_path: String) -> Router {
    create_router_with_hyperbeam(db_id, db_path, None)
}

/// Create the server router with optional HyperBEAM integration
pub fn create_router_with_hyperbeam(db_id: String, db_path: String, hb_port: Option<u16>) -> Router {
    // Initialize WeaveDB instance
    let initial_kv = HashMap::new();
    let mut opt = HashMap::new();
    opt.insert("id".to_string(), json!(db_id.clone()));
    opt.insert("db_path".to_string(), json!(db_path));
    
    let db = wdb(initial_kv, opt);
    
    // Setup HyperBEAM channel if port provided
    let hb_tx = if let Some(port) = hb_port {
        // Create channel
        let (tx, rx) = mpsc::unbounded_channel::<Value>();
        
        // Clone values for the task
        let db_id_clone = db_id.clone();
        
        // Spawn task to setup HyperBEAM
        tokio::spawn(async move {
            match setup_hyperbeam_and_process(port, &db_id_clone, rx).await {
                Ok(_) => println!("✅ HyperBEAM WAL started successfully"),
                Err(e) => eprintln!("❌ Failed to start HyperBEAM WAL: {}", e),
            }
        });
        
        Some(tx)
    } else {
        None
    };
    
    // Create shared state
    let state = Arc::new(AppState {
        db: Arc::new(RwLock::new(db)),
        db_id,
        hb_tx,
    });
    
    // Build router matching JS endpoints
    Router::new()
        .route("/~weavedb@1.0/get", axum::routing::get(get_handler))
        .route("/~weavedb@1.0/set", post(set_handler))
        .route("/query", post(query_handler))
        .route("/health", axum::routing::get(health_handler))
        .with_state(state)
}

/// Initialize and run the WeaveDB server
pub async fn run_weavedb_server(port: u16, db_id: String, db_path: String) {
    run_weavedb_server_with_hyperbeam(port, db_id, db_path, None).await
}

/// Initialize and run the WeaveDB server with optional HyperBEAM
pub async fn run_weavedb_server_with_hyperbeam(
    port: u16, 
    db_id: String, 
    db_path: String,
    hb_port: Option<u16>
) {
    let app = create_router_with_hyperbeam(db_id.clone(), db_path, hb_port);
    
    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], port));
    
    println!("🚀 WeaveDB Server starting on http://{}", addr);
    println!("📦 Database ID: {}", db_id);
    if hb_port.is_some() {
        println!("🔄 HyperBEAM WAL enabled on port {}", hb_port.unwrap());
    } else {
        println!("⚠️  HyperBEAM WAL disabled");
    }
    
    match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => {
            axum::serve(listener, app)
                .await
                .expect("Server error");
        }
        Err(e) => {
            eprintln!("❌ Failed to bind to address {}: {}", addr, e);
            eprintln!("The port may already be in use. Try a different port.");
            std::process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::{Request, Method};
    use tower::util::ServiceExt;
    
    #[tokio::test]
    async fn test_health_endpoint() {
        let app = create_router("test-db".to_string(), ".test-db".to_string());
        
        let response = app
            .oneshot(
                Request::builder()
                    .method(Method::GET)
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap()
            )
            .await
            .unwrap();
        
        assert_eq!(response.status(), StatusCode::OK);
    }
}
