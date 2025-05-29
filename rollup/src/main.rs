// src/main.rs

use std::net::SocketAddr;
use tokio::net::TcpListener;
use clap::{Parser, Subcommand};

/// WeaveDB Command Line Interface
#[derive(Parser)]
#[command(name = "weavedb")]
#[command(about = "WeaveDB - Decentralized NoSQL Database", long_about = None)]
pub struct Args {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Run the WeaveDB server
    Server {
        /// Port to listen on
        #[arg(short, long, default_value_t = 8080)]
        port: u16,
        
        /// Database ID
        #[arg(short, long, default_value = "weavedb-local")]
        id: String,
        
        /// Database path
        #[arg(short, long, default_value = ".weavedb")]
        db_path: String,
        
        /// HyperBeam port (if using HyperBeam)
        #[arg(short = 'b', long)]
        hb_port: Option<u16>,
        
        /// Use parallel verification for better performance
        #[arg(long)]
        parallel: bool,
        
        /// Admin wallet (for parallel mode, base64url encoded public key)
        #[arg(long)]
        admin_key: Option<String>,
    },
    /// Run the weavedb docker configuration
    Docker {
        /// Docker mode
        #[arg(default_value = "basic")]
        mode: String,
    },
}

/// Calculate address from public key (for admin address)
fn calculate_address(public_key: &str) -> Result<String, String> {
    use sha2::{Sha256, Digest};
    use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
    
    let pub_bytes = URL_SAFE_NO_PAD.decode(public_key)
        .map_err(|e| format!("Failed to decode public key: {}", e))?;
    
    let mut hasher = Sha256::new();
    hasher.update(&pub_bytes);
    let hash = hasher.finalize();
    
    Ok(URL_SAFE_NO_PAD.encode(&hash))
}

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    let args = Args::parse();
    
    match args.command {
        Some(Commands::Server { port, id, db_path, hb_port, parallel, admin_key }) => {
            if parallel {
                println!("Starting WeaveDB server on port {} (parallel verification mode)", port);
                
                // For parallel mode, we can use the same server with a flag
                let db_id = if let Some(key) = admin_key {
                    match calculate_address(&key) {
                        Ok(addr) => {
                            println!("Admin address: {}", addr);
                            format!("{}-parallel", id)
                        }
                        Err(e) => {
                            eprintln!("Failed to calculate admin address: {}", e);
                            eprintln!("Please provide a valid --admin-key");
                            std::process::exit(1);
                        }
                    }
                } else {
                    // Generate a new key pair for demo purposes
                    let (_, (key_id, _)) = weavedb::sign::generate_rsa_keypair()
                        .expect("Failed to generate keypair");
                    let addr = calculate_address(&key_id).expect("Failed to calculate address");
                    
                    println!("Generated admin key: {}", key_id);
                    println!("Admin address: {}", addr);
                    println!("Save this key to use for admin operations!");
                    
                    format!("{}-parallel", id)
                };
                
                // Use the same router - server_db already has parallel verification built in
                let router = if let Some(hb_port) = hb_port {
                    weavedb::server_db::create_router_with_hb(db_id, db_path, hb_port).await
                } else {
                    weavedb::server_db::create_router(db_id, db_path)
                };
                
                let addr = SocketAddr::from(([127, 0, 0, 1], port));
                let listener = TcpListener::bind(addr).await.unwrap();
                
                println!("WeaveDB server (with parallel verification) listening on {}", addr);
                
                axum::serve(listener, router).await.unwrap();
            } else {
                println!("Starting WeaveDB server on port {}", port);
                
                let router = if let Some(hb_port) = hb_port {
                    weavedb::server_db::create_router_with_hb(id.clone(), db_path.clone(), hb_port).await
                } else {
                    weavedb::server_db::create_router(id.clone(), db_path.clone())
                };
                
                let addr = SocketAddr::from(([127, 0, 0, 1], port));
                let listener = TcpListener::bind(addr).await.unwrap();
                
                println!("WeaveDB server listening on {}", addr);
                
                axum::serve(listener, router).await.unwrap();
            }
        }
        Some(Commands::Docker { mode }) => {
            println!("Running WeaveDB in Docker mode: {}", mode);
            // Docker mode implementation would go here
            eprintln!("Docker mode not yet implemented");
            std::process::exit(1);
        }
        None => {
            // Default behavior - run server on port 8080
            println!("Starting WeaveDB server on default port 8080");
            
            let router = weavedb::server_db::create_router(
                "weavedb-local".to_string(), 
                ".weavedb".to_string()
            );
            
            let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
            let listener = TcpListener::bind(addr).await.unwrap();
            
            println!("WeaveDB server listening on {}", addr);
            
            axum::serve(listener, router).await.unwrap();
        }
    }
}
