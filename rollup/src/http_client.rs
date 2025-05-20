use reqwest::{Client, Response};
use serde_json::Value;
use std::collections::HashMap;
use crate::sign::{sign_headers, generate_rsa_keypair};

/// Generic HTTP client for sending signed messages
pub struct SignedHttpClient {
    client: Client,
    private_key_pem: String,
    key_id: String,
}

#[derive(Debug, thiserror::Error)]
pub enum HttpClientError {
    #[error("HTTP request failed: {0}")]
    RequestFailed(#[from] reqwest::Error),
    #[error("Signature generation failed: {0}")]
    SignatureFailed(String),
    #[error("Invalid URL: {0}")]
    InvalidUrl(String),
}

impl SignedHttpClient {
    /// Create a new HTTP client with generated keypair
    pub fn new() -> Result<Self, HttpClientError> {
        let (private_key_pem, (key_id, _)) = generate_rsa_keypair()
            .map_err(|e| HttpClientError::SignatureFailed(e))?;

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?;

        Ok(Self {
            client,
            private_key_pem,
            key_id,
        })
    }

    /// Create a client with existing keypair
    pub fn with_keypair(private_key_pem: String, key_id: String) -> Result<Self, HttpClientError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?;

        Ok(Self {
            client,
            private_key_pem,
            key_id,
        })
    }

    /// Send a signed POST request
    pub async fn post_signed(
        &self,
        url: &str,
        headers: HashMap<String, String>,
        body: Option<Value>,
    ) -> Result<String, HttpClientError> {
        let signed_headers = self.sign_request_headers(headers)?;
        
        let mut request_builder = self.client.post(url);

        // Add all signed headers
        for (key, value) in signed_headers {
            request_builder = request_builder.header(&key, &value);
        }

        // Add body if provided
        if let Some(body) = body {
            request_builder = request_builder.json(&body);
        }

        let response = request_builder.send().await?;
        let response_text = response.text().await?;
        
        Ok(response_text)
    }

    /// Send a signed GET request
    pub async fn get_signed(
        &self,
        url: &str,
        headers: HashMap<String, String>,
    ) -> Result<String, HttpClientError> {
        let signed_headers = self.sign_request_headers(headers)?;
        
        let mut request_builder = self.client.get(url);

        // Add all signed headers
        for (key, value) in signed_headers {
            request_builder = request_builder.header(&key, &value);
        }

        let response = request_builder.send().await?;
        let response_text = response.text().await?;
        
        Ok(response_text)
    }

    /// Send any HTTP method with signed headers
    pub async fn send_signed(
        &self,
        method: &str,
        url: &str,
        headers: HashMap<String, String>,
        body: Option<Value>,
    ) -> Result<String, HttpClientError> {
        match method.to_uppercase().as_str() {
            "GET" => self.get_signed(url, headers).await,
            "POST" => self.post_signed(url, headers, body).await,
            "PUT" => self.put_signed(url, headers, body).await,
            "DELETE" => self.delete_signed(url, headers).await,
            _ => Err(HttpClientError::InvalidUrl(format!("Unsupported method: {}", method))),
        }
    }

    /// Send a signed PUT request
    pub async fn put_signed(
        &self,
        url: &str,
        headers: HashMap<String, String>,
        body: Option<Value>,
    ) -> Result<String, HttpClientError> {
        let signed_headers = self.sign_request_headers(headers)?;
        
        let mut request_builder = self.client.put(url);

        // Add all signed headers
        for (key, value) in signed_headers {
            request_builder = request_builder.header(&key, &value);
        }

        // Add body if provided
        if let Some(body) = body {
            request_builder = request_builder.json(&body);
        }

        let response = request_builder.send().await?;
        let response_text = response.text().await?;
        
        Ok(response_text)
    }

    /// Send a signed DELETE request
    pub async fn delete_signed(
        &self,
        url: &str,
        headers: HashMap<String, String>,
    ) -> Result<String, HttpClientError> {
        let signed_headers = self.sign_request_headers(headers)?;
        
        let mut request_builder = self.client.delete(url);

        // Add all signed headers
        for (key, value) in signed_headers {
            request_builder = request_builder.header(&key, &value);
        }

        let response = request_builder.send().await?;
        let response_text = response.text().await?;
        
        Ok(response_text)
    }

    /// Get the public key identifier
    pub fn key_id(&self) -> &str {
        &self.key_id
    }

