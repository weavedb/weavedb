// File: src/server_db.rs

use axum::{
    Router,
    routing::{get, post},
    extract::{State, Json, Path, Query},
    http::{StatusCode, HeaderMap},
    response::IntoResponse,
    body::Bytes,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use std::collections::HashMap;
use crate::weavedb_device::WeaveDB;
use crate::verify::verify_signature;
use crate::kv;
use tokio::task;
use once_cell::sync::OnceCell;

// Global initialization flag for RocksDB
static ROCKS_INITIALIZED: OnceCell<bool> = OnceCell::new();

/// Query parameters
#[derive(Debug, Deserialize)]
pub struct QueryParams {
    op: Option<String>,
    collection: Option<String>,
    doc: Option<String>,
}

/// Write request for the queue
struct WriteRequest {
    msg: Value,
    response_tx: tokio::sync::oneshot::Sender<Result<Value, String>>,
}

/// Queue for sequential write operations (like JS queue.js)
struct WriteQueue {
    sender: mpsc::UnboundedSender<WriteRequest>,
}

impl WriteQueue {
    fn new(db: Arc<Mutex<WeaveDB>>) -> Self {
        let (tx, mut rx) = mpsc::unbounded_channel::<WriteRequest>();
        
        // Process writes sequentially
        tokio::spawn(async move {
            while let Some(request) = rx.recv().await {
                let mut db = db.lock().await;
                let result = match db.write(request.msg) {
                    Ok(res) => Ok(res),
                    Err(e) => Err(e.to_string()),
                };
                let _ = request.response_tx.send(result);
            }
        });
        
        WriteQueue { sender: tx }
    }
    
    async fn queue_write(&self, msg: Value) -> Result<Value, String> {
        let (tx, rx) = tokio::sync::oneshot::channel();
        let request = WriteRequest { msg, response_tx: tx };
        
        self.sender.send(request)
            .map_err(|_| "Write queue closed".to_string())?;
        
        rx.await.map_err(|_| "Write operation cancelled".to_string())?
    }
}

/// Server state
#[derive(Clone)]
pub struct ServerState {
    /// Map of database ID to write queue
    write_queues: Arc<Mutex<HashMap<String, Arc<WriteQueue>>>>,
    /// Map of database ID to database instance (for reads)
    databases: Arc<Mutex<HashMap<String, Arc<Mutex<WeaveDB>>>>>,
    /// Server configuration
    id: String,
    db_path: String,
    hb_port: Option<u16>,
}

/// Initialize RocksDB once
fn init_rocks_db(db_path: &str) {
    ROCKS_INITIALIZED.get_or_init(|| {
        let rocks_path = format!("{}/rocks", db_path);
        // Create directory if it doesn't exist
        std::fs::create_dir_all(&rocks_path).expect("Failed to create RocksDB directory");
        kv::init(&rocks_path);
        println!("🗄️  RocksDB initialized at: {}", rocks_path);
        true
    });
}

/// Verify request signature in parallel (like JS verify function)
async fn verify_request(headers: &HeaderMap) -> Result<HashMap<String, String>, String> {
    // Convert headers to HashMap
    let mut header_map = HashMap::new();
    for (name, value) in headers.iter() {
        if let Ok(v) = value.to_str() {
            header_map.insert(name.as_str().to_lowercase(), v.to_string());
        }
    }
    
    // Serialize headers for verification
    let headers_json = serde_json::to_string(&header_map)
        .map_err(|e| format!("Failed to serialize headers: {}", e))?;
    
    // Verify signature in parallel using blocking task
    let verified = task::spawn_blocking(move || {
        verify_signature(&headers_json)?;
        Ok::<HashMap<String, String>, String>(header_map)
    })
    .await
    .map_err(|e| format!("Verification task failed: {}", e))??;
    
    Ok(verified)
}

/// Create router with default configuration
pub fn create_router(id: String, db_path: String) -> Router {
    create_router_with_options(id, db_path, None)
}

/// Create router with HyperBeam configuration
pub async fn create_router_with_hb(id: String, db_path: String, hb_port: u16) -> Router {
    create_router_with_options(id, db_path, Some(hb_port))
}

/// Create router with custom options
pub fn create_router_with_options(id: String, db_path: String, hb_port: Option<u16>) -> Router {
    // Initialize RocksDB
    init_rocks_db(&db_path);
    
    // Create server state
    let state = ServerState {
        write_queues: Arc::new(Mutex::new(HashMap::new())),
        databases: Arc::new(Mutex::new(HashMap::new())),
        id,
        db_path,
        hb_port,
    };
    
    // Build router
    Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/info", get(info))
        .route("/~weavedb@1.0/get", get(weavedb_get))
        .route("/~weavedb@1.0/set", post(weavedb_set))
        .route("/result/:mid", post(result_handler))
        .with_state(state)
}

/// Root handler
async fn root() -> impl IntoResponse {
    Json(json!({
        "name": "WeaveDB",
        "version": "1.0.0",
        "description": "Decentralized NoSQL Database"
    }))
}

/// Health check handler
async fn health() -> impl IntoResponse {
    Json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().timestamp()
    }))
}

