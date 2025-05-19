use deno_core::{JsRuntime, RuntimeOptions};

pub struct Transformer {
    js: JsRuntime,
}

impl Transformer {
    pub fn new() -> Self {
        let mut js = JsRuntime::new(RuntimeOptions::default());

        js.execute_script(
            "<init>",
            r#"
            globalThis.add_hello = function(name) {
                return "Hello, " + name + "!";
            };
            "#,
        ).unwrap();

        Self { js }
    }
    pub fn apply(&mut self, input: &str) -> Result<String, deno_core::anyhow::Error> {
	let script = format!("add_hello('{}')", input);
	let result = self.js.execute_script("<exec>", script)?;
	let scope = &mut self.js.handle_scope();
	let local = result.open(scope);
	Ok(local.to_rust_string_lossy(scope))
    }
}
