// File: src/db.rs

use serde_json::{json, Value};
use std::collections::HashMap;
use crate::build::{Context, TransformFn, Store};
use crate::normalize::normalize;
use crate::parse::parse;
use crate::auth::auth;
use crate::write::write;
use crate::read::read;
use crate::verify::verify;

// Function to prepend operation to message array
fn get(mut ctx: Context) -> Context {
    ctx.state.insert("opcode".to_string(), json!("get"));
    
    let msg_array = ctx.msg.as_array()
        .map(|arr| arr.clone())
        .unwrap_or_default();
    
    let mut query = vec![json!("get")];
    query.extend(msg_array);
    
    ctx.state.insert("query".to_string(), json!(query));
    ctx
}

fn cget(mut ctx: Context) -> Context {
    ctx.state.insert("opcode".to_string(), json!("cget"));
    
    let msg_array = ctx.msg.as_array()
        .map(|arr| arr.clone())
        .unwrap_or_default();
    
    let mut query = vec![json!("cget")];
    query.extend(msg_array);
    
    ctx.state.insert("query".to_string(), json!(query));
    ctx
}

// Simple DB structure that holds the store and processes operations
pub struct DB {
    store: Store,
    write_pipeline: Vec<TransformFn>,
    read_pipeline: Vec<TransformFn>,
}

impl DB {
    pub fn new(initial_data: HashMap<String, Value>) -> Self {
        let store = Store::new(initial_data);
        
        let write_pipeline = vec![
            normalize as TransformFn,
            verify as TransformFn,
            parse as TransformFn,
            auth as TransformFn,
            write as TransformFn,
        ];
        
        let read_pipeline = vec![
            normalize as TransformFn,
            parse as TransformFn,
            read as TransformFn,
        ];
        
        DB {
            store,
            write_pipeline,
            read_pipeline,
        }
    }
    
    pub fn write(&mut self, msg: Value, opt: HashMap<String, Value>) -> Result<Store, String> {
        let mut ctx = Context::new(self.store.clone(), msg, opt);
        
        // Run through write pipeline
        for transform in &self.write_pipeline {
            if ctx.state.contains_key("error") {
                break;
            }
            ctx = transform(ctx);
        }
        
        if let Some(error) = ctx.state.get("error") {
            // Reset on error
            return Err(error.to_string());
        }
        
        // Update store with the result
        self.store = ctx.kv.clone();
        Ok(self.store.clone())
    }
    
    pub fn read(&self, msg: Value, opt: HashMap<String, Value>) -> Result<Value, String> {
        let mut ctx = Context::new(self.store.clone(), msg, opt);
        
        // Run through read pipeline
        for transform in &self.read_pipeline {
            if ctx.state.contains_key("error") {
                break;
            }
            ctx = transform(ctx);
        }
        
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        // Return the read result
        Ok(ctx.state.get("read_result").cloned().unwrap_or(json!(null)))
    }
    
    pub fn get(&self, collection: &str, doc_id: &str) -> Result<Value, String> {
        let msg = json!([collection, doc_id]);
        let mut ctx = Context::new(self.store.clone(), msg.clone(), HashMap::new());
        
        // Run get transform
        ctx = get(ctx);
        
        // Then run through read pipeline
        for transform in &self.read_pipeline {
            if ctx.state.contains_key("error") {
                break;
            }
            ctx = transform(ctx);
        }
        
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        Ok(ctx.state.get("read_result").cloned().unwrap_or(json!(null)))
    }
    
    pub fn cget(&self, collection: &str, doc_id: &str) -> Result<Value, String> {
        let msg = json!([collection, doc_id]);
        let mut ctx = Context::new(self.store.clone(), msg.clone(), HashMap::new());
        
        // Run cget transform
        ctx = cget(ctx);
        
        // Then run through read pipeline
        for transform in &self.read_pipeline {
            if ctx.state.contains_key("error") {
                break;
            }
            ctx = transform(ctx);
        }
        
        if let Some(error) = ctx.state.get("error") {
            return Err(error.to_string());
        }
        
        Ok(ctx.state.get("read_result").cloned().unwrap_or(json!(null)))
    }
}

// Simple factory function that creates a DB
pub fn create_db() -> impl Fn(HashMap<String, Value>) -> DB {
    move |initial_data| {
        DB::new(initial_data)
    }
}
