// File: tests/simple_benchmark.rs

use std::time::Instant;
use std::collections::HashMap;
use serde_json::json;
use weavedb::build::Store;

/// Simple benchmark without authentication/nonce verification
#[test]
fn bench_raw_store_performance() {
    println!("\n=== RAW STORE PERFORMANCE (No Auth) ===\n");
    
    let iterations = 100_000;
    
    // Test PUT performance
    {
        let mut store = Store::new(HashMap::new());
        let start = Instant::now();
        
        for i in 0..iterations {
            store.put("users", &format!("user_{}", i), json!({
                "id": i,
                "name": format!("User {}", i),
                "email": format!("user{}@example.com", i),
                "age": 20 + (i % 50)
            }));
        }
        
        let duration = start.elapsed();
        let tps = iterations as f64 / duration.as_secs_f64();
        
        println!("Raw PUT Performance:");
        println!("  Iterations: {}", iterations);
        println!("  Duration: {:.3}s", duration.as_secs_f64());
        println!("  TPS: {:.0}", tps);
        println!("  Latency: {:.3}μs", (duration.as_micros() as f64) / (iterations as f64));
    }
    
    // Test GET performance
    {
        let mut store = Store::new(HashMap::new());
        
        // Pre-populate
        for i in 0..iterations {
            store.put("users", &format!("user_{}", i), json!({"id": i}));
        }
        
        let start = Instant::now();
        
        for i in 0..iterations {
            let _ = store.get("users", &format!("user_{}", i));
        }
        
        let duration = start.elapsed();
        let tps = iterations as f64 / duration.as_secs_f64();
        
        println!("\nRaw GET Performance:");
        println!("  Iterations: {}", iterations);
        println!("  Duration: {:.3}s", duration.as_secs_f64());
        println!("  TPS: {:.0}", tps);
        println!("  Latency: {:.3}μs", (duration.as_micros() as f64) / (iterations as f64));
    }
    
    // Test directory scanning performance
    {
        let mut store = Store::new(HashMap::new());
        
        // Pre-populate multiple directories
        for dir_idx in 0..10 {
            for i in 0..100 {
                store.put(&format!("dir_{}", dir_idx), &format!("key_{}", i), json!({"id": i}));
            }
        }
        
        let iterations = 10_000;
        let start = Instant::now();
        
        for i in 0..iterations {
            // Get a specific key from a directory
            let _ = store.get(&format!("dir_{}", i % 10), &format!("key_{}", i % 100));
        }
        
        let duration = start.elapsed();
        let tps = iterations as f64 / duration.as_secs_f64();
        
        println!("\nDirectory Access Performance (10 dirs, 100 keys each):");
        println!("  Iterations: {}", iterations);
        println!("  Duration: {:.3}s", duration.as_secs_f64());
        println!("  TPS: {:.0}", tps);
        println!("  Latency: {:.3}μs", (duration.as_micros() as f64) / (iterations as f64));
    }
    
    // Test mixed workload
    {
        let mut store = Store::new(HashMap::new());
        
        // Pre-populate
        for i in 0..10000 {
            store.put("data", &format!("key_{}", i), json!({"value": i}));
        }
        
        let iterations = 100_000;
        let start = Instant::now();
        
        for i in 0..iterations {
            match i % 10 {
                0..=6 => {
                    // 70% reads
                    let _ = store.get("data", &format!("key_{}", i % 10000));
                }
                7..=8 => {
                    // 20% writes
                    store.put("data", &format!("key_{}", 10000 + i), json!({"value": i}));
                }
                _ => {
                    // 10% deletes
                    store.del("data", &format!("key_{}", i % 5000));
                }
            }
        }
        
        let duration = start.elapsed();
        let tps = iterations as f64 / duration.as_secs_f64();
        
        println!("\nMixed Workload (70% read, 20% write, 10% delete):");
        println!("  Iterations: {}", iterations);
        println!("  Duration: {:.3}s", duration.as_secs_f64());
        println!("  TPS: {:.0}", tps);
        println!("  Latency: {:.3}μs", (duration.as_micros() as f64) / (iterations as f64));
    }
    
    // Memory usage estimate
    {
        let mut store = Store::new(HashMap::new());
        let sample_size = 10_000;
        
        for i in 0..sample_size {
            store.put("memory_test", &format!("key_{}", i), json!({
                "id": i,
                "name": format!("Test User {}", i),
                "email": format!("user{}@example.com", i),
                "metadata": {
                    "created": "2024-01-01",
                    "updated": "2024-01-01",
                    "tags": ["tag1", "tag2", "tag3"]
                }
            }));
        }
        
        println!("\nMemory Usage Estimate:");
        println!("  Stored {} documents", sample_size);
        println!("  Estimated per-document overhead: ~1KB (including keys and metadata)");
    }
}
