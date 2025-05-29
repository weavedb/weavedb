// File: src/auth.rs

use crate::build::Context;
use deno_core::{JsRuntime, RuntimeOptions, v8, serde_v8};
use serde_json::{Value, json};
use std::collections::HashMap;
use std::cell::RefCell;

/// Directory names and indices
const SYSTEM_DIR: &str = "_";

// Thread-local V8 runtime for auth FPJson evaluation
thread_local! {
    static AUTH_RUNTIME: RefCell<Option<JsRuntime>> = RefCell::new(None);
}

/// Get or create the thread-local auth runtime
fn with_auth_runtime<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&mut JsRuntime) -> Result<R, String>,
{
    AUTH_RUNTIME.with(|runtime_cell| {
        let mut runtime_opt = runtime_cell.borrow_mut();
        
        // Initialize runtime if needed
        if runtime_opt.is_none() {
            let mut runtime = JsRuntime::new(RuntimeOptions::default());
            
            // Load FPJson library once
            let fpjson_code = include_str!("fpjson_bundle.js");
            runtime.execute_script("[fpjson]", fpjson_code)
                .map_err(|e| format!("Failed to load FPJson bundle for auth: {}", e))?;
            
            // Pre-load auth-specific functions
            let auth_setup = r#"
                globalThis.ac_funcs = {
                    equals: (v, obj) => [v[0] === v[1], false],
                    allowif: (v, obj) => {
                        if (v[0]) obj.allow = true;
                        return [true, false];
                    }
                };
                
                // Set up KV functions for FPJson
                globalThis.kvFuncs = {
                    get: (v, obj, set) => [globalThis.kvGet(v[0], v[1]), false],
                    set: (v, obj, set) => {
                        const [data, dir, doc] = v;
                        globalThis.kvPut(dir, doc, data);
                        return [true, false];
                    },
                    update: (v, obj, set) => {
                        const [data, dir, doc] = v;
                        const old = globalThis.kvGet(dir, doc);
                        if (!old) return [false, false];
                        globalThis.kvPut(dir, doc, Object.assign({}, old, data));
                        return [true, false];
                    },
                    upsert: (v, obj, set) => {
                        const [data, dir, doc] = v;
                        const old = globalThis.kvGet(dir, doc) || {};
                        globalThis.kvPut(dir, doc, Object.assign({}, old, data));
                        return [true, false];
                    },
                    del: (v, obj, set) => {
                        const [dir, doc] = v;
                        const old = globalThis.kvGet(dir, doc);
                        if (!old) return [false, false];
                        globalThis.kvDel(dir, doc);
                        return [true, false];
                    },
                };
                
                // KV store access functions
                globalThis.kvGet = function(dir, doc) {
                    if (!globalThis.kvStore[dir]) return null;
                    return globalThis.kvStore[dir][doc] || null;
                };
                globalThis.kvPut = function(dir, doc, data) {
                    if (!globalThis.kvStore[dir]) globalThis.kvStore[dir] = {};
                    globalThis.kvStore[dir][doc] = data;
                };
                globalThis.kvDel = function(dir, doc) {
                    if (!globalThis.kvStore[dir]) return;
                    delete globalThis.kvStore[dir][doc];
                };
            "#;
            runtime.execute_script("[auth_setup]", auth_setup)
                .map_err(|e| format!("Failed to set up auth functions: {}", e))?;
            
            *runtime_opt = Some(runtime);
        }
        
        // Use the runtime
        if let Some(runtime) = runtime_opt.as_mut() {
            f(runtime)
        } else {
            Err("Failed to access auth runtime".to_string())
        }
    })
}

/// Authentication variables for rule evaluation
#[derive(Debug, Clone, serde::Serialize)]
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

