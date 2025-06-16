// File: src/write.rs

use crate::build::Context;
use crate::bpt::{BPT, SortFields, KVStore};
use serde_json::{Value, json};
use std::collections::HashMap;

/// Initialize database
fn init_db(ctx: &mut Context) -> Result<(), String> {
    // Get initialization data from query
    let init_data = ctx.state.get("data")
        .and_then(|v| v.as_object())
        .ok_or("Invalid init data")?;
    
    let id = init_data.get("id")
        .and_then(|v| v.as_str())
        .ok_or("No database ID in init data")?;
    
    let owner = init_data.get("owner")
        .and_then(|v| v.as_str())
        .ok_or("No owner in init data")?;
    
    // Store database metadata
    ctx.kv.put("_config", "info", json!({
        "id": id,
        "owner": owner,
        "version": "1.0.0"
    }));
    
    Ok(())
}
// In write.rs, fix the write_data function:
fn write_data(ctx: &mut Context) -> Result<(), String> {
    // Extract values first to avoid borrow issues
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?
        .to_string();
    
    let doc = ctx.state.get("doc")
        .and_then(|v| v.as_str())
        .ok_or("No document ID in state")?
        .to_string();
    
    let data = ctx.state.get("data")
        .ok_or("No data in state")?
        .clone();
    
    // Check if directory exists (create if needed)
    if dir != "_" && ctx.kv.get("_", &dir).is_none() {
        let autoid = ctx.state.get("autoid")
            .and_then(|v| v.as_u64())
            .unwrap_or(0);
        
        ctx.kv.put("_", &dir, json!({
            "name": dir,
            "autoid": autoid
        }));
    }
    
    // Store the document metadata in the directory
    ctx.kv.put(&dir, &doc, json!({
        "__id__": doc
    }));
    
    // Use the indexer to handle document storage and indexing
    let path = vec![dir.clone()];
    let create = ctx.state.get("op")
        .and_then(|v| v.as_str())
        .map(|op| op == "set" || op == "add")
        .unwrap_or(false);
    
    // Create a mutable clone of the KV store
    let mut kv_clone = ctx.kv.clone();
    
    // Use indexer::put with just the doc ID (not prefixed with directory)
    if let Some((before, after)) = crate::indexer::put(data.clone(), &doc, &path, &mut kv_clone, create) {
        ctx.state.insert("before".to_string(), json!(before));
        ctx.state.insert("after".to_string(), json!(after));
    }
    
    // Update the context's KV store with the modified version
    ctx.kv = kv_clone;
    
    Ok(())
}

/// Update indexes for a document
fn update_indexes(ctx: &mut Context, doc_id: &str, data: &Value) -> Result<(), String> {
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?
        .to_string();
    
    // Get indexes for this collection
    let index_key = format!("_/{}/indexes", dir);
    if let Some(indexes) = ctx.kv.get("", &index_key) {
        if let Some(index_map) = indexes.as_object() {
            // For each index, update the B+ tree
            for (index_name, _) in index_map {
                // Parse the index fields from the name
                let fields: Vec<(String, String)> = index_name.split('/')
                    .collect::<Vec<_>>()
                    .chunks(2)
                    .map(|chunk| {
                        let field = chunk[0].to_string();
                        let order = chunk.get(1).map(|s| s.to_string()).unwrap_or("asc".to_string());
                        (field, order)
                    })
                    .collect();
                
                // Create B+ tree for this index
                let prefix = format!("{}/{}", dir, index_name);
                let sort_fields = if fields.len() == 1 {
                    SortFields::Simple(fields[0].0.clone())
                } else {
                    SortFields::Complex(fields)
                };
                
                // Create a Box<dyn KVStore> from the context's Store
                let kv_box: Box<dyn KVStore> = Box::new(ctx.kv.clone());
                let mut bpt = BPT::new(100, sort_fields, prefix, kv_box);
                
                // Insert the document into the index
                bpt.insert(doc_id, data.clone());
                
                // The B+ tree will automatically update the underlying store
            }
        }
    }
    
    Ok(())
}


