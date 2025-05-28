use crate::build::Context;
use serde_json::{Value, json};

/// Accounts directory name
const ACCOUNTS_DIR: &str = "__accounts__";

/// Verify nonce and update account
/// 
/// This function:
/// 1. Gets the current nonce for the signer from __accounts__ directory
/// 2. Verifies the provided nonce is currentNonce + 1
/// 3. Updates the account with the new nonce
pub fn verify_nonce(mut ctx: Context) -> Context {
    // Get signer address from state
    let signer = match ctx.state.get("signer").and_then(|v| v.as_str()) {
        Some(s) => s.to_string(),
        None => {
            ctx.state.insert("error".to_string(), json!("No signer address in state"));
            return ctx;
        }
    };
    
    // Get nonce from state
    let state_nonce = match ctx.state.get("nonce") {
        Some(Value::String(s)) => {
            match s.parse::<u64>() {
                Ok(n) => n,
                Err(_) => {
                    ctx.state.insert("error".to_string(), json!("Invalid nonce format"));
                    return ctx;
                }
            }
        }
        Some(Value::Number(n)) => {
            match n.as_u64() {
                Some(n) => n,
                None => {
                    ctx.state.insert("error".to_string(), json!("Invalid nonce number"));
                    return ctx;
                }
            }
        }
        _ => {
            ctx.state.insert("error".to_string(), json!("No nonce in state"));
            return ctx;
        }
    };
    
    // Get account from store
    let acc = ctx.kv.get(ACCOUNTS_DIR, &signer);
    
    // Extract current nonce from account
    let current_nonce = match &acc {
        Some(Value::Object(obj)) => {
            obj.get("nonce")
                .and_then(|v| v.as_u64())
                .unwrap_or(0)
        }
        _ => 0, // New account starts at nonce 0
    };
    
    // Verify nonce is currentNonce + 1
    if state_nonce != current_nonce + 1 {
        ctx.state.insert("error".to_string(), 
            json!(format!("the wrong nonce: {}", state_nonce)));
        return ctx;
    }
    
    // Create updated account document
    let new_nonce = current_nonce + 1;
    let new_acc = match acc {
        Some(Value::Object(mut obj)) => {
            // Update existing account
            obj.insert("nonce".to_string(), json!(new_nonce));
            json!(obj)
        }
        _ => {
            // Create new account with just nonce
            json!({
                "nonce": new_nonce
            })
        }
    };
    
    // Put updated account back to __accounts__
    ctx.kv.put(ACCOUNTS_DIR, &signer, new_acc);
    
    // Mark as verified
    ctx.state.insert("verified".to_string(), json!(true));
    
    ctx
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::build::Store;
    use std::collections::HashMap;
    use serde_json::json;
    
    #[test]
    fn test_verify_new_account() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up state
        ctx.state.insert("signer".to_string(), json!("addr_test123"));
        ctx.state.insert("nonce".to_string(), json!("1"));
        
        // Run verify
        ctx = verify_nonce(ctx);
        
        // Check no error
        assert!(!ctx.state.contains_key("error"));
        assert_eq!(ctx.state.get("verified"), Some(&json!(true)));
        
        // Check account was created with nonce 1
        let acc = ctx.kv.get(ACCOUNTS_DIR, "addr_test123");
        assert_eq!(acc, Some(json!({
            "nonce": 1
        })));
    }
    
    #[test]
    fn test_verify_existing_account() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up existing account
        ctx.kv.put(ACCOUNTS_DIR, "addr_test123", json!({
            "nonce": 5,
            "extra": "data"
        }));
        
        // Set up state for nonce 6
        ctx.state.insert("signer".to_string(), json!("addr_test123"));
        ctx.state.insert("nonce".to_string(), json!("6"));
        
        // Run verify
        ctx = verify_nonce(ctx);
        
        // Check no error
        assert!(!ctx.state.contains_key("error"));
        
        // Check account was updated with new nonce
        let acc = ctx.kv.get(ACCOUNTS_DIR, "addr_test123");
        match acc {
            Some(Value::Object(obj)) => {
                assert_eq!(obj.get("nonce"), Some(&json!(6)));
                assert_eq!(obj.get("extra"), Some(&json!("data"))); // Other fields preserved
            }
            _ => panic!("Expected account object"),
        }
    }
    
    #[test]
    fn test_verify_wrong_nonce() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up existing account with nonce 5
        ctx.kv.put(ACCOUNTS_DIR, "addr_test123", json!({
            "nonce": 5
        }));
        
        // Try to use nonce 10 (should be 6)
        ctx.state.insert("signer".to_string(), json!("addr_test123"));
        ctx.state.insert("nonce".to_string(), json!("10"));
        
        // Run verify
        ctx = verify_nonce(ctx);
        
        // Check error
        assert_eq!(ctx.state.get("error"), Some(&json!("the wrong nonce: 10")));
    }
    
    #[test]
    fn test_verify_missing_signer() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // No signer in state
        ctx.state.insert("nonce".to_string(), json!("1"));
        
        // Run verify
        ctx = verify_nonce(ctx);
        
        // Check error
        assert_eq!(ctx.state.get("error"), Some(&json!("No signer address in state")));
    }
    
    #[test]
    fn test_verify_number_nonce() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up state with number nonce (not string)
        ctx.state.insert("signer".to_string(), json!("addr_test123"));
        ctx.state.insert("nonce".to_string(), json!(1)); // Number instead of string
        
        // Run verify
        ctx = verify_nonce(ctx);
        
        // Should work fine
        assert!(!ctx.state.contains_key("error"));
        assert_eq!(ctx.state.get("verified"), Some(&json!(true)));
    }
}
