// File: src/parse.rs

use crate::build::Context;
use serde_json::{Value, json, Map};
use std::collections::HashMap;
use base64::{Engine as _, engine::general_purpose};
use deno_core::{JsRuntime, RuntimeOptions, v8, serde_v8};
use std::cell::RefCell;

// Thread-local V8 runtime for FPJson evaluation
thread_local! {
    static FPJSON_RUNTIME: RefCell<Option<JsRuntime>> = RefCell::new(None);
}

/// Get or create the thread-local FPJson runtime
fn with_fpjson_runtime<F, R>(f: F) -> Result<R, String>
where
    F: FnOnce(&mut JsRuntime) -> Result<R, String>,
{
    FPJSON_RUNTIME.with(|runtime_cell| {
        let mut runtime_opt = runtime_cell.borrow_mut();
        
        // Initialize runtime if needed
        if runtime_opt.is_none() {
            let mut runtime = JsRuntime::new(RuntimeOptions::default());
            
            // Load FPJson library once
            let fpjson_code = include_str!("fpjson_bundle.js");
            runtime.execute_script("[fpjson]", fpjson_code)
                .map_err(|e| format!("Failed to load FPJson bundle: {}", e))?;
            
            *runtime_opt = Some(runtime);
        }
        
        // Use the runtime
        if let Some(runtime) = runtime_opt.as_mut() {
            f(runtime)
        } else {
            Err("Failed to access FPJson runtime".to_string())
        }
    })
}

const BASE64_CHARS: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/// Convert a number to base64 string
fn to_b64(mut n: u64) -> String {
    if n == 0 {
        return BASE64_CHARS.chars().nth(0).unwrap().to_string();
    }
    
    let mut result = String::new();
    while n > 0 {
        let char_idx = (n % 64) as usize;
        result.insert(0, BASE64_CHARS.chars().nth(char_idx).unwrap());
        n /= 64;
    }
    result
}

/// Check if document ID is valid
fn check_doc_id(id: &str, kv: &crate::build::Store) -> Result<(), String> {
    // Check if ID contains only valid base64url characters
    if !id.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_') {
        return Err(format!("invalid docID: {}", id));
    }
    
    // Check maximum document ID size
    if let Some(config) = kv.get("_config", "config") {
        if let Some(max_doc_id) = config.get("max_doc_id").and_then(|v| v.as_u64()) {
            if !check_max_doc_id(id, max_doc_id as usize) {
                return Err(format!("docID too large: {}", id));
            }
        }
    }
    
    Ok(())
}

/// Check if document ID size is within limit
fn check_max_doc_id(id: &str, size: usize) -> bool {
    // Convert from base64url to standard base64
    let b64 = id.replace('-', "+").replace('_', "/");
    let padding = match (2 * id.len()) % 4 {
        0 => "",
        2 => "==",
        _ => "=",
    };
    let padded = format!("{}{}", b64, padding);
    
    // Try to decode to check size
    match general_purpose::STANDARD.decode(&padded) {
        Ok(decoded) => decoded.len() <= size,
        Err(_) => false,
    }
}

/// Get field keys from new and old data
fn fields(ndata: &Map<String, Value>, odata: &Map<String, Value>) -> Vec<String> {
    let mut keys: std::collections::HashSet<String> = std::collections::HashSet::new();
    
    for key in ndata.keys() {
        keys.insert(key.clone());
    }
    
    for key in odata.keys() {
        keys.insert(key.clone());
    }
    
    keys.into_iter().collect()
}

/// Replace $ references in FPJson arrays
fn replace_dollar(val: &Value, old_val: Option<&Value>) -> Value {
    match val {
        Value::Array(arr) => {
            let mut new_arr = Vec::new();
            for item in arr {
                match item {
                    Value::String(s) if s == "$" => {
                        // Replace $ with the old value
                        new_arr.push(old_val.cloned().unwrap_or(Value::Null));
                    }
                    Value::Array(_) => {
                        // Recursively process nested arrays
                        new_arr.push(replace_dollar(item, old_val));
                    }
                    _ => {
                        new_arr.push(item.clone());
                    }
                }
            }
            Value::Array(new_arr)
        }
        _ => val.clone()
    }
}


