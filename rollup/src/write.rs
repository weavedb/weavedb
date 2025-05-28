use crate::build::{build, transform, BuildConfig, Context, TransformFn};
use crate::normalize;
use crate::verify_nonce;
use crate::auth;
use crate::indexer;
use crate::bpt::KVStore;
use std::sync::Arc;
use serde_json::{Value, json, Map};
use std::collections::HashMap;

// Re-export commonly used types
pub use crate::build::{Store, DBMethods};

/// System directory name
const SYSTEM_DIR: &str = "_";

/// Initialize database
fn init_db(mut ctx: Context) -> Context {
    // Extract configuration from query
    let config = match ctx.state.get("query")
        .and_then(|q| q.as_array())
        .and_then(|arr| arr.get(2))
        .and_then(|v| v.as_object()) {
            Some(cfg) => cfg,
            None => {
                ctx.state.insert("error".to_string(), json!("Invalid init configuration"));
                return ctx;
            }
	};
    
    // Extract configuration values
    let db_id = config.get("id")
        .and_then(|v| v.as_str())
        .unwrap_or_else(|| ctx.env.get("id").and_then(|v| v.as_str()).unwrap_or(""));
    
    let owner = config.get("owner")
        .and_then(|v| v.as_str())
        .unwrap_or("");
    
    let secure = config.get("secure")
        .and_then(|v| v.as_str())
        .unwrap_or("false");
    
    // Create config document
    let config_doc = json!({
        "id": db_id,
        "owner": owner,
        "secure": secure,
        "version": "1.0.0"
    });
    
    // Create info document
    let info_doc = json!({
        "id": db_id,
        "owner": owner
    });
    
    // Store in system directory
    ctx.kv.put(SYSTEM_DIR, "config", config_doc);
    ctx.kv.put(SYSTEM_DIR, "info", info_doc);
    
    // Mark as initialized
    ctx.state.insert("initialized".to_string(), json!(true));
    
    ctx
}

// Validate data against directory schema
fn validate_schema(ctx: &Context) -> Result<(), String> {
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?;
    
    let data = ctx.state.get("data")
        .ok_or("No data in state")?;
    
    // Get directory metadata
    let dir_meta = ctx.kv.get(SYSTEM_DIR, dir);
    
    // If directory doesn't exist, that's okay - it will be created
    if dir_meta.is_none() {
        return Ok(());
    }
    
    // Check if schema exists
    let has_schema = dir_meta
        .as_ref()
        .and_then(|meta| meta.as_object())
        .and_then(|obj| obj.get("schema"))
        .is_some();
    
    if has_schema {
        // In real implementation, would use jsonschema crate to validate
        // For now, just ensure data is not empty
        if data.is_null() || (data.is_object() && data.as_object().unwrap().is_empty()) {
            Err("invalid schema".to_string())
        } else {
            Ok(())
        }
    } else {
        Ok(()) // No schema means any data is valid
    }
}

/// Add index for a directory
fn add_index(mut ctx: Context) -> Context {
    let dir = match ctx.state.get("dir").and_then(|v| v.as_str()) {
        Some(d) => d,
        None => {
            ctx.state.insert("error".to_string(), json!("No directory in state"));
            return ctx;
        }
    };

    // Verify directory exists
    if ctx.kv.get(SYSTEM_DIR, dir).is_none() {
        ctx.state.insert("error".to_string(), json!(format!("dir doesn't exist: {}", dir)));
        return ctx;
    }
    
    // Extract index definition from state (should be in data)
    let index_def = match ctx.state.get("data") {
        Some(def) => def,
        None => {
            ctx.state.insert("error".to_string(), json!("No index definition in state"));
            return ctx;
        }
    };
    
    // Parse sort fields from index definition
    let sort_fields = match parse_sort_fields(index_def) {
        Ok(fields) => fields,
        Err(e) => {
            ctx.state.insert("error".to_string(), json!(e));
            return ctx;
        }
    };
    
    // Add the index using the Store directly (which implements Clone)
    match indexer::add_index(sort_fields, &[dir.to_string()], &mut ctx.kv) {
        Ok(_) => {
            ctx.state.insert("index_added".to_string(), json!(true));
        }
        Err(e) => {
            ctx.state.insert("error".to_string(), json!(e));
        }
    }
    
    ctx
}

