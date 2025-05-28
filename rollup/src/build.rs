// File: src/build.rs

use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use crate::monade::Device;

/// Build configuration for device chain
#[derive(Clone)]
pub struct BuildConfig {
    pub write: Option<Vec<TransformFn>>,
    pub read: Option<Vec<TransformFn>>,
    pub __write__: HashMap<String, Vec<TransformFn>>,
    pub __read__: HashMap<String, Vec<TransformFn>>,
}

impl Default for BuildConfig {
    fn default() -> Self {
        BuildConfig {
            write: None,
            read: None,
            __write__: HashMap::new(),
            __read__: HashMap::new(),
        }
    }
}

impl std::fmt::Debug for BuildConfig {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("BuildConfig")
            .field("write", &self.write.as_ref().map(|v| format!("{} transforms", v.len())))
            .field("read", &self.read.as_ref().map(|v| format!("{} transforms", v.len())))
            .field("__write__", &self.__write__.keys().collect::<Vec<_>>())
            .field("__read__", &self.__read__.keys().collect::<Vec<_>>())
            .finish()
    }
}

/// Transform function type
pub type TransformFn = Arc<dyn Fn(Context) -> Context + Send + Sync>;

/// Create a transform function from a regular function
pub fn transform<F>(f: F) -> TransformFn
where
    F: Fn(Context) -> Context + Send + Sync + 'static,
{
    Arc::new(f)
}

/// In-memory key-value store
#[derive(Debug, Clone)]
pub struct Store {
    data: Arc<Mutex<HashMap<String, HashMap<String, Value>>>>,
}

impl Store {
    pub fn new(initial_data: HashMap<String, Value>) -> Self {
        let mut data = HashMap::new();
        
        // Initialize with default directories
        data.insert("_".to_string(), HashMap::new());
        data.insert("__indexes__".to_string(), HashMap::new());
        
        // Add initial data to the default directory
        if !initial_data.is_empty() {
            data.insert("default".to_string(), initial_data);
        }
        
        Store {
            data: Arc::new(Mutex::new(data)),
        }
    }
    
    pub fn get(&self, dir: &str, key: &str) -> Option<Value> {
        let data = self.data.lock().unwrap();
        data.get(dir)?.get(key).cloned()
    }
    
    pub fn put(&mut self, dir: &str, key: &str, value: Value) {
        let mut data = self.data.lock().unwrap();
        data.entry(dir.to_string())
            .or_insert_with(HashMap::new)
            .insert(key.to_string(), value);
    }
    
    pub fn del(&mut self, dir: &str, key: &str) {
        let mut data = self.data.lock().unwrap();
        if let Some(dir_data) = data.get_mut(dir) {
            dir_data.remove(key);
        }
    }
    
    pub fn commit(&self) {
        // In a real implementation, this would persist changes
        // For now, it's a no-op since we're using in-memory storage
    }
    
    // Additional methods for compatibility with indexer
    pub fn data(&self, key: &str) -> Option<crate::bpt::DataValue> {
        self.get("data", key).map(|val| crate::bpt::DataValue {
            key: key.to_string(),
            val,
        })
    }
    
    pub fn put_data(&mut self, key: &str, val: Value) {
        self.put("data", key, val);
    }
    
    pub fn del_data(&mut self, key: &str) {
        self.del("data", key);
    }
}

// Implement KVStore trait for Store
impl crate::bpt::KVStore for Store {
    fn get(&self, key: &str) -> Option<Value> {
        self.get("", key)
    }
    
    fn put(&mut self, key: &str, val: Value) {
        self.put("", key, val)
    }
    
    fn del(&mut self, key: &str) {
        self.del("", key)
    }
    
    fn data(&self, key: &str) -> Option<crate::bpt::DataValue> {
        self.data(key)
    }
    
    fn put_data(&mut self, key: &str, val: Value) {
        self.put_data(key, val)
    }
    
    fn del_data(&mut self, key: &str) {
        self.del_data(key)
    }
}

/// Database methods trait
pub trait DBMethods: Clone {
    fn get(&self) -> Self;
    fn query(&self) -> Self;
    fn execute(&self, store: Store, msg: Value) -> (Store, Value);
}

/// Context passed through device chain
#[derive(Debug, Clone)]
pub struct Context {
    pub kv: Store,
    pub msg: Value,
    pub opt: HashMap<String, Value>,
    pub state: HashMap<String, Value>,
    pub env: HashMap<String, Value>,
}

/// Execute a chain of transforms
pub fn execute_chain(transforms: &[TransformFn], mut context: Context) -> Context {
    for transform in transforms {
        context = transform(context);
        
        // Stop if error occurred
        if context.state.contains_key("error") {
            break;
        }
    }
    context
}