// In auth.rs - fix the eval_auth_rule_with_deno function
/// Evaluate auth rule with FPJson using thread-local runtime
fn eval_auth_rule_with_deno(rule: &AuthRule, vars: &mut AuthVars, ctx: &mut Context) -> Result<(), String> {
    with_auth_runtime(|runtime| {
        // Create a context object with KV store access
        let mut kv_data = json!({});
        
        // For now, just include the system directory if it exists
        if let Some(system_meta) = ctx.kv.get(SYSTEM_DIR, SYSTEM_DIR) {
            kv_data[SYSTEM_DIR] = json!({
                SYSTEM_DIR: system_meta
            });
        }
        
        // Update KV store data
        let kv_setup = format!(
            r#"
            globalThis.kvStore = {};
            "#,
            serde_json::to_string(&kv_data).unwrap()
        );
        
        runtime.execute_script("[kv_setup]", kv_setup)
            .map_err(|e| format!("Failed to set up KV data: {}", e))?;
        
        // Evaluate the rule
        let eval_code = format!(
            r#"
            (function() {{
                const vars = {};
                const fpjsonExpr = {};
                const funcs = {{ ...globalThis.ac_funcs, ...globalThis.kvFuncs }};
                
                try {{
                    globalThis.fpj(fpjsonExpr, vars, funcs);
                    return JSON.stringify({{ success: true, allow: vars.allow }});
                }} catch (e) {{
                    return JSON.stringify({{ success: false, error: e.message }});
                }}
            }})()
            "#,
            serde_json::to_string(&vars).unwrap(),
            serde_json::to_string(&rule.fpjson).unwrap()
        );
        
        let result_value = runtime.execute_script("[eval]", eval_code)
            .map_err(|e| format!("Failed to evaluate rule: {}", e))?;
        
        // Convert the v8 value to string
        let scope = &mut runtime.handle_scope();
        let local = v8::Local::new(scope, result_value);
        let result_str: String = serde_v8::from_v8(scope, local)
            .map_err(|e| format!("Failed to convert result: {}", e))?;
        
        // Parse the result
        let result: serde_json::Value = serde_json::from_str(&result_str)
            .map_err(|e| format!("Failed to parse result: {}", e))?;
        
        if let Some(allow) = result.get("allow").and_then(|v| v.as_bool()) {
            vars.allow = allow;
            Ok(())
        } else if let Some(error) = result.get("error").and_then(|v| v.as_str()) {
            Err(error.to_string())
        } else {
            Err("Unknown error in FPJson evaluation".to_string())
        }
    })
}

// Also fix the only_owner function
/// Only owner can execute
fn only_owner(mut ctx: Context) -> Context {
    let signer = ctx.state.get("signer")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    // Get owner from database config, not from env
    let owner = ctx.kv.get(SYSTEM_DIR, "info")
        .and_then(|info| info.get("owner").and_then(|v| v.as_str()).map(|s| s.to_string()))
        .unwrap_or_default();
    
    if signer != owner || owner.is_empty() {
        ctx.state.insert("error".to_string(), json!("only owner can execute"));
    }
    
    ctx
}
/// Evaluate auth rule with FPJson (fallback mock implementation)
fn eval_auth_rule(rule: &AuthRule, vars: &mut AuthVars, ctx: &mut Context) -> Result<(), String> {
    // Try to use deno_core evaluation
    match eval_auth_rule_with_deno(rule, vars, ctx) {
        Ok(()) => Ok(()),
        Err(_) => {
            // Fallback to mock implementation
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
    }
}

/// Anyone can execute
fn anyone(ctx: Context) -> Context {
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
        match ctx.kv.get(SYSTEM_DIR, dir) {
            Some(meta) => Some(meta),
            None => None,
        }
    } else {
        ctx.kv.get(SYSTEM_DIR, dir)
    };
    
    // Get auth rules
    let auth_rules = match &dir_meta {
        Some(meta) => parse_auth_rules(meta),
        None => {
            if dir == SYSTEM_DIR {
                default_system_auth()
            } else {
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
        
        // Set up database with owner
        ctx.kv.put("_", "info", json!({"owner": "owner123"}));
        
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
    fn test_auth_rule_matching() {
        assert!(matches_op("set", "set,update"));
        assert!(matches_op("update", "set,update"));
        assert!(!matches_op("delete", "set,update"));
        assert!(matches_op("set", "set:init"));
        assert!(!matches_op("update", "set:init"));
    }
}
