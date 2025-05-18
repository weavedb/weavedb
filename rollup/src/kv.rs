use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;

pub static DB: Lazy<Mutex<HashMap<String, String>>> = Lazy::new(|| {
    Mutex::new(HashMap::new())
});

pub fn put(key: &str, value: &str) {
    let mut db = DB.lock().unwrap();
    db.insert(key.to_string(), value.to_string());
}

pub fn get(key: &str) -> Option<String> {
    let db = DB.lock().unwrap();
    db.get(key).cloned()
}

pub fn del(key: &str) {
    let mut db = DB.lock().unwrap();
    db.remove(key);
}

#[cfg(test)]
mod tests {
    use super::*; // import `put`, etc. from kv.rs
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