/// Info handler
async fn info(State(state): State<ServerState>) -> impl IntoResponse {
    Json(json!({
        "id": state.id,
        "db_path": state.db_path,
        "hb_enabled": state.hb_port.is_some(),
        "hb_port": state.hb_port
    }))
}

/// WeaveDB get handler - NO SIGNATURE VERIFICATION for reads
async fn weavedb_get(
    State(state): State<ServerState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // For GET operations, skip signature verification (fast path)
    let query_str = headers.get("query")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing query header".to_string()))?;
    
    let query: Vec<Value> = serde_json::from_str(query_str)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid query: {}", e)))?;
    
    let id = headers.get("id")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing id header".to_string()))?;
    
    // Get database
    let databases = state.databases.lock().await;
    if let Some(db) = databases.get(id) {
        let mut db = db.lock().await;
        
        match db.get(query.clone()) {
            Ok(result) => Ok(Json(json!({
                "success": true,
                "query": query,
                "res": result
            }))),
            Err(e) => Ok(Json(json!({
                "success": false,
                "query": query,
                "error": e.to_string()
            })))
        }
    } else {
        Ok(Json(json!({
            "success": false,
            "query": query,
            "error": format!("Database {} not found", id)
        })))
    }
}

/// WeaveDB set handler - WITH PARALLEL SIGNATURE VERIFICATION
async fn weavedb_set(
    State(state): State<ServerState>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Verify signature in parallel (like JS verify(req))
    let verified_headers = verify_request(&headers).await
        .map_err(|e| (StatusCode::UNAUTHORIZED, format!("Verification failed: {}", e)))?;
    
    // Extract required fields
    let query_str = verified_headers.get("query")
        .ok_or((StatusCode::BAD_REQUEST, "Missing query header".to_string()))?;
    
    let query: Vec<Value> = serde_json::from_str(query_str)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid query: {}", e)))?;
    
    let id = verified_headers.get("id")
        .ok_or((StatusCode::BAD_REQUEST, "Missing id header".to_string()))?;
    
    // Check if this is an init operation
    let is_init = query.first()
        .and_then(|v| v.as_str())
        .map(|op| op == "init")
        .unwrap_or(false);
    
    // Get or create database and queue
    let mut write_queues = state.write_queues.lock().await;
    let mut databases = state.databases.lock().await;
    
    if !write_queues.contains_key(id) {
        if is_init {
            // Create new database instance with proper KV store
            let initial_kv = HashMap::new();
            let opt = HashMap::from([
                ("id".to_string(), json!(id)),
                ("db_path".to_string(), json!(format!("{}-{}", state.db_path, id))),
            ]);
            
            // Create environment with proper Store
            let env = HashMap::from([
                ("kv".to_string(), json!({})), // This will be replaced with actual Store in WeaveDB
                ("kv_dir".to_string(), json!({})),
            ]);
            
            let db = Arc::new(Mutex::new(WeaveDB::new(initial_kv, opt)));
            
            // Create write queue for this database
            let queue = Arc::new(WriteQueue::new(Arc::clone(&db)));
            
            write_queues.insert(id.to_string(), queue);
            databases.insert(id.to_string(), db);
            
            println!("📝 Initialized new database: {}", id);
        } else {
            return Ok(Json(json!({ 
                "success": false, 
                "error": format!("Database {} does not exist", id) 
            })));
        }
    }
    
    // Get write queue
    let queue = write_queues.get(id)
        .ok_or((StatusCode::INTERNAL_SERVER_ERROR, "Database queue not found".to_string()))?
        .clone();
    
    // Drop locks before queuing write
    drop(write_queues);
    drop(databases);
    
    // Build message for write operation
    let msg = json!({
        "headers": verified_headers,
        "body": body.to_vec()
    });
    
    // Queue the write operation
    match queue.queue_write(msg).await {
        Ok(result) => {
            if result.get("success").and_then(|v| v.as_bool()).unwrap_or(false) {
                Ok(Json(json!({ "success": true, "query": query })))
            } else {
                let error = result.get("error")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown error");
                Ok(Json(json!({ "success": false, "error": error, "query": query })))
            }
        }
        Err(e) => Ok(Json(json!({ "success": false, "error": e.to_string() })))
    }
}

