use std::collections::HashMap;
use serde_json::Value;
use crate::monade::{of, SyncMonad};

/// Mock in-memory KV store
#[derive(Debug, Clone)]
pub struct KV {
    store: HashMap<String, String>,
}

impl KV {
    /// Create a new empty KV
    pub fn new() -> Self {
        KV { store: HashMap::new() }
    }

    /// Put a value under `dir/doc`
    pub fn put(&mut self, dir: &str, doc: &str, data: &str) {
        let key = format!("{}/{}", dir, doc);
        self.store.insert(key, data.to_string());
    }

    /// Get a value from `dir/doc`
    pub fn get(&self, dir: &str, doc: &str) -> Option<String> {
        let key = format!("{}/{}", dir, doc);
        self.store.get(&key).cloned()
    }

    /// Reset entire store
    pub fn reset(&mut self) {
        self.store.clear();
    }
}

/// Start a new WeaveDB monad
pub fn wdb(kv: KV) -> SyncMonad<KV> {
    of(kv)
}

/// Extension methods for KV monad
impl SyncMonad<KV> {
    /// Monadic write: expects JSON args ["set", data_obj, dir, doc]
    /// Panics with descriptive message if query is invalid
    pub fn write(self, args: Value) -> SyncMonad<KV> {
        self.map(|mut kv| {
            let arr = args.as_array().expect("Invalid write query: expected JSON array");
            let op = arr.get(0)
                .and_then(Value::as_str)
                .expect("Invalid write query: op must be a string");
            if op != "set" {
                panic!("Invalid write operation: expected 'set', found '{}'", op);
            }
            if arr.len() != 4 {
                panic!("Invalid write query length: expected 4 elements, got {}", arr.len());
            }
            let data_val = &arr[1];
            let dir = arr[2].as_str().expect("Invalid write query: dir must be a string");
            let doc = arr[3].as_str().expect("Invalid write query: doc must be a string");
            let data_str = serde_json::to_string(data_val)
                .expect("Failed to serialize data object");
            kv.put(dir, doc, &data_str);
            kv
        })
    }

    /// Monadic read: expects JSON args ["get", dir, doc]
    /// Panics with descriptive message if query is invalid
    pub fn read(self, args: Value) -> Option<String> {
        let arr = args.as_array().expect("Invalid read query: expected JSON array");
        let op = arr.get(0)
            .and_then(Value::as_str)
            .expect("Invalid read query: op must be a string");
        if op != "get" {
            panic!("Invalid read operation: expected 'get', found '{}'", op);
        }
        if arr.len() != 3 {
            panic!("Invalid read query length: expected 3 elements, got {}", arr.len());
        }
        let dir = arr[1].as_str().expect("Invalid read query: dir must be a string");
        let doc = arr[2].as_str().expect("Invalid read query: doc must be a string");
        self.map(|kv| kv.get(dir, doc)).val()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn chaining_example() {
        let kv = KV::new();
        let query_set = json!( ["set", {"name":"Bob"}, "users", "Bob"] );
        let query_get = json!( ["get", "users", "Bob"] );

        // Inline chaining: write then read returns Option<String>
        let val = wdb(kv.clone())
            .write(query_set.clone())
            .read(query_get.clone());
        assert_eq!(val.as_deref(), Some("{\"name\":\"Bob\"}"));

        // Separate chain then read
        let db = wdb(kv).write(query_set);
        let val2 = db.read(query_get);
        assert_eq!(val2.as_deref(), Some("{\"name\":\"Bob\"}"));
    }

    #[test]
    #[should_panic(expected = "Invalid write operation")]
    fn invalid_write_op() {
        let kv = KV::new();
        let bad = json!( ["get", "users", "Bob"] );
        // Should panic because op is not 'set'
        wdb(kv).write(bad);
    }

    #[test]
    #[should_panic(expected = "Invalid read operation")]
    fn invalid_read_op() {
        let kv = KV::new();
        let bad = json!( ["set", {"foo":1}, "a", "1"] );
        // Should panic because op is not 'get'
        wdb(kv).read(bad);
    }

    #[test]
    #[should_panic(expected = "Invalid write query length")]
    fn invalid_write_length() {
        let kv = KV::new();
        let bad = json!( ["set", {"x":1}, "only_two"] );
        wdb(kv).write(bad);
    }

    #[test]
    #[should_panic(expected = "Invalid read query length")]
    fn invalid_read_length() {
        let kv = KV::new();
        let bad = json!( ["get", "only_dir"] );
        wdb(kv).read(bad);
    }
}
