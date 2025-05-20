use reqwest::Client;
use serde_json::{Value, json};
use std::collections::HashMap;
use crate::sign::{sign_with_content_digest, generate_rsa_keypair};
use openssl::hash::{MessageDigest, hash};
use base64::engine::general_purpose::STANDARD;

/// Client for interacting with HyperBEAM nodes
pub struct HyperBeamClient {
    http_client: Client,
    port: u16,
    private_key_pem: Option<String>,
    key_id: Option<String>,
}

impl HyperBeamClient {
    /// Create a new HyperBEAM client
    pub fn new(port: u16) -> Result<Self, Box<dyn std::error::Error>> {
        let http_client = Client::new();
        
        Ok(Self {
            http_client,
            port,
            private_key_pem: None,
            key_id: None,
        })
    }

    /// Create a new HyperBEAM client with signing keys
    pub fn new_with_keys(port: u16) -> Result<Self, Box<dyn std::error::Error>> {
        let http_client = Client::new();
        
        // Generate a key pair for signing
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .map_err(|e| e.to_string())?;
        
        Ok(Self {
            http_client,
            port,
            private_key_pem: Some(private_key_pem),
            key_id: Some(key_id),
        })
    }

    /// Set signing keys
    pub fn set_keys(&mut self, private_key_pem: String, key_id: String) {
        self.private_key_pem = Some(private_key_pem);
        self.key_id = Some(key_id);
    }

    /// Get the scheduler address - uses plain GET, no signature needed
    pub async fn get_scheduler(&self) -> Result<String, Box<dyn std::error::Error>> {
        let url = format!("http://localhost:{}/~meta@1.0/info/serialize~json@1.0", self.port);
        
        let response = self.http_client.get(&url)
            .send()
            .await?
            .text()
            .await?;
        
        let value: Value = serde_json::from_str(&response)?;
            
        let address = value.get("address")
            .and_then(|a| a.as_str())
            .ok_or_else(|| "No address in response".to_string())?;
            
        Ok(address.to_string())
    }
    
    /// Spawn a process and extract the ID from the 'process' header
    pub async fn spawn_process(&self) -> Result<String, Box<dyn std::error::Error>> {
        // Get the scheduler address
        let scheduler = self.get_scheduler().await?;
        
        // Create a random seed
        let random_seed = rand::random::<f64>().to_string();
        
        // Create the process
        let url = format!("http://localhost:{}/~process@1.0/schedule", self.port);
        
        // Build the request with ONLY the required headers, NO body
        let response = self.http_client.post(&url)
            .header("scheduler", scheduler)
            .header("method", "POST")
            .header("path", "/~process@1.0/schedule")
            .header("random-seed", random_seed)
            .header("execution-device", "weavedb@1.0")
            .send()
            .await?;
        
        // Get process ID from header
        if let Some(process_id) = response.headers().get("process").and_then(|h| h.to_str().ok()) {
            println!("Process ID from header: {}", process_id);
            return Ok(process_id.to_string());
        }
        
        // If not in headers, try to extract from body
        let response_text = response.text().await?;
        println!("Raw process response: {}", response_text);
        
        match self.extract_process_id(&response_text) {
            Some(id) => Ok(id),
            None => Err("Could not extract process ID from response".into())
        }
    }
    
    /// Extract process ID from the multipart response
    pub fn extract_process_id(&self, response: &str) -> Option<String> {
        // Look for the content-disposition line which contains the process ID
        for line in response.lines() {
            if line.contains("content-disposition") && line.contains("body/commitments/") {
                // Extract the ID which is the last part after body/commitments/
                if let Some(id_part) = line.split("body/commitments/").nth(1) {
                    // Remove any trailing quotes or special chars
                    return Some(id_part.trim_end_matches("\"").to_string());
                }
            }
        }
        None
    }
    
    /// Schedule a message with ABSOLUTELY MINIMAL HEADERS
    pub async fn schedule_message(&self, process_id: &str) -> Result<(String, Option<String>), Box<dyn std::error::Error>> {
        // EXACTLY as specified: /${pid}/schedule
        let url = format!("http://localhost:{}/{}/schedule", self.port, process_id);
        println!("Sending message to URL: {}", url);
        
        // EXACTLY as specified for the path: /${pid}/schedule
        let path = format!("/{}/schedule", process_id);
        println!("Using path header: {}", path);
        
        // Send the message with ONLY the path header and NO BODY
        let response = self.http_client.post(&url)
            .header("path", path)
            .send()
            .await?;
        
        // Check for the "slot" header
        let slot = response.headers().get("slot").and_then(|h| h.to_str().ok()).map(String::from);
        
        if let Some(slot_value) = &slot {
            println!("Slot from header: {}", slot_value);
        }
        
        // Get the response body
        let response_text = response.text().await?;
        
        Ok((response_text, slot))
    }

