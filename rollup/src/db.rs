// File: src/db.rs

use crate::build::{build, transform, BuildConfig, Context, TransformFn, DBImpl, DBMethods};
use crate::normalize;
use crate::verify_nonce;
use crate::auth;
use crate::write;
use crate::read;
use crate::monade::Device;

use std::sync::Arc;
use serde_json::{Value, json};

// Re-export commonly used types
pub use crate::build::Store;
// Re-export parse so weavedb_device can access it
pub use crate::parse::parse;

/// Get operation setup - mirrors JS get function
pub fn get(mut ctx: Context) -> Context {
    ctx.state.insert("opcode".to_string(), json!("get"));
    
    // Build query array: ["get", ...msg]
    let query = if let Some(msg_array) = ctx.msg.as_array() {
        let mut q = vec![json!("get")];
        q.extend(msg_array.iter().cloned());
        json!(q)
    } else {
        json!(["get", ctx.msg.clone()])
    };
    
    ctx.state.insert("query".to_string(), query);
    ctx
}

/// Cget operation setup - mirrors JS cget function
pub fn cget(mut ctx: Context) -> Context {
    ctx.state.insert("opcode".to_string(), json!("cget"));
    
    // Build query array: ["cget", ...msg]
    let query = if let Some(msg_array) = ctx.msg.as_array() {
        let mut q = vec![json!("cget")];
        q.extend(msg_array.iter().cloned());
        json!(q)
    } else {
        json!(["cget", ctx.msg.clone()])
    };
    
    ctx.state.insert("query".to_string(), query);
    ctx
}

/// Create the default database configuration - exactly mirrors JS db.js
pub fn create_db_config() -> BuildConfig {
    BuildConfig {
        // write: [normalize, verify, parse, auth, write]
        write: Some(vec![
            transform(normalize::normalize),
            transform(verify_nonce::verify_nonce),
            transform(parse),
            transform(auth::auth),
            transform(write::write),
        ]),
        // read: [normalize, parse, read]
        read: Some(vec![
            transform(normalize::normalize),
            transform(parse),
            transform(read::read),
        ]),
        // __read__: { get: [get, parse, read], cget: [cget, parse, read] }
        __read__: vec![
            ("get".to_string(), vec![
                transform(get),
                transform(parse),
                transform(read::read),
            ]),
            ("cget".to_string(), vec![
                transform(cget),
                transform(parse),
                transform(read::read),
            ]),
        ].into_iter().collect(),
        __write__: Default::default(),
    }
}

/// Create a database instance
pub fn create_db() -> Box<dyn Fn(std::collections::HashMap<String, Value>, std::collections::HashMap<String, Value>) 
    -> Device<(Store, Value), DBImpl> + Send + Sync> {
    build(create_db_config())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    
    #[test]
    fn test_get_operation() {
        let mut ctx = Context {
            kv: crate::build::Store::new(HashMap::new()),
            msg: json!(["collection", "doc_id"]),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        ctx = get(ctx);
        assert_eq!(ctx.state.get("opcode"), Some(&json!("get")));
        assert_eq!(ctx.state.get("query"), Some(&json!(["get", "collection", "doc_id"])));
    }
    
    #[test]
    fn test_cget_operation() {
        let mut ctx = Context {
            kv: crate::build::Store::new(HashMap::new()),
            msg: json!(["collection", "doc_id"]),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        ctx = cget(ctx);
        assert_eq!(ctx.state.get("opcode"), Some(&json!("cget")));
        assert_eq!(ctx.state.get("query"), Some(&json!(["cget", "collection", "doc_id"])));
    }
    
    #[test]
    fn test_normalize() {
        use crate::normalize::normalize;
        
        let mut headers = serde_json::Map::new();
        headers.insert("Signature-Input".to_string(), 
            json!(r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#));
        headers.insert("signature".to_string(), json!("test-sig"));
        headers.insert("id".to_string(), json!("test-id"));
        headers.insert("nonce".to_string(), json!("12345"));
        headers.insert("query".to_string(), json!(r#"["get", "collection", "doc_id"]"#));
        
        let msg = json!({
            "headers": headers
        });
        
        let mut ctx = Context {
            kv: crate::build::Store::new(HashMap::new()),
            msg,
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        ctx = normalize(ctx);
        assert!(ctx.state.contains_key("query"));
        assert!(ctx.state.contains_key("signer"));
    }
    
    #[test]
    fn test_write_pipeline() {
        use crate::normalize::normalize;
        use crate::verify_nonce::verify_nonce;
        use crate::auth::auth;
        use crate::write::write;
        
        let mut headers = serde_json::Map::new();
        headers.insert("Signature-Input".to_string(), 
            json!(r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#));
        headers.insert("signature".to_string(), json!("test-sig"));
        headers.insert("id".to_string(), json!("test-id"));
        headers.insert("nonce".to_string(), json!("1")); // First nonce for new account
        headers.insert("query".to_string(), json!(r#"["init", "_", {"owner": "addr_test", "id": "test-db"}]"#));
        
        let msg = json!({
            "headers": headers
        });
        
        let mut ctx = Context {
            kv: crate::build::Store::new(HashMap::new()),
            msg,
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set environment for auth
        ctx.env.insert("owner".to_string(), json!("addr_test"));
        ctx.env.insert("id".to_string(), json!("default-id"));
        
        // Run through write pipeline
        ctx = normalize(ctx);
        if let Some(error) = ctx.state.get("error") {
            panic!("Normalize failed: {}", error);
        }
        
        ctx = verify_nonce(ctx);
        if let Some(error) = ctx.state.get("error") {
            panic!("Verify nonce failed: {}", error);
        }
        
        ctx = parse(ctx);
        if let Some(error) = ctx.state.get("error") {
            panic!("Parse failed: {}", error);
        }
        
        ctx = auth(ctx);
        if let Some(error) = ctx.state.get("error") {
            panic!("Auth failed: {}", error);
        }
        
        ctx = write(ctx);
        if let Some(error) = ctx.state.get("error") {
            panic!("Write failed: {}", error);
        }
        
        // Check all stages completed
        assert!(ctx.state.contains_key("signer"));
        assert_eq!(ctx.state.get("verified"), Some(&json!(true)));
        assert_eq!(ctx.state.get("parsed"), Some(&json!(true)));
        assert_eq!(ctx.state.get("authenticated"), Some(&json!(true)));
        assert!(ctx.state.contains_key("write_result"));
        assert_eq!(ctx.state.get("initialized"), Some(&json!(true)));
    }
    
    #[test]
    fn test_read_pipeline() {
        use crate::normalize::normalize;
        
        let mut headers = serde_json::Map::new();
        headers.insert("Signature-Input".to_string(), 
            json!(r#"sig1=("id" "nonce" "query");alg="eddsa-ed25519";keyid="test-key""#));
        headers.insert("signature".to_string(), json!("test-sig"));
        headers.insert("id".to_string(), json!("test-id"));
        headers.insert("nonce".to_string(), json!("12345"));
        headers.insert("query".to_string(), json!(r#"["get", "collection", "doc_id"]"#));
        
        let msg = json!({
            "headers": headers
        });
        
        let mut ctx = Context {
            kv: crate::build::Store::new(HashMap::new()),
            msg,
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Run through read pipeline
        ctx = normalize(ctx);
        ctx = parse(ctx);
        ctx = read::read(ctx);
        
        // Check stages completed
        assert!(ctx.state.contains_key("signer"));
        assert_eq!(ctx.state.get("parsed"), Some(&json!(true)));
        assert!(ctx.state.contains_key("read_result"));
    }
}
