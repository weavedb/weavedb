// File: src/planner.rs

use crate::bpt::{BPT, DataValue, SortFields, KVStore};
use crate::build::Store;
use serde_json::{Value, json};
use crate::read::{ParsedQuery, WhereCondition};
use std::cmp::Ordering;  // Add this import

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

// In planner.rs, keep the original simple approach:
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
        // Range query
        let dir = &parsed.path[0];
        let mut results = Vec::new();
        
        // Get all document IDs in this directory
        for (key, _) in &store.data.clone() {
            if key.starts_with(&format!("{}/", dir)) {
                let parts: Vec<&str> = key.split('/').collect();
                if parts.len() == 2 && parts[0] == dir {
                    let doc_id = parts[1];
                    // Get the actual document data
                    if let Some(data) = store.data(doc_id) {
                        if apply_where_conditions(&data.val, &parsed.where_conditions) {
                            results.push(data.val);
                        }
                    }
                }
            }
        }
        
        // Apply sorting
        if !parsed.sort.is_empty() {
            results.sort_by(|a, b| {
                for (field, order) in &parsed.sort {
                    let va = a.get(field).unwrap_or(&json!(null));
                    let vb = b.get(field).unwrap_or(&json!(null));
                    
                    let cmp = compare_json_values(va, vb);
                    if cmp != Ordering::Equal {
                        return if order == "desc" {
                            cmp.reverse()
                        } else {
                            cmp
                        };
                    }
                }
                Ordering::Equal
            });
        }
        
        // Apply limit
        results.truncate(parsed.limit);
        
        Ok(Value::Array(results))
    }
}
// Add this function to planner.rs (after the imports, before the other functions):

fn compare_json_values(a: &Value, b: &Value) -> Ordering {
    match (a, b) {
        (Value::Null, Value::Null) => Ordering::Equal,
        (Value::Null, _) => Ordering::Less,
        (_, Value::Null) => Ordering::Greater,
        (Value::Bool(a), Value::Bool(b)) => a.cmp(b),
        (Value::Number(a), Value::Number(b)) => {
            let af = a.as_f64().unwrap_or(0.0);
            let bf = b.as_f64().unwrap_or(0.0);
            af.partial_cmp(&bf).unwrap_or(Ordering::Equal)
        }
        (Value::String(a), Value::String(b)) => a.cmp(b),
        (Value::Array(a), Value::Array(b)) => {
            for (av, bv) in a.iter().zip(b.iter()) {
                let cmp = compare_json_values(av, bv);
                if cmp != Ordering::Equal {
                    return cmp;
                }
            }
            a.len().cmp(&b.len())
        }
        _ => Ordering::Equal,
    }
}
