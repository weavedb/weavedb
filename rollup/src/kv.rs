use std::collections::HashMap;
use std::sync::RwLock;
use rocksdb::DB;
use tokio::sync::mpsc::{unbounded_channel, UnboundedSender};
use std::sync::Arc;
use serde_json::Value;
use once_cell::sync::{Lazy, OnceCell};

enum Op {
    Put(String, String),
    Del(String),
}

// Use RwLock instead of Mutex for better read concurrency
pub static KV: Lazy<RwLock<HashMap<String, Value>>> = Lazy::new(|| RwLock::new(HashMap::new()));
static DB: OnceCell<Arc<DB>> = OnceCell::new();
static TX: OnceCell<UnboundedSender<Op>> = OnceCell::new();

pub fn get(key: &str) -> Option<String> {
    // Use read lock for better concurrency
    let db = KV.read().unwrap();
    db.get(key).and_then(|v| v.as_str().map(|s| s.to_string()))
}

pub fn put(key: &str, value: &str) {
    // Queue async write first (non-blocking)
    if let Some(tx) = TX.get() {
        let _ = tx.send(Op::Put(key.to_string(), value.to_string()));
    }
    
    // Then update memory with minimal lock time
    {
        let mut db = KV.write().unwrap();
        db.insert(key.to_string(), serde_json::Value::String(value.to_string()));
    } // Lock released here
}

pub fn del(key: &str) {
    // Queue async delete first (non-blocking)
    if let Some(tx) = TX.get() {
        let _ = tx.send(Op::Del(key.to_string()));
    }
    
    // Then update memory with minimal lock time
    {
        let mut db = KV.write().unwrap();
        db.remove(key);
    } // Lock released here
}

pub fn init(path: &str) {
    let db = DB::open_default(path).expect("failed to open rocksdb");
    println!("🗃️  RocksDB opened at: {}", std::fs::canonicalize(path).unwrap().display());
    
    let (tx, mut rx) = unbounded_channel::<Op>();
    let db = Arc::new(db);
    let db_clone: Arc<DB> = Arc::clone(&db);

    // Load existing data from RocksDB
    {
        let mut mem = KV.write().unwrap();
        for item in db.iterator(rocksdb::IteratorMode::Start) {
            if let Ok((k, v)) = item {
                let key = String::from_utf8(k.to_vec()).unwrap();
                let val = String::from_utf8(v.to_vec()).unwrap();
                mem.insert(key, serde_json::Value::String(val));
            }
        }
    }

    // Spawn background writer with batching for better performance
    tokio::spawn(async move {
        let mut batch = Vec::with_capacity(100);
        let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(10));
        
        loop {
            tokio::select! {
                Some(op) = rx.recv() => {
                    batch.push(op);
                    
                    // Write in batches of 100 or when channel is empty
                    if batch.len() >= 100 || rx.is_empty() {
                        let mut write_batch = rocksdb::WriteBatch::default();
                        
                        for op in batch.drain(..) {
                            match op {
                                Op::Put(k, v) => {
                                    write_batch.put(k.as_bytes(), v.as_bytes());
                                }
                                Op::Del(k) => {
                                    write_batch.delete(k.as_bytes());
                                }
                            }
                        }
                        
                        // Write entire batch atomically
                        let _ = db_clone.write(write_batch);
                    }
                }
                _ = interval.tick() => {
                    // Flush any pending writes every 10ms
                    if !batch.is_empty() {
                        let mut write_batch = rocksdb::WriteBatch::default();
                        
                        for op in batch.drain(..) {
                            match op {
                                Op::Put(k, v) => {
                                    write_batch.put(k.as_bytes(), v.as_bytes());
                                }
                                Op::Del(k) => {
                                    write_batch.delete(k.as_bytes());
                                }
                            }
                        }
                        
                        let _ = db_clone.write(write_batch);
                    }
                }
            }
        }
    });
    
    DB.set(Arc::clone(&db)).unwrap();
    TX.set(tx).unwrap();
}

#[cfg(test)]
mod tests {
    use super::*; 
    use std::time::Instant;

    #[test]
    fn test_put_tps() {
        let iterations = 1_000_000;
        let start = Instant::now();
        for i in 0..iterations {
            let key = format!("key-{}", i);
            let val = i.to_string();
            put(&key, &val);
        }
        let elapsed = start.elapsed();
        let secs = elapsed.as_secs_f64();
        let tps = iterations as f64 / secs;
        println!("Executed {} puts in {:.3} seconds", iterations, secs);
        println!("TPS: {:.0}", tps);
    }
}
