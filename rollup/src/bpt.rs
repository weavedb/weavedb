use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::cmp::Ordering;

/// B+ Tree node structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub id: String,
    pub leaf: bool,
    pub vals: Vec<String>,  // Keys for leaf nodes, values for internal nodes
    pub parent: Option<String>,
    pub children: Vec<String>,
    pub next: Option<String>,
    pub prev: Option<String>,
}

/// Key-value data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataValue {
    pub key: String,
    pub val: Value,
}

/// B+ Tree implementation
pub struct BPT {
    pub order: usize,
    pub sort_fields: SortFields,
    pub max_vals: usize,
    pub min_vals: usize,
    pub prefix: String,
    pub kv: Box<dyn KVStore>,
}

/// Sort field specification
#[derive(Debug, Clone)]
pub enum SortFields {
    Simple(String),
    Complex(Vec<(String, String)>), // field name, direction (asc/desc)
}

/// Trait for key-value storage operations
pub trait KVStore: Send + Sync {
    fn get(&self, key: &str) -> Option<Value>;
    fn put(&mut self, key: &str, val: Value);
    fn del(&mut self, key: &str);
    fn data(&self, key: &str) -> Option<DataValue>;
    fn put_data(&mut self, key: &str, val: Value);
    fn del_data(&mut self, key: &str);
}
impl BPT {
    /// Create a new B+ Tree
    pub fn new(order: usize, sort_fields: SortFields, prefix: String, kv: Box<dyn KVStore>) -> Self {
        let max_vals = order - 1;
        let min_vals = (order as f64 / 2.0).ceil() as usize - 1;
        
        BPT {
            order,
            sort_fields,
            max_vals,
            min_vals,
            prefix,
            kv,
        }
    }
    
    /// Add prefix to key
    fn add_prefix(&self, key: &str) -> String {
        if self.prefix.is_empty() {
            key.to_string()
        } else {
            format!("{}/{}", self.prefix, key)
        }
    }
    
    /// Get a node by ID
    fn get_node(&self, id: &str) -> Option<Node> {
        let key = self.add_prefix(id);
        self.kv.get(&key).and_then(|v| serde_json::from_value(v).ok())
    }
    
    /// Store a node
    fn put_node(&mut self, node: &Node) {
        let key = self.add_prefix(&node.id);
        if let Ok(val) = serde_json::to_value(node) {
            self.kv.put(&key, val);
        }
    }
    
    /// Delete a node
    fn del_node(&mut self, id: &str) {
        let key = self.add_prefix(id);
        self.kv.del(&key);
    }
    
    /// Get root node ID
    fn root(&self) -> Option<String> {
        let key = self.add_prefix("root");
        self.kv.get(&key).and_then(|v| v.as_str().map(|s| s.to_string()))
    }
    
    /// Set root node ID
    fn set_root(&mut self, id: &str) {
        let key = self.add_prefix("root");
        self.kv.put(&key, json!(id));
    }
    
    /// Get next ID
    fn next_id(&mut self) -> String {
        let count_key = self.add_prefix("count");
        let count = self.kv.get(&count_key)
            .and_then(|v| v.as_i64())
            .unwrap_or(-1) + 1;
        self.kv.put(&count_key, json!(count));
        count.to_string()
    }
    
    /// Check if node is over capacity
    fn is_over(&self, node: &Node, plus: usize) -> bool {
        node.vals.len() + plus > self.max_vals
    }
    
    /// Check if node is under capacity
    fn is_under(&self, node: &Node, minus: usize) -> bool {
        node.vals.len() < self.min_vals + minus
    }
    
    /// Get data value
    pub fn data(&self, key: &str) -> Option<DataValue> {
        self.kv.data(key)
    }
    
    /// Compare two values based on sort fields
    fn compare(&self, a: &DataValue, b: &DataValue) -> Ordering {
        match &self.sort_fields {
            SortFields::Simple(_) => {
                // Simple comparison based on value
                let a_str = serde_json::to_string(&a.val).unwrap_or_default();
                let b_str = serde_json::to_string(&b.val).unwrap_or_default();
                b_str.cmp(&a_str) // Reverse for descending
            }
            SortFields::Complex(fields) => {
                // Complex comparison based on multiple fields
                for (field, direction) in fields {
                    let va = if field == "__id__" {
                        json!(&a.key)
                    } else {
                        a.val.get(field).cloned().unwrap_or(json!(null))
                    };
                    
                    let vb = if field == "__id__" {
                        json!(&b.key)
                    } else {
                        b.val.get(field).cloned().unwrap_or(json!(null))
                    };
                    
                    let cmp = self.compare_values(&va, &vb);
                    if cmp != Ordering::Equal {
                        return if direction == "desc" {
                            cmp.reverse()
                        } else {
                            cmp
                        };
                    }
                }
                Ordering::Equal
            }
        }
    }
    
