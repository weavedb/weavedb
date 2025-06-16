// File: src/normalize.rs

use crate::build::Context;
use serde_json::{Value, json};
use sha2::{Sha256, Digest};
use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct SignatureInput {
    pub label: String,
    pub fields: Vec<String>,
    pub alg: String,
    pub keyid: String,
    pub created: Option<u64>,
    pub expires: Option<u64>,
    pub nonce: Option<String>,
}

/// Base64url decode
fn base64url_decode(s: &str) -> Result<Vec<u8>, String> {
    URL_SAFE_NO_PAD.decode(s)
        .map_err(|e| format!("Base64 decode error: {}", e))
}

/// Base64url encode
fn base64url_encode(bytes: &[u8]) -> String {
    URL_SAFE_NO_PAD.encode(bytes)
}

/// Convert public key to address using SHA256
fn to_addr(keyid: &str) -> Result<String, String> {
    let pub_bytes = base64url_decode(keyid)?;
    let mut hasher = Sha256::new();
    hasher.update(&pub_bytes);
    let hash = hasher.finalize();
    Ok(base64url_encode(&hash))
}

/// Convert number to base64url string
fn to_b64(n: u64) -> String {
    const BASE64_CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    
    if n == 0 {
        return (BASE64_CHARS[0] as char).to_string();
    }
    
    let mut result = String::new();
    let mut num = n;
    
    while num > 0 {
        result.insert(0, BASE64_CHARS[(num % 64) as usize] as char);
        num /= 64;
    }
    
    result
}

/// Parse Signature-Input header (simplified - no verification)
fn parse_si(input: &str) -> Result<SignatureInput, String> {
    let eq_pos = input.find('=')
        .ok_or("Invalid Signature-Input (no `=` found)")?;
    
    let label = input[..eq_pos].trim().to_string();
    let mut rest = input[eq_pos + 1..].trim();
    
    if !rest.starts_with('(') {
        return Err("Invalid Signature-Input (fields list missing)".to_string());
    }
    
    let end_fields = rest.find(')')
        .ok_or("Invalid Signature-Input (unclosed fields list)")?;
    
    let fields_raw = &rest[1..end_fields];
    let fields: Vec<String> = fields_raw
        .split_whitespace()
        .map(|f| f.trim_matches('"').to_lowercase())
        .collect();
    
    rest = &rest[end_fields + 1..];
    
    let mut si = SignatureInput {
        label,
        fields,
        alg: String::new(),
        keyid: String::new(),
        created: None,
        expires: None,
        nonce: None,
    };
    
    // Parse parameters
    for part in rest.split(';') {
        let p = part.trim();
        if p.is_empty() {
            continue;
        }
        
        if let Some((key, val)) = p.split_once('=') {
            let key = key.trim().to_lowercase();
            let val = val.trim().trim_matches('"');
            
            match key.as_str() {
                "alg" => si.alg = val.to_string(),
                "keyid" => si.keyid = val.to_string(),
                "created" => si.created = val.parse().ok(),
                "expires" => si.expires = val.parse().ok(),
                "nonce" => si.nonce = Some(val.to_string()),
                _ => {}
            }
        }
    }
    
    if si.alg.is_empty() {
        return Err("Missing `alg` in Signature-Input".to_string());
    }
    if si.keyid.is_empty() {
        return Err("Missing `keyid` in Signature-Input".to_string());
    }
    
    Ok(si)
}

/// Convert headers to lowercase for signature-related headers
fn to_lower(mut ctx: Context) -> Context {
    if let Some(headers) = ctx.msg.as_object_mut()
        .and_then(|m| m.get_mut("headers"))
        .and_then(|h| h.as_object_mut()) 
    {
        let mut lowers = HashMap::new();
        
        // Find and normalize signature-related headers
        let keys: Vec<String> = headers.keys().cloned().collect();
        for key in keys {
            let lower = key.to_lowercase();
            if lower == "signature" || lower == "signature-input" {
                if let Some(val) = headers.remove(&key) {
                    lowers.insert(lower, val);
                }
            }
        }
        
        // Re-insert with lowercase keys
        for (k, v) in lowers {
            headers.insert(k, v);
        }
    }
    
    ctx
}

