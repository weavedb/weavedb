// File: tests/realistic_parallel_benchmark.rs

use std::time::Instant;
use axum::http::{Request, HeaderMap, HeaderValue};
use axum::body::Body;
use tower::ServiceExt;
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Semaphore, Mutex};

#[tokio::test]
async fn bench_realistic_parallel_performance() {
    println!("\n=== REALISTIC PARALLEL PERFORMANCE BENCHMARK ===\n");
    
    // Generate accounts
    let num_accounts = 500;
    
    println!("Generating {} accounts...", num_accounts);
    let start_gen = Instant::now();
    let mut accounts = Vec::new();
    
    // Generate accounts in parallel for speed
    let handles: Vec<_> = (0..num_accounts)
        .map(|i| {
            tokio::spawn(async move {
                let (private_key, (key_id, _)) = weavedb::sign::generate_rsa_keypair().unwrap();
                (i, private_key, key_id)
            })
        })
        .collect();
    
    for handle in handles {
        let account = handle.await.unwrap();
        accounts.push(account);
    }
    
    println!("Account generation took: {:.2}s", start_gen.elapsed().as_secs_f64());
    
    // Create server
    let app = weavedb::server_db::create_router(
        "bench-parallel-db".to_string(),
        ".test-realistic-parallel".to_string()
    );
    
    // Initialize database
    let owner_address = {
        let (_, _, key_id) = &accounts[0];
        calculate_signer_address(key_id).unwrap()
    };
    
    {
        let (_, private_key, key_id) = &accounts[0];
        let init_headers = create_signed_headers(
            private_key,
            key_id,
            json!(["init", "_", {"id": "bench-parallel-db", "owner": owner_address}]).to_string(),
            "1"
        );
        
        let request = Request::builder()
            .method("POST")
            .uri("/~weavedb@1.0/set")
            .body(Body::empty())
            .unwrap();
        
        let request = add_headers(request, init_headers);
        
        let response = app.clone()
            .oneshot(request)
            .await
            .unwrap();
        
        assert_eq!(response.status(), 200);
    }
    
    // Pre-sign ONE transaction per account
    println!("\nPre-signing {} transactions (1 per account)...", num_accounts);
    let mut signed_writes = Vec::new();
    
    for (account_idx, private_key, key_id) in &accounts {
        // Account 0 uses nonce 2 (after init), others use nonce 1
        let nonce = if *account_idx == 0 { 2 } else { 1 };
        
        let headers = create_signed_headers(
            private_key,
            key_id,
            json!(["set", {
                "account": account_idx,
                "timestamp": chrono::Utc::now().timestamp_millis(),
                "data": format!("Data from account {}", account_idx)
            }, "bench", format!("doc_{}", account_idx)]).to_string(),
            &nonce.to_string()
        );
        signed_writes.push((*account_idx, headers));
    }
    
    println!("Pre-signing complete!\n");
    
    // Test burst of writes for 100ms
    {
        println!("Testing parallel write burst for ~100ms...");
        println!("({} accounts, 1 write each, no nonce conflicts)\n", num_accounts);
        
        let app = Arc::new(app.clone());
        let successful_writes = Arc::new(Mutex::new(0));
        let failed_writes = Arc::new(Mutex::new(Vec::new()));
        
        // Track operations completed over time
        let operations_completed = Arc::new(Mutex::new(Vec::new()));
        let start_time = Instant::now();
        
        // Launch all writes in parallel
        let semaphore = Arc::new(Semaphore::new(1000)); // Limit concurrent connections
        let mut handles = vec![];
        
        for (account_idx, headers) in signed_writes {
            let app = Arc::clone(&app);
            let sem = Arc::clone(&semaphore);
            let success_count = Arc::clone(&successful_writes);
            let failed = Arc::clone(&failed_writes);
            let ops_completed = Arc::clone(&operations_completed);
            let start = start_time.clone();
            
            let handle = tokio::spawn(async move {
                let _permit = sem.acquire().await.unwrap();
                
                let request = Request::builder()
                    .method("POST")
                    .uri("/~weavedb@1.0/set")
                    .body(Body::empty())
                    .unwrap();
                
                let request = add_headers(request, headers);
                
                let response = app.as_ref().clone()
                    .oneshot(request)
                    .await
                    .unwrap();
                
                let completion_time = start.elapsed();
                
                let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
                if let Ok(body_json) = serde_json::from_slice::<serde_json::Value>(&body) {
                    if body_json["success"] == true {
                        *success_count.lock().await += 1;
                        ops_completed.lock().await.push(completion_time.as_millis());
                    } else {
                        failed.lock().await.push((account_idx, body_json));
                    }
                }
            });
            
            handles.push(handle);
        }
        
        // Wait for all writes to complete
        for handle in handles {
            handle.await.unwrap();
        }
        
        let total_duration = start_time.elapsed();
        let successful = *successful_writes.lock().await;
        let failed_list = failed_writes.lock().await;
        let failed_count = failed_list.len();
        
        // Calculate TPS at different time windows
        let ops_times = operations_completed.lock().await;
        let ops_at_100ms = ops_times.iter().filter(|&&t| t <= 100).count();
        let ops_at_200ms = ops_times.iter().filter(|&&t| t <= 200).count();
        
        println!("Results:");
        println!("  Total operations: {}", num_accounts);
        println!("  Successful: {} ({:.1}%)", successful, (successful as f64 / num_accounts as f64) * 100.0);
        println!("  Failed: {} ({:.1}%)", failed_count, (failed_count as f64 / num_accounts as f64) * 100.0);
        println!("  Total duration: {:.3}s", total_duration.as_secs_f64());
        
        println!("\nTPS Analysis:");
        println!("  Operations completed in 100ms: {} (TPS: {})", 
            ops_at_100ms, 
            ops_at_100ms * 10  // Multiply by 10 to get per-second rate
        );
        println!("  Operations completed in 200ms: {} (TPS: {})", 
            ops_at_200ms,
            (ops_at_200ms as f64 * 5.0) as u64  // Multiply by 5 to get per-second rate
        );
        println!("  Overall TPS: {:.0}", successful as f64 / total_duration.as_secs_f64());
        
        if failed_count > 0 {
            println!("\nFailed operations (first 5):");
            for (account, error) in failed_list.iter().take(5) {
                println!("  Account {}: {}", account, error["error"]);
            }
        }
    }
    
    // Test read performance
    {
        println!("\n\nTesting parallel read burst for ~100ms...");
        let read_count = 2000;  // More reads since they're faster
        
        let app = Arc::new(app);
        let start = Instant::now();
        let semaphore = Arc::new(Semaphore::new(2000));
        let successful_reads = Arc::new(Mutex::new(0));
        let read_times = Arc::new(Mutex::new(Vec::new()));
        
        let mut handles = vec![];
        
        for i in 0..read_count {
            let app = Arc::clone(&app);
            let sem = Arc::clone(&semaphore);
            let success = Arc::clone(&successful_reads);
            let times = Arc::clone(&read_times);
            let start_time = start.clone();
            
            let handle = tokio::spawn(async move {
                let _permit = sem.acquire().await.unwrap();
                
                // Read from random account
                let account = i % num_accounts;
                
                let mut headers = HeaderMap::new();
                headers.insert("query", HeaderValue::from_str(
                    &json!(["get", "bench", format!("doc_{}", account)]).to_string()
                ).unwrap());
                headers.insert("id", HeaderValue::from_static("bench-parallel-db"));
                
                let request = Request::builder()
                    .method("GET")
                    .uri("/~weavedb@1.0/get")
                    .body(Body::empty())
                    .unwrap();
                
                let request = add_header_map(request, headers);
                
                let response = app.as_ref().clone()
                    .oneshot(request)
                    .await
                    .unwrap();
                
                let completion_time = start_time.elapsed();
                
                if response.status() == 200 {
                    *success.lock().await += 1;
                    times.lock().await.push(completion_time.as_millis());
                }
            });
            
            handles.push(handle);
        }
        
        for handle in handles {
            handle.await.unwrap();
        }
        
        let duration = start.elapsed();
        let successful = *successful_reads.lock().await;
        let times = read_times.lock().await;
        let reads_at_100ms = times.iter().filter(|&&t| t <= 100).count();
        
        println!("Read Results:");
        println!("  Total read attempts: {}", read_count);
        println!("  Successful: {}", successful);
        println!("  Duration: {:.3}s", duration.as_secs_f64());
        println!("  Reads in 100ms: {} (TPS: {})", reads_at_100ms, reads_at_100ms * 10);
        println!("  Overall read TPS: {:.0}", successful as f64 / duration.as_secs_f64());
    }
    
    println!("\n=== BENCHMARK COMPLETE ===");
}

