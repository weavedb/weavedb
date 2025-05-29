// File: src/parallel_server.rs

use axum::{
    Router,
    routing::{get, post},
    extract::{State, Path, Query},
    http::{StatusCode, HeaderMap},
    response::IntoResponse,
    body::Bytes,
};
use serde_json::{Value, json};
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use std::collections::HashMap;
use crate::weavedb_device::WeaveDB;
// The verify module is in the crate root
use crate::verify_signature;
use tokio::task;

/// Queue for sequential write operations per database
pub struct WriteQueue {
    sender: mpsc::UnboundedSender<WriteRequest>,
}

struct WriteRequest {
    headers: HashMap<String, String>,
    body: Vec<u8>,
    response_tx: tokio::sync::oneshot::Sender<Result<Value, String>>,
}

impl WriteQueue {
    /// Create a new write queue for a database instance
    pub fn new(db: Arc<Mutex<WeaveDB>>) -> Self {
        let (tx, mut rx) = mpsc::unbounded_channel::<WriteRequest>();
        
        // Spawn a task to process writes sequentially
        tokio::spawn(async move {
            while let Some(request) = rx.recv().await {
                let mut db = db.lock().await;
                
                // Build message for WeaveDB
                let msg = json!({
                    "headers": request.headers,
                    "body": request.body
                });
                
                let result = match db.write(msg) {
                    Ok(res) => Ok(res),
                    Err(e) => Err(e.to_string()),
                };
                
                // Send response back (ignore if receiver dropped)
                let _ = request.response_tx.send(result);
            }
        });
        
        WriteQueue { sender: tx }
    }
    
    /// Queue a write operation
    pub async fn queue_write(
        &self,
        headers: HashMap<String, String>,
        body: Vec<u8>,
    ) -> Result<Value, String> {
        let (tx, rx) = tokio::sync::oneshot::channel();
        
        let request = WriteRequest {
            headers,
            body,
            response_tx: tx,
        };
        
        self.sender.send(request)
            .map_err(|_| "Write queue closed".to_string())?;
        
        rx.await.map_err(|_| "Write operation cancelled".to_string())?
    }
}

/// Server state with parallel verification support
#[derive(Clone)]
pub struct ParallelServerState {
    /// Map of database ID to write queue
    write_queues: Arc<Mutex<HashMap<String, Arc<WriteQueue>>>>,
    /// Map of database ID to database instance (for reads)
    databases: Arc<Mutex<HashMap<String, Arc<Mutex<WeaveDB>>>>>,
    /// Admin address for permission checks
    admin_addr: String,
    /// Database path
    db_path: String,
}

impl ParallelServerState {
    pub fn new(admin_addr: String, db_path: String) -> Self {
        Self {
            write_queues: Arc::new(Mutex::new(HashMap::new())),
            databases: Arc::new(Mutex::new(HashMap::new())),
            admin_addr,
            db_path,
        }
    }
    
    /// Get or create a database instance
    async fn get_or_create_db(
        &self,
        db_id: &str,
        init_query: Option<&Vec<Value>>,
        signer: Option<&str>,
    ) -> Result<(), String> {
        let mut queues = self.write_queues.lock().await;
        let mut databases = self.databases.lock().await;
        
        if !queues.contains_key(db_id) {
            // Check if this is an init operation
            if let Some(query) = init_query {
                if query.first().and_then(|v| v.as_str()) == Some("init") {
                    // Verify admin permission
                    if let Some(signer_addr) = signer {
                        if signer_addr != self.admin_addr {
                            return Err("Only admin can initialize new databases".to_string());
                        }
                    }
                    
                    // Create new database instance
                    let db = Arc::new(Mutex::new(WeaveDB::new(
                        HashMap::new(),
                        HashMap::from([
                            ("id".to_string(), json!(db_id)),
                            ("db_path".to_string(), json!(format!("{}-{}", self.db_path, db_id))),
                        ])
                    )));
                    
                    // Create write queue for this database
                    let queue = Arc::new(WriteQueue::new(Arc::clone(&db)));
                    
                    queues.insert(db_id.to_string(), queue);
                    databases.insert(db_id.to_string(), db);
                    
                    Ok(())
                } else {
                    Err(format!("Database {} does not exist", db_id))
                }
            } else {
                Err(format!("Database {} does not exist", db_id))
            }
        } else {
            Ok(())
        }
    }
}

/// Create router with parallel verification
pub fn create_parallel_router(admin_addr: String, db_path: String) -> Router {
    let state = ParallelServerState::new(admin_addr, db_path);
    
    Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/~weavedb@1.0/get", get(parallel_get_handler))
        .route("/~weavedb@1.0/set", post(parallel_set_handler))
        .with_state(state)
}

/// Root handler
async fn root() -> impl IntoResponse {
    axum::Json(json!({
        "name": "WeaveDB Parallel",
        "version": "1.0.0",
        "description": "Parallel verification server"
    }))
}