/// Pick input headers based on signature input (NO VERIFICATION)
fn pick_input(mut ctx: Context) -> Result<Context, String> {
    let headers = ctx.msg.as_object()
        .and_then(|m| m.get("headers"))
        .and_then(|h| h.as_object())
        .ok_or("No headers in message")?;
    
    // Extract required headers that are always needed
    let id = headers.get("id")
        .and_then(|v| v.as_str())
        .ok_or("id missing")?;
    
    let query_str = headers.get("query")
        .and_then(|v| v.as_str())
        .ok_or("query missing")?;
    
    let parsed_query: Value = serde_json::from_str(query_str)
        .map_err(|e| format!("Failed to parse query: {}", e))?;
    
    // Check if this is a read operation
    let op = parsed_query.as_array()
        .and_then(|arr| arr.get(0))
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    let is_read_op = op == "get" || op == "cget";
    
    // For read operations, skip signature processing
    if is_read_op {
        // Update state with minimal info for reads
        ctx.state.insert("signer".to_string(), json!(null));
        ctx.state.insert("query".to_string(), parsed_query.clone());
        ctx.state.insert("id".to_string(), json!(id));
        ctx.state.insert("nonce".to_string(), json!(null));
        ctx.state.insert("ts".to_string(), json!(chrono::Utc::now().timestamp_millis()));
        
        // Build filtered message with minimal headers
        let mut filtered_headers = serde_json::Map::new();
        filtered_headers.insert("id".to_string(), json!(id));
        filtered_headers.insert("query".to_string(), json!(query_str));
        
        let mut new_msg = serde_json::Map::new();
        new_msg.insert("headers".to_string(), json!(filtered_headers));
        
        ctx.msg = json!(new_msg);
        
        return Ok(ctx);
    }
    
    // For write operations, require signature headers
    let sig_input = headers.get("signature-input")
        .and_then(|v| v.as_str())
        .ok_or("No signature-input header")?;
    
    let si = parse_si(sig_input)?;
    
    let nonce = headers.get("nonce")
        .ok_or("nonce missing")?;
    
    // Calculate signer address from keyid
    let signer = to_addr(&si.keyid)?;
    
    // Update state
    ctx.state.insert("signer".to_string(), json!(signer));
    ctx.state.insert("query".to_string(), parsed_query.clone());
    ctx.state.insert("id".to_string(), json!(id));
    ctx.state.insert("nonce".to_string(), nonce.clone());
    ctx.state.insert("ts".to_string(), json!(chrono::Utc::now().timestamp_millis()));
    
    // Build filtered message with signature headers
    let mut filtered_headers = serde_json::Map::new();
    
    filtered_headers.insert("signature".to_string(), 
        headers.get("signature").cloned().unwrap_or(json!(null)));
    filtered_headers.insert("signature-input".to_string(), json!(sig_input));
    
    // Add fields from signature input
    for field in &si.fields {
        if let Some(val) = headers.get(field) {
            filtered_headers.insert(field.clone(), val.clone());
        } else {
            return Err(format!("Missing required header: {}", field));
        }
    }
    
    // Build new message with filtered headers
    let mut new_msg = serde_json::Map::new();
    new_msg.insert("headers".to_string(), json!(filtered_headers));
    
    // Add body if content-digest is in fields
    if si.fields.iter().any(|f| f == "content-digest") {
        if let Some(body) = ctx.msg.get("body") {
            new_msg.insert("body".to_string(), body.clone());
        }
    }
    
    ctx.msg = json!(new_msg);
    
    Ok(ctx)
}
/// Parse operation from query
fn parse_op(mut ctx: Context) -> Result<Context, String> {
    let query = ctx.state.get("query")
        .ok_or("No query in state")?;
    
    let op = query.as_array()
        .and_then(|arr| arr.get(0))
        .and_then(|v| v.as_str())
        .ok_or("Invalid query format")?;
    
    ctx.state.insert("op".to_string(), json!(op));
    
    Ok(ctx)
}

/// Main normalize function that chains all operations (NO SIGNATURE VERIFICATION)
pub fn normalize(ctx: Context) -> Context {
    let ctx = to_lower(ctx);
    
    match pick_input(ctx) {
        Ok(ctx) => match parse_op(ctx) {
            Ok(ctx) => ctx,
            Err(e) => {
                let mut error_ctx = Context {
                    kv: crate::build::Store::new(Default::default()),
                    msg: json!({}),
                    opt: Default::default(),
                    state: Default::default(),
                    env: Default::default(),
                };
                error_ctx.state.insert("error".to_string(), json!(e));
                error_ctx
            }
        },
        Err(e) => {
            let mut error_ctx = Context {
                kv: crate::build::Store::new(Default::default()),
                msg: json!({}),
                opt: Default::default(),
                state: Default::default(),
                env: Default::default(),
            };
            error_ctx.state.insert("error".to_string(), json!(e));
            error_ctx
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_parse_si() {
        let input = r#"sig1=("@method" "@path" "content-digest");alg="eddsa-ed25519";keyid="test-key""#;
        let si = parse_si(input).unwrap();
        
        assert_eq!(si.label, "sig1");
        assert_eq!(si.fields, vec!["@method", "@path", "content-digest"]);
        assert_eq!(si.alg, "eddsa-ed25519");
        assert_eq!(si.keyid, "test-key");
    }
    
    #[test]
    fn test_to_b64() {
        assert_eq!(to_b64(0), "A");
        assert_eq!(to_b64(1), "B");
        assert_eq!(to_b64(63), "_");
        assert_eq!(to_b64(64), "BA");
        assert_eq!(to_b64(128), "CA");
    }
    
    #[test]
    fn test_normalize_flow() {
        let mut headers = serde_json::Map::new();
        headers.insert("Signature".to_string(), json!("test-sig"));
        headers.insert("Signature-Input".to_string(), 
            json!(r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#));
        headers.insert("id".to_string(), json!("test-id"));
        headers.insert("nonce".to_string(), json!("12345"));
        headers.insert("query".to_string(), json!(r#"["get", "collection", "doc"]"#));
        
        let msg = json!({
            "headers": headers
        });
        
        let ctx = Context {
            kv: crate::build::Store::new(HashMap::new()),
            msg,
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        let result = normalize(ctx);
        
        // Check that headers were normalized
        assert!(result.msg.get("headers")
            .and_then(|h| h.get("signature-input"))
            .is_some());
        
        // Check that state was populated
        assert!(result.state.contains_key("signer"));
        assert!(result.state.contains_key("query"));
        assert!(result.state.contains_key("op"));
        assert_eq!(result.state.get("op"), Some(&json!("get")));
    }
}
