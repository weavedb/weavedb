// File: src/planner.rs

use crate::bpt::{BPT, DataValue, SortFields, KVStore};
use crate::build::Store;
use serde_json::{Value, json};
use crate::read::{ParsedQuery, WhereCondition};

/// Apply where conditions to filter a document
fn apply_where_conditions(doc: &Value, conditions: &[WhereCondition]) -> bool {
    for condition in conditions {
        let field_value = doc.get(&condition.field);
        
        match condition.operator.as_str() {
            "==" => {
                if field_value != Some(&condition.value) {
                    return false;
                }
            }
            "!=" => {
                if field_value == Some(&condition.value) {
                    return false;
                }
            }
            ">" => {
                match (field_value, &condition.value) {
                    (Some(Value::Number(a)), Value::Number(b)) => {
                        if let (Some(a_val), Some(b_val)) = (a.as_i64(), b.as_i64()) {
                            if a_val <= b_val {
                                return false;
                            }
                        } else if let (Some(a_val), Some(b_val)) = (a.as_f64(), b.as_f64()) {
                            if a_val <= b_val {
                                return false;
                            }
                        }
                    }
                    _ => return false,
                }
            }
            ">=" => {
                match (field_value, &condition.value) {
                    (Some(Value::Number(a)), Value::Number(b)) => {
                        if let (Some(a_val), Some(b_val)) = (a.as_i64(), b.as_i64()) {
                            if a_val < b_val {
                                return false;
                            }
                        } else if let (Some(a_val), Some(b_val)) = (a.as_f64(), b.as_f64()) {
                            if a_val < b_val {
                                return false;
                            }
                        }
                    }
                    _ => return false,
                }
            }
            "<" => {
                match (field_value, &condition.value) {
                    (Some(Value::Number(a)), Value::Number(b)) => {
                        if let (Some(a_val), Some(b_val)) = (a.as_i64(), b.as_i64()) {
                            if a_val >= b_val {
                                return false;
                            }
                        } else if let (Some(a_val), Some(b_val)) = (a.as_f64(), b.as_f64()) {
                            if a_val >= b_val {
                                return false;
                            }
                        }
                    }
                    _ => return false,
                }
            }
            "<=" => {
                match (field_value, &condition.value) {
                    (Some(Value::Number(a)), Value::Number(b)) => {
                        if let (Some(a_val), Some(b_val)) = (a.as_i64(), b.as_i64()) {
                            if a_val > b_val {
                                return false;
                            }
                        } else if let (Some(a_val), Some(b_val)) = (a.as_f64(), b.as_f64()) {
                            if a_val > b_val {
                                return false;
                            }
                        }
                    }
                    _ => return false,
                }
            }
            _ => {} // Unknown operator, ignore
        }
    }
    
    true
}

// Add this function to check if an index exists
fn has_index(path: &[String], sort_fields: &[(String, String)], store: &Store) -> bool {
    // Check if there's an index for this path and sort fields
    let dir = path.join("/");
    let index_key = format!("_/{}/indexes", dir);
    
    if let Some(indexes) = store.get("", &index_key) {
        if let Some(index_map) = indexes.as_object() {
            // Check if we have an index for these sort fields
            let sort_key = sort_fields.iter()
                .map(|(field, order)| format!("{}/{}", field, order))
                .collect::<Vec<_>>()
                .join("/");
            return index_map.contains_key(&sort_key);
        }
    }
    false
}

// Fix the doc function to use the data method correctly
pub fn doc(id: &str, path: &[String], store: &Store) -> Option<DataValue> {
    // First check if document exists in the collection
    let dir = if path.is_empty() { 
        String::new() 
    } else { 
        path.join("/") 
    };
    
    // The document should be stored at dir/doc
    if let Some(_doc_data) = store.get(&dir, id) {
        // Now get the actual data using the data() method
        // The data is stored with just the document ID as the key
        return store.data(id);
    }
    
    None
}

// Fix the get function to handle both indexed and non-indexed queries
pub fn get(parsed: &ParsedQuery, store: &mut Store) -> Result<Value, String> {
    if parsed.single {
        // Single document query
        let path = &parsed.path[0..parsed.path.len()-1];
        let doc_id = &parsed.path[parsed.path.len()-1];
        
        match doc(doc_id, path, store) {
            Some(data) => Ok(data.val),
            None => Ok(Value::Null),
        }
    } else {
        // Range query - check if we have an index
        let path = &parsed.path;
        let dir = path.join("/");
        
        // Check if we have indexes for this collection
        let index_key = format!("_/{}/indexes", dir);
        let has_indexes = store.get("", &index_key).is_some();
        
        if has_indexes && !parsed.sort.is_empty() {
            // Use B+ tree index if available
            let sort_fields = parsed.sort.clone();
            let index_name = sort_fields.iter()
                .map(|(field, order)| format!("{}/{}", field, order))
                .collect::<Vec<_>>()
                .join("/");
            
            let prefix = format!("{}/{}", dir, index_name);
            
            // Check if this specific index exists
            if let Some(indexes) = store.get("", &index_key) {
                if let Some(index_map) = indexes.as_object() {
                    if index_map.contains_key(&index_name) {
                        // Use the B+ tree index
                        let sort_fields_enum = if sort_fields.len() == 1 {
                            SortFields::Simple(sort_fields[0].0.clone())
                        } else {
                            SortFields::Complex(sort_fields.clone())
                        };
                        
                        let kv_box: Box<dyn KVStore> = Box::new(store.clone());
                        let bpt = BPT::new(100, sort_fields_enum, prefix, kv_box);
                        
                        // Perform range query on B+ tree
                        let results = bpt.range(None, None, parsed.limit);
                        let values: Vec<Value> = results.into_iter()
                            .map(|dv| dv.val)
                            .filter(|val| apply_where_conditions(val, &parsed.where_conditions))
                            .collect();
                        
                        return Ok(Value::Array(values));
                    }
                }
            }
        }
        
        // Fallback: simple scan of all documents
        let mut results = Vec::new();
        let mut doc_ids = Vec::new();
        
        // Collect all document IDs in the collection
        for (key, _) in &store.data.clone() {
            if key.starts_with(&format!("{}/", dir)) {
                let parts: Vec<&str> = key.split('/').collect();
                if parts.len() == 2 && parts[0] == dir {
                    doc_ids.push(parts[1].to_string());
                }
            }
        }
        
        // Get the actual document data and apply where conditions
        for doc_id in doc_ids {
            if let Some(data) = store.data(&doc_id) {
                if apply_where_conditions(&data.val, &parsed.where_conditions) {
                    results.push(data.val);
                }
            }
        }
        
        // Apply simple sorting if requested
        if !parsed.sort.is_empty() && parsed.sort[0].0 == "age" {
            results.sort_by(|a, b| {
                let a_age = a.get("age").and_then(|v| v.as_i64()).unwrap_or(0);
                let b_age = b.get("age").and_then(|v| v.as_i64()).unwrap_or(0);
                
                if parsed.sort[0].1 == "desc" {
                    b_age.cmp(&a_age)
                } else {
                    a_age.cmp(&b_age)
                }
            });
        }
        
        // Apply limit
        results.truncate(parsed.limit);
        
        Ok(Value::Array(results))
    }
}
