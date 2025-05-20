use std::collections::HashMap;
use base64::engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD};
use base64::Engine;
use openssl::hash::MessageDigest;
use openssl::pkey::PKey;
use openssl::rsa::Rsa;
use openssl::sign::Signer;

/// Signs an HTTP message according to RFC 9421
/// 
/// This function takes HTTP headers and signs them using RSA-PSS-SHA512.
/// It generates both the `signature-input` and `signature` headers.
/// 
/// # Arguments
/// * `headers` - HashMap of HTTP headers to include in the signature
/// * `fields` - List of header field names to include in the signature
/// * `private_key_pem` - RSA private key in PEM format
/// * `key_id` - The key identifier (base64url-encoded RSA modulus)
/// * `signature_label` - Label for this signature (e.g., "sig1")
/// 
/// # Returns
/// A tuple containing (signature-input header value, signature header value)
pub fn sign_message(
    headers: &HashMap<String, String>,
    fields: &[String],
    private_key_pem: &str,
    key_id: &str,
    signature_label: &str,
) -> Result<(String, String), String> {
    let private_key = PKey::private_key_from_pem(private_key_pem.as_bytes())
        .map_err(|e| format!("Failed to parse private key: {}", e))?;

    // Build the signature-input header value
    let fields_str = fields
        .iter()
        .map(|f| format!("\"{}\"", f.to_lowercase()))
        .collect::<Vec<_>>()
        .join(" ");
    
    let signature_input_value = format!(
        "{}=({});keyid=\"{}\"",
        signature_label,
        fields_str,
        key_id
    );

    // Extract the raw parameters part (everything after the equals sign)
    let raw_params = &signature_input_value[signature_input_value.find('=').unwrap() + 1..];

    // Build the signature base string
    let signing_string = build_signature_base(headers, fields, raw_params)?;

    // Sign the message
    let signature_bytes = sign_with_rsa_pss(&private_key, &signing_string)?;
    
    // Encode signature as base64
    let signature_b64 = STANDARD.encode(&signature_bytes);
    
    // Build the signature header value
    let signature_value = format!("{}=:{}:", signature_label, signature_b64);

    Ok((signature_input_value, signature_value))
}

/// Generates a complete set of headers with signature included
/// 
/// This is a convenience function that adds the signature headers to the existing headers.
pub fn sign_headers(
    mut headers: HashMap<String, String>,
    fields: &[String],
    private_key_pem: &str,
    key_id: &str,
    signature_label: &str,
) -> Result<HashMap<String, String>, String> {
    let (signature_input, signature) = sign_message(
        &headers,
        fields,
        private_key_pem,
        key_id,
        signature_label,
    )?;

    headers.insert("signature-input".to_string(), signature_input);
    headers.insert("signature".to_string(), signature);

    Ok(headers)
}

/// Builds the signature base string according to RFC 9421 format
fn build_signature_base(
    headers: &HashMap<String, String>,
    fields: &[String],
    raw_params: &str,
) -> Result<String, String> {
    let mut signing_string = String::new();

    // Add each covered component in the format: "field-name": value\n
    for field in fields {
        let value = headers
            .get(field)
            .ok_or_else(|| format!("Missing header field: {}", field))?;
        signing_string.push_str(&format!("\"{}\": {}\n", field.to_lowercase(), value));
    }

    // Add the signature parameters line (no trailing newline)
    signing_string.push_str(&format!("\"@signature-params\": {}", raw_params));
    
    Ok(signing_string)
}

