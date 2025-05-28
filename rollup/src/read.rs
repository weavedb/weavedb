// File: src/read.rs

use crate::build::{Context, Store};
use crate::planner;
use serde_json::{Value, json};

/// ParsedQuery structure that matches what parse.rs expects
#[derive(Debug, Clone)]
pub struct ParsedQuery {
    pub path: Vec<String>,
    pub queries: Vec<QueryItem>,
    pub sort: Vec<(String, String)>,
    pub limit: usize,
    pub op: String,
    pub doc: Option<String>,
    pub range: bool,
    pub single: bool,
}

#[derive(Debug, Clone)]
pub struct QueryItem {
    // Add fields as needed for complex queries
}

/// Parse a query array into a ParsedQuery structure
fn parse_query(query: &Value) -> Result<ParsedQuery, String> {
    let query_array = query.as_array()
        .ok_or("Query must be an array")?;
    
    if query_array.is_empty() {
        return Err("Query array cannot be empty".to_string());
    }
    
    let op = query_array[0].as_str()
        .ok_or("First element must be operation string")?;
    
    let path: Vec<String> = query_array[1..]
        .iter()
        .take_while(|v| v.is_string())
        .map(|v| v.as_str().unwrap().to_string())
        .collect();
    
    if path.is_empty() {
        return Err("Query must have at least one path element".to_string());
    }
    
    Ok(ParsedQuery {
        path: path.clone(),
        queries: vec![],
        sort: vec![],
        limit: 1000,
        op: op.to_string(),
        doc: if path.len() == 2 { Some(path[1].clone()) } else { None },
        range: path.len() == 1,
        single: path.len() == 2,
    })
}

/// Get documents based on the parsed query
fn get_docs(mut ctx: Context) -> (Context, Result<(), String>) {
    let dir = match ctx.state.get("dir").and_then(|v| v.as_str()) {
        Some(d) => d.to_string(),
        None => return (ctx, Err("No directory in state".to_string())),
    };
    
    // Check if directory exists (except for system directory)
    if dir != "_" {
        let _dir = ctx.kv.get("_", &dir);
        if _dir.is_none() {
            return (ctx, Err(format!("dir doesn't exist: {}", dir)));
        }
    }
    
    // Get the query from state
    let query = match ctx.state.get("query") {
        Some(q) => q.clone(),
        None => return (ctx, Err("No query in state".to_string())),
    };
    
    // Parse the query
    let parsed = match parse_query(&query) {
        Ok(p) => p,
        Err(e) => return (ctx, Err(e)),
    };
    
    // Use planner to get results directly with the store
    let result = match planner::get(&parsed, &mut ctx.kv) {
        Ok(r) => r,
        Err(e) => return (ctx, Err(e)),
    };
    
    // Handle the result based on opcode
    let opcode = ctx.state.get("opcode")
        .and_then(|v| v.as_str())
        .unwrap_or("get");
    
    // Check if this is a range query
    let is_range = parsed.path.len() % 2 == 1;
    
    let final_result = if opcode == "cget" {
        if is_range {
            // For range queries, planner returns an array of values
            match result {
                Value::Array(items) => {
                    let cursors: Vec<Value> = items.into_iter().map(|item| {
                        json!({
                            "__cursor__": true,
                            "dir": dir,
                            "id": "", // Would need to extract from item if available
                            "data": item
                        })
                    }).collect();
                    json!(cursors)
                },
                _ => {
                    // Single document case
                    if !result.is_null() {
                        json!({
                            "__cursor__": true,
                            "dir": dir,
                            "id": parsed.path.last().unwrap_or(&String::new()),
                            "data": result
                        })
                    } else {
                        result
                    }
                }
            }
        } else {
            // For single document queries
            if !result.is_null() {
                json!({
                    "__cursor__": true,
                    "dir": dir,
                    "id": parsed.path.last().unwrap_or(&String::new()),
                    "data": result
                })
            } else {
                result
            }
        }
    } else {
        // Regular get - already returns just the values
        result
    };
    
    ctx.state.insert("result".to_string(), final_result);
    (ctx, Ok(()))
}

