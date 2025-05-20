// benchmark.rs
#[cfg(test)]
mod benchmarks {
    use std::collections::HashMap;
    use std::time::Instant;
    use std::sync::{Arc, Mutex};
    use std::thread;

    use crate::sign::{sign_headers, generate_rsa_keypair};
    use crate::verify::verify_signature;

    #[test]
    fn test_sign_tps() {
        let iterations = 10_000; // Signing is computationally expensive, use fewer iterations
        
        // Generate a test key pair
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .expect("Failed to generate key pair");

        // Prepare test data
        let base_headers = {
            let mut headers = HashMap::new();
            headers.insert("content-type".to_string(), "application/json".to_string());
            headers
        };
        let fields = vec!["query".to_string(), "content-type".to_string()];

        let start = Instant::now();
        for i in 0..iterations {
            let mut headers = base_headers.clone();
            headers.insert("query".to_string(), format!(r#"{{"op":"put","key":"key-{}","value":"value-{}"}}"#, i, i));
            
            let _ = sign_headers(headers, &fields, &private_key_pem, &key_id, "sig1")
                .expect("Failed to sign headers");
        }
        let elapsed = start.elapsed();
        let secs = elapsed.as_secs_f64();
        let tps = iterations as f64 / secs;
        
        println!("Executed {} signature operations in {:.3} seconds", iterations, secs);
        println!("Signing TPS: {:.0}", tps);
    }

    #[test]
    fn test_verify_tps() {
        let iterations = 10_000; // Verification is also computationally expensive
        
        // Generate a test key pair
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .expect("Failed to generate key pair");

        // Pre-generate signed headers for verification tests
        let mut signed_headers_list = Vec::new();
        for i in 0..iterations {
            let mut headers = HashMap::new();
            headers.insert("query".to_string(), format!(r#"{{"op":"put","key":"key-{}","value":"value-{}"}}"#, i, i));
            headers.insert("content-type".to_string(), "application/json".to_string());
            
            let fields = vec!["query".to_string(), "content-type".to_string()];
            let signed_headers = sign_headers(headers, &fields, &private_key_pem, &key_id, "sig1")
                .expect("Failed to sign headers");
            
            let headers_json = serde_json::to_string(&signed_headers)
                .expect("Failed to serialize headers");
            signed_headers_list.push(headers_json);
        }

        // Now measure verification TPS
        let start = Instant::now();
        for headers_json in &signed_headers_list {
            verify_signature(headers_json)
                .expect("Signature verification should succeed");
        }
        let elapsed = start.elapsed();
        let secs = elapsed.as_secs_f64();
        let tps = iterations as f64 / secs;
        
        println!("Executed {} verification operations in {:.3} seconds", iterations, secs);
        println!("Verification TPS: {:.0}", tps);
    }

    #[test]
    fn test_sign_verify_roundtrip_tps() {
        let iterations = 5_000; // Fewer iterations since we're doing both operations
        
        // Generate a test key pair
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .expect("Failed to generate key pair");

        let base_headers = {
            let mut headers = HashMap::new();
            headers.insert("content-type".to_string(), "application/json".to_string());
            headers
        };
        let fields = vec!["query".to_string(), "content-type".to_string()];

        let start = Instant::now();
        for i in 0..iterations {
            let mut headers = base_headers.clone();
            headers.insert("query".to_string(), format!(r#"{{"op":"put","key":"key-{}","value":"value-{}"}}"#, i, i));
            
            // Sign
            let signed_headers = sign_headers(headers, &fields, &private_key_pem, &key_id, "sig1")
                .expect("Failed to sign headers");
            
            // Verify
            let headers_json = serde_json::to_string(&signed_headers)
                .expect("Failed to serialize headers");
            verify_signature(&headers_json)
                .expect("Signature verification should succeed");
        }
        let elapsed = start.elapsed();
        let secs = elapsed.as_secs_f64();
        let tps = iterations as f64 / secs;
        
        println!("Executed {} sign+verify roundtrips in {:.3} seconds", iterations, secs);
        println!("Roundtrip TPS: {:.0}", tps);
    }

    #[test]
    fn test_parallel_verify_tps() {
        // Report system environment
        print_benchmark_environment();
        
        let iterations = 50_000; // More iterations for parallel test
        let num_cpus = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(1);
        
        println!("Testing parallel verification with {} CPU cores", num_cpus);
        
        // Generate a test key pair
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .expect("Failed to generate key pair");

        // Pre-generate signed headers for verification tests
        println!("Preparing {} signed headers...", iterations);
        let prep_start = Instant::now();
        let signed_headers_list: Vec<String> = (0..iterations)
            .map(|i| {
                let mut headers = HashMap::new();
                headers.insert("query".to_string(), format!(r#"{{"op":"put","key":"key-{}","value":"value-{}"}}"#, i, i));
                headers.insert("content-type".to_string(), "application/json".to_string());
                
                let fields = vec!["query".to_string(), "content-type".to_string()];
                let signed_headers = sign_headers(headers, &fields, &private_key_pem, &key_id, "sig1")
                    .expect("Failed to sign headers");
                
                serde_json::to_string(&signed_headers)
                    .expect("Failed to serialize headers")
            })
            .collect();
        let prep_elapsed = prep_start.elapsed();
        println!("Preparation took {:.3} seconds", prep_elapsed.as_secs_f64());

        // Test serial verification for comparison
        println!("Running serial verification...");
        let serial_start = Instant::now();
        for headers_json in &signed_headers_list {
            verify_signature(headers_json)
                .expect("Signature verification should succeed");
        }
        let serial_elapsed = serial_start.elapsed();
        let serial_secs = serial_elapsed.as_secs_f64();
        let serial_tps = iterations as f64 / serial_secs;
        
        println!("Serial: {} verifications in {:.3} seconds", iterations, serial_secs);
        println!("Serial TPS: {:.0}", serial_tps);

        // Test parallel verification using std::thread
        println!("Running parallel verification...");
        let parallel_start = Instant::now();
        
        // Split work across threads
        let chunk_size = (iterations + num_cpus - 1) / num_cpus; // Ceiling division
        let signed_headers_arc = Arc::new(signed_headers_list);
        let errors = Arc::new(Mutex::new(Vec::new()));
        let mut handles = Vec::new();
        
        for thread_id in 0..num_cpus {
            let start_idx = thread_id * chunk_size;
            let end_idx = std::cmp::min(start_idx + chunk_size, iterations);
            
            if start_idx >= iterations {
                break;
            }
            
            let signed_headers_clone = Arc::clone(&signed_headers_arc);
            let errors_clone = Arc::clone(&errors);
            
            let handle = thread::spawn(move || {
                for idx in start_idx..end_idx {
                    if let Err(e) = verify_signature(&signed_headers_clone[idx]) {
                        errors_clone.lock().unwrap().push(format!("Index {}: {}", idx, e));
                    }
                }
            });
            handles.push(handle);
        }
        
        // Wait for all threads to complete
        for handle in handles {
            handle.join().unwrap();
        }
        
        let parallel_elapsed = parallel_start.elapsed();
        let parallel_secs = parallel_elapsed.as_secs_f64();
        let parallel_tps = iterations as f64 / parallel_secs;
        
        // Check for errors
        let error_list = errors.lock().unwrap();
        if !error_list.is_empty() {
            panic!("Verification errors: {:?}", *error_list);
        }
        
        println!("Parallel: {} verifications in {:.3} seconds", iterations, parallel_secs);
        println!("Parallel TPS: {:.0}", parallel_tps);
        
        let speedup = parallel_tps / serial_tps;
        let efficiency = speedup / num_cpus as f64;
        
        println!("Speedup: {:.2}x", speedup);
        println!("Parallel efficiency: {:.1}% ({:.2}x out of {}x theoretical)", 
                 efficiency * 100.0, speedup, num_cpus);
        
        print_performance_analysis(serial_tps, parallel_tps, num_cpus);
        
        // Verify we got a reasonable speedup
        assert!(speedup > 1.5, "Expected at least 1.5x speedup, got {:.2}x", speedup);
    }

    #[cfg(feature = "tokio-runtime")]
    #[test]
    fn test_async_parallel_verify_tps() {
        use tokio::task;
        
        // Report system environment
        print_benchmark_environment();
        
        let runtime = tokio::runtime::Runtime::new().unwrap();
        runtime.block_on(async {
            let iterations = 20_000; // Fewer iterations for async test
            let num_cpus = std::thread::available_parallelism()
                .map(|n| n.get())
                .unwrap_or(1);
            
            println!("Testing async parallel verification with {} CPU cores", num_cpus);
            
            // Generate a test key pair
            let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
                .expect("Failed to generate key pair");

            // Pre-generate signed headers
            println!("Preparing {} signed headers...", iterations);
            let signed_headers_list: Vec<String> = (0..iterations)
                .map(|i| {
                    let mut headers = HashMap::new();
                    headers.insert("query".to_string(), format!(r#"{{"op":"put","key":"key-{}","value":"value-{}"}}"#, i, i));
                    headers.insert("content-type".to_string(), "application/json".to_string());
                    
                    let fields = vec!["query".to_string(), "content-type".to_string()];
                    let signed_headers = sign_headers(headers, &fields, &private_key_pem, &key_id, "sig1")
                        .expect("Failed to sign headers");
                    
                    serde_json::to_string(&signed_headers)
                        .expect("Failed to serialize headers")
                })
                .collect();

            // Test async parallel verification using spawn_blocking
            println!("Running async parallel verification...");
            let async_start = Instant::now();
            
            let mut tasks = Vec::new();
            for headers_json in signed_headers_list {
                let task = task::spawn_blocking(move || {
                    verify_signature(&headers_json)
                });
                tasks.push(task);
            }
            
            // Wait for all tasks to complete
            for task in tasks {
                task.await
                    .expect("Task panicked")
                    .expect("Signature verification should succeed");
            }
            
            let async_elapsed = async_start.elapsed();
            let async_secs = async_elapsed.as_secs_f64();
            let async_tps = iterations as f64 / async_secs;
            
            println!("Async parallel: {} verifications in {:.3} seconds", iterations, async_secs);
            println!("Async parallel TPS: {:.0}", async_tps);
            
            println!("This represents realistic server performance under load");
            print_server_capacity_projection(async_tps);
        });
    }

    /// Print system environment information that affects benchmark performance
    fn print_benchmark_environment() {
        println!("\n=== BENCHMARK ENVIRONMENT ===");
        
        // CPU information
        let num_cpus = std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(1);
        println!("CPU cores: {}", num_cpus);
        
        // Rust version and compilation info
        if let Ok(version) = std::process::Command::new("rustc").arg("--version").output() {
            if let Ok(version_str) = String::from_utf8(version.stdout) {
                println!("Rust version: {}", version_str.trim());
            }
        } else {
            println!("Rust version: Unknown");
        }
        
        // Build profile
        if cfg!(debug_assertions) {
            println!("Build: DEBUG (use --release for production benchmarks)");
        } else {
            println!("Build: RELEASE");
        }
        
        // Target architecture from built-in constants
        println!("Target arch: {}", std::env::consts::ARCH);
        println!("Target family: {}", std::env::consts::FAMILY);
        
        // OpenSSL version info
        println!("OpenSSL: {}", openssl::version::version());
        
        // OS information
        println!("OS: {}", std::env::consts::OS);
        
        // System information if available
        if std::env::consts::OS == "linux" {
            // Try to get CPU info
            if let Ok(cpuinfo) = std::fs::read_to_string("/proc/cpuinfo") {
                if let Some(model_line) = cpuinfo.lines().find(|line| line.starts_with("model name")) {
                    if let Some(model) = model_line.split(':').nth(1) {
                        println!("CPU model: {}", model.trim());
                    }
                }
            }
            
            // Try to get memory info
            if let Ok(meminfo) = std::fs::read_to_string("/proc/meminfo") {
                if let Some(mem_line) = meminfo.lines().find(|line| line.starts_with("MemTotal")) {
                    println!("Total memory: {}", mem_line.split_whitespace().nth(1).unwrap_or("Unknown"));
                }
            }
        } else if std::env::consts::OS == "macos" {
            // Try to get macOS system info
            if let Ok(output) = std::process::Command::new("sysctl")
                .args(&["-n", "machdep.cpu.brand_string"])
                .output() {
                if let Ok(cpu_model) = String::from_utf8(output.stdout) {
                    println!("CPU model: {}", cpu_model.trim());
                }
            }
            
            if let Ok(output) = std::process::Command::new("sysctl")
                .args(&["-n", "hw.memsize"])
                .output() {
                if let Ok(mem_str) = String::from_utf8(output.stdout) {
                    if let Ok(mem_bytes) = mem_str.trim().parse::<u64>() {
                        println!("Total memory: {} GB", mem_bytes / (1024 * 1024 * 1024));
                    }
                }
            }
        }
        
        println!("=============================\n");
    }

    /// Analyze and project performance characteristics
    fn print_performance_analysis(serial_tps: f64, parallel_tps: f64, num_cpus: usize) {
        println!("\n=== PERFORMANCE ANALYSIS ===");
        
        let speedup = parallel_tps / serial_tps;
        let efficiency = speedup / num_cpus as f64;
        
        // Theoretical maximum based on Amdahl's law (assuming 95% parallelizable)
        let parallel_fraction = 0.95;
        let amdahl_speedup = 1.0 / ((1.0 - parallel_fraction) + (parallel_fraction / num_cpus as f64));
        let theoretical_tps = serial_tps * amdahl_speedup;
        
        println!("Parallel efficiency: {:.1}%", efficiency * 100.0);
        println!("Theoretical max (Amdahl's Law): {:.0} TPS", theoretical_tps);
        println!("Achieved vs theoretical: {:.1}%", (parallel_tps / theoretical_tps) * 100.0);
        
        // Project combined database + verification performance
        let db_tps = 500_000.0; // Based on your KV benchmark
        let combined_bottleneck = f64::min(db_tps, parallel_tps);
        println!("Combined DB+verification bottleneck: {:.0} TPS", combined_bottleneck);
        
        if parallel_tps > 100_000.0 {
            println!("✅ 100k+ TPS target: ACHIEVED");
        } else {
            println!("❌ 100k+ TPS target: {} TPS needed", 100_000.0 - parallel_tps);
        }
        
        println!("============================\n");
    }

    /// Project realistic server capacity under different load scenarios
    fn print_server_capacity_projection(async_tps: f64) {
        println!("\n=== SERVER CAPACITY PROJECTION ===");
        
        // Account for typical server overhead (network, parsing, serialization)
        let overhead_factor = 0.7; // 30% overhead typical for web servers
        let realistic_tps = async_tps * overhead_factor;
        
        println!("Raw async verification TPS: {:.0}", async_tps);
        println!("With server overhead (30%): {:.0} TPS", realistic_tps);
        
        // Different load scenarios
        let scenarios = [
            ("Light load (1% verified ops)", 0.01),
            ("Medium load (10% verified ops)", 0.10),
            ("Heavy load (50% verified ops)", 0.50),
            ("All verified ops", 1.00),
        ];
        
        println!("\nProjected total throughput:");
        for (scenario, verified_ratio) in scenarios {
            let verified_tps = realistic_tps * verified_ratio;
            let unverified_tps = 500_000.0 * (1.0 - verified_ratio); // Assume 500k unverified TPS
            let total_projected = f64::min(verified_tps + unverified_tps, 
                                         f64::min(realistic_tps / verified_ratio, 500_000.0));
            println!("  {}: ~{:.0} TPS", scenario, total_projected);
        }
        
        println!("==================================\n");
    }
}