/// Remove index for a directory
fn remove_index(mut ctx: Context) -> Context {
    let dir = match ctx.state.get("dir").and_then(|v| v.as_str()) {
        Some(d) => d,
        None => {
            ctx.state.insert("error".to_string(), json!("No directory in state"));
            return ctx;
        }
    };
    
    // Extract index definition from state
    let index_def = match ctx.state.get("data") {
        Some(def) => def,
        None => {
            ctx.state.insert("error".to_string(), json!("No index definition in state"));
            return ctx;
        }
    };
    
    // Parse sort fields from index definition
    let sort_fields = match parse_sort_fields(index_def) {
        Ok(fields) => fields,
        Err(e) => {
            ctx.state.insert("error".to_string(), json!(e));
            return ctx;
        }
    };
    
    // Remove the index using the Store directly
    match indexer::remove_index(sort_fields, &[dir.to_string()], &mut ctx.kv) {
        Ok(_) => {
            ctx.state.insert("index_removed".to_string(), json!(true));
        }
        Err(e) => {
            ctx.state.insert("error".to_string(), json!(e));
        }
    }
    
    ctx
}

/// Parse sort fields from index definition
fn parse_sort_fields(index_def: &Value) -> Result<Vec<(String, String)>, String> {
    if let Value::Array(arr) = index_def {
        let mut fields = Vec::new();
        for item in arr {
            if let Value::Array(field_def) = item {
                if field_def.len() >= 1 {
                    let field = field_def[0].as_str()
                        .ok_or("Invalid field name")?
                        .to_string();
                    let direction = field_def.get(1)
                        .and_then(|v| v.as_str())
                        .unwrap_or("asc")
                        .to_string();
                    fields.push((field, direction));
                }
            } else if let Value::String(field) = item {
                fields.push((field.clone(), "asc".to_string()));
            }
        }
        Ok(fields)
    } else {
        Err("Index definition must be an array".to_string())
    }
}

/// Put data into the database
fn put_data(mut ctx: Context) -> Context {
    let dir = match ctx.state.get("dir").and_then(|v| v.as_str()) {
        Some(d) => d,
        None => {
            ctx.state.insert("error".to_string(), json!("No directory in state"));
            return ctx;
        }
    };
    
    let doc = match ctx.state.get("doc").and_then(|v| v.as_str()) {
        Some(d) => d,
        None => {
            ctx.state.insert("error".to_string(), json!("No document ID in state"));
            return ctx;
        }
    };
    
    let data = match ctx.state.get("data") {
        Some(d) => d.clone(),
        None => {
            ctx.state.insert("error".to_string(), json!("No document data in state"));
            return ctx;
        }
    };
    
    // Check if directory exists in system directory
    let dir_exists = ctx.kv.get(SYSTEM_DIR, dir).is_some();
    
    // If directory doesn't exist and it's not a system directory, create it
    if !dir_exists && dir != "_" && dir != "__accounts__" && dir != "__indexes__" {
        // Create directory metadata in system directory
        let mut dir_meta = json!({
            "name": dir,
            "created": chrono::Utc::now().timestamp(),
        });
        
        // If we have an autoid in state (from add operation), include it
        if let Some(autoid) = ctx.state.get("autoid") {
            if let Some(meta_obj) = dir_meta.as_object_mut() {
                meta_obj.insert("autoid".to_string(), autoid.clone());
            }
        }
        
        ctx.kv.put(SYSTEM_DIR, dir, dir_meta);
    }
    
    // Determine if this is a create (set) or update operation
    let is_create = ctx.state.get("op")
        .and_then(|v| v.as_str())
        .map(|op| op == "set" || op == "add")
        .unwrap_or(false);
    
    // Use indexer to put data (handles all index updates)
    if let Some((before, after)) = indexer::put(data, doc, &[dir.to_string()], &mut ctx.kv, is_create) {
        // Store the before/after states for potential triggers or logging
        ctx.state.insert("before".to_string(), serde_json::to_value(&before).unwrap_or(json!(null)));
        ctx.state.insert("after".to_string(), serde_json::to_value(&after).unwrap_or(json!(null)));
    }
    
    ctx
}

/// Delete data from the database
fn del_data(mut ctx: Context) -> Context {
    let dir = match ctx.state.get("dir").and_then(|v| v.as_str()) {
        Some(d) => d,
        None => {
            ctx.state.insert("error".to_string(), json!("No directory in state"));
            return ctx;
        }
    };
    
    let doc = match ctx.state.get("doc").and_then(|v| v.as_str()) {
        Some(d) => d,
        None => {
            ctx.state.insert("error".to_string(), json!("No document ID in state"));
            return ctx;
        }
    };
    
    // Check if directory exists
    if ctx.kv.get(SYSTEM_DIR, dir).is_none() {
        ctx.state.insert("error".to_string(), json!(format!("dir doesn't exist: {}", dir)));
        return ctx;
    }
    
    // Use indexer to delete (handles all index updates)
    if let Some((before, after)) = indexer::del(doc, &[dir.to_string()], &mut ctx.kv) {
        // Store the before/after states
        ctx.state.insert("before".to_string(), serde_json::to_value(&before).unwrap_or(json!(null)));
        ctx.state.insert("after".to_string(), serde_json::to_value(&after).unwrap_or(json!(null)));
    }
    
    ctx
}

