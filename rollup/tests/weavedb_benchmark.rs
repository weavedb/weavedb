// File: tests/weavedb_benchmark.rs

use std::time::Instant;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::collections::HashMap;
use serde_json::{json, Value};
use weavedb::{
    db::{create_db_config, Store},
    build::{build, Context},
    sign::{sign_headers, generate_rsa_keypair},
    weavedb_device::WeaveDB,
};

/// Benchmark results structure
#[derive(Debug)]
struct BenchmarkResults {
    operation: String,
    iterations: usize,
    duration_secs: f64,
    tps: f64,
    latency_ms: f64,
}

impl BenchmarkResults {
    fn new(operation: &str, iterations: usize, duration: std::time::Duration) -> Self {
        let duration_secs = duration.as_secs_f64();
        let tps = iterations as f64 / duration_secs;
        let latency_ms = (duration_secs / iterations as f64) * 1000.0;
        
        Self {
            operation: operation.to_string(),
            iterations,
            duration_secs,
            tps,
            latency_ms,
        }
    }
    
    fn print(&self) {
        println!("┌─────────────────────────────────────────────────┐");
        println!("│ Operation: {:<36} │", self.operation);
        println!("├─────────────────────────────────────────────────┤");
        println!("│ Iterations: {:<35} │", self.iterations);
        println!("│ Duration: {:<33.3} s │", self.duration_secs);
        println!("│ TPS: {:<38.0} │", self.tps);
        println!("│ Latency: {:<34.3} ms │", self.latency_ms);
        println!("└─────────────────────────────────────────────────┘");
    }
}

/// Helper to create a test context with minimal setup
fn create_test_context(op: &str, data: Value) -> Context {
    let mut ctx = Context {
        kv: Store::new(HashMap::new()),
        msg: data,
        opt: HashMap::new(),
        state: HashMap::new(),
        env: HashMap::new(),
    };
    
    ctx.state.insert("op".to_string(), json!(op));
    ctx.state.insert("opcode".to_string(), json!(op));
    ctx
}

/// Benchmark raw KV store operations
#[tokio::test]
async fn bench_raw_kv_operations() {
    println!("\n=== RAW KV STORE BENCHMARKS ===\n");
    
    let iterations = 100_000;
    
    // Benchmark PUT operations
    {
        let mut store = Store::new(HashMap::new());
        let start = Instant::now();
        
        for i in 0..iterations {
            store.put("test_dir", &format!("key_{}", i), json!({
                "id": i,
                "name": format!("test_{}", i),
                "value": i * 2
            }));
        }
        
        let results = BenchmarkResults::new("Raw KV PUT", iterations, start.elapsed());
        results.print();
    }
    
    // Benchmark GET operations
    {
        let mut store = Store::new(HashMap::new());
        
        // Pre-populate
        for i in 0..iterations {
            store.put("test_dir", &format!("key_{}", i), json!({
                "id": i,
                "value": i * 2
            }));
        }
        
        let start = Instant::now();
        
        for i in 0..iterations {
            let _ = store.get("test_dir", &format!("key_{}", i));
        }
        
        let results = BenchmarkResults::new("Raw KV GET", iterations, start.elapsed());
        results.print();
    }
    
    // Benchmark mixed operations (80% read, 20% write)
    {
        let mut store = Store::new(HashMap::new());
        
        // Pre-populate
        for i in 0..iterations/2 {
            store.put("test_dir", &format!("key_{}", i), json!({"value": i}));
        }
        
        let start = Instant::now();
        
        for i in 0..iterations {
            if i % 5 == 0 {
                // 20% writes
                store.put("test_dir", &format!("key_{}", i), json!({"value": i * 3}));
            } else {
                // 80% reads
                let _ = store.get("test_dir", &format!("key_{}", i % (iterations/2)));
            }
        }
        
        let results = BenchmarkResults::new("Raw KV Mixed (80/20)", iterations, start.elapsed());
        results.print();
    }
}

