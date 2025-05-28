// File: src/hb_client.rs

use reqwest::Client;
use serde_json::{Value, json};
use std::collections::HashMap;
use crate::sign::{sign_with_content_digest, generate_rsa_keypair};

/// Client for interacting with HyperBEAM nodes
pub struct HyperBeamClient {
    http_client: Client,
    port: u16,
    private_key_pem: Option<String>,
    key_id: Option<String>,
}

impl HyperBeamClient {
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

    /// Get the scheduler address
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
    
    /// Spawn a process
    pub async fn spawn_process(&self) -> Result<String, Box<dyn std::error::Error>> {
        // Get the scheduler address
        let scheduler = self.get_scheduler().await?;
        
        // Create a random seed
        let random_seed = rand::random::<f64>().to_string();
        
        // Create the process
        let url = format!("http://localhost:{}/~process@1.0/schedule", self.port);
        
        // Build the request with required headers
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
            return Ok(process_id.to_string());
        }
        
        // If not in headers, extract from body
        let response_text = response.text().await?;
        
        // Look for process ID in response
        for line in response_text.lines() {
            if line.contains("content-disposition") && line.contains("body/commitments/") {
                if let Some(id_part) = line.split("body/commitments/").nth(1) {
                    return Ok(id_part.trim_end_matches("\"").to_string());
                }
            }
        }
        
        Err("Could not extract process ID".into())
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
            
        // Get the scheduler address
        let scheduler = self.get_scheduler().await?;
            
        let url = format!("http://localhost:{}/{}/schedule", self.port, process_id);
        let path = format!("/{}/schedule", process_id);
        
        // Create initial headers
        let mut headers = HashMap::new();
        headers.insert("path".to_string(), path);
        headers.insert("method".to_string(), "POST".to_string());
        headers.insert("scheduler".to_string(), scheduler);
        
        // Sign the message with content digest
        let signed_headers = sign_with_content_digest(
            headers,
            &content,
            private_key_pem,
            key_id
        ).map_err(|e| e.to_string())?;
        
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
        
        // Get the response body
        let response_text = response.text().await?;
        
        Ok((response_text, slot))
    }
}