/// Result handler for AO integration
async fn result_handler(
    State(state): State<ServerState>,
    Path(mid): Path<String>,
    Query(params): Query<HashMap<String, String>>,
    Json(payload): Json<Value>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // TODO: Implement AO integration
    let process_id = params.get("process-id");
    
    // For now, check if we have this database and process the query
    if let Some(pid) = process_id {
        let databases = state.databases.lock().await;
        if let Some(db) = databases.get(pid) {
            // Extract query from payload if present
            if let Some(edges) = payload.get("edges").and_then(|e| e.as_array()) {
                if let Some(first_edge) = edges.first() {
                    if let Some(node) = first_edge.get("node") {
                        if let Some(message) = node.get("message") {
                            if let Some(tags) = message.get("Tags").and_then(|t| t.as_array()) {
                                // Look for Query tag
                                for tag in tags {
                                    if tag.get("name").and_then(|n| n.as_str()) == Some("Query") {
                                        if let Some(query_str) = tag.get("value").and_then(|v| v.as_str()) {
                                            if let Ok(query) = serde_json::from_str::<Vec<Value>>(query_str) {
                                                let mut db = db.lock().await;
                                                if let Ok(data) = db.get(query) {
                                                    return Ok(Json(json!({
                                                        "Output": {
                                                            "data": data
                                                        },
                                                        "Messages": []
                                                    })));
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(Json(json!({
        "Output": {
            "data": null
        },
        "Messages": []
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;
    use tower::ServiceExt;
    use axum::http::Request;
    use axum::body::Body;
    
    #[tokio::test]
    async fn test_health_endpoint() {
        let app = create_router("test-db".to_string(), ".test".to_string());
        
        let response = app
            .oneshot(Request::builder().uri("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();
        
        assert_eq!(response.status(), StatusCode::OK);
    }
    
    #[tokio::test]
    async fn test_info_endpoint() {
        let app = create_router("test-db".to_string(), ".test".to_string());
        
        let response = app
            .oneshot(Request::builder().uri("/info").body(Body::empty()).unwrap())
            .await
            .unwrap();
        
        assert_eq!(response.status(), StatusCode::OK);
    }
    
    #[tokio::test]
    async fn test_parallel_verification() {
        use crate::sign::generate_rsa_keypair;
        
        let app = create_router("test-db".to_string(), ".test".to_string());
        
        // Generate test keypair
        let (private_key, (key_id, _)) = generate_rsa_keypair().unwrap();
        
        // Create signed headers
        let mut headers = HashMap::new();
        headers.insert("query".to_string(), json!(["init", "_", {"id": "test-db", "owner": "test"}]).to_string());
        headers.insert("nonce".to_string(), "1".to_string());
        headers.insert("id".to_string(), "test-db".to_string());
        
        let signed_headers = crate::sign::sign_headers(
            headers,
            &["query".to_string(), "nonce".to_string(), "id".to_string()],
            &private_key,
            &key_id,
            "sig1"
        ).unwrap();
        
        // Build request with signed headers
        let mut request = Request::builder()
            .method("POST")
            .uri("/~weavedb@1.0/set")
            .body(Body::empty())
            .unwrap();
        
        let headers_mut = request.headers_mut();
        for (key, value) in signed_headers {
            headers_mut.insert(
                axum::http::HeaderName::from_bytes(key.as_bytes()).unwrap(),
                axum::http::HeaderValue::from_str(&value).unwrap()
            );
        }
        
        let response = app
            .oneshot(request)
            .await
            .unwrap();
        
        assert_eq!(response.status(), StatusCode::OK);
    }
}
