use crate::build::Context;
use serde_json::{Value, json, Map};
use std::collections::HashMap;

/// Directory names and indices
const SYSTEM_DIR: &str = "_";
const SYSTEM_DIR_INDEX: usize = 0;

/// Authentication variables for rule evaluation
#[derive(Debug, Clone)]
struct AuthVars {
    op: String,
    opcode: String,
    operand: String,
    id: String,
    owner: String,
    signer: String,
    ts: u64,
    dir: String,
    doc: Option<String>,
    query: Value,
    before: Option<Value>,
    after: Option<Value>,
    allow: bool,
}

/// Create auth variables from context
fn mk_auth_vars(ctx: &Context) -> AuthVars {
    AuthVars {
        op: ctx.state.get("op")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        opcode: ctx.state.get("op")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        operand: String::new(),
        id: ctx.env.get("id")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        owner: ctx.env.get("owner")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        signer: ctx.state.get("signer")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        ts: ctx.state.get("ts")
            .and_then(|v| v.as_u64())
            .unwrap_or(0),
        dir: ctx.state.get("dir")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        doc: ctx.state.get("doc")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        query: ctx.state.get("query")
            .cloned()
            .unwrap_or(json!([])),
        before: ctx.state.get("before").cloned(),
        after: ctx.state.get("data").cloned(),
        allow: false,
    }
}

/// Authentication rule
#[derive(Debug, Clone)]
struct AuthRule {
    pattern: String,
    fpjson: Value,
}

/// Parse auth rules from directory metadata
fn parse_auth_rules(dir_meta: &Value) -> Vec<AuthRule> {
    match dir_meta.get("auth").and_then(|v| v.as_array()) {
        Some(rules) => {
            rules.iter().filter_map(|rule| {
                if let Some(arr) = rule.as_array() {
                    if arr.len() >= 2 {
                        if let Some(pattern) = arr[0].as_str() {
                            return Some(AuthRule {
                                pattern: pattern.to_string(),
                                fpjson: arr[1].clone(),
                            });
                        }
                    }
                }
                None
            }).collect()
        }
        None => Vec::new(),
    }
}

/// Check if operation matches auth rule pattern
fn matches_op(op: &str, pattern: &str) -> bool {
    pattern.split(',').any(|p| p.trim() == op || pattern.contains(':'))
}

/// Default auth rules for system directory
fn default_system_auth() -> Vec<AuthRule> {
    vec![
        AuthRule {
            pattern: "set:init".to_string(),
            fpjson: json!([
                ["=$isOwner", ["equals", "$signer", "$owner"]],
                ["allowif()", "$isOwner"]
            ]),
        }
    ]
}

/// Evaluate auth rule with FPJson (mocked for now)
fn eval_auth_rule(rule: &AuthRule, vars: &mut AuthVars, ctx: &mut Context) -> Result<(), String> {
    // Mock FPJson evaluation
    // In real implementation, this would use deno_core to evaluate the FPJson expression
    
    // For now, implement basic logic for common patterns
    match rule.pattern.as_str() {
        "set:init" => {
            // Check if signer is owner
            if vars.signer == vars.owner {
                vars.allow = true;
                Ok(())
            } else {
                Err("Not owner".to_string())
            }
        }
        _ => {
            // For other patterns, mock allowing if signer is set
            if !vars.signer.is_empty() {
                vars.allow = true;
                Ok(())
            } else {
                Err("No signer".to_string())
            }
        }
    }
}

/// Anyone can execute
fn anyone(ctx: Context) -> Context {
    ctx
}

/// Only owner can execute
fn only_owner(mut ctx: Context) -> Context {
    let signer = ctx.state.get("signer")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    let owner = ctx.env.get("owner")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    if signer != owner {
        ctx.state.insert("error".to_string(), json!("only owner can execute"));
    }
    
    ctx
}