/// Signs the message using RSA-PSS-SHA512
fn sign_with_rsa_pss(
    private_key: &PKey<openssl::pkey::Private>,
    signing_string: &str,
) -> Result<Vec<u8>, String> {
    let mut signer = Signer::new(MessageDigest::sha512(), private_key)
        .map_err(|e| format!("Failed to create signer: {}", e))?;

    // Configure RSA-PSS padding (matches the verifier)
    signer
        .set_rsa_padding(openssl::rsa::Padding::PKCS1_PSS)
        .map_err(|e| format!("Failed to set PSS padding: {}", e))?;

    // Set MGF1 hash function to SHA-512 (matches the verifier)
    signer
        .set_rsa_mgf1_md(MessageDigest::sha512())
        .map_err(|e| format!("Failed to set MGF1 hash function: {}", e))?;

    // Update signer with the signing string
    signer
        .update(signing_string.as_bytes())
        .map_err(|e| format!("Failed to update signer: {}", e))?;

    // Generate the signature
    signer
        .sign_to_vec()
        .map_err(|e| format!("Failed to sign message: {}", e))
}

/// Generates an RSA key pair for testing
/// 
/// Returns (private_key_pem, public_key_components)
/// The public_key_components tuple contains (modulus_base64url, exponent_base64url)
pub fn generate_rsa_keypair() -> Result<(String, (String, String)), String> {
    let rsa = Rsa::generate(2048)
        .map_err(|e| format!("Failed to generate RSA key: {}", e))?;

    // Get private key PEM
    let private_key_pem = String::from_utf8(
        rsa.private_key_to_pem()
            .map_err(|e| format!("Failed to export private key: {}", e))?,
    )
    .map_err(|e| format!("Failed to convert private key to string: {}", e))?;

    // Get public key components for JWK-style key ID
    let n = rsa.n().to_vec();
    let e = rsa.e().to_vec();
    
    let n_b64 = URL_SAFE_NO_PAD.encode(&n);
    let e_b64 = URL_SAFE_NO_PAD.encode(&e);

    Ok((private_key_pem, (n_b64, e_b64)))
}

/// Convenience function to create headers with a query and sign them
/// 
/// This is useful for creating signed requests to your `/query` endpoint.
pub fn create_signed_query_headers(
    query_json: &str,
    private_key_pem: &str,
    key_id: &str,
) -> Result<HashMap<String, String>, String> {
    let mut headers = HashMap::new();
    headers.insert("query".to_string(), query_json.to_string());
    headers.insert("content-type".to_string(), "application/json".to_string());

    // Sign the headers (including the query header)
    let fields = vec!["query".to_string(), "content-type".to_string()];
    sign_headers(headers, &fields, private_key_pem, key_id, "sig1")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::verify::verify_signature;
    use std::time::Instant;

    #[test]
    fn test_sign_and_verify_roundtrip() {
        // Generate a test key pair
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .expect("Failed to generate key pair");

        // Create test headers
        let mut headers = HashMap::new();
        headers.insert("query".to_string(), r#"{"op":"put","key":"test","value":"value"}"#.to_string());
        headers.insert("content-type".to_string(), "application/json".to_string());

        // Sign the headers
        let fields = vec!["query".to_string(), "content-type".to_string()];
        let signed_headers = sign_headers(headers, &fields, &private_key_pem, &key_id, "sig1")
            .expect("Failed to sign headers");

        // Convert to JSON for verification
        let headers_json = serde_json::to_string(&signed_headers)
            .expect("Failed to serialize headers");

        // Verify the signature
        verify_signature(&headers_json)
            .expect("Signature verification should succeed");
    }

    #[test]
    fn test_create_signed_query_headers() {
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .expect("Failed to generate key pair");

        let query = r#"{"op":"put","key":"test","value":"value"}"#;
        let signed_headers = create_signed_query_headers(query, &private_key_pem, &key_id)
            .expect("Failed to create signed headers");

        // Should contain the required headers
        assert!(signed_headers.contains_key("query"));
        assert!(signed_headers.contains_key("signature-input"));
        assert!(signed_headers.contains_key("signature"));

        // Verify the signature
        let headers_json = serde_json::to_string(&signed_headers)
            .expect("Failed to serialize headers");
        verify_signature(&headers_json)
            .expect("Signature verification should succeed");
    }

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
        use std::sync::{Arc, Mutex};
        use std::thread;
        
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
