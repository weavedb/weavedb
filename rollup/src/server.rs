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
};
use tokio::{net::TcpListener, sync::Notify};

use crate::verify::verify_signature;
use crate::transform::Transformer;
use crate::kv;

thread_local! {
    static TRANSFORMER: RefCell<Transformer> = RefCell::new(Transformer::new());
}

#[derive(Deserialize)]
pub struct KVRequest {
    pub op: String,
    pub key: Option<String>,
    pub value: Option<String>,
}

#[derive(Serialize)]
pub struct KVResponse {
    pub result: Option<String>,
    pub message: String,
}

pub async fn kv_handler(
    Json(req): Json<KVRequest>,
    shutdown: Arc<Notify>,
) -> Json<KVResponse> {
    match req.op.as_str() {
        "put" => {
            if let (Some(key), Some(val)) = (req.key, req.value) {
		kv::put(&key, &val);
                Json(KVResponse { result: None, message: "ok".into() })
            } else {
                Json(KVResponse { result: None, message: "missing key/value for put".into() })
            }
        }
	"hello" => {
            if let (Some(key), Some(val)) = (req.key, req.value) {
		let transformed = TRANSFORMER.with(|t| t.borrow_mut().apply(&val).unwrap());
		kv::put(&key, &transformed);
                Json(KVResponse { result: None, message: "ok".into() })
            } else {
                Json(KVResponse { result: None, message: "missing key/value for put".into() })
            }
        }
        "get" => {
            if let Some(key) = req.key {
                let val = kv::get(&key);
                Json(KVResponse { result: val, message: "ok".into() })
            } else {
                Json(KVResponse { result: None, message: "missing key for get".into() })
            }
        }
        "del" => {
            if let Some(key) = req.key {
                kv::del(&key);
                Json(KVResponse { result: None, message: "ok".into() })
            } else {
                Json(KVResponse { result: None, message: "missing key for del".into() })
            }
        }
        "close" => {
            println!("🔁 Received shutdown request");
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
        // Convert header name to lowercase (RFC 9421 requirement)
        let key = name.as_str().to_lowercase();
        
        // Convert header value to string
        if let Ok(value_str) = value.to_str() {
            map.insert(key, value_str.to_string());
        }
    }
    
    map
}

pub async fn query(req: Request<body::Body>) -> Result<String, (StatusCode, String)> {
    let (parts, _body) = req.into_parts();
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
            Ok("signature verified".to_string())
        }
        Err(e) => {
            eprintln!("❌ Signature verification failed: {}", e);
            Err((StatusCode::UNAUTHORIZED, format!("Signature verification failed: {}", e)))
        }
    }
}

pub async fn run_server(port: u16) {
    let shutdown_notify = Arc::new(Notify::new());
    let shutdown_for_handler = shutdown_notify.clone();

    let app = Router::new()
        .route("/kv", post(move |body| kv_handler(body, shutdown_for_handler.clone())))
	.route("/query", post(query));

    let addr: SocketAddr = ([127, 0, 0, 1], port).into();
    let listener = TcpListener::bind(addr).await.unwrap();

    println!("🚀 Server listening on http://{}", addr);

    serve(listener, app)
        .with_graceful_shutdown(async move {
            shutdown_notify.notified().await;
            println!("✅ Server shutdown signal received");
        })
        .await
        .unwrap();
}
