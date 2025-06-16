// File: src/read.rs

use crate::build::{Context, Store};
use crate::planner;
use serde_json::{Value, json};

/// Where condition for filtering
#[derive(Debug, Clone)]
pub struct WhereCondition {
    pub field: String,
    pub operator: String,
    pub value: Value,
}

/// ParsedQuery structure that matches what parse.rs expects
#[derive(Debug, Clone)]
pub struct ParsedQuery {
    pub path: Vec<String>,
    pub queries: Vec<QueryItem>,
    pub where_conditions: Vec<WhereCondition>,
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

/// Parse a query array into a ParsedQuery structure (matching JS parser)
fn parse_query(query: &Value) -> Result<ParsedQuery, String> {
    let query_array = query.as_array()
        .ok_or("Query must be an array")?;
    
    if query_array.is_empty() {
        return Err("Query array cannot be empty".to_string());
    }
    
    let op = query_array[0].as_str()
        .ok_or("First element must be operation string")?;
    
    // Skip the operation
    let mut i = 1;
    let mut path = Vec::new();
    let mut sort = Vec::new();
    let mut where_conditions = Vec::new();
    let mut limit = 1000;
    
    // Parse path elements (consecutive strings after op)
    while i < query_array.len() {
        if let Some(s) = query_array[i].as_str() {
            path.push(s.to_string());
            i += 1;
        } else {
            break;
        }
    }
    
    if path.is_empty() {
        return Err("Query must have at least one path element".to_string());
    }
    
    // Parse remaining elements (sort, where, limit)
    while i < query_array.len() {
        match &query_array[i] {
            Value::Array(arr) => {
                match arr.len() {
                    1 => {
                        // Sort field without direction: ["field"] -> ["field", "asc"]
                        if let Some(field) = arr[0].as_str() {
                            sort.push((field.to_string(), "asc".to_string()));
                        }
                    }
                    2 => {
                        // Could be sort or where
                        if let (Some(field), Some(dir)) = (arr[0].as_str(), arr[1].as_str()) {
                            if dir == "asc" || dir == "desc" {
                                // This is a sort directive
                                sort.push((field.to_string(), dir.to_string()));
                            }
                        }
                    }
                    3 => {
                        // Where condition: ["field", "operator", value]
                        if let (Some(field), Some(op)) = (arr[0].as_str(), arr[1].as_str()) {
                            match op {
                                "==" | "!=" | ">" | ">=" | "<" | "<=" => {
                                    where_conditions.push(WhereCondition {
                                        field: field.to_string(),
                                        operator: op.to_string(),
                                        value: arr[2].clone(),
                                    });
                                }
                                _ => {}
                            }
                        }
                    }
                    _ => {}
                }
            }
            Value::Number(n) => {
                // Limit
                if let Some(limit_val) = n.as_u64() {
                    limit = limit_val as usize;
                }
            }
            _ => {}
        }
        i += 1;
    }
    
    // Determine if this is a single document or range query
    let single = path.len() == 2 && 
                 query_array.len() == 3 && 
                 query_array[2].is_string();
    
    Ok(ParsedQuery {
        path: path.clone(),
        queries: vec![],
        where_conditions,
        sort,
        limit,
        op: op.to_string(),
        doc: if single { path.get(1).cloned() } else { None },
        range: !single,
        single,
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
    
    let final_result = if opcode == "cget" {
        if parsed.range {
            // For range queries, planner returns an array of values
            match result {
                Value::Array(items) => {
                    let cursors: Vec<Value> = items.into_iter().enumerate().map(|(idx, item)| {
                        // Try to extract the ID from the item
                        let id = item.get("__id__")
                            .and_then(|v| v.as_str())
                            .unwrap_or(&format!("doc_{}", idx))
                            .to_string();
                        
                        json!({
                            "__cursor__": true,
                            "dir": dir.clone(),
                            "id": id,
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
        
        // Store document metadata
        store.put("users", "user1", json!({"__id__": "user1"}));
        
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
        
        // Store document
        store.put("users", "user1", json!({"__id__": "user1"}));
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