// In parse.rs - fix the eval_fpjson function
/// Evaluate FPJson expression using thread-local runtime
fn eval_fpjson(expr: &Value, vars: &HashMap<String, Value>, old_val: Option<&Value>) -> Result<Value, String> {
    with_fpjson_runtime(|runtime| {
        // Process the expression to replace $ references
        let processed_expr = replace_dollar(expr, old_val);
        
        // Set up the evaluation
        let vars_json = serde_json::to_string(vars)
            .map_err(|e| format!("Failed to serialize vars: {}", e))?;
        let expr_json = serde_json::to_string(&processed_expr)
            .map_err(|e| format!("Failed to serialize expression: {}", e))?;
        
        let eval_code = format!(
            r#"
            (function() {{
                const vars = {};
                const expr = {};
                try {{
                    const result = globalThis.fpj(expr, vars);
                    return JSON.stringify({{ success: true, value: result }});
                }} catch (e) {{
                    return JSON.stringify({{ success: false, error: e.message }});
                }}
            }})()
            "#,
            vars_json, expr_json
        );
        
        let result_value = runtime.execute_script("[eval]", eval_code)
            .map_err(|e| format!("Failed to evaluate FPJson: {}", e))?;
        
        // Convert the v8 value to string
        let scope = &mut runtime.handle_scope();
        let local = v8::Local::new(scope, result_value);
        let result_str: String = serde_v8::from_v8(scope, local)
            .map_err(|e| format!("Failed to convert result: {}", e))?;
        
        // Parse the result
        let result: serde_json::Value = serde_json::from_str(&result_str)
            .map_err(|e| format!("Failed to parse result: {}", e))?;
        
        if let Some(true) = result.get("success").and_then(|v| v.as_bool()) {
            Ok(result.get("value").cloned().unwrap_or(Value::Null))
        } else if let Some(error) = result.get("error").and_then(|v| v.as_str()) {
            Err(error.to_string())
        } else {
            Err("Unknown error in FPJson evaluation".to_string())
        }
    })
}

/// Merge data with special variable substitutions and FPJson evaluation
fn merge(
    data: &Map<String, Value>, 
    state: &HashMap<String, Value>, 
    old: Option<&Map<String, Value>>, 
    env: &HashMap<String, Value>
) -> Result<Value, String> {
    let old_data = old.map(|m| m.clone()).unwrap_or_default();
    let mut new_data = Map::new();
    
    let all_fields = fields(data, &old_data);
    
    for k in all_fields {
        if let Some(val) = data.get(&k) {
            if !val.is_null() {
                // Check for special _$ operations
                if let Some(obj) = val.as_object() {
                    if let Some(dollar_val) = obj.get("_$") {
                        // Variable substitution
                        let vars = json!({
                            "signer": state.get("signer").cloned().unwrap_or(json!(null)),
                            "ts": state.get("ts").cloned().unwrap_or(json!(0)),
                            "id": env.get("id").cloned().unwrap_or(json!(null)),
                            "owner": env.get("owner").cloned().unwrap_or(json!(null)),
                        });
                        
                        if let Some(var_name) = dollar_val.as_str() {
                            if var_name == "del" {
                                // Skip this field (delete it)
                                continue;
                            } else if let Some(var_val) = vars.get(var_name) {
                                new_data.insert(k.clone(), var_val.clone());
                            }
                        } else if dollar_val.is_array() {
                            // This is an FPJson expression
                            let vars_map: HashMap<String, Value> = match vars.as_object() {
                                Some(obj) => obj.iter().map(|(k, v)| (k.clone(), v.clone())).collect(),
                                None => HashMap::new(),
                            };
                            
                            // Get the old value for this field
                            let old_field_val = old_data.get(&k).map(|v| v.clone());
                            
                            // Evaluate the FPJson expression
                            match eval_fpjson(dollar_val, &vars_map, old_field_val.as_ref()) {
                                Ok(result) => {
                                    new_data.insert(k.clone(), result);
                                }
                                Err(_) => {
                                    // If evaluation fails, use the old value or null
                                    if let Some(old_val) = old_data.get(&k) {
                                        new_data.insert(k.clone(), old_val.clone());
                                    } else {
                                        new_data.insert(k.clone(), json!(null));
                                    }
                                }
                            }
                        }
                    } else {
                        new_data.insert(k.clone(), val.clone());
                    }
                } else {
                    new_data.insert(k.clone(), val.clone());
                }
            } else {
                // null value - use old value if exists
                if let Some(old_val) = old_data.get(&k) {
                    new_data.insert(k.clone(), old_val.clone());
                }
            }
        } else {
            // Field not in new data - preserve old value
            if let Some(old_val) = old_data.get(&k) {
                new_data.insert(k.clone(), old_val.clone());
            }
        }
    }
    
    Ok(Value::Object(new_data))
}

