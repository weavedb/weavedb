use std::collections::HashMap;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use std::time::Instant;

static DB: Lazy<Mutex<HashMap<String, String>>> = Lazy::new(|| {
    Mutex::new(HashMap::new())
});

fn put(key: &str, value: &str) {
    let mut db = DB.lock().unwrap();
    db.insert(key.to_string(), value.to_string());
}

fn get(key: &str) -> Option<String> {
    let db = DB.lock().unwrap();
    db.get(key).cloned()
}

fn del(key: &str) {
    let mut db = DB.lock().unwrap();
    db.remove(key);
}

fn main() {
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
