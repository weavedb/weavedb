use crate::bpt::{BPT, DataValue, KVStore, SortFields};
use serde::{Serialize, Deserialize};
use serde_json::{Value, json};
use std::collections::{HashMap, HashSet};

const ORDER: usize = 100;
const IDSORTER: (&str, &str) = ("__id__", "asc");

/// Index metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexInfo {
    pub key: String,
    pub order: usize,
    pub items: HashMap<String, IndexItem>, // For array indexes
}

/// Array index item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IndexItem {
    pub key: String,
    pub order: usize,
}

/// Get all indexes for a path
pub fn get_indexes(kv: &dyn KVStore) -> HashMap<String, IndexInfo> {
    kv.get("indexes")
        .and_then(|v| serde_json::from_value(v).ok())
        .unwrap_or_default()
}

/// Validate sort fields
fn validate_sort_fields(sort_fields: &[(String, String)]) -> bool {
    if sort_fields.is_empty() {
        return false;
    }
    
    // Check if first field is array type
    let mut has_array = false;
    for (i, (_, sort_type)) in sort_fields.iter().enumerate() {
        if sort_type == "array" {
            if i != 0 {
                return false; // Array must be first
            }
            has_array = true;
        } else if sort_type != "asc" && sort_type != "desc" {
            return false; // Invalid sort type
        }
    }
    
    // Single field indexes need nested fields
    if sort_fields.len() == 1 && !has_array {
        let field_parts: Vec<&str> = sort_fields[0].0.split('.').collect();
        if field_parts.len() < 2 {
            return false;
        }
    }
    
    true
}

/// Add fields from nested objects
fn add_fields(val: &Value, fields: &mut Vec<String>, path: Vec<String>, top: bool) {
    if let Value::Object(map) = val {
        for (k, v) in map {
            if !top {
                let mut new_path = path.clone();
                new_path.push(k.clone());
                fields.push(new_path.join("."));
            }
            
            if v.is_object() && !v.is_array() {
                let mut new_path = path.clone();
                new_path.push(k.clone());
                add_fields(v, fields, new_path, false);
            }
        }
    }
}

/// Calculate MD5 hash using the md5 crate
fn md5_hash(s: &str) -> String {
    format!("{:x}", md5::compute(s))
}

