use axum::{routing::post, Json, Router, serve};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tokio::{net::TcpListener, sync::Notify};
use std::sync::Arc;

use crate::kv;

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

pub async fn run_server(port: u16) {
    let shutdown_notify = Arc::new(Notify::new());
    let shutdown_for_handler = shutdown_notify.clone();

    let app = Router::new()
        .route("/kv", post(move |body| kv_handler(body, shutdown_for_handler.clone())));

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
