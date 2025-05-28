// src/main.rs

use std::net::SocketAddr;
use tokio::net::TcpListener;
use clap::{Parser, Subcommand};
use weavedb::server_db;

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
    },
    /// Run the weavedb docker configuration
    Docker {
        /// Docker mode
        #[arg(default_value = "basic")]
        mode: String,
    },
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    
    match args.command {
        Some(Commands::Server { port, id, db_path, hb_port }) => {
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
        Some(Commands::Docker { mode }) => {
            println!("Running WeaveDB in Docker mode: {}", mode);
            // Docker mode implementation would go here
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
