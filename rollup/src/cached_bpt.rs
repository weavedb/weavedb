// File: src/cached_bpt.rs
// B+ Tree implementation with in-memory node caching and async persistence

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::collections::HashMap;
use std::cmp::Ordering;
use std::sync::{Arc, RwLock, Mutex};
use crate::bpt::{Node, DataValue, KVStore, SortFields};
use once_cell::sync::Lazy;

/// Thread-safe node cache
type NodeCache = Arc<RwLock<HashMap<String, Node>>>;

/// Pending writes to be persisted
type PendingWrites = Arc<Mutex<Vec<(String, Value)>>>;

/// Cached B+ Tree implementation
pub struct CachedBPT {
    pub order: usize,
    pub sort_fields: SortFields,
    pub max_vals: usize,
    pub min_vals: usize,
    pub prefix: String,
    pub kv: Arc<Mutex<Box<dyn KVStore + Send + Sync>>>,
    // In-memory cache for nodes
    node_cache: NodeCache,
    // Pending writes to be persisted
    pending_writes: PendingWrites,
}

// Background writer for async persistence
static WRITE_WORKER: Lazy<()> = Lazy::new(|| {
    std::thread::spawn(|| {
        loop {
            std::thread::sleep(std::time::Duration::from_millis(10));
            
            // Process all pending writes from all BPT instances
            if let Ok(instances) = BPT_INSTANCE_CACHE.read() {
                for (_, bpt_arc) in instances.iter() {
                    if let Ok(mut bpt) = bpt_arc.write() {
                        bpt.flush_pending_writes();
                    }
                }
            }
        }
    });
});

impl CachedBPT {
    /// Create a new cached B+ Tree
    pub fn new(order: usize, sort_fields: SortFields, prefix: String, kv: Box<dyn KVStore + Send + Sync>) -> Self {
        // Ensure background writer is started
        Lazy::force(&WRITE_WORKER);
        
        let max_vals = order - 1;
        let min_vals = (order as f64 / 2.0).ceil() as usize - 1;
        
        CachedBPT {
            order,
            sort_fields,
            max_vals,
            min_vals,
            prefix,
            kv: Arc::new(Mutex::new(kv)),
            node_cache: Arc::new(RwLock::new(HashMap::new())),
            pending_writes: Arc::new(Mutex::new(Vec::new())),
        }
    }
    