/// Add an index
pub fn add_index<K: KVStore + Clone + 'static>(
    sort_fields: Vec<(String, String)>,
    path: &[String],
    kv: &mut K,
) -> Result<(), String> {
    // Ensure sort fields have sort direction
    let sort_fields: Vec<(String, String)> = sort_fields
        .into_iter()
        .map(|(field, dir)| {
            if dir.is_empty() {
                (field, "asc".to_string())
            } else {
                (field, dir)
            }
        })
        .collect();
    
    if !validate_sort_fields(&sort_fields) {
        return Err("Invalid sort fields".to_string());
    }
    
    // Get existing indexes
    let mut indexes = get_indexes(kv);
    
    // Create index key
    let index_key = sort_fields
        .iter()
        .map(|(f, d)| format!("{}/{}", f, d))
        .collect::<Vec<_>>()
        .join("/");
    
    // Check if index already exists
    if indexes.contains_key(&index_key) {
        return Ok(()); // Index already exists
    }
    
    // Create ID tree to iterate all documents
    let prefix = format!("{}/{}", IDSORTER.0, IDSORTER.1);
    let mut id_tree = BPT::new(ORDER, SortFields::Complex(vec![(IDSORTER.0.to_string(), IDSORTER.1.to_string())]), prefix, Box::new(kv.clone()));
    
    // Get all documents
    let docs = id_tree.range(None, None, usize::MAX);
    
    // Extract fields to index (excluding __id__)
    let i_fields: Vec<String> = sort_fields
        .iter()
        .filter(|(f, _)| f != "__id__")
        .map(|(f, _)| f.clone())
        .collect();
    
    // Handle array indexes
    if sort_fields[0].1 == "array" {
        let mut array_indexes = HashMap::new();
        let array_field = &sort_fields[0].0;
        
        for doc in docs {
            let mut fields = vec![];
            add_fields(&doc.val, &mut fields, vec![], true);
            
            // Check if document has all required fields
            let has_all_fields = i_fields.iter().all(|f| {
                fields.contains(f) || doc.val.get(f).is_some()
            });
            
            if has_all_fields {
                // Handle array field
                if let Some(Value::Array(arr)) = doc.val.get(array_field) {
                    for val in arr {
                        let val_hash = md5_hash(&serde_json::to_string(&val).unwrap_or_default());
                        let array_key = format!("{}/array:{}", array_field, val_hash);
                        
                        // Create sub-index for this array value
                        let sub_sort_fields: Vec<(String, String)> = sort_fields[1..]
                            .iter()
                            .cloned()
                            .chain(vec![(IDSORTER.0.to_string(), IDSORTER.1.to_string())])
                            .collect();
                        
                        let prefix = if sub_sort_fields.len() > 1 {
                            format!("{}/{}", array_key, sub_sort_fields[0].0)
                        } else {
                            array_key.clone()
                        };
                        
                        let mut sub_tree = BPT::new(
                            ORDER,
                            SortFields::Complex(sub_sort_fields),
                            prefix,
                            Box::new(kv.clone())
                        );
                        
                        sub_tree.insert(&doc.key, doc.val.clone());
                        
                        array_indexes.insert(val_hash.clone(), IndexItem {
                            key: array_key,
                            order: ORDER,
                        });
                    }
                }
            }
        }
        
        indexes.insert(index_key.clone(), IndexInfo {
            key: index_key,
            order: ORDER,
            items: array_indexes,
        });
    } else {
        // Regular index
        let mut tree = BPT::new(
            ORDER,
            SortFields::Complex(sort_fields.clone()),
            index_key.clone(),
            Box::new(kv.clone())
        );
        
        for doc in docs {
            let mut fields = vec![];
            add_fields(&doc.val, &mut fields, vec![], true);
            
            // Check if document has all required fields
            let has_all_fields = i_fields.iter().all(|f| {
                fields.contains(f) || doc.val.get(f).is_some()
            });
            
            if has_all_fields {
                tree.insert(&doc.key, doc.val);
            }
        }
        
        indexes.insert(index_key.clone(), IndexInfo {
            key: index_key,
            order: ORDER,
            items: HashMap::new(),
        });
    }
    
    // Save updated indexes
    if let Ok(indexes_val) = serde_json::to_value(&indexes) {
        kv.put("indexes", indexes_val);
    }
    
    Ok(())
}

/// Remove an index
pub fn remove_index<K: KVStore + Clone + 'static>(
    sort_fields: Vec<(String, String)>,
    path: &[String],
    kv: &mut K,
) -> Result<(), String> {
    // Ensure sort fields have sort direction
    let sort_fields: Vec<(String, String)> = sort_fields
        .into_iter()
        .map(|(field, dir)| {
            if dir.is_empty() {
                (field, "asc".to_string())
            } else {
                (field, dir)
            }
        })
        .collect();
    
    if !validate_sort_fields(&sort_fields) {
        return Err("Invalid sort fields".to_string());
    }
    
    // Get existing indexes
    let mut indexes = get_indexes(kv);
    
    // Create index key
    let index_key = sort_fields
        .iter()
        .map(|(f, d)| format!("{}/{}", f, d))
        .collect::<Vec<_>>()
        .join("/");
    
    // Remove the index
    indexes.remove(&index_key);
    
    // Save updated indexes
    if let Ok(indexes_val) = serde_json::to_value(&indexes) {
        kv.put("indexes", indexes_val);
    }
    
    // TODO: Clean up the actual index data from storage
    
    Ok(())
}

