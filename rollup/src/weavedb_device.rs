// File: src/weavedb_device.rs

use serde_json::{Value, json};
use std::collections::HashMap;
use crate::build::{Store, Context, TransformFn};
use crate::normalize::normalize;
use crate::parse::parse;
use crate::auth::auth;
use crate::write::write;
use crate::read::read;
use crate::verify::verify;

pub struct WeaveDB {
    store: Store,
    write_transforms: Vec<TransformFn>,
    read_transforms: Vec<TransformFn>,
}

impl WeaveDB {
    pub fn new(initial_data: HashMap<String, Value>, _opt: HashMap<String, Value>) -> Self {
        let store = Store::new(initial_data);
        
        // Define the transform pipelines
        let write_transforms = vec![
            normalize as TransformFn,
            verify as TransformFn,
            parse as TransformFn,
            auth as TransformFn,
            write as TransformFn,
        ];
        
        let read_transforms = vec![
            normalize as TransformFn,
            parse as TransformFn,
            read as TransformFn,
        ];
        
        WeaveDB {
            store,
            write_transforms,
            read_transforms,
        }
    }
    
    fn apply_transforms(mut ctx: Context, transforms: &[TransformFn]) -> Context {
        for transform in transforms {
            if ctx.state.contains_key("error") {
                break;
            }
            ctx = transform(ctx);
        }
        ctx
    }
    
    fn create_context(&self, msg: Value) -> Context {
        let mut ctx = Context::new(
            self.store.clone(),
            msg.clone(),
            HashMap::new(),
        );

	let config_info = ctx.kv.get("_", "info")
	    .or_else(|| ctx.kv.get("_config", "info"));
	
	if let Some(config_info) = config_info {
	    if let Some(obj) = config_info.as_object() {
		for (key, value) in obj {
		    ctx.env.insert(key.clone(), value.clone());
		}
	    }
	}
    
    ctx
}

pub fn write(&mut self, msg: Value) -> Result<Value, Box<dyn std::error::Error>> {
    // Create context from message with proper env initialization
    let mut ctx = self.create_context(msg);
    
    // Apply transforms
    ctx = Self::apply_transforms(ctx, &self.write_transforms);
    
    // Check for errors
    if let Some(error) = ctx.state.get("error") {
        return Err(error.to_string().into());
    }
    
    // Update the store with changes from context
    self.store = ctx.kv;
    
    // Return success response
    Ok(json!({
        "success": ctx.state.get("success").unwrap_or(&json!(true)),
        "state": ctx.state
    }))
}

pub fn read(&mut self, msg: Value) -> Result<Value, Box<dyn std::error::Error>> {
    // Create context from message with proper env initialization
    let mut ctx = self.create_context(msg);
    
    // Apply transforms
    ctx = Self::apply_transforms(ctx, &self.read_transforms);
    
    // Check for errors
    if let Some(error) = ctx.state.get("error") {
        return Err(error.to_string().into());
    }
    
    // Return the read result
    Ok(json!({
        "success": true,
        "state": ctx.state
    }))
}
}