    /// Compare two JSON values
    fn compare_values(&self, a: &Value, b: &Value) -> Ordering {
        match (a, b) {
            (Value::Null, Value::Null) => Ordering::Equal,
            (Value::Null, _) => Ordering::Less,
            (_, Value::Null) => Ordering::Greater,
            (Value::Bool(a), Value::Bool(b)) => a.cmp(b),
            (Value::Number(a), Value::Number(b)) => {
                let af = a.as_f64().unwrap_or(0.0);
                let bf = b.as_f64().unwrap_or(0.0);
                bf.partial_cmp(&af).unwrap_or(Ordering::Equal) // Reverse for descending
            }
            (Value::String(a), Value::String(b)) => b.cmp(a), // Reverse for descending
            (Value::Array(a), Value::Array(b)) => {
                for (av, bv) in a.iter().zip(b.iter()) {
                    let cmp = self.compare_values(av, bv);
                    if cmp != Ordering::Equal {
                        return cmp;
                    }
                }
                b.len().cmp(&a.len())
            }
            _ => Ordering::Equal,
        }
    }
    
    /// Initialize tree with first key
    pub fn init(&mut self, key: &str) {
        let new_node = Node {
            id: self.next_id(),
            leaf: true,
            vals: vec![key.to_string()],
            parent: None,
            children: vec![],
            next: None,
            prev: None,
        };
        
        self.put_node(&new_node);
        self.set_root(&new_node.id);
    }
    
    /// Search for a leaf node
    pub fn search(&self, val: Option<&DataValue>, node_id: Option<&str>) -> Option<Node> {
        let root_id = self.root();
        let node_id = node_id.or_else(|| root_id.as_deref())?;
        let node = self.get_node(node_id)?;
        
        if node.leaf {
            return Some(node);
        }
        
        // For internal nodes, find the appropriate child
        if let Some(search_val) = val {
            for (i, node_val_key) in node.vals.iter().enumerate() {
                if let Some(node_val) = self.data(node_val_key) {
                    if self.compare(search_val, &node_val) == Ordering::Greater {
                        return self.search(val, node.children.get(i).map(|s| s.as_str()));
                    }
                }
            }
            // If we get here, go to the last child
            return self.search(val, node.children.last().map(|s| s.as_str()));
        }
        
        // If no value provided, go to first child
        self.search(val, node.children.first().map(|s| s.as_str()))
    }
    
    /// Insert a key-value pair
    pub fn insert(&mut self, key: &str, val: Value) {
        // Store the data
        self.kv.put_data(key, val.clone());
        
        let data_val = DataValue {
            key: key.to_string(),
            val,
        };
        
        // Find leaf node
        if let Some(mut node) = self.search(Some(&data_val), None) {
            // Insert into leaf node
            let mut inserted = false;
            for (i, existing_key) in node.vals.clone().iter().enumerate() {
                if let Some(existing_val) = self.data(existing_key) {
                    if self.compare(&data_val, &existing_val) == Ordering::Greater {
                        node.vals.insert(i, key.to_string());
                        inserted = true;
                        break;
                    }
                }
            }
            
            if !inserted {
                node.vals.push(key.to_string());
            }
            
            self.put_node(&node);
            
            // Check if node needs splitting
            if self.is_over(&node, 0) {
                self.split(&node);
            }
        } else {
            // Tree is empty, initialize with this key
            self.init(key);
        }
    }
    
    /// Split an overfull node
    fn split(&mut self, node: &Node) {
        let mid = node.vals.len() / 2;
        let (left_vals, right_vals) = node.vals.split_at(mid);
        
        // Create new right node
        let mut new_node = Node {
            id: self.next_id(),
            leaf: node.leaf,
            vals: right_vals.to_vec(),
            parent: node.parent.clone(),
            children: vec![],
            next: node.next.clone(),
            prev: Some(node.id.clone()),
        };
        
        // Update current node (becomes left node)
        let mut left_node = node.clone();
        left_node.vals = left_vals.to_vec();
        left_node.next = Some(new_node.id.clone());
        
        // Handle children for internal nodes
        if !node.leaf {
            let (left_children, right_children) = node.children.split_at(mid + 1);
            left_node.children = left_children.to_vec();
            new_node.children = right_children.to_vec();
            
            // Update parent pointers in children
            for child_id in &new_node.children {
                if let Some(mut child) = self.get_node(child_id) {
                    child.parent = Some(new_node.id.clone());
                    self.put_node(&child);
                }
            }
        }
        
        // Update next node's prev pointer
        if let Some(next_id) = &node.next {
            if let Some(mut next_node) = self.get_node(next_id) {
                next_node.prev = Some(new_node.id.clone());
                self.put_node(&next_node);
            }
        }
        
        // Get the middle key to promote
        let middle_key = if node.leaf {
            right_vals[0].clone()
        } else {
            left_vals.last().unwrap().clone()
        };
        
        // Update or create parent
        if let Some(parent_id) = &node.parent {
            // Insert into existing parent
            if let Some(mut parent) = self.get_node(parent_id) {
                // Find position to insert
		let pos = parent.children.iter().position(|id| id == &node.id).unwrap_or(0);                
                parent.vals.insert(pos, middle_key);
                parent.children.insert(pos + 1, new_node.id.clone());
                
                self.put_node(&parent);
                
                // Check if parent needs splitting
                if self.is_over(&parent, 0) {
                    self.split(&parent);
                }
            }
        } else {
            // Create new root
            let new_root = Node {
                id: self.next_id(),
                leaf: false,
                vals: vec![middle_key],
                parent: None,
                children: vec![left_node.id.clone(), new_node.id.clone()],
                next: None,
                prev: None,
            };
            
            left_node.parent = Some(new_root.id.clone());
            new_node.parent = Some(new_root.id.clone());
            
            self.put_node(&new_root);
            self.set_root(&new_root.id);
        }
        
        // Save the nodes
        self.put_node(&left_node);
        self.put_node(&new_node);
    }
    