/// Delete a document from all indexes
pub fn del<K: KVStore + Clone + 'static>(id: &str, path: &[String], kv: &mut K) -> Option<(DataValue, DataValue)> {
    // Get the document data first
    let data = kv.data(id)?;
    let before = data.clone();
    
    // Get all indexes
    let indexes = get_indexes(kv);
    
    // Remove from each index
    for (index_key, index_info) in indexes {
        let sort_fields: Vec<(String, String)> = index_key
            .split('/')
            .collect::<Vec<_>>()
            .chunks(2)
            .map(|chunk| (chunk[0].to_string(), chunk.get(1).unwrap_or(&"asc").to_string()))
            .collect();
        
        // Get fields this index uses
        let i_fields: Vec<String> = sort_fields
            .iter()
            .filter(|(f, _)| f != "__id__")
            .map(|(f, _)| f.clone())
            .collect();
        
        let mut fields = vec![];
        add_fields(&data.val, &mut fields, vec![], true);
        
        // Check if document has all required fields
        let has_all_fields = i_fields.iter().all(|f| {
            fields.contains(f) || data.val.get(f).is_some()
        });
        
        if has_all_fields {
            if sort_fields[0].1 == "array" {
                // Handle array index
                if let Some(Value::Array(arr)) = data.val.get(&sort_fields[0].0) {
                    for val in arr {
                        let val_hash = md5_hash(&serde_json::to_string(&val).unwrap_or_default());
                        
                        if index_info.items.contains_key(&val_hash) {
                            let sub_prefix = format!("{}/array:{}", sort_fields[0].0, val_hash);
                            let sub_sort_fields: Vec<(String, String)> = sort_fields[1..]
                                .iter()
                                .cloned()
                                .chain(vec![(IDSORTER.0.to_string(), IDSORTER.1.to_string())])
                                .collect();
                            
                            let mut sub_tree = BPT::new(
                                ORDER,
                                SortFields::Complex(sub_sort_fields),
                                sub_prefix,
                                Box::new(kv.clone())
                            );
                            
                            sub_tree.delete(id);
                        }
                    }
                }
            } else {
                // Regular index
                let mut tree = BPT::new(
                    ORDER,
                    SortFields::Complex(sort_fields),
                    index_key.clone(),
                    Box::new(kv.clone())
                );
                
                tree.delete(id);
            }
        }
    }
    
    // Delete from ID index
    let prefix = format!("{}/{}", IDSORTER.0, IDSORTER.1);
    let mut id_tree = BPT::new(ORDER, SortFields::Complex(vec![(IDSORTER.0.to_string(), IDSORTER.1.to_string())]), prefix, Box::new(kv.clone()));
    id_tree.delete(id);
    
    // Delete the data
    kv.del_data(id);
    
    let after = DataValue {
        key: id.to_string(),
        val: json!(null),
    };
    
    Some((before, after))
}

/// Insert or update a document in indexes
pub fn put<K: KVStore + Clone + 'static>(
    data: Value,
    id: &str,
    path: &[String],
    kv: &mut K,
    create: bool,
) -> Option<(DataValue, DataValue)> {
    // Check if document exists
    let old_data = kv.data(id);
    
    if let Some(ref existing) = old_data {
        if create {
            // If create mode, delete existing first
            del(id, path, kv);
        } else {
            // Update existing document
            return update(data, id, existing, kv);
        }
    }
    
    // Insert new document
    kv.put_data(id, data.clone());
    
    // Insert into ID index
    let prefix = format!("{}/{}", IDSORTER.0, IDSORTER.1);
    let mut id_tree = BPT::new(ORDER, SortFields::Complex(vec![(IDSORTER.0.to_string(), IDSORTER.1.to_string())]), prefix.clone(), Box::new(kv.clone()));
    id_tree.insert(id, data.clone());
    
    // Get current indexes
    let mut indexes = get_indexes(kv);
    
    // Ensure __id__ index exists
    let id_index_key = "__id__/asc".to_string();
    if !indexes.contains_key(&id_index_key) {
        indexes.insert(id_index_key.clone(), IndexInfo {
            key: id_index_key.clone(),
            order: ORDER,
            items: HashMap::new(),
        });
    }
    
    // Add to field indexes
    if let Value::Object(map) = &data {
        for (field, value) in map {
            let field_index_key = format!("{}/asc", field);
            
            if !indexes.contains_key(&field_index_key) {
                indexes.insert(field_index_key.clone(), IndexInfo {
                    key: field_index_key.clone(),
                    order: ORDER,
                    items: HashMap::new(),
                });
            }
            
            // Create field index tree
            let mut field_tree = BPT::new(
                ORDER,
                SortFields::Complex(vec![(field.clone(), "asc".to_string()), (IDSORTER.0.to_string(), IDSORTER.1.to_string())]),
                field_index_key.clone(),
                Box::new(kv.clone())
            );
            
            field_tree.insert(id, data.clone());
            
            // Handle array fields
            if let Value::Array(arr) = value {
                let array_index_key = format!("{}/array", field);
                
                if !indexes.contains_key(&array_index_key) {
                    indexes.insert(array_index_key.clone(), IndexInfo {
                        key: array_index_key.clone(),
                        order: ORDER,
                        items: HashMap::new(),
                    });
                }
                
                for val in arr {
                    let val_hash = md5_hash(&serde_json::to_string(&val).unwrap_or_default());
                    let array_item_key = format!("{}:array:{}", field, val_hash);
                    
                    let mut array_tree = BPT::new(
                        ORDER,
                        SortFields::Complex(vec![(IDSORTER.0.to_string(), IDSORTER.1.to_string())]),
                        array_item_key.clone(),
                        Box::new(kv.clone())
                    );
                    
                    array_tree.insert(id, data.clone());
                    
                    if let Some(index_info) = indexes.get_mut(&array_index_key) {
                        index_info.items.insert(val_hash, IndexItem {
                            key: array_item_key,
                            order: ORDER,
                        });
                    }
                }
            }
        }
    }
    
    // Save updated indexes
    if let Ok(indexes_val) = serde_json::to_value(&indexes) {
        kv.put("indexes", indexes_val);
    }
    
    let after = DataValue {
        key: id.to_string(),
        val: data,
    };
    
    Some((old_data.unwrap_or(DataValue {
        key: id.to_string(),
        val: json!(null),
    }), after))
}

