use std::collections::HashMap;
use std::sync::Mutex;
use rocksdb::DB;
use tokio::sync::mpsc::{unbounded_channel, UnboundedSender};
use std::sync::Arc;
use serde_json::Value;
use once_cell::sync::{Lazy, OnceCell};

enum Op {
    Put(String, String),
    Del(String),
}

pub static KV: Lazy<Mutex<HashMap<String, Value>>> = Lazy::new(|| Mutex::new(HashMap::new()));
static DB: OnceCell<Arc<DB>> = OnceCell::new();
static TX: OnceCell<UnboundedSender<Op>> = OnceCell::new();

pub fn get(key: &str) -> Option<String> {
    let db = KV.lock().unwrap();
    db.get(key).and_then(|v| v.as_str().map(|s| s.to_string()))
}

pub fn put(key: &str, value: &str) {
    KV.lock()
        .unwrap()
        .insert(key.to_string(), serde_json::Value::String(value.to_string()));
    if let Some(tx) = TX.get() {
        let _ = tx.send(Op::Put(key.to_string(), value.to_string()));
    }
}

pub fn del(key: &str) {
    KV.lock().unwrap().remove(key);
    if let Some(tx) = TX.get() {
        let _ = tx.send(Op::Del(key.to_string()));
    }    
}

pub fn init(path: &str) {
    let db = DB::open_default(path).expect("failed to open rocksdb");
    println!("🗃️  RocksDB opened at: {}", std::fs::canonicalize(path).unwrap().display());
    
    let (tx, mut rx) = unbounded_channel::<Op>();
    let db = Arc::new(db);
    let db_clone = Arc::clone(&db);

    {
	
        let mut mem = KV.lock().unwrap();
	for item in db.iterator(rocksdb::IteratorMode::Start) {
	    if let Ok((k, v)) = item {
		let key = String::from_utf8(k.to_vec()).unwrap();
		let val = String::from_utf8(v.to_vec()).unwrap();
		mem.insert(key, serde_json::Value::String(val));
	    }
	}
    }

    tokio::spawn(async move {
	while let Some(op) = rx.recv().await {
            match op {
		Op::Put(k, v) => {
                    let _ = db_clone.put(k.as_bytes(), v.as_bytes());
		}
		Op::Del(k) => {
                    let _ = db_clone.delete(k.as_bytes());
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
