// File: src/planner.rs

use crate::bpt::{BPT, DataValue, SortFields, KVStore};
use crate::indexer::{get_indexes, IndexInfo};
use crate::build::Store;
use serde_json::{Value, json};
use std::collections::HashMap;

// Import ParsedQuery from read module since that's where it's defined
use crate::read::{ParsedQuery, QueryItem};

const IDSORTER: (&str, &str) = ("__id__", "asc");
const ORDER: usize = 100;

/// Range options
#[derive(Debug, Clone)]
pub struct RangeOpt {
    pub limit: Option<usize>,
    pub start_at: Option<Value>,
    pub start_after: Option<Value>,
    pub end_at: Option<Value>,
    pub end_before: Option<Value>,
    pub reverse: bool,
}

/// Check if an index exists for the given sort fields
fn check_index(prefix: &str, _path: &[String], kv: &Store) -> Result<(), String> {
    let indexes = get_indexes(kv);
    
    // Parse sort fields from prefix
    let parts: Vec<&str> = prefix.split('/').collect();
    let sort_fields: Vec<(String, String)> = parts
        .chunks(2)
        .map(|chunk| {
            let field = chunk[0].to_string();
            let dir = chunk.get(1).unwrap_or(&"asc").to_string();
            (field, dir)
        })
        .collect();
    
    // Build index key
    let key = sort_fields
        .iter()
        .map(|(f, d)| format!("{}/{}", f, d))
        .collect::<Vec<_>>()
        .join("/");
    
    // Single field indexes are auto-generated, multi-field need to be explicit
    if sort_fields.len() > 1 && !indexes.contains_key(&key) {
        return Err(format!("missing index {:?}", sort_fields));
    }
    
    Ok(())
}

/// Get a single document by ID
pub fn doc(id: &str, path: &[String], kv: &Store) -> Option<DataValue> {
    // Try to get from the directory first
    if !path.is_empty() {
        if let Some(data) = kv.get(&path[0], id) {
            return Some(DataValue {
                key: id.to_string(),
                val: data,
            });
        }
    }
    // Fallback to data directory
    kv.data(id)
}

/// Execute a range query
pub fn range(
    sort_fields: Vec<(String, String)>,
    opt: RangeOpt,
    path: &[String],
    kv: &mut Store,
) -> Vec<DataValue> {
    // Handle single field descending by reversing
    let mut fields = sort_fields.clone();
    let mut opt = opt;
    
    if fields.len() == 1 && fields[0].1 == "desc" {
        fields[0].1 = "asc".to_string();
        opt.reverse = true;
    }
    
    // Build prefix for the index
    let prefix = if fields.is_empty() {
        format!("{}/{}", IDSORTER.0, IDSORTER.1)
    } else {
        fields
            .iter()
            .map(|(f, d)| format!("{}/{}", f, d))
            .collect::<Vec<_>>()
            .join("/")
    };
    
    // Check if index exists
    if let Err(e) = check_index(&prefix, path, kv) {
        eprintln!("Index check failed: {}", e);
        return vec![];
    }
    
    // Create BPT for the index
    let mut sort_fields_with_id = fields.clone();
    sort_fields_with_id.push((IDSORTER.0.to_string(), IDSORTER.1.to_string()));
    
    // Clone the store to avoid lifetime issues
    let cloned_store = kv.clone();
    let bpt = BPT::new(
        ORDER,
        SortFields::Complex(sort_fields_with_id),
        prefix,
        Box::new(cloned_store),
    );
    
    // Convert options to BPT range format and execute
    let limit = opt.limit.unwrap_or(usize::MAX);
    
    // For now, simplified range query without complex bounds
    // Full implementation would handle all range options
    bpt.range(None, None, limit)
}

/// Main get function that handles parsed queries
pub fn get(parsed: &ParsedQuery, kv: &mut Store) -> Result<Value, String> {
    // Check if this is a single document query
    if parsed.path.len() == 2 {
        // Single document: ["collection", "doc_id"]
        let doc_id = &parsed.path[1];
        
        if let Some(data) = doc(doc_id, &parsed.path[0..1].to_vec(), kv) {
            Ok(data.val)
        } else {
            Ok(json!(null))
        }
    } else if parsed.path.len() == 1 {
        // Collection query
        let results = if parsed.queries.is_empty() {
            // Simple collection query without filters
            range(
                parsed.sort.clone(),
                RangeOpt {
                    limit: Some(parsed.limit),
                    start_at: None,
                    start_after: None,
                    end_at: None,
                    end_before: None,
                    reverse: false,
                },
                &parsed.path,
                kv,
            )
        } else {
            // Complex query with filters - for now just return empty
            // Full implementation would handle all query types
            vec![]
        };
        
        // Extract just the values for regular get
        let vals: Vec<Value> = results.into_iter().map(|d| d.val).collect();
        Ok(json!(vals))
    } else {
        Err("Invalid query path".to_string())
    }
}

/// Get with cursor information (for cget)
pub fn get_with_cursor(parsed: &ParsedQuery, kv: &mut Store) -> Result<Value, String> {
    // Similar to get but returns cursor information
    if parsed.path.len() == 2 {
        // Single document
        let doc_id = &parsed.path[1];
        
        if let Some(data) = doc(doc_id, &parsed.path[0..1].to_vec(), kv) {
            Ok(json!({
                "__cursor__": true,
                "dir": parsed.path[0],
                "id": data.key,
                "data": data.val
            }))
        } else {
            Ok(json!(null))
        }
    } else if parsed.path.len() == 1 {
        // Collection query
        let results = range(
            parsed.sort.clone(),
            RangeOpt {
                limit: Some(parsed.limit),
                start_at: None,
                start_after: None,
                end_at: None,
                end_before: None,
                reverse: false,
            },
            &parsed.path,
            kv,
        );
        
        // Convert to cursor format
        let cursors: Vec<Value> = results.into_iter().map(|d| {
            json!({
                "__cursor__": true,
                "dir": parsed.path[0],
                "id": d.key,
                "data": d.val
            })
        }).collect();
        
        Ok(json!(cursors))
    } else {
        Err("Invalid query path".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::build::Store;
    
    #[test]
    fn test_doc_retrieval() {
        let mut store = Store::new(HashMap::new());
        
        // Store some test data
        store.put_data("doc1", json!({"name": "Test", "age": 30}));
        
        // Retrieve document
        let result = doc("doc1", &vec!["users".to_string()], &store);
        
        assert!(result.is_some());
        let data = result.unwrap();
        assert_eq!(data.key, "doc1");
        assert_eq!(data.val["name"], "Test");
        assert_eq!(data.val["age"], 30);
    }
}
