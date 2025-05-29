// File: src/build.rs - Updated Store implementation

use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use crate::monade::Device;
use crate::ls_kv::LsKv;

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

/// Store that wraps LsKv for log-structured operations
#[derive(Debug, Clone)]
pub struct Store {
    kv: LsKv,
    // Keep track of initialized collections/directories
    initialized: Arc<Mutex<std::collections::HashSet<String>>>,
}

impl Store {
    pub fn new(initial_data: HashMap<String, Value>) -> Self {
        let kv = LsKv::new();
        let initialized = Arc::new(Mutex::new(std::collections::HashSet::new()));
        
        // Initialize default directories
        let dirs = vec!["_", "__indexes__", "__accounts__"];
        for dir in &dirs {
            initialized.lock().unwrap().insert(dir.to_string());
        }
        
        // Add initial data to the default directory if provided
        if !initial_data.is_empty() {
            for (key, value) in initial_data {
                kv.put_dir("default", &key, value);
            }
            initialized.lock().unwrap().insert("default".to_string());
        }
        
        Store { kv, initialized }
    }
    
    pub fn get(&self, dir: &str, key: &str) -> Option<Value> {
        self.kv.get_dir(dir, key)
    }
    
    pub fn put(&self, dir: &str, key: &str, value: Value) {
        // Track that we've used this directory
        self.initialized.lock().unwrap().insert(dir.to_string());
        self.kv.put_dir(dir, key, value);
    }
    
    pub fn del(&self, dir: &str, key: &str) {
        self.kv.del_dir(dir, key);
    }
    
    pub fn reset(&self) {
        self.kv.reset();
    }
    
    pub fn commit(&self) {
        self.kv.commit();
    }
    
    // Additional methods for compatibility with indexer
    pub fn data(&self, key: &str) -> Option<crate::bpt::DataValue> {
        self.get("data", key).map(|val| crate::bpt::DataValue {
            key: key.to_string(),
            val,
        })
    }
    
    pub fn put_data(&self, key: &str, val: Value) {
        self.put("data", key, val)
    }
    
    pub fn del_data(&self, key: &str) {
        self.del("data", key)
    }
}

// Implement KVStore trait for Store
impl crate::bpt::KVStore for Store {
    fn get(&self, key: &str) -> Option<Value> {
        // Default to empty directory for BPT compatibility
        Store::get(self, "", key)
    }
    
    fn put(&mut self, key: &str, val: Value) {
        // Use empty directory for BPT compatibility
        Store::put(self, "", key, val)
    }
    
    fn del(&mut self, key: &str) {
        // Use empty directory for BPT compatibility
        Store::del(self, "", key)
    }
    
    fn data(&self, key: &str) -> Option<crate::bpt::DataValue> {
        Store::data(self, key)
    }
    
    fn put_data(&mut self, key: &str, val: Value) {
        Store::put_data(self, key, val)
    }
    
    fn del_data(&mut self, key: &str) {
        Store::del_data(self, key)
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
        // Load database info from _/info into env (mirrors JS _init function)
        let mut env = self.env.clone();
        
        // First check _config/info (like some JS versions)
        if let Some(info) = store.get("_config", "info") {
            if let Some(info_obj) = info.as_object() {
                for (key, value) in info_obj {
                    env.insert(key.clone(), value.clone());
                }
            }
        }
        
        // Also check _/info (like write.rs stores it)
        if let Some(info) = store.get("_", "info") {
            if let Some(info_obj) = info.as_object() {
                for (key, value) in info_obj {
                    env.insert(key.clone(), value.clone());
                }
            }
        }
        
        let context = Context {
            kv: store.clone(),
            msg: msg.clone(),
            opt: self.opt.clone(),
            state: HashMap::new(),
            env, // Use the updated env with database info
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
            // Reset on error (like JS)
            store.reset();
            json!({
                "success": false,
                "error": error,
                "query": msg
            })
        } else if let Some(_result) = final_context.state.get("write_result") {
            // Successful write - commit changes (like JS: kv.commit())
            store.commit();
            json!({
                "success": true,
                "query": msg
            })
        } else if let Some(result) = final_context.state.get("read_result") {
            // For read operations, no commit needed
            json!({
                "success": true,
                "res": result
            })
        } else {
            // Default success response
            json!({
                "success": true,
                "query": msg
            })
        };
        
        // Return the SAME store instance
        (store, response)
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
    fn test_store_ls_behavior() {
        // Initialize RocksDB for testing
        crate::kv::init(".test-rocks-db");
        
        let store = Store::new(HashMap::new());
        
        // Test put and get with local state
        store.put("test_dir", "key1", json!("value1"));
        assert_eq!(store.get("test_dir", "key1"), Some(json!("value1")));
        
        // Test reset clears local state
        store.reset();
        assert_eq!(store.get("test_dir", "key1"), None);
        
        // Test commit persists to committed state
        store.put("test_dir", "key2", json!("value2"));
        store.commit();
        
        // After commit, value should persist even after reset
        store.reset();
        assert_eq!(store.get("test_dir", "key2"), Some(json!("value2")));
    }
    
    #[test]
    fn test_store_delete() {
        // Initialize RocksDB for testing
        crate::kv::init(".test-rocks-db-2");
        
        let store = Store::new(HashMap::new());
        
        // Add and commit a value
        store.put("test_dir", "key1", json!("value1"));
        store.commit();
        
        // Delete (put null)
        store.del("test_dir", "key1");
        store.commit();
        
        // Should be gone
        assert_eq!(store.get("test_dir", "key1"), None);
    }
    
    #[test]
    fn test_env_loading() {
        // Initialize RocksDB for testing
        crate::kv::init(".test-rocks-db-3");
        
        let store = Store::new(HashMap::new());
        
        // Simulate database initialization - store info in _/info
        store.put("_", "info", json!({
            "id": "test-db",
            "owner": "test-owner"
        }));
        store.commit();
        
        // Create DBImpl
        let config = BuildConfig::default();
        let db_impl = DBImpl {
            config,
            opt: HashMap::new(),
            env: HashMap::new(),
        };
        
        // Execute a dummy operation
        let msg = json!(["get", "test"]);
        let (_, _) = db_impl.execute(store, msg);
        
        // The env should now contain the database info
        // (This test mainly ensures the code compiles and runs without panic)
    }
}