/// Main read function
pub fn read(mut ctx: Context) -> Context {
    let opcode = match ctx.state.get("opcode").and_then(|v| v.as_str()) {
        Some(op) => op,
        None => match ctx.state.get("op").and_then(|v| v.as_str()) {
            Some(op) => op,
            None => {
                ctx.state.insert("error".to_string(), json!("No operation in state"));
                return ctx;
            }
        }
    };
    
    match opcode {
        "get" | "cget" => {
            let (mut ctx, result) = get_docs(ctx);
            match result {
                Ok(()) => {
                    // Move result to read_result for compatibility
                    if let Some(result) = ctx.state.remove("result") {
                        ctx.state.insert("read_result".to_string(), result);
                    }
                    ctx
                }
                Err(e) => {
                    ctx.state.insert("error".to_string(), json!(e));
                    ctx
                }
            }
        }
        _ => {
            ctx.state.insert("error".to_string(), json!("Unknown read operation"));
            ctx
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::build::Store;
    use std::collections::HashMap;
    
    #[test]
    fn test_read_single_document() {
        let mut store = Store::new(HashMap::new());
        
        // Set up directory
        store.put("_", "users", json!({"name": "users"}));
        
        // Store test data with proper key format
        store.put_data("user1", json!({"name": "Alice", "age": 30}));
        
        let mut ctx = Context {
            kv: store,
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up state for single document read
        ctx.state.insert("op".to_string(), json!("get"));
        ctx.state.insert("opcode".to_string(), json!("get"));
        ctx.state.insert("dir".to_string(), json!("users"));
        ctx.state.insert("query".to_string(), json!(["get", "users", "user1"]));
        
        ctx = read(ctx);
        
        if let Some(error) = ctx.state.get("error") {
            panic!("Read failed: {}", error);
        }
        
        assert!(ctx.state.contains_key("read_result"));
        
        let result = ctx.state.get("read_result").unwrap();
        assert_eq!(result["name"], "Alice");
        assert_eq!(result["age"], 30);
    }
    
    #[test]
    fn test_read_missing_directory() {
        let store = Store::new(HashMap::new());
        
        let mut ctx = Context {
            kv: store,
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        ctx.state.insert("op".to_string(), json!("get"));
        ctx.state.insert("dir".to_string(), json!("nonexistent"));
        ctx.state.insert("query".to_string(), json!(["get", "nonexistent", "doc1"]));
        
        ctx = read(ctx);
        
        assert!(ctx.state.contains_key("error"));
        let error = ctx.state.get("error").unwrap().as_str().unwrap();
        assert!(error.contains("dir doesn't exist"));
    }
    
    #[test]
    fn test_cget_single_document() {
        let mut store = Store::new(HashMap::new());
        
        // Set up directory
        store.put("_", "users", json!({"name": "users"}));
        
        // Store test data
        store.put_data("user1", json!({"name": "Bob", "age": 25}));
        
        let mut ctx = Context {
            kv: store,
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Set up state for cget
        ctx.state.insert("opcode".to_string(), json!("cget"));
        ctx.state.insert("dir".to_string(), json!("users"));
        ctx.state.insert("query".to_string(), json!(["cget", "users", "user1"]));
        
        ctx = read(ctx);
        
        if let Some(error) = ctx.state.get("error") {
            panic!("Read failed: {}", error);
        }
        
        assert!(ctx.state.contains_key("read_result"));
        
        let result = ctx.state.get("read_result").unwrap();
        assert_eq!(result["__cursor__"], true);
        assert_eq!(result["dir"], "users");
        assert_eq!(result["id"], "user1");
        assert_eq!(result["data"]["name"], "Bob");
        assert_eq!(result["data"]["age"], 25);
    }
}
