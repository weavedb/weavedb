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
use tokio::sync::Mutex;
use std::collections::HashMap;
use crate::weavedb_device::WeaveDB;

/// Server state
#[derive(Clone)]
pub struct ServerState {
    db: Arc<Mutex<WeaveDB>>,
    id: String,
    db_path: String,
    hb_port: Option<u16>,
}

/// Query parameters
#[derive(Debug, Deserialize)]
pub struct QueryParams {
    op: Option<String>,
    collection: Option<String>,
    doc: Option<String>,
}

/// Create router with default configuration
pub fn create_router(id: String, db_path: String) -> Router {
    create_router_with_options(id, db_path, None)
}

/// Create router with HyperBeam configuration
pub async fn create_router_with_hb(id: String, db_path: String, hb_port: u16) -> Router {
    // In a full implementation, this would set up HyperBeam connection
    // For now, just create the router with the port stored
    create_router_with_options(id, db_path, Some(hb_port))
}

/// Create router with custom options
pub fn create_router_with_options(id: String, db_path: String, hb_port: Option<u16>) -> Router {
    // Initialize WeaveDB
    let initial_kv = HashMap::new();
    let opt = HashMap::from([
        ("id".to_string(), json!(id.clone())),
        ("db_path".to_string(), json!(db_path.clone())),
    ]);
    
    let db = WeaveDB::new(initial_kv, opt);
    
    // Create server state
    let state = ServerState {
        db: Arc::new(Mutex::new(db)),
        id,
        db_path,
        hb_port,
    };
    
    // Build router - matching JavaScript server routes
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

/// WeaveDB get handler - matches JS: app.get("/~weavedb@1.0/get", ...)
async fn weavedb_get(
    State(state): State<ServerState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // TODO: Implement signature verification like in JS verify(req)
    // For now, just extract query from headers
    
    let query_str = headers.get("query")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing query header".to_string()))?;
    
    let query: Vec<Value> = serde_json::from_str(query_str)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid query: {}", e)))?;
    
    let id = headers.get("id")
        .and_then(|v| v.to_str().ok())
        .ok_or((StatusCode::BAD_REQUEST, "Missing id header".to_string()))?;
    
    let mut db = state.db.lock().await;
    
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
}

/// WeaveDB set handler - matches JS: app.post("/~weavedb@1.0/set", ...)
async fn weavedb_set(
    State(state): State<ServerState>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Extract headers
    let mut req_headers = serde_json::Map::new();
    for (name, value) in headers.iter() {
        if let Ok(v) = value.to_str() {
            req_headers.insert(name.as_str().to_lowercase(), json!(v));
        }
    }
    
    // Build message for write operation
    let msg = json!({
        "headers": req_headers,
        "body": body.to_vec()
    });
    
    let mut db = state.db.lock().await;
    
    match db.write(msg) {
        Ok(result) => {
            if result.get("success").and_then(|v| v.as_bool()).unwrap_or(false) {
                Ok(Json(json!({ "success": true })))
            } else {
                let error = result.get("error")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Unknown error");
                Ok(Json(json!({ "success": false, "error": error })))
            }
        }
        Err(e) => Ok(Json(json!({ "success": false, "error": e.to_string() })))
    }
}

/// Result handler for AO integration - matches JS: app.post("/result/:mid", ...)
async fn result_handler(
    State(state): State<ServerState>,
    Path(mid): Path<String>,
    Query(params): Query<HashMap<String, String>>,
    Json(payload): Json<Value>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // TODO: Implement AO integration
    // For now, return a stub response
    
    let process_id = params.get("process-id");
    
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
}