    /// Flush pending writes to KV storage
    fn flush_pending_writes(&mut self) {
        if let Ok(mut pending) = self.pending_writes.lock() {
            if pending.is_empty() {
                return;
            }
            
            // Take all pending writes
            let writes = std::mem::take(&mut *pending);
            drop(pending); // Release lock
            
            // Persist to KV
            if let Ok(mut kv) = self.kv.lock() {
                for (key, value) in writes {
                    if value.is_null() {
                        kv.del(&key);
                    } else {
                        kv.put(&key, value);
                    }
                }
            }
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
    
    /// Get a node by ID - checks cache first
    fn get_node(&self, id: &str) -> Option<Node> {
        let key = self.add_prefix(id);
        
        // Check cache first
        if let Ok(cache) = self.node_cache.read() {
            if let Some(node) = cache.get(&key) {
                return Some(node.clone());
            }
        }
        
        // Not in cache, load from KV and cache it
        if let Ok(kv) = self.kv.lock() {
            if let Some(val) = kv.get(&key) {
                if let Ok(node) = serde_json::from_value::<Node>(val) {
                    // Add to cache
                    if let Ok(mut cache) = self.node_cache.write() {
                        cache.insert(key, node.clone());
                    }
                    return Some(node);
                }
            }
        }
        
        None
    }
    
    /// Store a node - updates cache immediately and queues for persistence
    fn put_node(&mut self, node: &Node) {
        let key = self.add_prefix(&node.id);
        
        // Update cache immediately (for reads)
        if let Ok(mut cache) = self.node_cache.write() {
            cache.insert(key.clone(), node.clone());
        }
        
        // Queue for async persistence
        if let Ok(val) = serde_json::to_value(node) {
            if let Ok(mut pending) = self.pending_writes.lock() {
                pending.push((key, val));
            }
        }
    }
    
    /// Delete a node
    fn del_node(&mut self, id: &str) {
        let key = self.add_prefix(id);
        
        // Remove from cache
        if let Ok(mut cache) = self.node_cache.write() {
            cache.remove(&key);
        }
        
        // Queue deletion (null value)
        if let Ok(mut pending) = self.pending_writes.lock() {
            pending.push((key, Value::Null));
        }
    }
    
    /// Get root node ID
    fn root(&self) -> Option<String> {
        let key = self.add_prefix("root");
        
        // Check cache first
        thread_local! {
            static ROOT_CACHE: std::cell::RefCell<HashMap<String, Option<String>>> = 
                std::cell::RefCell::new(HashMap::new());
        }
        
        ROOT_CACHE.with(|cache| {
            let mut cache = cache.borrow_mut();
            
            if cache.contains_key(&key) {
                return cache.get(&key).cloned().flatten();
            }
            
            // Not cached, get from KV
            let root_id = if let Ok(kv) = self.kv.lock() {
                kv.get(&key).and_then(|v| v.as_str().map(|s| s.to_string()))
            } else {
                None
            };
            
            cache.insert(key, root_id.clone());
            root_id
        })
    }
    
    /// Set root node ID
    fn set_root(&mut self, id: &str) {
        let key = self.add_prefix("root");
        
        // Queue for persistence
        if let Ok(mut pending) = self.pending_writes.lock() {
            pending.push((key.clone(), json!(id)));
        }
        
        // Update cache
        thread_local! {
            static ROOT_CACHE: std::cell::RefCell<HashMap<String, Option<String>>> = 
                std::cell::RefCell::new(HashMap::new());
        }
        
        ROOT_CACHE.with(|cache| {
            cache.borrow_mut().insert(key, Some(id.to_string()));
        });
    }
    
    /// Get next ID
    fn next_id(&mut self) -> String {
        let count_key = self.add_prefix("count");
        
        thread_local! {
            static COUNTERS: std::cell::RefCell<HashMap<String, i64>> = 
                std::cell::RefCell::new(HashMap::new());
        }
        
        COUNTERS.with(|counters| {
            let mut counters = counters.borrow_mut();
            let count = counters.entry(count_key.clone()).or_insert_with(|| {
                if let Ok(kv) = self.kv.lock() {
                    kv.get(&count_key).and_then(|v| v.as_i64()).unwrap_or(-1)
                } else {
                    -1
                }
            });
            
            *count += 1;
            
            // Queue for persistence
            if let Ok(mut pending) = self.pending_writes.lock() {
                pending.push((count_key, json!(*count)));
            }
            
            count.to_string()
        })
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
        if let Ok(kv) = self.kv.lock() {
            kv.data(key)
        } else {
            None
        }
    }
    
    /// Compare two values based on sort fields
    fn compare(&self, a: &DataValue, b: &DataValue) -> Ordering {
        match &self.sort_fields {
            SortFields::Simple(_) => {
                let a_str = serde_json::to_string(&a.val).unwrap_or_default();
                let b_str = serde_json::to_string(&b.val).unwrap_or_default();
                b_str.cmp(&a_str)
            }
            SortFields::Complex(fields) => {
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
                af.partial_cmp(&bf).unwrap_or(Ordering::Equal)
            }
            (Value::String(a), Value::String(b)) => a.cmp(b),
            _ => Ordering::Equal,
        }
    }
    
    /// Initialize tree with first key
    fn init(&mut self, key: &str) {
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
                    if self.compare(search_val, &node_val) == Ordering::Less {
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
        if let Ok(mut kv) = self.kv.lock() {
            kv.put_data(key, val.clone());
        }
        
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
                    if self.compare(&data_val, &existing_val) == Ordering::Less {
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
        // Implementation similar to insert but removes the key
        // Omitted for brevity but follows same pattern with caching
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
                        if self.compare(&data, end_val) == Ordering::Greater {
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

// Global cache for BPT instances
static BPT_INSTANCE_CACHE: Lazy<RwLock<HashMap<String, Arc<RwLock<CachedBPT>>>>> = 
    Lazy::new(|| RwLock::new(HashMap::new()));

/// Get or create a cached BPT instance
pub fn get_cached_bpt<K: KVStore + Clone + Send + Sync + 'static>(
    order: usize,
    sort_fields: SortFields,
    prefix: String,
    kv: Box<K>,
) -> Arc<RwLock<CachedBPT>> {
    let cache_key = prefix.clone();
    
    // Check if we already have this BPT instance
    if let Ok(cache) = BPT_INSTANCE_CACHE.read() {
        if let Some(bpt) = cache.get(&cache_key) {
            return Arc::clone(bpt);
        }
    }
    
    // Create new instance
    let bpt = CachedBPT::new(order, sort_fields, prefix, kv);
    let bpt_arc = Arc::new(RwLock::new(bpt));
    
    // Add to cache
    if let Ok(mut cache) = BPT_INSTANCE_CACHE.write() {
        cache.insert(cache_key, Arc::clone(&bpt_arc));
    }
    
    bpt_arc
}