/// Database implementation
#[derive(Clone)]
pub struct DBImpl {
    pub config: BuildConfig,
    pub opt: HashMap<String, Value>,
    pub env: HashMap<String, Value>,
}

impl DBMethods for DBImpl {
    fn get(&self) -> Self {
        self.clone()
    }
    
    fn query(&self) -> Self {
        self.clone()
    }
    
    fn execute(&self, store: Store, msg: Value) -> (Store, Value) {
        let context = Context {
            kv: store,
            msg: msg.clone(),
            opt: self.opt.clone(),
            state: HashMap::new(),
            env: self.env.clone(),
        };
        
        // Determine operation type from message
        let op_type = if let Some(headers) = msg.get("headers") {
            if headers.get("query").is_some() {
                "write"
            } else {
                "read"
            }
        } else if let Some(arr) = msg.as_array() {
            if let Some(first) = arr.first() {
                if let Some(op) = first.as_str() {
                    match op {
                        "get" | "cget" => "read",
                        _ => "write",
                    }
                } else {
                    "read"
                }
            } else {
                "read"
            }
        } else {
            "read"
        };
        
        // Get appropriate transform chain
        let transforms = match op_type {
            "write" => self.config.write.as_ref(),
            "read" => self.config.read.as_ref(),
            _ => None,
        };
        
        // Execute transforms if available
        let final_context = if let Some(transforms) = transforms {
            execute_chain(transforms, context)
        } else {
            context
        };
        
        // Build response
        let response = if let Some(error) = final_context.state.get("error") {
            json!({
                "success": false,
                "error": error,
                "query": msg
            })
        } else if let Some(_result) = final_context.state.get("write_result") {
            json!({
                "success": true,
                "query": msg
            })
        } else if let Some(result) = final_context.state.get("read_result") {
            // For read operations, wrap the result in a success response
            json!({
                "success": true,
                "res": result
            })
        } else {
            json!({
                "success": true,
                "query": msg
            })
        };
        
        (final_context.kv, response)
    }
}

/// Build a device with the given configuration
pub fn build(config: BuildConfig) -> Box<dyn Fn(HashMap<String, Value>, HashMap<String, Value>) -> Device<(Store, Value), DBImpl> + Send + Sync> {
    Box::new(move |opt: HashMap<String, Value>, env: HashMap<String, Value>| {
        let db_impl = DBImpl { 
            config: config.clone(),
            opt,
            env,
        };
        
        // Create initial value
        let initial_value = (Store::new(HashMap::new()), json!({}));
        
        // Create device
        Device::new(db_impl, initial_value)
    })
}

/// Helper functions for other modules
pub fn apply_transforms(transforms: &[TransformFn], context: Context) -> Context {
    execute_chain(transforms, context)
}

pub fn default_init(mut ctx: Context) -> Context {
    // Set default values if not present
    if !ctx.state.contains_key("ts") {
        ctx.state.insert("ts".to_string(), json!(chrono::Utc::now().timestamp_millis()));
    }
    ctx
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_store() {
        let mut store = Store::new(HashMap::new());
        
        // Test put and get
        store.put("test_dir", "key1", json!("value1"));
        assert_eq!(store.get("test_dir", "key1"), Some(json!("value1")));
        
        // Test delete
        store.del("test_dir", "key1");
        assert_eq!(store.get("test_dir", "key1"), None);
        
        // Test non-existent key
        assert_eq!(store.get("test_dir", "non_existent"), None);
    }
    
    #[test]
    fn test_context_chain() {
        fn add_one(mut ctx: Context) -> Context {
            let val = ctx.state.get("counter")
                .and_then(|v| v.as_i64())
                .unwrap_or(0);
            ctx.state.insert("counter".to_string(), json!(val + 1));
            ctx
        }
        
        fn multiply_two(mut ctx: Context) -> Context {
            let val = ctx.state.get("counter")
                .and_then(|v| v.as_i64())
                .unwrap_or(0);
            ctx.state.insert("counter".to_string(), json!(val * 2));
            ctx
        }
        
        let transforms = vec![transform(add_one), transform(multiply_two)];
        let context = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        let result = execute_chain(&transforms, context);
        assert_eq!(result.state.get("counter"), Some(&json!(2)));
    }
    
    #[test]
    fn test_build_config() {
        let config = BuildConfig::default();
        assert!(config.write.is_none());
        assert!(config.read.is_none());
        assert!(config.__write__.is_empty());
        assert!(config.__read__.is_empty());
    }
}