/// Default authentication for operations
fn default_auth(mut ctx: Context) -> Context {
    let op = match ctx.state.get("op").and_then(|v| v.as_str()) {
        Some(op) => op.to_string(),
        None => {
            ctx.state.insert("error".to_string(), json!("No operation in state"));
            return ctx;
        }
    };
    
    let dir = match ctx.state.get("dir").and_then(|v| v.as_str()) {
        Some(d) => d,
        None => {
            ctx.state.insert("error".to_string(), json!("No directory in state"));
            return ctx;
        }
    };
    
    // Get directory metadata
    let dir_meta = if dir == SYSTEM_DIR {
        // Special handling for system directory
        match ctx.kv.get(SYSTEM_DIR, dir) {
            Some(meta) => Some(meta),
            None => {
                // System directory initialization - use default auth
                None
            }
        }
    } else {
        // Regular directory - get metadata from system directory
        ctx.kv.get(SYSTEM_DIR, dir)
    };
    
    // Get auth rules
    let auth_rules = match &dir_meta {
        Some(meta) => parse_auth_rules(meta),
        None => {
            if dir == SYSTEM_DIR {
                // System directory initialization
                default_system_auth()
            } else {
                // Directory doesn't exist - that's OK, use empty auth rules
                // The write module will create the directory if needed
                Vec::new()
            }
        }
    };
    
    // Create auth variables
    let mut vars = mk_auth_vars(&ctx);
    
    // If no auth rules, allow by default
    if auth_rules.is_empty() {
        return ctx;
    }
    
    // Find matching auth rule and evaluate
    let mut allow = false;
    for rule in &auth_rules {
        if matches_op(&op, &rule.pattern) {
            match eval_auth_rule(rule, &mut vars, &mut ctx) {
                Ok(()) => {
                    if vars.allow {
                        allow = true;
                        break;
                    }
                }
                Err(_) => {
                    // Continue to next rule
                }
            }
        }
    }
    
    if !allow {
        ctx.state.insert("error".to_string(), json!("operation not allowed"));
    }
    
    ctx
}
/// Get authentication function for operation
fn get_auth_func(opcode: &str) -> fn(Context) -> Context {
    match opcode {
        "init" => anyone,
        "batch" => anyone,
        "addIndex" => only_owner,
        "removeIndex" => only_owner,
        _ => default_auth,
    }
}

/// Main authentication function
pub fn auth(ctx: Context) -> Context {
    let opcode = match ctx.state.get("op").and_then(|v| v.as_str()) {
        Some(op) => op,
        None => {
            let mut ctx = ctx;
            ctx.state.insert("error".to_string(), json!("No operation in state"));
            return ctx;
        }
    };
    
    let auth_func = get_auth_func(opcode);
    let mut ctx = auth_func(ctx);
    
    // Mark as authenticated if no error
    if !ctx.state.contains_key("error") {
        ctx.state.insert("authenticated".to_string(), json!(true));
    }
    
    ctx
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::build::Store;
    
    #[test]
    fn test_anyone_auth() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up for init operation
        ctx.state.insert("op".to_string(), json!("init"));
        
        // Run auth
        ctx = auth(ctx);
        
        // Should pass
        assert!(!ctx.state.contains_key("error"));
        assert_eq!(ctx.state.get("authenticated"), Some(&json!(true)));
    }
    
    #[test]
    fn test_only_owner_auth() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up environment
        ctx.env.insert("owner".to_string(), json!("owner123"));
        
        // Test with non-owner
        ctx.state.insert("op".to_string(), json!("addIndex"));
        ctx.state.insert("signer".to_string(), json!("notowner"));
        
        ctx = auth(ctx);
        
        // Should fail
        assert_eq!(ctx.state.get("error"), Some(&json!("only owner can execute")));
        
        // Test with owner
        ctx.state.remove("error");
        ctx.state.insert("signer".to_string(), json!("owner123"));
        
        ctx = auth(ctx);
        
        // Should pass
        assert!(!ctx.state.contains_key("error"));
        assert_eq!(ctx.state.get("authenticated"), Some(&json!(true)));
    }
    
    #[test]
    fn test_default_auth_system_init() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up for system directory initialization
        ctx.state.insert("op".to_string(), json!("set:init"));
        ctx.state.insert("dir".to_string(), json!("_"));
        ctx.state.insert("signer".to_string(), json!("owner123"));
        ctx.env.insert("owner".to_string(), json!("owner123"));
        
        ctx = auth(ctx);
        
        // Should pass for owner
        assert!(!ctx.state.contains_key("error"));
        assert_eq!(ctx.state.get("authenticated"), Some(&json!(true)));
    }
    
    #[test]
    fn test_default_auth_missing_dir() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up for operation on non-existent directory
        ctx.state.insert("op".to_string(), json!("set"));
        ctx.state.insert("dir".to_string(), json!("nonexistent"));
        ctx.state.insert("signer".to_string(), json!("user123"));
        
        ctx = auth(ctx);
        
        // Should fail
        assert_eq!(ctx.state.get("error"), Some(&json!("dir doesn't exist: nonexistent")));
    }
    
    #[test]
    fn test_auth_rule_matching() {
        assert!(matches_op("set", "set,update"));
        assert!(matches_op("update", "set,update"));
        assert!(!matches_op("delete", "set,update"));
        assert!(matches_op("set", "set:init"));
        assert!(!matches_op("update", "set:init"));
    }
}
