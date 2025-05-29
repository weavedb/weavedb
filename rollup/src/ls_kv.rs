// File: src/ls_kv.rs

use serde_json::Value;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use tokio::task;

/// Log-Structured KV Store that wraps RocksDB
/// Mimics the JS kv.js pattern with local changes and commits
#[derive(Clone, Debug)]
pub struct LsKv {
    /// Local uncommitted changes (like JS 'l')
    local: Arc<RwLock<HashMap<String, Value>>>,
    /// Committed state in memory (like JS 's')
    committed: Arc<RwLock<HashMap<String, Value>>>,
}

impl LsKv {
    pub fn new() -> Self {
        LsKv {
            local: Arc::new(RwLock::new(HashMap::new())),
            committed: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    /// Get value - checks local first, then committed, then RocksDB
    /// Mimics JS: l[k] ?? s[k] ?? io.get(k)
    pub fn get(&self, key: &str) -> Option<Value> {
        // Check local first
        if let Ok(local) = self.local.read() {
            if let Some(val) = local.get(key) {
                if !val.is_null() {
                    return Some(val.clone());
                }
                return None; // Null means deleted
            }
        }
        
        // Check committed state
        if let Ok(committed) = self.committed.read() {
            if let Some(val) = committed.get(key) {
                return Some(val.clone());
            }
        }
        
        // Fallback to RocksDB
        if let Some(value) = crate::kv::get(key) {
            serde_json::from_str(&value).ok()
        } else {
            None
        }
    }
    
    /// Put value in local state (not committed yet)
    pub fn put(&self, key: &str, value: Value) {
        if let Ok(mut local) = self.local.write() {
            local.insert(key.to_string(), value);
        }
    }
    
    /// Delete key (put null in local state)
    pub fn del(&self, key: &str) {
        self.put(key, Value::Null);
    }
    
    /// Reset local changes
    pub fn reset(&self) {
        if let Ok(mut local) = self.local.write() {
            local.clear();
        }
    }
    
    /// Commit local changes to committed state and RocksDB
    /// This mirrors the JS behavior - immediate memory update, async disk write
    pub fn commit(&self) {
        // Get local changes
        let changes = if let Ok(mut local) = self.local.write() {
            let changes: Vec<(String, Value)> = local.drain().collect();
            changes
        } else {
            return;
        };
        
        if changes.is_empty() {
            return;
        }
        
        // Update committed state immediately (like JS: s[k] = cl[k])
        // This makes changes visible to reads immediately
        if let Ok(mut committed) = self.committed.write() {
            for (k, v) in &changes {
                if v.is_null() {
                    committed.remove(k);
                } else {
                    committed.insert(k.clone(), v.clone());
                }
            }
        }
        
        // Spawn async task for disk writes (like JS commit())
        // Use spawn_blocking since we're in a sync context
        std::thread::spawn(move || {
            // Write to RocksDB in background
            for (k, v) in changes {
                if v.is_null() {
                    crate::kv::del(&k);
                } else {
                    if let Ok(serialized) = serde_json::to_string(&v) {
                        crate::kv::put(&k, &serialized);
                    }
                }
            }
        });
    }
    
    /// Get with directory support (for Store compatibility)
    pub fn get_dir(&self, dir: &str, doc: &str) -> Option<Value> {
        let key = if dir.is_empty() {
            doc.to_string()
        } else {
            format!("{}/{}", dir, doc)
        };
        self.get(&key)
    }
    
    /// Put with directory support
    pub fn put_dir(&self, dir: &str, doc: &str, value: Value) {
        let key = if dir.is_empty() {
            doc.to_string()
        } else {
            format!("{}/{}", dir, doc)
        };
        self.put(&key, value);
    }
    
    /// Delete with directory support
    pub fn del_dir(&self, dir: &str, doc: &str) {
        let key = if dir.is_empty() {
            doc.to_string()
        } else {
            format!("{}/{}", dir, doc)
        };
        self.del(&key);
    }
}