    /// Delete a key
    pub fn delete(&mut self, key: &str) {
        // Find the node containing the key
        if let Some(data_val) = self.data(key) {
            if let Some(mut node) = self.search(Some(&data_val), None) {
                // Remove the key from the node
                if let Some(pos) = node.vals.iter().position(|k| k == key) {
                    node.vals.remove(pos);
                    self.put_node(&node);
                    
                    // Delete the data
                    self.kv.del_data(key);
                    
                    // Check if node needs rebalancing
                    if node.vals.is_empty() || (node.parent.is_some() && self.is_under(&node, 0)) {
                        self.rebalance(&node);
                    }
                }
            }
        }
    }
    
    /// Rebalance an underfull node
    fn rebalance(&mut self, node: &Node) {
        // Implementation simplified for brevity
        // In a full implementation, this would:
        // 1. Try to borrow from siblings
        // 2. Merge with siblings if borrowing isn't possible
        // 3. Update parent and potentially propagate rebalancing up the tree
    }
    
    /// Get all values in a range
    pub fn range(&self, start: Option<&DataValue>, end: Option<&DataValue>, limit: usize) -> Vec<DataValue> {
        let mut result = Vec::new();
        
        // Find starting leaf node
        let mut current_node = self.search(start, None);
        
        while let Some(node) = current_node {
            for key in &node.vals {
                if let Some(data) = self.data(key) {
                    // Check if we're past the end
                    if let Some(end_val) = end {
                        if self.compare(&data, end_val) == Ordering::Less {
                            return result;
                        }
                    }
                    
                    result.push(data);
                    
                    if result.len() >= limit {
                        return result;
                    }
                }
            }
            
            // Move to next leaf node
            current_node = node.next.as_ref().and_then(|id| self.get_node(id));
        }
        
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;
    
    struct MockKVStore {
        data: HashMap<String, Value>,
    }
    
    impl MockKVStore {
        fn new() -> Self {
            MockKVStore {
                data: HashMap::new(),
            }
        }
    }
    
    impl KVStore for MockKVStore {
        fn get(&self, key: &str) -> Option<Value> {
            self.data.get(key).cloned()
        }
        
        fn put(&mut self, key: &str, val: Value) {
            self.data.insert(key.to_string(), val);
        }
        
        fn del(&mut self, key: &str) {
            self.data.remove(key);
        }
        
        fn data(&self, key: &str) -> Option<DataValue> {
            self.get(&format!("data/{}", key)).map(|val| DataValue {
                key: key.to_string(),
                val,
            })
        }
        
        fn put_data(&mut self, key: &str, val: Value) {
            self.put(&format!("data/{}", key), val);
        }
        
        fn del_data(&mut self, key: &str) {
            self.del(&format!("data/{}", key));
        }
    }
    
    #[test]
    fn test_bpt_insert_and_search() {
        let kv = Box::new(MockKVStore::new());
        let mut bpt = BPT::new(5, SortFields::Simple("value".to_string()), "test".to_string(), kv);
        
        // Insert some values
        bpt.insert("key1", json!({"value": 10}));
        bpt.insert("key2", json!({"value": 20}));
        bpt.insert("key3", json!({"value": 15}));
        
        // Search for values
        let data = bpt.data("key2");
        assert!(data.is_some());
        assert_eq!(data.unwrap().val["value"], 20);
    }
    
    #[test]
    fn test_bpt_range() {
        let kv = Box::new(MockKVStore::new());
        let mut bpt = BPT::new(5, SortFields::Simple("value".to_string()), "test".to_string(), kv);
        
        // Insert values
        for i in 0..10 {
            bpt.insert(&format!("key{}", i), json!({"value": i * 10}));
        }
        
        // Get range
        let range = bpt.range(None, None, 5);
        assert_eq!(range.len(), 5);
    }
}