/// Update an existing document
fn update<K: KVStore + Clone + 'static>(
    data: Value,
    id: &str,
    old_data: &DataValue,
    kv: &mut K,
) -> Option<(DataValue, DataValue)> {
    // Calculate changes
    let (dels, changes, news) = calculate_changes(&old_data.val, &data);
    
    // Handle deletions
    for field in &dels {
        // Remove from field indexes
        // This is simplified - full implementation would handle nested fields and arrays
    }
    
    // Handle new fields
    for field in &news {
        // Add to field indexes
        // This is simplified - full implementation would handle nested fields and arrays
    }
    
    // Update the data
    kv.put_data(id, data.clone());
    
    let after = DataValue {
        key: id.to_string(),
        val: data,
    };
    
    Some((old_data.clone(), after))
}

/// Calculate changes between old and new data
fn calculate_changes(old: &Value, new: &Value) -> (Vec<String>, Vec<String>, Vec<String>) {
    let mut dels = Vec::new();
    let mut changes = Vec::new();
    let mut news = Vec::new();
    
    // Get all keys from both objects
    let mut all_keys = HashSet::new();
    
    if let Value::Object(old_map) = old {
        all_keys.extend(old_map.keys().cloned());
    }
    
    if let Value::Object(new_map) = new {
        all_keys.extend(new_map.keys().cloned());
    }
    
    // Compare each key
    for key in all_keys {
        let old_val = old.get(&key);
        let new_val = new.get(&key);
        
        match (old_val, new_val) {
            (None, Some(_)) => news.push(key),
            (Some(_), None) => dels.push(key),
            (Some(a), Some(b)) if a != b => changes.push(key),
            _ => {} // No change
        }
    }
    
    (dels, changes, news)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_validate_sort_fields() {
        // Valid simple field
        assert!(validate_sort_fields(&vec![
            ("name".to_string(), "asc".to_string()),
            ("age".to_string(), "desc".to_string()),
        ]));
        
        // Valid array field (must be first)
        assert!(validate_sort_fields(&vec![
            ("tags".to_string(), "array".to_string()),
            ("name".to_string(), "asc".to_string()),
        ]));
        
        // Invalid - array not first
        assert!(!validate_sort_fields(&vec![
            ("name".to_string(), "asc".to_string()),
            ("tags".to_string(), "array".to_string()),
        ]));
        
        // Invalid - single non-nested field
        assert!(!validate_sort_fields(&vec![
            ("name".to_string(), "asc".to_string()),
        ]));
        
        // Valid - single nested field
        assert!(validate_sort_fields(&vec![
            ("user.name".to_string(), "asc".to_string()),
        ]));
    }
    
    #[test]
    fn test_md5_hash() {
        let hash1 = md5_hash("test");
        let hash2 = md5_hash("test");
        let hash3 = md5_hash("different");
        
        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }
    
    #[test]
    fn test_calculate_changes() {
        let old = json!({
            "name": "Alice",
            "age": 30,
            "city": "NYC"
        });
        
        let new = json!({
            "name": "Alice",
            "age": 31,
            "country": "USA"
        });
        
        let (dels, changes, news) = calculate_changes(&old, &new);
        
        assert_eq!(dels, vec!["city"]);
        assert_eq!(changes, vec!["age"]);
        assert_eq!(news, vec!["country"]);
    }
}