/// Benchmark database operations through the full pipeline
#[tokio::test]
async fn bench_database_operations() {
    println!("\n=== DATABASE PIPELINE BENCHMARKS ===\n");
    
    let iterations = 10_000;
    
    // Create database instance
    let db_fn = build(create_db_config());
    
    // Initialize database
    let init_msg = json!({
        "headers": {
            "query": json!(["init", "_", {"id": "bench-db", "owner": "bench-owner"}]).to_string(),
            "nonce": "1",
            "id": "bench-db",
            "signature": "test-sig",
            "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#
        }
    });
    
    let _ = db_fn(HashMap::new(), HashMap::from([
        ("msg".to_string(), init_msg)
    ]));
    
    // Benchmark SET operations
    {
        // Create a new database instance for this benchmark
        let db_fn = build(create_db_config());
        
        // Initialize it
        let init_msg = json!({
            "headers": {
                "query": json!(["init", "_", {"id": "bench-db-set", "owner": "bench-owner"}]).to_string(),
                "nonce": "1",
                "id": "bench-db-set",
                "signature": "test-sig",
                "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#
            }
        });
        
        let _ = db_fn(HashMap::new(), HashMap::from([
            ("msg".to_string(), init_msg)
        ]));
        
        let start = Instant::now();
        
        for i in 0..iterations {
            let msg = json!({
                "headers": {
                    "query": json!(["set", {"name": format!("user_{}", i), "age": 25 + (i % 50)}, "users", format!("user_{}", i)]).to_string(),
                    "nonce": (i + 2).to_string(),
                    "id": "bench-db-set",
                    "signature": "test-sig",
                    "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#
                }
            });
            
            let _ = db_fn(HashMap::new(), HashMap::from([
                ("msg".to_string(), msg)
            ]));
        }
        
        let results = BenchmarkResults::new("Database SET", iterations, start.elapsed());
        results.print();
    }
    
    // Benchmark GET operations
    {
        // Create a new database instance for this benchmark
        let db_fn = build(create_db_config());
        
        // Initialize and populate it
        let init_msg = json!({
            "headers": {
                "query": json!(["init", "_", {"id": "bench-db-get", "owner": "bench-owner"}]).to_string(),
                "nonce": "1",
                "id": "bench-db-get",
                "signature": "test-sig",
                "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#
            }
        });
        
        let _ = db_fn(HashMap::new(), HashMap::from([
            ("msg".to_string(), init_msg)
        ]));
        
        // Populate some data first
        for i in 0..100 {
            let msg = json!({
                "headers": {
                    "query": json!(["set", {"name": format!("user_{}", i)}, "users", format!("user_{}", i)]).to_string(),
                    "nonce": (i + 2).to_string(),
                    "id": "bench-db-get",
                    "signature": "test-sig",
                    "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#
                }
            });
            
            let _ = db_fn(HashMap::new(), HashMap::from([
                ("msg".to_string(), msg)
            ]));
        }
        
        let start = Instant::now();
        
        for i in 0..iterations {
            let msg = json!({
                "headers": {
                    "query": json!(["get", "users", format!("user_{}", i % 100)]).to_string(),
                    "id": "bench-db-get"
                }
            });
            
            let _ = db_fn(HashMap::new(), HashMap::from([
                ("msg".to_string(), msg)
            ]));
        }
        
        let results = BenchmarkResults::new("Database GET", iterations, start.elapsed());
        results.print();
    }
}

/// Benchmark WeaveDB device operations
#[tokio::test]
async fn bench_weavedb_device() {
    println!("\n=== WEAVEDB DEVICE BENCHMARKS ===\n");
    
    let iterations = 1_000; // Reduced to avoid stack overflow
    
    // Create WeaveDB instance
    let mut db = WeaveDB::new(
        HashMap::new(),
        HashMap::from([
            ("id".to_string(), json!("bench-db")),
            ("owner".to_string(), json!("bench-owner"))
        ])
    );
    
    // Initialize the database first
    let init_msg = json!({
        "headers": {
            "query": json!(["init", "_", {"id": "bench-db", "owner": "test-signer"}]).to_string(),
            "nonce": "1",
            "id": "bench-db",
            "signature": "test-sig",
            "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
            "signer": "test-signer"
        }
    });
    let _ = db.write(init_msg);
    
    // Benchmark write operations
    {
        let start = Instant::now();
        let mut success_count = 0;
        
        for i in 0..iterations {
            let msg = json!({
                "headers": {
                    "query": json!(["set", {"value": i}, "bench", format!("doc_{}", i)]).to_string(),
                    "nonce": (i + 2).to_string(), // Start from 2 since init used 1
                    "id": "bench-db",
                    "signature": "test-sig",
                    "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                    "signer": "test-signer"
                }
            });
            
            match db.write(msg) {
                Ok(_) => success_count += 1,
                Err(_) => {} // Ignore errors for benchmark
            }
        }
        
        let results = BenchmarkResults::new(
            &format!("WeaveDB Write ({}/{} succeeded)", success_count, iterations),
            success_count,
            start.elapsed()
        );
        results.print();
    }
    
    // Benchmark read operations
    {
        let start = Instant::now();
        
        for i in 0..iterations {
            let _ = db.get(vec![
                json!("get"),
                json!("bench"),
                json!(format!("doc_{}", i))
            ]);
        }
        
        let results = BenchmarkResults::new("WeaveDB Read", iterations, start.elapsed());
        results.print();
    }
}