/// Generate auto-incrementing document ID
fn gen_doc_id(ctx: &mut Context) -> Result<(), String> {
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?
        .to_string();  // Clone to avoid borrow issues
    
    // Get directory metadata, or use default if it doesn't exist
    let dir_meta = ctx.kv.get("_", &dir);
    
    // Get current autoid
    let mut i = match dir_meta {
        Some(ref meta) => meta.get("autoid")
            .and_then(|v| v.as_u64())
            .unwrap_or(0) + 1,
        None => 1,  // Start from 1 if directory doesn't exist
    };
    
    // Find next available ID
    while ctx.kv.get(&dir, &to_b64(i)).is_some() {
        i += 1;
    }
    
    let doc_id = to_b64(i);
    
    // Store the autoid value in state for the write module to use
    ctx.state.insert("autoid".to_string(), json!(i));
    
    // Update autoid in directory metadata if it exists
    if let Some(mut dir_meta_val) = dir_meta {
        if let Some(meta_obj) = dir_meta_val.as_object_mut() {
            meta_obj.insert("autoid".to_string(), json!(i));
            ctx.kv.put("_", &dir, Value::Object(meta_obj.clone()));
        }
    }
    // If directory doesn't exist, the write module will create it with the autoid
    
    ctx.state.insert("doc".to_string(), json!(doc_id));
    
    Ok(())
}

/// Set data for a document
fn set_data(ctx: &mut Context) -> Result<(), String> {
    let data = ctx.state.get("data")
        .and_then(|v| v.as_object())
        .ok_or("No data in state")?;
    
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?;
    
    // For non-system directories, check if directory exists in metadata
    // If not, it will be created by the write module
    if dir != "_" && ctx.kv.get("_", dir).is_none() {
        // Directory doesn't exist yet, but that's OK for set operations
        // The write module will create it
    }
    
    // Merge data
    let merged_data = merge(data, &ctx.state, None, &ctx.env)?;
    ctx.state.insert("data".to_string(), merged_data);
    
    Ok(())
}

/// Update existing data
fn update_data(ctx: &mut Context) -> Result<(), String> {
    let data = ctx.state.get("data")
        .and_then(|v| v.as_object())
        .ok_or("No data in state")?;
    
    let before = ctx.state.get("before")
        .and_then(|v| v.as_object())
        .ok_or("data doesn't exist")?;
    
    // Merge new data with old data
    let merged_data = merge(data, &ctx.state, Some(before), &ctx.env)?;
    ctx.state.insert("data".to_string(), merged_data);
    
    Ok(())
}

/// Upsert data (update if exists, insert if not)
fn upsert_data(ctx: &mut Context) -> Result<(), String> {
    let data = ctx.state.get("data")
        .and_then(|v| v.as_object())
        .ok_or("No data in state")?;
    
    let _dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?;
    
    // For non-system directories, directory will be created if needed by write module
    
    // Get existing data if any
    let before = ctx.state.get("before").and_then(|v| v.as_object());
    
    // Merge data
    let merged_data = merge(data, &ctx.state, before, &ctx.env)?;
    ctx.state.insert("data".to_string(), merged_data);
    
    Ok(())
}