/// Health handler
async fn health() -> impl IntoResponse {
    axum::Json(json!({
        "status": "healthy",
        "timestamp": chrono::Utc::now().timestamp()
    }))
}

/// Extract and verify headers in parallel
async fn verify_request_parallel(headers: &HeaderMap) -> Result<(HashMap<String, String>, String), String> {
    // Convert headers to HashMap
    let mut header_map = HashMap::new();
    for (name, value) in headers.iter() {
        if let Ok(v) = value.to_str() {
            header_map.insert(name.as_str().to_lowercase(), v.to_string());
        }
    }
    
    // Extract signature info to get signer address
    let sig_input = header_map.get("signature-input")
        .ok_or("Missing signature-input header")?;
    
    // Parse keyid from signature-input (simplified)
    let keyid = extract_keyid(sig_input)?;
    let signer = calculate_signer_address(&keyid)?;
    
    // Spawn blocking task for signature verification
    let headers_json = serde_json::to_string(&header_map)
        .map_err(|e| format!("Failed to serialize headers: {}", e))?;
    
    let verify_result = task::spawn_blocking(move || {
        verify_signature(&headers_json)
    }).await
        .map_err(|e| format!("Verification task failed: {}", e))?;
    
    verify_result.map_err(|e| format!("Invalid signature: {}", e))?;
    
    Ok((header_map, signer))
}

/// Extract keyid from signature-input header
fn extract_keyid(sig_input: &str) -> Result<String, String> {
    // Find keyid in signature-input
    if let Some(keyid_start) = sig_input.find("keyid=\"") {
        let keyid_start = keyid_start + 7;
        if let Some(keyid_end) = sig_input[keyid_start..].find('"') {
            return Ok(sig_input[keyid_start..keyid_start + keyid_end].to_string());
        }
    }
    Err("Could not extract keyid from signature-input".to_string())
}

/// Calculate signer address from keyid (simplified)
fn calculate_signer_address(keyid: &str) -> Result<String, String> {
    use sha2::{Sha256, Digest};
    use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
    
    let pub_bytes = URL_SAFE_NO_PAD.decode(keyid)
        .map_err(|e| format!("Failed to decode keyid: {}", e))?;
    
    let mut hasher = Sha256::new();
    hasher.update(&pub_bytes);
    let hash = hasher.finalize();
    
    Ok(URL_SAFE_NO_PAD.encode(&hash))
}

/// GET handler with parallel verification
async fn parallel_get_handler(
    State(state): State<ParallelServerState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // For GET operations, we can skip verification or do it in parallel
    // Let's do a fast path without verification for reads
    
    let query_str = headers.get("query")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing query header".to_string()))?;
    
    let query: Vec<Value> = serde_json::from_str(query_str)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid query: {}", e)))?;
    
    let db_id = headers.get("id")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing id header".to_string()))?;
    
    // Get database instance
    let databases = state.databases.lock().await;
    let db = databases.get(db_id)
        .ok_or((StatusCode::NOT_FOUND, format!("Database {} not found", db_id)))?;
    
    let mut db = db.lock().await;
    
    match db.get(query.clone()) {
        Ok(result) => Ok(axum::Json(json!({
            "success": true,
            "query": query,
            "res": result
        }))),
        Err(e) => Ok(axum::Json(json!({
            "success": false,
            "query": query,
            "error": e.to_string()
        })))
    }
}

/// SET handler with parallel verification
async fn parallel_set_handler(
    State(state): State<ParallelServerState>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Start verification in parallel
    let verify_future = verify_request_parallel(&headers);
    
    // While verification happens, extract basic info
    let query_str = headers.get("query")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing query header".to_string()))?;
    
    let query: Vec<Value> = serde_json::from_str(query_str)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid query: {}", e)))?;
    
    let db_id = headers.get("id")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing id header".to_string()))?;
    
    // Wait for verification to complete
    let (verified_headers, signer) = verify_future.await
        .map_err(|e| (StatusCode::UNAUTHORIZED, e))?;
    
    // Check if database exists or needs to be created
    state.get_or_create_db(db_id, Some(&query), Some(&signer)).await
        .map_err(|e| (StatusCode::FORBIDDEN, e))?;
    
    // Get write queue for this database
    let queues = state.write_queues.lock().await;
    let queue = queues.get(db_id)
        .ok_or((StatusCode::NOT_FOUND, format!("Database {} not found", db_id)))?;
    
    // Queue the write operation
    let result = queue.queue_write(verified_headers, body.to_vec()).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;
    
    if result.get("success").and_then(|v| v.as_bool()).unwrap_or(false) {
        Ok(axum::Json(json!({ "success": true, "query": query })))
    } else {
        let error = result.get("error")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown error");
        Ok(axum::Json(json!({ "success": false, "error": error, "query": query })))
    }
}