fn delete_data(ctx: &mut Context) -> Result<(), String> {
    // Extract values first to avoid borrow issues
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?
        .to_string();
    
    let doc = ctx.state.get("doc")
        .and_then(|v| v.as_str())
        .ok_or("No document ID in state")?
        .to_string();
    
    let path = vec![dir.clone()];
    
    // Create a mutable clone of the KV store
    let mut kv_clone = ctx.kv.clone();
    
    // Use indexer::del to remove the document and update all indexes
    if let Some((before, after)) = crate::indexer::del(&doc, &path, &mut kv_clone) {
        ctx.state.insert("before".to_string(), json!(before));
        ctx.state.insert("after".to_string(), json!(after));
    }
    
    // Update the context's KV store with the modified version
    ctx.kv = kv_clone;
    
    // Also remove from the directory
    ctx.kv.del(&dir, &doc);
    
    Ok(())
}
/// Remove document from indexes
fn remove_from_indexes(ctx: &mut Context, doc_id: &str, _data: &Value) -> Result<(), String> {
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?
        .to_string();
    
    // Get indexes for this collection
    let index_key = format!("_/{}/indexes", dir);
    if let Some(indexes) = ctx.kv.get("", &index_key) {
        if let Some(index_map) = indexes.as_object() {
            // For each index, remove from B+ tree
            for (index_name, _) in index_map {
                // Parse the index fields from the name
                let fields: Vec<(String, String)> = index_name.split('/')
                    .collect::<Vec<_>>()
                    .chunks(2)
                    .map(|chunk| {
                        let field = chunk[0].to_string();
                        let order = chunk.get(1).map(|s| s.to_string()).unwrap_or("asc".to_string());
                        (field, order)
                    })
                    .collect();
                
                // Create B+ tree for this index
                let prefix = format!("{}/{}", dir, index_name);
                let sort_fields = if fields.len() == 1 {
                    SortFields::Simple(fields[0].0.clone())
                } else {
                    SortFields::Complex(fields)
                };
                
                let kv_box: Box<dyn KVStore> = Box::new(ctx.kv.clone());
                let mut bpt = BPT::new(100, sort_fields, prefix, kv_box);
                
                // Delete the document from the index
                bpt.delete(doc_id);
            }
        }
    }
    
    Ok(())
}

/// Add an index to a collection
fn add_index(ctx: &mut Context) -> Result<(), String> {
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?
        .to_string();
    
    let data = ctx.state.get("data")
        .ok_or("No index data in state")?
        .clone();
    
    // Parse the index fields
    let fields = data.as_array()
        .ok_or("Index data must be an array")?;
    
    // Build the index name from fields
    let index_name = fields.iter()
        .filter_map(|f| f.as_array())
        .map(|arr| {
            let field = arr.get(0)?.as_str()?;
            let order = arr.get(1).and_then(|v| v.as_str()).unwrap_or("asc");
            Some(format!("{}/{}", field, order))
        })
        .collect::<Option<Vec<_>>>()
        .ok_or("Invalid index fields")?
        .join("/");
    
    // Store the index metadata
    let index_key = format!("_/{}/indexes", dir);
    let mut indexes = ctx.kv.get("", &index_key)
        .and_then(|v| v.as_object().cloned())
        .unwrap_or_default();
    
    indexes.insert(index_name.clone(), json!(true));
    ctx.kv.put("", &index_key, json!(indexes));
    
    // Create the B+ tree for this index
    let prefix = format!("{}/{}", dir, index_name);
    let sort_fields = if fields.len() == 1 {
        let field = fields[0].as_array()
            .and_then(|arr| arr.get(0))
            .and_then(|v| v.as_str())
            .unwrap_or("value");
        SortFields::Simple(field.to_string())
    } else {
        let complex_fields: Vec<(String, String)> = fields.iter()
            .filter_map(|f| {
                let arr = f.as_array()?;
                let field = arr.get(0)?.as_str()?.to_string();
                let order = arr.get(1)
                    .and_then(|v| v.as_str())
                    .unwrap_or("asc")
                    .to_string();
                Some((field, order))
            })
            .collect();
        SortFields::Complex(complex_fields)
    };
    
    // Index all existing documents
    let mut docs_to_index = Vec::new();
    
    for (key, _) in &ctx.kv.data.clone() {
        if key.starts_with(&format!("{}/", dir)) {
            let parts: Vec<&str> = key.split('/').collect();
            if parts.len() == 2 && parts[0] == dir {
                docs_to_index.push(parts[1].to_string());
            }
        }
    }
    
    // Create a single B+ tree and index all documents
    let kv_box: Box<dyn KVStore> = Box::new(ctx.kv.clone());
    let mut bpt = BPT::new(100, sort_fields, prefix, kv_box);
    
    for doc_id in docs_to_index {
        if let Some(data) = ctx.kv.data(&doc_id) {
            bpt.insert(&doc_id, data.val);
        }
    }
    
    Ok(())
}

