mod kv;
mod server;

use std::env;

#[tokio::main]
async fn main() {
    let port = env::args()
        .position(|arg| arg == "--port")
        .and_then(|i| env::args().nth(i + 1))
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(6868);
    server::run_server(port).await;
}