fn calculate_signer_address(keyid: &str) -> Result<String, String> {
    use sha2::{Sha256, Digest};
    use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
    
    let pub_bytes = URL_SAFE_NO_PAD.decode(keyid)
        .map_err(|e| format!("Base64 decode error: {}", e))?;
    
    let mut hasher = Sha256::new();
    hasher.update(&pub_bytes);
    let hash = hasher.finalize();
    
    Ok(URL_SAFE_NO_PAD.encode(&hash))
}

fn create_signed_headers(
    private_key: &str,
    key_id: &str,
    query: String,
    nonce: &str
) -> HashMap<String, String> {
    let mut headers = HashMap::new();
    headers.insert("query".to_string(), query);
    headers.insert("nonce".to_string(), nonce.to_string());
    headers.insert("id".to_string(), "bench-parallel-db".to_string());
    
    weavedb::sign::sign_headers(
        headers,
        &["query".to_string(), "nonce".to_string(), "id".to_string()],
        private_key,
        key_id,
        "sig1"
    ).unwrap()
}

fn add_headers(mut request: Request<Body>, headers: HashMap<String, String>) -> Request<Body> {
    let headers_mut = request.headers_mut();
    for (key, value) in headers {
        headers_mut.insert(
            axum::http::HeaderName::from_bytes(key.as_bytes()).unwrap(),
            HeaderValue::from_str(&value).unwrap()
        );
    }
    request
}

fn add_header_map(mut request: Request<Body>, headers: HeaderMap) -> Request<Body> {
    let headers_mut = request.headers_mut();
    for (key, value) in headers {
        if let Some(key) = key {
            headers_mut.insert(key, value);
        }
    }
    request
}