/// Remove an index from a collection
fn remove_index(ctx: &mut Context) -> Result<(), String> {
    let dir = ctx.state.get("dir")
        .and_then(|v| v.as_str())
        .ok_or("No directory in state")?
        .to_string();
    
    let data = ctx.state.get("data")
        .ok_or("No index data in state")?
        .clone();
    
    // Parse the index fields
    let fields = data.as_array()
        .ok_or("Index data must be an array")?;
    
    // Build the index name from fields
    let index_name = fields.iter()
        .filter_map(|f| f.as_array())
        .map(|arr| {
            let field = arr.get(0)?.as_str()?;
            let order = arr.get(1).and_then(|v| v.as_str()).unwrap_or("asc");
            Some(format!("{}/{}", field, order))
        })
        .collect::<Option<Vec<_>>>()
        .ok_or("Invalid index fields")?
        .join("/");
    
    // Remove the index metadata
    let index_key = format!("_/{}/indexes", dir);
    let mut indexes = ctx.kv.get("", &index_key)
        .and_then(|v| v.as_object().cloned())
        .unwrap_or_default();
    
    indexes.remove(&index_name);
    
    if indexes.is_empty() {
        ctx.kv.del("", &index_key);
    } else {
        ctx.kv.put("", &index_key, json!(indexes));
    }
    
    // Remove B+ tree nodes
    let prefix = format!("{}/{}", dir, index_name);
    let keys_to_remove: Vec<String> = ctx.kv.data.keys()
        .filter(|k| k.starts_with(&prefix))
        .cloned()
        .collect();
    
    for key in keys_to_remove {
        ctx.kv.data.remove(&key);
    }
    
    Ok(())
}

/// Process batch operations
fn batch_operations(ctx: &mut Context) -> Result<(), String> {
    // Clone the query to avoid borrow issues
    let query = ctx.state.get("query")
        .and_then(|v| v.as_array())
        .ok_or("No query in state")?
        .clone();
    
    if query.is_empty() || query[0].as_str() != Some("batch") {
        return Err("Invalid batch query".to_string());
    }
    
    // Process each operation in the batch
    for (i, op) in query.iter().skip(1).enumerate() {
        let op_array = op.as_array()
            .ok_or(format!("Batch operation {} is not an array", i))?;
        
        if op_array.is_empty() {
            continue;
        }
        
        let op_type = op_array[0].as_str()
            .ok_or(format!("Batch operation {} has invalid type", i))?;
        
        // Update the context state for this operation
        ctx.state.insert("query".to_string(), op.clone());
        ctx.state.insert("op".to_string(), json!(op_type));
        
        // Parse the operation
        match op_type {
            "set" | "update" | "upsert" if op_array.len() >= 4 => {
                ctx.state.insert("data".to_string(), op_array[1].clone());
                ctx.state.insert("dir".to_string(), op_array[2].clone());
                ctx.state.insert("doc".to_string(), op_array[3].clone());
                ctx.state.insert("parsed".to_string(), json!(true));
            }
            "add" if op_array.len() >= 3 => {
                ctx.state.insert("data".to_string(), op_array[1].clone());
                ctx.state.insert("dir".to_string(), op_array[2].clone());
                ctx.state.insert("parsed".to_string(), json!(true));
            }
            "del" if op_array.len() >= 3 => {
                ctx.state.insert("dir".to_string(), op_array[1].clone());
                ctx.state.insert("doc".to_string(), op_array[2].clone());
                ctx.state.insert("parsed".to_string(), json!(true));
            }
            _ => {
                return Err(format!("Unknown batch operation: {}", op_type));
            }
        }
        
        // Execute the operation
        let result = match op_type {
            "set" | "add" => write_data(ctx),
            "del" => delete_data(ctx),
            "update" | "upsert" => {
                // For update/upsert, we need to handle existing data
                write_data(ctx)
            }
            _ => Err(format!("Unknown operation: {}", op_type)),
        };
        
        if let Err(e) = result {
            return Err(format!("Batch operation {} failed: {}", i, e));
        }
    }
    
    Ok(())
}

/// Main write function
pub fn write(mut ctx: Context) -> Context {
    let opcode = match ctx.state.get("op").and_then(|v| v.as_str()) {
        Some(op) => op.to_string(),
        None => {
            ctx.state.insert("error".to_string(), json!("No operation in state"));
            return ctx;
        }
    };
    
    let result = match opcode.as_str() {
        "init" => init_db(&mut ctx),
        "set" | "add" | "update" | "upsert" => write_data(&mut ctx),
        "del" => delete_data(&mut ctx),
        "batch" => batch_operations(&mut ctx),
        "addIndex" => add_index(&mut ctx),
        "removeIndex" => remove_index(&mut ctx),
        _ => Err(format!("Unknown write operation: {}", opcode)),
    };
    
    match result {
        Ok(()) => {
            ctx.state.insert("success".to_string(), json!(true));
        }
        Err(e) => {
            ctx.state.insert("error".to_string(), json!(e));
            ctx.state.insert("success".to_string(), json!(false));
        }
    }
    
    ctx
}