    /// Sign the provided headers
    fn sign_request_headers(&self, mut headers: HashMap<String, String>) -> Result<HashMap<String, String>, HttpClientError> {
        // Add content-type if not present
        if !headers.contains_key("content-type") {
            headers.insert("content-type".to_string(), "application/json".to_string());
        }

        // Get all header keys for signing
        let fields: Vec<String> = headers.keys().cloned().collect();

        // Sign the headers
        sign_headers(headers, &fields, &self.private_key_pem, &self.key_id, "sig1")
            .map_err(|e| HttpClientError::SignatureFailed(e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::time::Duration;
    use tokio::time::timeout;

    // Cleanup function to remove test databases
    fn cleanup_test_dbs() {
        for port in [10001, 10002, 10003, 10004] {
            let path = format!(".db/_{}", port);
            let _ = std::fs::remove_dir_all(&path);
        }
    }

    // Helper function to start a test server
    async fn start_test_server(port: u16) -> tokio::task::JoinHandle<()> {
        tokio::spawn(async move {
            // Clean up any existing test database
            let db_path = format!(".db/_{}", port);
            let _ = std::fs::remove_dir_all(&db_path);
            
            // Add a small delay to ensure cleanup is complete
            tokio::time::sleep(Duration::from_millis(200)).await;
            
            // Initialize the database with unique path for this test
            crate::kv::init(&db_path);
            
            // Start the server
            crate::server::run_server(port, Some(10000)).await;
        })
    }

    // Wait for server to be ready
    async fn wait_for_server(port: u16) -> bool {
        let url = format!("http://localhost:{}/kv", port);
        let client = reqwest::Client::new();
        
        for i in 0..100 { // Try for 10 seconds
            if let Ok(response) = timeout(Duration::from_millis(500), 
                client.post(&url)
                    .json(&json!({"op": "get", "key": "test"}))
                    .send()
            ).await {
                if let Ok(resp) = response {
                    if resp.status().is_success() {
                        return true;
                    }
                }
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
            if i % 10 == 0 {
                println!("Still waiting for server on port {} (attempt {})", port, i);
            }
        }
        false
    }

    #[tokio::test]
    async fn test_create_client() {
        let client = SignedHttpClient::new().unwrap();
        assert!(!client.key_id().is_empty());
        println!("Created client with key ID: {}", client.key_id());
    }

    #[tokio::test]
    async fn test_sign_headers() {
        let client = SignedHttpClient::new().unwrap();
        
        let mut headers = HashMap::new();
        headers.insert("query".to_string(), r#"{"op":"put","key":"test","value":"hello"}"#.to_string());
        headers.insert("nonce".to_string(), "12345".to_string());
        headers.insert("id".to_string(), "test_db".to_string());

        let signed_headers = client.sign_request_headers(headers).unwrap();

        // Verify signature headers are added
        assert!(signed_headers.contains_key("signature"));
        assert!(signed_headers.contains_key("signature-input"));
        assert!(signed_headers.contains_key("content-type"));

        println!("Signed headers:");
        for (key, value) in signed_headers {
            println!("  {}: {}", key, value);
        }
    }

    #[tokio::test]
    async fn test_with_own_server() {
        cleanup_test_dbs();
        let port = 10000;
        
        // Start our own server
        let _server_handle = start_test_server(port).await;
        
        // Wait for server to be ready
        assert!(wait_for_server(port).await, "Test server failed to start");
        
        println!("✅ Test server started on port {}", port);
        
        // Create client
        let client = SignedHttpClient::new().unwrap();
        println!("Client key ID: {}", client.key_id());

        // Test signed operations
        let mut headers = HashMap::new();
        headers.insert("query".to_string(), r#"{"op":"put","key":"test123","value":"hello world"}"#.to_string());
        headers.insert("nonce".to_string(), "12345".to_string());
        headers.insert("id".to_string(), "test_database".to_string());

        let response = client.post_signed(
            &format!("http://localhost:{}/query", port), 
            headers, 
            None
        ).await.unwrap();
        
        println!("PUT response: {}", response);
        assert!(response.contains("ok"));

        // Test GET operation (unverified)
        let get_headers = HashMap::new();
        let response = client.post_signed(
            &format!("http://localhost:{}/kv", port),
            get_headers,
            Some(json!({"op": "get", "key": "test123"}))
        ).await.unwrap();
        
        println!("GET response: {}", response);
        assert!(response.contains("hello world"));

        // Test HELLO operation (with transformer)
        let mut hello_headers = HashMap::new();
        hello_headers.insert("query".to_string(), r#"{"op":"hello","key":"greeting","value":"World"}"#.to_string());
        hello_headers.insert("nonce".to_string(), "54321".to_string());
        hello_headers.insert("id".to_string(), "test_database".to_string());

        let response = client.post_signed(
            &format!("http://localhost:{}/query", port),
            hello_headers,
            None
        ).await.unwrap();
        
        println!("HELLO response: {}", response);

        // Verify the transformation happened
        let response = client.post_signed(
            &format!("http://localhost:{}/kv", port),
            HashMap::new(),
            Some(json!({"op": "get", "key": "greeting"}))
        ).await.unwrap();
        
        println!("GET greeting response: {}", response);
        assert!(response.contains("Hello, World!"));

        // Shutdown the server
        let response = client.post_signed(
            &format!("http://localhost:{}/kv", port),
            HashMap::new(),
            Some(json!({"op": "close"}))
        ).await.unwrap();
        
        println!("Shutdown response: {}", response);
        
        // Wait a bit for shutdown to complete
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    #[tokio::test]
    #[ignore] // Run separately to avoid port conflicts
    async fn test_multiple_requests() {
        cleanup_test_dbs();
        let port = 10002;
        
        // Start server
        let _server_handle = start_test_server(port).await;
        assert!(wait_for_server(port).await, "Test server failed to start");
        
        let client = SignedHttpClient::new().unwrap();
        println!("Testing multiple requests with client: {}", client.key_id());

        // Send multiple signed requests
        for i in 0..5 {
            let mut headers = HashMap::new();
            headers.insert("query".to_string(), format!(r#"{{"op":"put","key":"multi_{}","value":"value_{}"}}"#, i, i));
            headers.insert("nonce".to_string(), (12345 + i).to_string());
            headers.insert("id".to_string(), "multi_test_db".to_string());

            let response = client.post_signed(
                &format!("http://localhost:{}/query", port),
                headers,
                None
            ).await.unwrap();
            
            println!("Request {} response: {}", i, response);
            assert!(response.contains("ok"));
        }

        // Verify all values were stored
        for i in 0..5 {
            let response = client.post_signed(
                &format!("http://localhost:{}/kv", port),
                HashMap::new(),
                Some(json!({"op": "get", "key": format!("multi_{}", i)}))
            ).await.unwrap();
            
            println!("Get multi_{} response: {}", i, response);
            assert!(response.contains(&format!("value_{}", i)));
        }

        // Shutdown
        client.post_signed(
            &format!("http://localhost:{}/kv", port),
            HashMap::new(), 
            Some(json!({"op": "close"}))
        ).await.unwrap();
        
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    #[tokio::test]
    #[ignore] // Run separately to avoid port conflicts
    async fn test_signature_verification() {
        cleanup_test_dbs();
        let port = 10003;
        
        // Start server
        let _server_handle = start_test_server(port).await;
        assert!(wait_for_server(port).await, "Test server failed to start");
        
        let client = SignedHttpClient::new().unwrap();
        println!("Testing signature verification with client: {}", client.key_id());

        // Test valid signed request
        let mut headers = HashMap::new();
        headers.insert("query".to_string(), r#"{"op":"put","key":"sig_test","value":"valid"}"#.to_string());
        headers.insert("nonce".to_string(), "99999".to_string());
        headers.insert("id".to_string(), "sig_test_db".to_string());

        let response = client.post_signed(
            &format!("http://localhost:{}/query", port),
            headers,
            None
        ).await.unwrap();
        
        println!("Valid signature response: {}", response);
        assert!(response.contains("ok"));

        // Test that unsigned request to /query fails
        let unsigned_client = reqwest::Client::new();
        let response = unsigned_client.post(&format!("http://localhost:{}/query", port))
            .json(&json!({"op": "put", "key": "unsigned", "value": "should_fail"}))
            .send()
            .await.unwrap();
            
        println!("Unsigned request status: {}", response.status());
        assert!(!response.status().is_success());

        // But unsigned request to /kv should work (for get/close operations)
        let response = unsigned_client.post(&format!("http://localhost:{}/kv", port))
            .json(&json!({"op": "get", "key": "sig_test"}))
            .send()
            .await.unwrap();
            
        println!("Unsigned /kv request status: {}", response.status());
        assert!(response.status().is_success());

        // Shutdown
        unsigned_client.post(&format!("http://localhost:{}/kv", port))
            .json(&json!({"op": "close"}))
            .send()
            .await.unwrap();
        
        tokio::time::sleep(Duration::from_millis(500)).await;
    }

    #[tokio::test]
    #[ignore] // Run separately to avoid port conflicts
    async fn test_error_handling() {
        cleanup_test_dbs();
        let port = 10004;
        
        // Start server  
        let _server_handle = start_test_server(port).await;
        assert!(wait_for_server(port).await, "Test server failed to start");
        
        let client = SignedHttpClient::new().unwrap();

        // Test invalid JSON in query header
        let mut headers = HashMap::new();
        headers.insert("query".to_string(), "invalid json".to_string());
        headers.insert("nonce".to_string(), "11111".to_string());
        headers.insert("id".to_string(), "error_test_db".to_string());

        let response = client.post_signed(
            &format!("http://localhost:{}/query", port),
            headers,
            None
        ).await.unwrap();
        
        println!("Invalid JSON response: {}", response);
        // Should get an error response but not crash

        // Test missing query header
        let mut headers = HashMap::new();
        headers.insert("nonce".to_string(), "11112".to_string());
        headers.insert("id".to_string(), "error_test_db".to_string());

        let response = client.post_signed(
            &format!("http://localhost:{}/query", port),
            headers,
            None
        ).await.unwrap();
        
        println!("Missing query header response: {}", response);

        // Shutdown
        client.post_signed(
            &format!("http://localhost:{}/kv", port),
            HashMap::new(),
            Some(json!({"op": "close"}))
        ).await.unwrap();
        
        tokio::time::sleep(Duration::from_millis(500)).await;
    }
}