/// Main parse function
pub fn parse(mut ctx: Context) -> Context {
    // Get query from state
    let query = match ctx.state.get("query").cloned() {
        Some(q) => q,
        None => {
            ctx.state.insert("error".to_string(), json!("No query in state"));
            return ctx;
        }
    };
    
    let query_array = match query.as_array() {
        Some(arr) => arr,
        None => {
            ctx.state.insert("error".to_string(), json!("Query is not an array"));
            return ctx;
        }
    };
    
    if query_array.is_empty() {
        ctx.state.insert("error".to_string(), json!("Empty query"));
        return ctx;
    }
    
    // Skip first element (operation code) as it's already in state
    let params: Vec<Value> = query_array.iter().skip(1).cloned().collect();
    
    let opcode = match ctx.state.get("op").and_then(|v| v.as_str()) {
        Some(op) => op.to_string(),  // Clone the string to avoid borrow issues
        None => {
            ctx.state.insert("error".to_string(), json!("No operation in state"));
            return ctx;
        }
    };
    
    // Handle batch operation separately
    if opcode == "batch" {
        ctx.state.insert("parsed".to_string(), json!(true));
        return ctx;
    }
    
    // Parse based on operation type
    let result = match opcode.as_str() {
	"init" => {
	    if params.len() >= 2 {
		ctx.state.insert("data".to_string(), params[1].clone());
		ctx.state.insert("dir".to_string(), json!("_"));
		Ok(())
	    } else {
		Err("Invalid init parameters".to_string())
	    }
	}        
        "get" | "cget" => {
            if params.is_empty() {
                Err("Invalid get/cget parameters".to_string())
            } else if params.len() == 1 {
                // Collection query: ["get", "collection"]
                let dir = params[0].as_str().unwrap_or("");
                ctx.state.insert("dir".to_string(), json!(dir));
                ctx.state.insert("range".to_string(), json!(true));
                Ok(())
            } else {
                // Document query: ["get", "collection", "doc_id", ...] 
                let dir = params[0].as_str().unwrap_or("");
                ctx.state.insert("dir".to_string(), json!(dir));
                
                if let Some(doc) = params[1].as_str() {
                    if let Err(e) = check_doc_id(doc, &ctx.kv) {
                        Err(e)
                    } else {
                        ctx.state.insert("doc".to_string(), json!(doc));
                        ctx.state.insert("range".to_string(), json!(false));
                        Ok(())
                    }
                } else {
                    // If second param is not a string, it might be query options
                    ctx.state.insert("range".to_string(), json!(true));
                    Ok(())
                }
            }
        }
        
        "add" => {
            if params.len() >= 2 {
                ctx.state.insert("data".to_string(), params[0].clone());
                let dir = params[1].as_str().unwrap_or("");
                ctx.state.insert("dir".to_string(), json!(dir));
                
                // Generate document ID and set data
                match gen_doc_id(&mut ctx) {
                    Ok(()) => match set_data(&mut ctx) {
                        Ok(()) => Ok(()),
                        Err(e) => Err(e),
                    },
                    Err(e) => Err(e),
                }
            } else {
                Err("Invalid add parameters".to_string())
            }
        }
        
        "addIndex" | "removeIndex" => {
            if params.len() >= 2 {
                ctx.state.insert("data".to_string(), params[0].clone());
                let dir = params[1].as_str().unwrap_or("");
                ctx.state.insert("dir".to_string(), json!(dir));
                Ok(())
            } else {
                Err(format!("Invalid {} parameters", opcode))
            }
        }
        
        "del" => {
            if params.len() >= 2 {
                let dir = params[0].as_str().unwrap_or("");
                let doc = params[1].as_str().unwrap_or("");
                
                if let Err(e) = check_doc_id(doc, &ctx.kv) {
                    Err(e)
                } else {
                    // Get existing document using the same method as read module
                    let before = crate::planner::doc(doc, &[dir.to_string()], &ctx.kv)
                        .map(|dv| dv.val);
                    
                    if let Some(before_val) = before {
                        ctx.state.insert("before".to_string(), before_val);
                    }
                    
                    ctx.state.insert("dir".to_string(), json!(dir));
                    ctx.state.insert("doc".to_string(), json!(doc));
                    Ok(())
                }
            } else {
                Err("Invalid del parameters".to_string())
            }
        }
        
        "set" | "update" | "upsert" => {
            if params.len() >= 3 {
                ctx.state.insert("data".to_string(), params[0].clone());
                let dir = params[1].as_str().unwrap_or("");
                let doc = params[2].as_str().unwrap_or("");
                
                if let Err(e) = check_doc_id(doc, &ctx.kv) {
                    Err(e)
                } else {
                    ctx.state.insert("dir".to_string(), json!(dir));
                    ctx.state.insert("doc".to_string(), json!(doc));
                    
                    // Get existing document for update/upsert
                    if opcode.as_str() != "set" {
                        // Use the same method as the read module to get the document
                        let before = crate::planner::doc(doc, &[dir.to_string()], &ctx.kv)
                            .map(|dv| dv.val);
                        
                        if let Some(before_val) = before {
                            ctx.state.insert("before".to_string(), before_val);
                        } else if opcode.as_str() == "update" {
                            // For update, the document must exist
                            return {
                                ctx.state.insert("error".to_string(), json!("data doesn't exist"));
                                ctx
                            };
                        }
                        // For upsert, it's OK if document doesn't exist
                    }
                    
                    // Execute the appropriate operation
                    match opcode.as_str() {
                        "set" => set_data(&mut ctx),
                        "update" => update_data(&mut ctx),
                        "upsert" => upsert_data(&mut ctx),
                        _ => unreachable!(),
                    }
                }
            } else {
                Err(format!("Invalid {} parameters", opcode))
            }
        }
        
        _ => Err(format!("Unknown operation: {}", opcode))
    };
    
    // Handle result
    match result {
        Ok(()) => {
            ctx.state.insert("parsed".to_string(), json!(true));
        }
        Err(e) => {
            ctx.state.insert("error".to_string(), json!(e));
        }
    }
    
    ctx
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_to_b64() {
        assert_eq!(to_b64(0), "A");
        assert_eq!(to_b64(1), "B");
        assert_eq!(to_b64(63), "_");
        assert_eq!(to_b64(64), "BA");
        assert_eq!(to_b64(65), "BB");
    }
    
    #[test]
    fn test_check_doc_id() {
        let store = crate::build::Store::new(HashMap::new());
        
        assert!(check_doc_id("abc123", &store).is_ok());
        assert!(check_doc_id("ABC-_", &store).is_ok());
        assert!(check_doc_id("test@123", &store).is_err());
        assert!(check_doc_id("test space", &store).is_err());
    }
    
    #[test]
    fn test_fields() {
        let mut ndata = Map::new();
        ndata.insert("a".to_string(), json!(1));
        ndata.insert("b".to_string(), json!(2));
        
        let mut odata = Map::new();
        odata.insert("b".to_string(), json!(3));
        odata.insert("c".to_string(), json!(4));
        
        let fields = fields(&ndata, &odata);
        assert_eq!(fields.len(), 3);
        assert!(fields.contains(&"a".to_string()));
        assert!(fields.contains(&"b".to_string()));
        assert!(fields.contains(&"c".to_string()));
    }
    
    #[test]
    fn test_merge_simple() {
        let mut data = Map::new();
        data.insert("name".to_string(), json!("Alice"));
        data.insert("age".to_string(), json!(30));
        
        let state = HashMap::new();
        let env = HashMap::new();
        
        let result = merge(&data, &state, None, &env).unwrap();
        let result_obj = result.as_object().unwrap();
        
        assert_eq!(result_obj.get("name"), Some(&json!("Alice")));
        assert_eq!(result_obj.get("age"), Some(&json!(30)));
    }
    
    #[test]
    fn test_merge_with_old_data() {
        let mut data = Map::new();
        data.insert("name".to_string(), json!("Alice"));
        data.insert("age".to_string(), json!(null)); // null means keep old value
        
        let mut old_data = Map::new();
        old_data.insert("age".to_string(), json!(25));
        old_data.insert("city".to_string(), json!("NYC"));
        
        let state = HashMap::new();
        let env = HashMap::new();
        
        let result = merge(&data, &state, Some(&old_data), &env).unwrap();
        let result_obj = result.as_object().unwrap();
        
        assert_eq!(result_obj.get("name"), Some(&json!("Alice")));
        assert_eq!(result_obj.get("age"), Some(&json!(25))); // Kept old value
        assert_eq!(result_obj.get("city"), Some(&json!("NYC"))); // Preserved from old
    }
    
    #[test]
    fn test_merge_with_variable_substitution() {
        let mut data = Map::new();
        data.insert("creator".to_string(), json!({"_$": "signer"}));
        data.insert("timestamp".to_string(), json!({"_$": "ts"}));
        
        let mut state = HashMap::new();
        state.insert("signer".to_string(), json!("user123"));
        state.insert("ts".to_string(), json!(1234567890));
        
        let env = HashMap::new();
        
        let result = merge(&data, &state, None, &env).unwrap();
        let result_obj = result.as_object().unwrap();
        
        assert_eq!(result_obj.get("creator"), Some(&json!("user123")));
        assert_eq!(result_obj.get("timestamp"), Some(&json!(1234567890)));
    }
    
    #[test]
    fn test_merge_with_delete() {
        let mut data = Map::new();
        data.insert("keep".to_string(), json!("value"));
        data.insert("remove".to_string(), json!({"_$": "del"}));
        
        let mut old_data = Map::new();
        old_data.insert("keep".to_string(), json!("old_value"));
        old_data.insert("remove".to_string(), json!("should_be_removed"));
        
        let state = HashMap::new();
        let env = HashMap::new();
        
        let result = merge(&data, &state, Some(&old_data), &env).unwrap();
        let result_obj = result.as_object().unwrap();
        
        assert_eq!(result_obj.get("keep"), Some(&json!("value")));
        assert_eq!(result_obj.get("remove"), None); // Should be deleted
    }
}
