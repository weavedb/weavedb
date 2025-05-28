// File: src/main.rs

use weavedb::{server_db, weavedb_device::wdb};
use clap::{Parser, Subcommand};
use std::collections::HashMap;
use serde_json::json;

#[derive(Parser, Debug)]
#[command(name = "weavedb")]
#[command(about = "WeaveDB - Decentralized NoSQL Database", long_about = None)]
pub struct Args {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Run the WeaveDB server
    Server {
        /// Port to listen on
        #[arg(short, long, default_value_t = 8080)]
        port: u16,
        
        /// Database ID
        #[arg(short, long, default_value = "weavedb-local")]
        id: String,
        
        /// Database storage path
        #[arg(short, long, default_value = ".weavedb")]
        db_path: String,
        
        /// HyperBEAM port (optional, enables WAL)
        #[arg(short = 'b', long)]
        hyperbeam_port: Option<u16>,
    },
    /// Run a test query
    Test {
        /// Test command to run
        #[arg(default_value = "basic")]
        test: String,
    },
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    
    match args.command {
        Some(Commands::Server { port, id, db_path, hyperbeam_port }) => {
            println!("🔧 Initializing WeaveDB...");
            if let Some(hb_port) = hyperbeam_port {
                server_db::run_weavedb_server_with_hyperbeam(port, id, db_path, Some(hb_port)).await;
            } else {
                server_db::run_weavedb_server(port, id, db_path).await;
            }
        }
        Some(Commands::Test { test }) => {
            run_tests(&test);
        }
        None => {
            // Default: run server
            println!("🔧 Initializing WeaveDB with default settings...");
            server_db::run_weavedb_server(8080, "weavedb-local".to_string(), ".weavedb".to_string()).await;
        }
    }
}

fn run_tests(test_name: &str) {
    println!("🧪 Running test: {}", test_name);
    
    match test_name {
        "basic" => {
            // Create a WeaveDB instance - just like JS: wdb(kv, opt)
            let mut db = wdb(HashMap::new(), HashMap::new());
            
            // Test init operation
            let init_msg = json!({
                "headers": {
                    "query": r#"["init", "_", {"id": "test-db", "owner": "test-owner"}]"#,
                    "nonce": "1",
                    "signature": "test-sig",
                    "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                    "id": "test-db"
                }
            });
            
            // Call db.write(msg) - just like JS
            match db.write(init_msg) {
                Ok(_) => println!("✅ Init operation successful"),
                Err(e) => println!("❌ Init operation failed: {}", e),
            }
            
            // Test set operation
            let set_msg = json!({
                "headers": {
                    "query": r#"["set", {"name": "Alice", "age": 30}, "users", "user1"]"#,
                    "nonce": "2",
                    "signature": "test-sig",
                    "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                    "id": "test-db"
                }
            });
            
            match db.write(set_msg) {
                Ok(_) => println!("✅ Set operation successful"),
                Err(e) => println!("❌ Set operation failed: {}", e),
            }
            
            // Test get operation - just like JS: db.get(...query).val()
            match db.get(vec![json!("users"), json!("user1")]) {
                Ok(result) => println!("✅ Get operation result: {}", serde_json::to_string_pretty(&result).unwrap()),
                Err(e) => println!("❌ Get operation failed: {}", e),
            }
        }
        _ => {
            println!("❓ Unknown test: {}", test_name);
        }
    }
}