/// Benchmark signature operations
#[tokio::test]
async fn bench_signature_operations() {
    println!("\n=== SIGNATURE BENCHMARKS ===\n");
    
    let iterations = 1_000; // Signatures are expensive
    
    // Generate keypair
    let (private_key_pem, (key_id, _)) = generate_rsa_keypair().unwrap();
    
    // Benchmark signing
    {
        let start = Instant::now();
        
        for i in 0..iterations {
            let mut headers = HashMap::new();
            headers.insert("query".to_string(), json!(["set", {"id": i}, "test", format!("doc_{}", i)]).to_string());
            headers.insert("nonce".to_string(), i.to_string());
            headers.insert("id".to_string(), "bench-db".to_string());
            
            let _ = sign_headers(
                headers,
                &["query".to_string(), "nonce".to_string(), "id".to_string()],
                &private_key_pem,
                &key_id,
                "sig1"
            ).unwrap();
        }
        
        let results = BenchmarkResults::new("Sign Headers", iterations, start.elapsed());
        results.print();
    }
}

/// Benchmark concurrent operations
#[tokio::test]
async fn bench_concurrent_operations() {
    println!("\n=== CONCURRENT OPERATION BENCHMARKS ===\n");
    
    let iterations_per_task = 100; // Reduced to avoid issues
    let num_tasks = 10;
    let total_iterations = iterations_per_task * num_tasks;
    
    // Create shared WeaveDB instance
    let db = Arc::new(Mutex::new(WeaveDB::new(
        HashMap::new(),
        HashMap::from([
            ("id".to_string(), json!("bench-db")),
            ("owner".to_string(), json!("bench-owner"))
        ])
    )));
    
    // Initialize database
    {
        let mut db = db.lock().await;
        let init_msg = json!({
            "headers": {
                "query": json!(["init", "_", {"id": "bench-db", "owner": "concurrent-signer"}]).to_string(),
                "nonce": "1",
                "id": "bench-db",
                "signature": "test-sig",
                "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                "signer": "concurrent-signer"
            }
        });
        let _ = db.write(init_msg);
    }
    
    // Benchmark concurrent writes
    {
        let start = Instant::now();
        let mut handles = vec![];
        let nonce_start = Arc::new(Mutex::new(2)); // Start from 2 after init
        
        for task_id in 0..num_tasks {
            let db_clone = Arc::clone(&db);
            let nonce_counter = Arc::clone(&nonce_start);
            
            let handle = tokio::spawn(async move {
                let mut success_count = 0;
                
                for i in 0..iterations_per_task {
                    // Get and increment nonce atomically
                    let nonce = {
                        let mut counter = nonce_counter.lock().await;
                        let current = *counter;
                        *counter += 1;
                        current
                    };
                    
                    let msg = json!({
                        "headers": {
                            "query": json!(["set", {"task": task_id, "iter": i}, "concurrent", format!("doc_{}_{}", task_id, i)]).to_string(),
                            "nonce": nonce.to_string(),
                            "id": "bench-db",
                            "signature": "test-sig",
                            "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                            "signer": "concurrent-signer"
                        }
                    });
                    
                    let mut db = db_clone.lock().await;
                    if db.write(msg).is_ok() {
                        success_count += 1;
                    }
                }
                
                success_count
            });
            
            handles.push(handle);
        }
        
        // Wait for all tasks and collect success counts
        let mut total_success = 0;
        for handle in handles {
            total_success += handle.await.unwrap();
        }
        
        let results = BenchmarkResults::new(
            &format!("Concurrent Writes ({} tasks, {}/{} succeeded)", num_tasks, total_success, total_iterations),
            total_success,
            start.elapsed()
        );
        results.print();
    }
    
    // Benchmark concurrent reads
    {
        let start = Instant::now();
        let mut handles = vec![];
        
        for task_id in 0..num_tasks {
            let db_clone = Arc::clone(&db);
            
            let handle = tokio::spawn(async move {
                for i in 0..iterations_per_task {
                    let mut db = db_clone.lock().await;
                    let _ = db.get(vec![
                        json!("get"),
                        json!("concurrent"),
                        json!(format!("doc_{}_{}", task_id, i))
                    ]);
                }
            });
            
            handles.push(handle);
        }
        
        // Wait for all tasks
        for handle in handles {
            handle.await.unwrap();
        }
        
        let results = BenchmarkResults::new(
            &format!("Concurrent Reads ({} tasks)", num_tasks),
            total_iterations,
            start.elapsed()
        );
        results.print();
    }
}