/// Process batch operations
fn batch(mut ctx: Context) -> Context {
    let ops = match ctx.state.get("query")
        .and_then(|q| q.as_array())
        .and_then(|arr| arr.get(1))
        .and_then(|v| v.as_array()) {
            Some(ops) => ops.clone(),
            None => {
                ctx.state.insert("error".to_string(), json!("Invalid batch query"));
                return ctx;
            }
	};
    
    // In real implementation, would process each operation through the pipeline
    // For now, just mark as successful
    ctx.state.insert("batch_count".to_string(), json!(ops.len()));
    
    ctx
}

/// Execute write operation with optional schema validation
fn write_with_validation<F>(mut ctx: Context, writer: F) -> Context
where
    F: FnOnce(Context) -> Context,
{
    // Validate schema first
    if let Err(e) = validate_schema(&ctx) {
        ctx.state.insert("error".to_string(), json!(e));
        return ctx;
    }
    
    // Execute the writer
    writer(ctx)
}

/// Get writer function for operation
fn get_writer(opcode: &str) -> Option<fn(Context) -> Context> {
    match opcode {
        "init" => Some(init_db),
        "set" | "add" | "upsert" | "update" => Some(|ctx| write_with_validation(ctx, put_data)),
        "del" => Some(del_data),
        "addIndex" => Some(add_index),
        "removeIndex" => Some(remove_index),
        "batch" => Some(batch),
        _ => None,
    }
}

/// Main write function
pub fn write(mut ctx: Context) -> Context {
    let op = match ctx.state.get("op").and_then(|v| v.as_str()) {
        Some(op) => op.to_string(),  // Convert to owned String
        None => {
            ctx.state.insert("error".to_string(), json!("No operation in state"));
            return ctx;
        }
    };
    
    // Get the writer function
    let writer = match get_writer(&op) {
        Some(w) => w,
        None => {
            ctx.state.insert("error".to_string(), json!(format!("Unknown operation: {}", op)));
            return ctx;
        }
    };
    
    // Execute the writer
    ctx = writer(ctx);
    
    // Check if we should commit (not in batch mode)
    let no_commit = ctx.env.get("no_commit")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    
    if !no_commit && !ctx.state.contains_key("error") {
        // In real implementation, would call kv.commit()
        ctx.kv.commit();
        ctx.state.insert("committed".to_string(), json!(true));
    }
    
    // Mark write as complete
    if !ctx.state.contains_key("error") {
        ctx.state.insert("write_result".to_string(), json!({
            "success": true,
            "operation": op
        }));
    }
    
    ctx
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_init_db() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up init query
        ctx.state.insert("op".to_string(), json!("init"));
        ctx.state.insert("query".to_string(), json!([
            "init", "_", {
                "id": "test-db",
                "owner": "owner123",
                "secure": "true"
            }
        ]));
        ctx.env.insert("id".to_string(), json!("default-id"));
        
        ctx = write(ctx);
        
        // Check no error
        assert!(!ctx.state.contains_key("error"));
        assert_eq!(ctx.state.get("initialized"), Some(&json!(true)));
        
        // Check config was stored
        let config = ctx.kv.get(SYSTEM_DIR, "config");
        assert!(config.is_some());
        let config = config.unwrap();
        assert_eq!(config.get("id"), Some(&json!("test-db")));
        assert_eq!(config.get("owner"), Some(&json!("owner123")));
        assert_eq!(config.get("secure"), Some(&json!("true")));
    }
    
    #[test]
    fn test_put_data() {
        let mut ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Initialize directory metadata
        ctx.kv.put(SYSTEM_DIR, "users", json!({"name": "users"}));
        
        // Set up put operation
        ctx.state.insert("op".to_string(), json!("set"));
        ctx.state.insert("dir".to_string(), json!("users"));
        ctx.state.insert("doc".to_string(), json!("user1"));
        ctx.state.insert("data".to_string(), json!({"name": "Alice", "age": 30}));
        
        ctx = write(ctx);
        
        // Check no error
        assert!(!ctx.state.contains_key("error"));
        
        // Check data was stored
        let data = ctx.kv.get("users", "user1");
        assert_eq!(data, Some(json!({"name": "Alice", "age": 30})));
    }
}
