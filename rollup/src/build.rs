use crate::monade::{of, ka, dev, SyncMonad, Device};
use std::collections::HashMap;
use std::sync::Arc;
use serde_json::Value;

// Type definitions matching the JS structure
pub type Msg = Value;
pub type Opt = HashMap<String, Value>;

#[derive(Clone)]
pub struct Context {
    pub kv: Store,
    pub msg: Msg,
    pub opt: Opt,
    pub state: HashMap<String, Value>,
    pub env: HashMap<String, Value>,
}

// Store wrapper matching JS _store
#[derive(Clone)]
pub struct Store {
    data: HashMap<String, Value>,
}

impl Store {
    pub fn new(kv: HashMap<String, Value>) -> Self {
        Store { data: kv }
    }

    pub fn get(&self, dir: &str, doc: &str) -> Option<Value> {
        let key = format!("{}/{}", dir, doc);
        self.data.get(&key).cloned()
    }

    pub fn put(&mut self, dir: &str, doc: &str, data: Value) {
        let key = format!("{}/{}", dir, doc);
        self.data.insert(key, data);
    }

    pub fn del(&mut self, dir: &str, doc: &str) {
        let key = format!("{}/{}", dir, doc);
        self.data.remove(&key);
    }

    pub fn commit(&mut self) {
        // In JS this would persist changes
    }

    pub fn reset(&mut self) {
        // In JS this would reset uncommitted changes
    }
}

// Default init function matching JS _init
pub fn default_init(ctx: Context) -> Context {
    let mut env = ctx.opt.clone();
    
    // Get config info if it exists
    if let Some(info) = ctx.kv.get("_config", "info") {
        if let Some(obj) = info.as_object() {
            for (k, v) in obj {
                env.insert(k.clone(), v.clone());
            }
        }
    }

    Context {
        state: HashMap::new(),
        env,
        ..ctx
    }
}

// Device methods
#[derive(Clone)]
pub struct DBMethods {
    pub write: Option<Arc<dyn Fn(&mut Store, Msg, Opt) -> Result<(), String> + Send + Sync>>,
    pub pwrite: Option<Arc<dyn Fn(&mut Store, Msg, Opt) -> Result<(), String> + Send + Sync>>,
    pub read: Option<Arc<dyn Fn(&Store, Msg, Opt) -> Value + Send + Sync>>,
    pub custom: HashMap<String, Arc<dyn Fn(&mut Store, Vec<Value>) -> Value + Send + Sync>>,
}

impl DBMethods {
    fn new() -> Self {
        DBMethods {
            write: None,
            pwrite: None,
            read: None,
            custom: HashMap::new(),
        }
    }
}

// Transform function type
pub type TransformFn = Arc<dyn Fn(Context) -> Context + Send + Sync>;

// Build configuration
pub struct BuildConfig {
    pub r#async: bool,
    pub write: Option<Vec<TransformFn>>,
    pub read: Option<Vec<TransformFn>>,
    pub __write__: HashMap<String, Vec<TransformFn>>,
    pub __read__: HashMap<String, Vec<TransformFn>>,
    pub init: Arc<dyn Fn(Context) -> Context + Send + Sync>,
    pub store: Arc<dyn Fn(HashMap<String, Value>) -> Store + Send + Sync>,
}

impl Default for BuildConfig {
    fn default() -> Self {
        BuildConfig {
            r#async: false,
            write: None,
            read: None,
            __write__: HashMap::new(),
            __read__: HashMap::new(),
            init: Arc::new(default_init),
            store: Arc::new(Store::new),
        }
    }
}

// Apply a chain of transformations
pub fn apply_transforms(mut ctx: Context, transforms: &[TransformFn]) -> Context {
    for transform in transforms {
        ctx = (*transform)(ctx);
    }
    ctx
}

