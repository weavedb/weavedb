// File: src/build.rs

use serde_json::{Value, json};
use std::collections::HashMap;
use crate::bpt::{KVStore, DataValue};

#[derive(Clone, Debug)]
pub struct Store {
    pub data: HashMap<String, Value>,
}

impl Store {
    pub fn new(data: HashMap<String, Value>) -> Self {
        Store { data }
    }
    
    pub fn get(&self, dir: &str, doc: &str) -> Option<Value> {
        let key = if dir.is_empty() {
            doc.to_string()
        } else {
            format!("{}/{}", dir, doc)
        };
        self.data.get(&key).cloned()
    }
    
    pub fn put(&mut self, dir: &str, doc: &str, value: Value) {
        let key = if dir.is_empty() {
            doc.to_string()
        } else {
            format!("{}/{}", dir, doc)
        };
        self.data.insert(key, value);
    }
    
    pub fn del(&mut self, dir: &str, doc: &str) {
        let key = if dir.is_empty() {
            doc.to_string()
        } else {
            format!("{}/{}", dir, doc)
        };
        self.data.remove(&key);
    }
    
    pub fn put_data(&mut self, key: &str, value: Value) {
        let data_key = format!("data/{}", key);
        self.data.insert(data_key, json!({"val": value}));
    }
    
    pub fn get_data(&self, key: &str) -> Option<Value> {
        let data_key = format!("data/{}", key);
        self.data.get(&data_key)
            .and_then(|v| v.get("val"))
            .cloned()
    }
    
    pub fn del_data(&mut self, key: &str) {
        let data_key = format!("data/{}", key);
        self.data.remove(&data_key);
    }
}

impl KVStore for Store {
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
        let data_key = format!("data/{}", key);
        self.data.get(&data_key)
            .and_then(|v| v.get("val").cloned())
            .map(|val| DataValue {
                key: key.to_string(),
                val,
            })
    }
    
    fn put_data(&mut self, key: &str, val: Value) {
        let data_key = format!("data/{}", key);
        self.data.insert(data_key, json!({"val": val}));
    }
    
    fn del_data(&mut self, key: &str) {
        let data_key = format!("data/{}", key);
        self.data.remove(&data_key);
    }
}

#[derive(Clone)]
pub struct Context {
    pub kv: Store,
    pub msg: Value,
    pub opt: HashMap<String, Value>,
    pub state: HashMap<String, Value>,
    pub env: HashMap<String, Value>,
}

impl Context {
    pub fn new(kv: Store, msg: Value, opt: HashMap<String, Value>) -> Self {
        Context {
            kv,
            msg,
            opt,
            state: HashMap::new(),
            env: HashMap::new(),
        }
    }
}

// Type definition for transform functions
pub type TransformFn = fn(Context) -> Context;

// BuildConfig with all the fields that db.rs expects
#[derive(Clone)]
pub struct BuildConfig {
    pub write: Option<Vec<TransformFn>>,
    pub read: Option<Vec<TransformFn>>,
    pub __read__: Vec<(String, Vec<TransformFn>)>,
    pub __write__: Vec<(String, Vec<TransformFn>)>,
}

// DBImpl structure - now derives Clone
#[derive(Clone)]
pub struct DBImpl {
    pub store: Store,
    pub config: BuildConfig,
}

// Helper type definitions that db.rs might need
pub type DBMethods = HashMap<String, fn(&mut Store, Value) -> Result<Value, String>>;

// Transform a single function into a TransformFn
pub fn transform(f: TransformFn) -> TransformFn {
    f
}

// Default initialization - accepts Context and returns it
pub fn default_init(ctx: Context) -> Context {
    ctx
}

// Apply a series of transforms to a context
pub fn apply_transforms(mut ctx: Context, transforms: &[TransformFn]) -> Context {
    for transform in transforms {
        if ctx.state.contains_key("error") {
            break;
        }
        ctx = transform(ctx);
    }
    ctx
}

// Build function that matches what db.rs expects
pub fn build(config: BuildConfig) -> impl Fn(Store) -> DBImpl {
    move |store| DBImpl {
        store,
        config: config.clone(),
    }
}

// Pipeline builder
pub fn pipeline(funcs: Vec<fn(Context) -> Context>) -> impl Fn(Context) -> Context {
    move |initial_ctx| {
        funcs.iter().fold(initial_ctx, |ctx, func| {
            if ctx.state.contains_key("error") {
                return ctx;
            }
            func(ctx)
        })
    }
}