    /// Schedule a message with content digest and signature
pub async fn schedule_message_with_digest(
    &self, 
    process_id: &str, 
    content: Value
) -> Result<(String, Option<String>), Box<dyn std::error::Error>> {
    // Ensure we have keys for signing
    let private_key_pem = self.private_key_pem.as_ref()
        .ok_or_else(|| "No private key available for signing".to_string())?;
    let key_id = self.key_id.as_ref()
        .ok_or_else(|| "No key ID available for signing".to_string())?;
        
    // Get the scheduler address - this is required for the signature
    let scheduler = self.get_scheduler().await?;
        
    // EXACTLY as specified: /${pid}/schedule
    let url = format!("http://localhost:{}/{}/schedule", self.port, process_id);
    println!("Sending signed message to URL: {}", url);
    
    // EXACTLY as specified for the path: /${pid}/schedule
    let path = format!("/{}/schedule", process_id);
    
    // Create initial headers
    let mut headers = HashMap::new();
    headers.insert("path".to_string(), path);
    headers.insert("method".to_string(), "POST".to_string());
    // Add the scheduler header - this is REQUIRED for the signature
    headers.insert("scheduler".to_string(), scheduler);
    
    // Sign the message with content digest
    let signed_headers = sign_with_content_digest(
        headers,
        &content,
        private_key_pem,
        key_id
    ).map_err(|e| e.to_string())?;
    
    // Print the headers for debug
    println!("Signed headers: {:#?}", signed_headers);
    
    // Build the request with signed headers and JSON body
    let mut request_builder = self.http_client.post(&url);
    
    // Add all the signed headers
    for (key, value) in &signed_headers {
        request_builder = request_builder.header(key, value);
    }
    
    // Add the JSON body
    let response = request_builder
        .json(&content)
        .send()
        .await?;
    
    // Check for the "slot" header
    let slot = response.headers().get("slot").and_then(|h| h.to_str().ok()).map(String::from);
    
    if let Some(slot_value) = &slot {
        println!("Slot from header: {}", slot_value);
    }
    
    // Get the response body
    let response_text = response.text().await?;
    
    Ok((response_text, slot))
}
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;
    use tokio::time::sleep;
    
    #[tokio::test]
    async fn test_process_and_messages() {
        // Create client for HyperBEAM at port 10000
        let client = HyperBeamClient::new(10000).unwrap();
        
        // Get scheduler address
        let scheduler = client.get_scheduler().await.unwrap();
        println!("Using scheduler: {}", scheduler);
        
        // Step 1: Create a process
        println!("\n=== STEP 1: Creating Process ===");
        let process_id = match client.spawn_process().await {
            Ok(id) => {
                println!("Process created with ID: {}", id);
                id
            },
            Err(e) => {
                eprintln!("Error creating process: {}", e);
                panic!("Failed to create process");
            }
        };
        
        // Wait for process to initialize
        println!("Waiting for process to initialize...");
        sleep(Duration::from_secs(1)).await;
        
        // Step 2: EXACTLY as specified: /${pid}/schedule with MINIMAL HEADERS
        println!("\n=== STEP 2: Sending Message to /${}/schedule with MINIMAL HEADERS ===", process_id);
        
        match client.schedule_message(&process_id).await {
            Ok((response, slot)) => {
                println!("Message response: {}", response);
                println!("Slot extracted: {}", slot.unwrap_or_else(|| "No slot found".to_string()));
            },
            Err(e) => println!("Error sending message: {}", e)
        }
    }
    
    #[tokio::test]
    async fn test_process_and_messages_with_digest() {
        // Create client for HyperBEAM at port 10000 with signing keys
        let client = HyperBeamClient::new_with_keys(10000).unwrap();
        
        // Get scheduler address
        let scheduler = client.get_scheduler().await.unwrap();
        println!("Using scheduler: {}", scheduler);
        
        // Step 1: Create a process
        println!("\n=== STEP 1: Creating Process ===");
        let process_id = match client.spawn_process().await {
            Ok(id) => {
                println!("Process created with ID: {}", id);
                id
            },
            Err(e) => {
                eprintln!("Error creating process: {}", e);
                panic!("Failed to create process");
            }
        };

        // Wait for process to initialize
        println!("Waiting for process to initialize...");
        sleep(Duration::from_secs(1)).await;
        
        // Step 2: Send a message with content digest and signature
        println!("\n=== STEP 2: Sending Message with Content Digest ===");
        // Prepare message content
        let content = json!({
            "op": "put",
            "key": "test-key",
            "value": "This is a test value with content digest"
        });
        match client.schedule_message_with_digest(&process_id, content).await {
            Ok((response, slot)) => {
                println!("Message response: {}", response);
                println!("Slot extracted: {}", slot.unwrap_or_else(|| "No slot found".to_string()));
            },
            Err(e) => println!("Error sending message with digest: {}", e)
        }
    }
}