/// Summary benchmark that tests realistic workload
#[tokio::test]
async fn bench_realistic_workload() {
    println!("\n=== REALISTIC WORKLOAD BENCHMARK ===\n");
    println!("Simulating: 70% reads, 20% writes, 10% deletes\n");
    
    let total_ops = 10_000; // Reduced from 50_000 to avoid issues
    let mut db = WeaveDB::new(
        HashMap::new(),
        HashMap::from([
            ("id".to_string(), json!("bench-db")),
            ("owner".to_string(), json!("bench-owner"))
        ])
    );
    
    // Initialize database
    let init_msg = json!({
        "headers": {
            "query": json!(["init", "_", {"id": "bench-db", "owner": "workload-signer"}]).to_string(),
            "nonce": "1",
            "id": "bench-db",
            "signature": "test-sig",
            "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
            "signer": "workload-signer"
        }
    });
    let _ = db.write(init_msg);
    
    // Pre-populate some data
    let mut nonce_counter = 2; // Start from 2 after init
    for i in 0..100 {
        let msg = json!({
            "headers": {
                "query": json!(["set", {"preload": true, "id": i}, "data", format!("pre_{}", i)]).to_string(),
                "nonce": nonce_counter.to_string(),
                "id": "bench-db",
                "signature": "test-sig",
                "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                "signer": "workload-signer"
            }
        });
        let _ = db.write(msg);
        nonce_counter += 1;
    }
    
    let start = Instant::now();
    let mut write_count = 0;
    let mut read_count = 0;
    let mut delete_count = 0;
    let mut success_count = 0;
    
    for i in 0..total_ops {
        let op_type = i % 10;
        
        match op_type {
            0..=6 => {
                // 70% reads (don't need nonces)
                let result = db.get(vec![
                    json!("get"),
                    json!("data"),
                    json!(format!("pre_{}", i % 100))
                ]);
                if result.is_ok() {
                    success_count += 1;
                }
                read_count += 1;
            }
            7..=8 => {
                // 20% writes
                let msg = json!({
                    "headers": {
                        "query": json!(["set", {"workload": true, "value": i}, "data", format!("new_{}", i)]).to_string(),
                        "nonce": nonce_counter.to_string(),
                        "id": "bench-db",
                        "signature": "test-sig",
                        "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                        "signer": "workload-signer"
                    }
                });
                if db.write(msg).is_ok() {
                    success_count += 1;
                    nonce_counter += 1;
                }
                write_count += 1;
            }
            _ => {
                // 10% deletes
                let msg = json!({
                    "headers": {
                        "query": json!(["del", "data", format!("pre_{}", i % 50)]).to_string(),
                        "nonce": nonce_counter.to_string(),
                        "id": "bench-db",
                        "signature": "test-sig",
                        "signature-input": r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#,
                        "signer": "workload-signer"
                    }
                });
                if db.write(msg).is_ok() {
                    success_count += 1;
                    nonce_counter += 1;
                }
                delete_count += 1;
            }
        }
    }
    
    let duration = start.elapsed();
    let results = BenchmarkResults::new(
        &format!("Realistic Workload ({}/{} succeeded)", success_count, total_ops),
        success_count,
        duration
    );
    results.print();
    
    println!("\nOperation breakdown:");
    println!("  Reads:   {} ({:.1}%)", read_count, (read_count as f64 / total_ops as f64) * 100.0);
    println!("  Writes:  {} ({:.1}%)", write_count, (write_count as f64 / total_ops as f64) * 100.0);
    println!("  Deletes: {} ({:.1}%)", delete_count, (delete_count as f64 / total_ops as f64) * 100.0);
    println!("  Success rate: {:.1}%", (success_count as f64 / total_ops as f64) * 100.0);
}

/// Print system information and summary
#[tokio::test]
async fn bench_summary() {
    println!("\n=== SYSTEM INFORMATION ===\n");
    
    // CPU information
    let num_cpus = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1);
    println!("CPU cores: {}", num_cpus);
    
    // Build information
    println!("Build profile: {}", if cfg!(debug_assertions) { "DEBUG" } else { "RELEASE" });
    println!("Target: {} {}", std::env::consts::ARCH, std::env::consts::OS);
    
    // Performance recommendations
    println!("\n=== PERFORMANCE RECOMMENDATIONS ===\n");
    println!("1. Run benchmarks in release mode: cargo test --release");
    println!("2. For production workloads, consider:");
    println!("   - Using connection pooling for HTTP clients");
    println!("   - Implementing caching for frequently accessed data");
    println!("   - Using batch operations where possible");
    println!("   - Enabling compression for network traffic");
    println!("3. Monitor these metrics in production:");
    println!("   - Request latency (p50, p95, p99)");
    println!("   - Throughput (requests/second)");
    println!("   - Error rates");
    println!("   - Resource utilization (CPU, memory, disk I/O)");
}
