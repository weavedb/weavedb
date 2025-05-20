use axum::{
    extract::Request,
    body,
    routing::post,
    Json, Router, serve,
};
use http::StatusCode;
use serde::{Deserialize, Serialize};
use std::{
    cell::RefCell,
    net::SocketAddr,
    sync::Arc,
    collections::HashMap,
    process,
};
use tokio::{net::TcpListener, sync::Notify};

use crate::verify::verify_signature;
use crate::transform::Transformer;
use crate::kv;
use crate::bundler;

thread_local! {
    static TRANSFORMER: RefCell<Transformer> = RefCell::new(Transformer::new());
}

#[derive(Deserialize, Debug)]
pub struct KVRequest {
    pub op: String,
    pub key: Option<String>,
    pub value: Option<String>,
}

#[derive(Serialize, Debug)]
pub struct KVResponse {
    pub result: Option<String>,
    pub message: String,
}

pub async fn kv_handler(
    Json(req): Json<KVRequest>,
    shutdown: Arc<Notify>,
) -> Json<KVResponse> {
    match req.op.as_str() {
        "get" => {
            if let Some(key) = req.key {
                let val = kv::get(&key);
                Json(KVResponse { result: val, message: "ok".into() })
            } else {
                Json(KVResponse { result: None, message: "missing key for get".into() })
            }
        }
        "flush" => {
            // Force flush of the bundler
            bundler::flush().await;
            Json(KVResponse { result: None, message: "bundler flushed".into() })
        }
        "close" => {
            println!("🔁 Received shutdown request");
            
            // Flush bundler before shutting down
            bundler::flush().await;
            
            let notify = shutdown.clone();
            tokio::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                notify.notify_one();
            });

            Json(KVResponse {
                result: None,
                message: "server shutting down".into(),
            })
        }
        _ => Json(KVResponse { result: None, message: "unknown op".into() }),
    }
}

fn headers_to_map(headers: &http::HeaderMap) -> HashMap<String, String> {
    let mut map = HashMap::new();
    
    for (name, value) in headers.iter() {
        let key = name.as_str().to_lowercase();
        if let Ok(value_str) = value.to_str() {
            map.insert(key, value_str.to_string());
        }
    }
    
    map
}

pub async fn query(req: Request<body::Body>) -> Result<Json<KVResponse>, (StatusCode, String)> {
    let (parts, body) = req.into_parts();
    let headers = parts.headers;
    let headers_map = headers_to_map(&headers);
    let headers_json = serde_json::to_string(&headers_map)
        .map_err(|e| {
            eprintln!("Failed to serialize headers: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, "Failed to process headers".to_string())
        })?;
    
    match verify_signature(&headers_json) {
        Ok(()) => {
            println!("✅ Signature verification successful");
        }
        Err(e) => {
            eprintln!("❌ Signature verification failed: {}", e);
            return Err((StatusCode::UNAUTHORIZED, format!("Signature verification failed: {}", e)));
        }
    }

    let query_header = headers.get("query")
        .ok_or((StatusCode::BAD_REQUEST, "Missing 'query' header".to_string()))?;
    
    let query_str = query_header.to_str()
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid query header: {}", e)))?;
    
    let kv_req: KVRequest = serde_json::from_str(query_str)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid JSON in query header: {}", e)))?;
    
    println!("kv: {:?}", kv_req);

    match kv_req.op.as_str() {
        "put" => {
            if let (Some(key), Some(val)) = (kv_req.key.clone(), kv_req.value.clone()) {
                // Update local KV store immediately
                kv::put(&key, &val);
                
                // Add to bundle for HyperBEAM
                bundler::add_put(&key, &val).await;
                
                Ok(Json(KVResponse { result: None, message: "ok".into() }))
            } else {
                Ok(Json(KVResponse { result: None, message: "missing key/value for put".into() }))
            }
        }
        "hello" => {
            if let (Some(key), Some(val)) = (kv_req.key.clone(), kv_req.value) {
                let transformed = TRANSFORMER.with(|t| t.borrow_mut().apply(&val).unwrap());
                
                // Update local KV store immediately
                kv::put(&key, &transformed);
                
                // Add to bundle for HyperBEAM
                bundler::add_put(&key, &transformed).await;
                
                Ok(Json(KVResponse { result: None, message: "ok".into() }))
            } else {
                Ok(Json(KVResponse { result: None, message: "missing key/value for put".into() }))
            }
        }
        "del" => {
            if let Some(key) = kv_req.key.clone() {
                // Update local KV store immediately
                kv::del(&key);
                
                // Add to bundle for HyperBEAM
                bundler::add_del(&key).await;
                
                Ok(Json(KVResponse { result: None, message: "ok".into() }))
            } else {
                Ok(Json(KVResponse { result: None, message: "missing key for del".into() }))
            }
        }
        _ => {
            Ok(Json(KVResponse { result: Some("signature verified".into()), message: "ok".into() }))
        }
    }
}

pub async fn run_server(port: u16, hb_port: Option<u16>) {
    // Initialize HyperBEAM process if port is provided
    if let Some(process_id) = bundler::init(hb_port).await {
        println!("🚀 HyperBEAM integration enabled with process ID: {}", process_id);
    } else if hb_port.is_some() {
        println!("⚠️ HyperBEAM integration failed to initialize");
    }
    
    let shutdown_notify = Arc::new(Notify::new());
    let shutdown_for_handler = shutdown_notify.clone();

    let app = Router::new()
        .route("/kv", post(move |body| kv_handler(body, shutdown_for_handler.clone())))
        .route("/query", post(query));

    let addr: SocketAddr = ([127, 0, 0, 1], port).into();
    
    // Try to bind to the address, handle error gracefully
    match TcpListener::bind(addr).await {
        Ok(listener) => {
            println!("🚀 Server listening on http://{}", addr);

            serve(listener, app)
                .with_graceful_shutdown(async move {
                    shutdown_notify.notified().await;
                    println!("✅ Server shutdown signal received");
                })
                .await
                .expect("Server error");
        },
        Err(e) => {
            eprintln!("❌ Failed to bind to address {}: {}", addr, e);
            eprintln!("The port may already be in use. Try a different port with --port <PORT>");
            process::exit(1);
        }
    }
}
