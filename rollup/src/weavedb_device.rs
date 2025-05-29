// File: src/weavedb_device.rs

use crate::build::{Store, Context, apply_transforms, default_init};
use crate::normalize::normalize;
use crate::verify_nonce::verify_nonce;
use crate::auth::auth;
use crate::write::write;
use crate::db::{parse, get as get_transform, cget as cget_transform};
use crate::read::read;
use serde_json::{Value, json};
use std::collections::HashMap;
use std::sync::Arc;

/// WeaveDB Device - matches the JS device pattern
pub struct WeaveDB {
    store: Store,
    env: HashMap<String, Value>,
}

impl WeaveDB {
    /// Create a new WeaveDB instance
    pub fn new(initial_kv: HashMap<String, Value>, opt: HashMap<String, Value>) -> Self {
        let store = Store::new(initial_kv);
        WeaveDB {
            store,
            env: opt,
        }
    }

    /// Load database info from storage into environment
    fn load_db_env(&self) -> HashMap<String, Value> {
        let mut env = self.env.clone();
        
        // Load database info from _/info into env (mirrors JS _init function)
        // First check _config/info (like some JS versions)
        if let Some(info) = self.store.get("_config", "info") {
            if let Some(info_obj) = info.as_object() {
                for (key, value) in info_obj {
                    env.insert(key.clone(), value.clone());
                }
            }
        }
        
        // Also check _/info (like write.rs stores it)
        if let Some(info) = self.store.get("_", "info") {
            if let Some(info_obj) = info.as_object() {
                for (key, value) in info_obj {
                    env.insert(key.clone(), value.clone());
                }
            }
        }
        
        env
    }

    /// Write operation - matches JS: db.write(msg)
    pub fn write(&mut self, msg: Value) -> Result<Value, String> {
        // Load database info into environment
        let env = self.load_db_env();
        
        // Create context - Store is cheap to clone now (just Arc)
        let ctx = Context {
            kv: self.store.clone(),
            msg,
            opt: HashMap::new(),
            state: HashMap::new(),
            env, // Use the loaded env
        };
        
        // Initialize
        let ctx = default_init(ctx);
        
        // Run through write pipeline
        let ctx = normalize(ctx);
        if let Some(error) = ctx.state.get("error") {
            println!("Error after normalize: {:?}", error);
            // Reset is already handled in write.rs
            return Err(error.to_string());
        }
        
        let ctx = verify_nonce(ctx);
        if let Some(error) = ctx.state.get("error") {
            println!("Error after verify_nonce: {:?}", error);
            // Reset is already handled in write.rs
            return Err(error.to_string());
        }
        
        let ctx = parse(ctx);
        if let Some(error) = ctx.state.get("error") {
            println!("Error after parse: {:?}", error);
            // Reset is already handled in write.rs
            return Err(error.to_string());
        }
        
        let ctx = auth(ctx);
        if let Some(error) = ctx.state.get("error") {
            println!("Error after auth: {:?}", error);
            // Reset is already handled in write.rs
            return Err(error.to_string());
        }
        
        let ctx = write(ctx);
        if let Some(error) = ctx.state.get("error") {
            println!("Error after write: {:?}", error);
            // Reset is already handled in write.rs
            return Err(error.to_string());
        }
        
        // NO NEED TO UPDATE self.store - it's already updated through the shared state!
        // The transforms operated on the same Store instance through the shared LsKv
        
        // Return success with state
        Ok(json!({
            "success": true,
            "state": ctx.state
        }))
    }
    
    /// Read operation - matches JS: db.read(msg)
    pub fn read(&self, msg: Value) -> Result<Value, String> {
        // Load database info into environment
        let env = self.load_db_env();
        
        // Create context
        let ctx = Context {
            kv: self.store.clone(),
            msg,
            opt: HashMap::new(),
            state: HashMap::new(),
            env, // Use the loaded env
        };
        
        // Initialize
        let ctx = default_init(ctx);
        
        // Run through read pipeline
        let ctx = normalize(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        let ctx = parse(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        let ctx = read(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        // Return result
        Ok(json!({
            "state": ctx.state
        }))
    }
    
    /// Get operation - matches JS: db.get(...query).val()
    pub fn get(&mut self, query: Vec<Value>) -> Result<Value, String> {
        // Load database info into environment
        let env = self.load_db_env();
        
        // Create context with query as msg
        let ctx = Context {
            kv: self.store.clone(),
            msg: Value::Array(query),
            opt: HashMap::new(),
            state: HashMap::new(),
            env, // Use the loaded env
        };
        
        // Initialize
        let ctx = default_init(ctx);
        
        // Run through get pipeline
        let ctx = get_transform(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        let ctx = parse(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        let ctx = read(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        // Return the read result
        if let Some(result) = ctx.state.get("read_result") {
            Ok(result.clone())
        } else {
            Ok(Value::Null)
        }
    }
    
    /// Cget operation - matches JS: db.cget(...query).val()
    pub fn cget(&mut self, query: Vec<Value>) -> Result<Value, String> {
        // Load database info into environment
        let env = self.load_db_env();
        
        // Create context with query as msg
        let ctx = Context {
            kv: self.store.clone(),
            msg: Value::Array(query),
            opt: HashMap::new(),
            state: HashMap::new(),
            env, // Use the loaded env
        };
        
        // Initialize
        let ctx = default_init(ctx);
        
        // Run through cget pipeline
        let ctx = cget_transform(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        let ctx = parse(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        let ctx = read(ctx);
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        // Return the read result
        if let Some(result) = ctx.state.get("read_result") {
            Ok(result.clone())
        } else {
            Ok(Value::Null)
        }
    }
    
    /// Get the current store
    pub fn store(&self) -> &Store {
        &self.store
    }
    
    /// Get mutable store
    pub fn store_mut(&mut self) -> &mut Store {
        &mut self.store
    }
}

/// Create a WeaveDB instance - matches JS: wdb(kv, opt)
pub fn wdb(kv: HashMap<String, Value>, opt: HashMap<String, Value>) -> WeaveDB {
    WeaveDB::new(kv, opt)
}
