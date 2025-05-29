// Add this test to find the remaining bottleneck in the write pipeline

#[tokio::test]
async fn profile_write_pipeline_detailed() {
    println!("\n=== DETAILED WRITE PIPELINE PROFILING ===\n");
    
    use weavedb::build::{Context, Store};
    use weavedb::write::write;
    use std::collections::HashMap;
    use std::time::Instant;
    
    // Initialize
    let store = Store::new(HashMap::new());
    store.put("_", "users", serde_json::json!({"name": "users"}));
    store.commit();
    
    // Test 1: Time Context creation
    {
        println!("1. Context creation overhead:");
        let num_ops = 100_000;
        let start = Instant::now();
        
        for i in 0..num_ops {
            let _ = Context {
                kv: store.clone(),
                msg: serde_json::json!({}),
                opt: HashMap::new(),
                state: HashMap::from([
                    ("op".to_string(), serde_json::json!("set")),
                    ("dir".to_string(), serde_json::json!("users")),
                    ("doc".to_string(), serde_json::json!(format!("user{}", i))),
                    ("data".to_string(), serde_json::json!({"id": i})),
                ]),
                env: HashMap::new(),
            };
        }
        
        let elapsed = start.elapsed();
        println!("   {} Context creations: {:.3}ms", num_ops, elapsed.as_millis() as f64);
        println!("   Per creation: {:.3}µs", elapsed.as_micros() as f64 / num_ops as f64);
    }
    
    // Test 2: Profile the actual write function
    {
        println!("\n2. Full write function timing:");
        let num_ops = 1000;
        let start = Instant::now();
        
        for i in 0..num_ops {
            let mut ctx = Context {
                kv: store.clone(),
                msg: serde_json::json!({}),
                opt: HashMap::new(),
                state: HashMap::from([
                    ("op".to_string(), serde_json::json!("set")),
                    ("dir".to_string(), serde_json::json!("users")),
                    ("doc".to_string(), serde_json::json!(format!("bench_user{}", i))),
                    ("data".to_string(), serde_json::json!({"id": i})),
                    ("authenticated".to_string(), serde_json::json!(true)),
                ]),
                env: HashMap::new(),
            };
            
            ctx = write(ctx);
            
            if ctx.state.contains_key("error") {
                println!("Error: {:?}", ctx.state.get("error"));
                break;
            }
        }
        
        let elapsed = start.elapsed();
        println!("   Operations: {}", num_ops);
        println!("   Duration: {:.3}s", elapsed.as_secs_f64());
        println!("   TPS: {:.0}", num_ops as f64 / elapsed.as_secs_f64());
        println!("   Per op: {:.3}ms", elapsed.as_millis() as f64 / num_ops as f64);
    }
    
    // Test 3: Write with put_fast
    {
        println!("\n3. Write with put_fast (no BPT):");
        println!("   (Change indexer::put to indexer::put_fast in write.rs to test)");
        // This would show if BPT is still a bottleneck
    }
    
    // Test 4: Minimal write path
    {
        println!("\n4. Minimal write path (direct put_data + commit):");
        let num_ops = 10000;
        let start = Instant::now();
        
        for i in 0..num_ops {
            store.put("users", &format!("minimal_user{}", i), serde_json::json!({"id": i}));
            store.commit();
        }
        
        let elapsed = start.elapsed();
        println!("   Operations: {}", num_ops);
        println!("   Duration: {:.3}s", elapsed.as_secs_f64());
        println!("   TPS: {:.0}", num_ops as f64 / elapsed.as_secs_f64());
    }
    
    println!("\n=== ANALYSIS ===");
    println!("Compare the TPS of each test to identify bottlenecks.");
}