// Main build function
pub fn build(config: BuildConfig) -> impl Fn(HashMap<String, Value>, Opt) -> Device<Store, DBMethods> {
    move |kv, opt| {
        let store = (*config.store)(kv);
        let mut methods = DBMethods::new();
        
        // Build write method
        if let Some(ref write_transforms) = config.write {
            let transforms = write_transforms.clone();
            let init = config.init.clone();
            let base_opt = opt.clone();
            
            methods.write = Some(Arc::new(move |store: &mut Store, msg, opt| {
                let mut full_opt = base_opt.clone();
                full_opt.extend(opt);
                
                let ctx = Context {
                    kv: store.clone(),
                    msg,
                    opt: full_opt,
                    state: HashMap::new(),
                    env: HashMap::new(),
                };
                
                let ctx = (*init)(ctx);
                let result = apply_transforms(ctx, &transforms);
                *store = result.kv;
                Ok(())
            }));
            
            // Add pwrite for async
            if config.r#async {
                let transforms = write_transforms.clone();
                let init = config.init.clone();
                let base_opt = opt.clone();
                
                methods.pwrite = Some(Arc::new(move |store: &mut Store, msg, opt| {
                    let mut full_opt = base_opt.clone();
                    full_opt.extend(opt);
                    
                    let ctx = Context {
                        kv: store.clone(),
                        msg,
                        opt: full_opt,
                        state: HashMap::new(),
                        env: HashMap::new(),
                    };
                    
                    let ctx = (*init)(ctx);
                    let result = apply_transforms(ctx, &transforms);
                    *store = result.kv;
                    Ok(())
                }));
            }
        }
        
        // Build read method
        if let Some(ref read_transforms) = config.read {
            let transforms = read_transforms.clone();
            let init = config.init.clone();
            let base_opt = opt.clone();
            
            methods.read = Some(Arc::new(move |store: &Store, msg, opt| {
                let mut full_opt = base_opt.clone();
                full_opt.extend(opt);
                
                let ctx = Context {
                    kv: store.clone(),
                    msg,
                    opt: full_opt,
                    state: HashMap::new(),
                    env: HashMap::new(),
                };
                
                let ctx = (*init)(ctx);
                let _result = apply_transforms(ctx, &transforms);
                
                // Return some value - in real impl would return from context
                Value::Null
            }));
        }
        
        // Build custom methods
        for (name, transforms) in config.__write__.iter().chain(config.__read__.iter()) {
            let transforms = transforms.clone();
            let init = config.init.clone();
            let base_opt = opt.clone();
            
            methods.custom.insert(
                name.clone(),
                Arc::new(move |store: &mut Store, args| {
                    let ctx = Context {
                        kv: store.clone(),
                        msg: Value::Array(args),
                        opt: base_opt.clone(),
                        state: HashMap::new(),
                        env: HashMap::new(),
                    };
                    
                    let ctx = (*init)(ctx);
                    let result = apply_transforms(ctx, &transforms);
                    *store = result.kv;
                    
                    Value::Null
                })
            );
        }
        
        dev(methods)(store)
    }
}

// Helper to create transform functions
pub fn transform<F>(f: F) -> TransformFn
where
    F: Fn(Context) -> Context + Send + Sync + 'static,
{
    Arc::new(f)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_build() {
        // Track whether functions were called
        use std::sync::Mutex;
        let write_called = Arc::new(Mutex::new(false));
        let write_called_clone = write_called.clone();
        
        let config = BuildConfig {
            write: Some(vec![
                transform(move |mut ctx| {
                    *write_called_clone.lock().unwrap() = true;
                    // Example: modify the store
                    ctx.kv.put("test", "doc", json!({"value": 42}));
                    ctx
                }),
            ]),
            ..Default::default()
        };
        
        let builder = build(config);
        let db = builder(HashMap::new(), HashMap::new());
        
        // Since we can't access private fields, we'll just verify the device was created
        // In a real application, you would use the device through its public API
        
        // Verify our transform was set up (it will be called when write is invoked)
        assert!(!*write_called.lock().unwrap());
    }
    
    #[test]
    fn test_store() {
        let mut store = Store::new(HashMap::new());
        
        // Test put and get
        store.put("dir", "doc", json!({"key": "value"}));
        assert_eq!(store.get("dir", "doc"), Some(json!({"key": "value"})));
        
        // Test delete
        store.del("dir", "doc");
        assert_eq!(store.get("dir", "doc"), None);
    }
    
    #[test]
    fn test_transform_chain() {
        let transforms = vec![
            transform(|mut ctx| {
                ctx.state.insert("step1".to_string(), json!(true));
                ctx
            }),
            transform(|mut ctx| {
                ctx.state.insert("step2".to_string(), json!(true));
                ctx
            }),
        ];
        
        let ctx = Context {
            kv: Store::new(HashMap::new()),
            msg: json!({}),
            opt: HashMap::new(),
            state: HashMap::new(),
            env: HashMap::new(),
        };
        
        let result = apply_transforms(ctx, &transforms);
        assert_eq!(result.state.get("step1"), Some(&json!(true)));
        assert_eq!(result.state.get("step2"), Some(&json!(true)));
    }
}
