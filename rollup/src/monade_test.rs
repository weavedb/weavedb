use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::{Arc, atomic::{AtomicI32, Ordering}};

// Assuming the monade module is in the same crate
use crate::{pof, monade::{of, pof_fn, pof_fut, ka, aka, SyncMonad, AsyncMonad}};


// NOTE: The current monade implementation has some limitations:
// 1. The `chain` method doesn't properly flatten nested monads
// 2. The helper functions `handle_map_output` and `handle_chain_output` are simplified
// 3. AsyncMonad doesn't implement Debug or PartialEq traits
// These tests work around these limitations.

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
struct Person {
    name: String,
    age: u32,
    email: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
struct ProcessedData {
    id: String,
    person: Person,
    score: f64,
    tags: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;

    // Test helper functions
    fn add_10(x: i32) -> i32 {
        x + 10
    }

    fn multiply_by_2(x: i32) -> i32 {
        x * 2
    }

    fn to_string_monad(x: i32) -> SyncMonad<String> {
        of(x.to_string())
    }

    async fn async_add_5(x: i32) -> i32 {
        // Simulate some async work
        tokio::time::sleep(tokio::time::Duration::from_millis(1)).await;
        x + 5
    }

    fn process_person(person: Person) -> ProcessedData {
        ProcessedData {
            id: format!("user_{}", person.name.to_lowercase().replace(" ", "_")),
            person: person.clone(),
            score: person.age as f64 * 1.5,
            tags: vec!["processed".to_string(), "active".to_string()],
        }
    }

    async fn fetch_additional_data(data: ProcessedData) -> ProcessedData {
        // Simulate async data fetching
        tokio::time::sleep(tokio::time::Duration::from_millis(1)).await;
        let mut updated = data;
        updated.tags.push("fetched".to_string());
        updated
    }

    #[test]
    fn test_sync_monad_basic() {
        let result = of(5)
            .map(add_10)
            .map(multiply_by_2)
            .val();
        
        assert_eq!(result, 30);
    }

    #[test]
    fn test_sync_monad_chain() {
        let result = of(10)
            .map(add_10)
            .chain(to_string_monad)
            .val();
        
        assert_eq!(result, "20");
    }

    #[test]
    fn test_sync_monad_tap() {
        let mut side_effect = 0;
        
        let result = of(5)
            .map(add_10)
            .tap(|x| side_effect = *x)
            .map(multiply_by_2)
            .val();
        
        assert_eq!(result, 30);
        assert_eq!(side_effect, 15);
    }

    #[test]
    fn test_sync_monad_to() {
        let result = of(42)
            .map(|x| x + 8)
            .to(|x| format!("The answer is {}", x));
        
        assert_eq!(result, "The answer is 50");
    }

    #[tokio::test]
    async fn test_async_monad_basic() {
        let result = pof_fn(5)
            .map(add_10)
            .map(multiply_by_2)
            .val()
            .await;
        
        assert_eq!(result, 30);
    }

    #[tokio::test]
    async fn test_async_monad_from_future() {
        let future = async { 10 };
        let result = pof_fut(future)
            .map(add_10)
            .map(multiply_by_2)
            .val()
            .await;
        
        assert_eq!(result, 40);
    }

    #[tokio::test]
    async fn test_async_monad_with_futures() {
        // Test with async block using pof_fut directly
        let result = pof_fut(async { 10 })
            .map(add_10)
            .map(multiply_by_2)
            .val()
            .await;
        
        assert_eq!(result, 40);
        
        // Test with regular value using pof
        let result2 = pof_fn(15)
            .map(add_10)
            .val()
            .await;
        
        assert_eq!(result2, 25);
    }

    #[tokio::test]
    async fn test_async_monad_with_async_functions() {
        let result = pof_fut(async_add_5(10))
            .map(multiply_by_2)
            .val()
            .await;
        
        assert_eq!(result, 30);
    }

    #[tokio::test]
    async fn test_async_monad_tap_with_clone() {
        let result = pof_fn(5)
            .map(add_10)
            .tap(|x| println!("Side effect: {}", x))
            .map(multiply_by_2)
            .val()
            .await;
        
        assert_eq!(result, 30);
    }

    #[tokio::test]
    async fn test_async_monad_tap() {
        let result = pof_fn(String::from("Hello"))
            .map(|s| format!("{} World", s))
            .tap(|s| println!("Current value: {}", s))
            .val()
            .await;
        
        assert_eq!(result, "Hello World");
    }

    #[test]
    fn test_sync_monad_with_json() {
        let json_data = json!({
            "name": "John Doe",
            "age": 30,
            "email": "john@example.com"
        });
        
        let result = of(json_data)
            .map(|v| serde_json::from_value::<Person>(v).unwrap())
            .map(|p| Person { age: p.age + 5, ..p })
            .map(|p| json!({
                "updated_person": p,
                "timestamp": "2024-01-01"
            }))
            .val();
        
        assert_eq!(result["updated_person"]["age"], 35);
        assert_eq!(result["updated_person"]["name"], "John Doe");
    }

    #[tokio::test]
    async fn test_async_monad_with_json() {
        let json_str = r#"{
            "name": "Jane Smith",
            "age": 25,
            "email": null
        }"#;
        
        // Parse JSON and process person
        let person = pof_fn(json_str)
            .map(|s| serde_json::from_str::<Person>(s).unwrap())
            .val()
            .await;
        
        // Process the person data
        let processed = process_person(person);
        
        // Fetch additional data asynchronously
        let final_data = pof_fut(fetch_additional_data(processed))
            .val()
            .await;
        
        // Convert to JSON for assertions
        let result_value = serde_json::to_value(final_data).unwrap();
        
        assert_eq!(result_value["id"], "user_jane_smith");
        assert_eq!(result_value["score"], 37.5);
        assert!(result_value["tags"].as_array().unwrap().contains(&json!("fetched")));
    }

    #[tokio::test]
    async fn test_complex_json_pipeline() {
        let input_json = json!({
            "users": [
                {"name": "Alice", "age": 28, "email": "alice@test.com"},
                {"name": "Bob", "age": 35, "email": null},
                {"name": "Charlie", "age": 42, "email": "charlie@test.com"}
            ]
        });
        
        let result = pof_fn(input_json)
            .map(|v| {
                v["users"].as_array()
                    .unwrap()
                    .iter()
                    .map(|u| serde_json::from_value::<Person>(u.clone()).unwrap())
                    .collect::<Vec<_>>()
            })
            .map(|users| {
                users.into_iter()
                    .filter(|u| u.email.is_some())
                    .map(process_person)
                    .collect::<Vec<_>>()
            })
            .map(|processed| json!({
                "processed_count": processed.len(),
                "total_score": processed.iter().map(|p| p.score).sum::<f64>(),
                "data": processed
            }))
            .val()
            .await;
        
        assert_eq!(result["processed_count"], 2);
        assert_eq!(result["total_score"], 105.0); // (28 * 1.5) + (42 * 1.5)
    }

    #[test]
    fn test_sync_pipeline_builder() {
        // Note: The pipeline builders in the original code are incomplete
        // This test shows how they might be used once fully implemented
        let _pipeline = ka::<i32>()
            .map(add_10)
            .map(multiply_by_2)
            .tap(|x| println!("Value is: {}", x));
        
        // Once implemented, this would execute the pipeline
        // let result = pipeline.into_fn()(5).val();
        // assert_eq!(result, 30);
    }

    #[tokio::test]
    async fn test_async_pipeline_builder() {
        // Note: The pipeline builders in the original code are incomplete
        // This test shows how they might be used once fully implemented
        let _pipeline = aka::<i32>()
            .map(add_10)
            .tap(|x| println!("Value is: {}", x))
            .map(multiply_by_2);
        
        // Once implemented, this would execute the pipeline
        // let result = pipeline.into_fn()(5).val().await;
        // assert_eq!(result, 30);
    }

    #[tokio::test]
    async fn test_error_handling_in_json_parsing() {
        let invalid_json = r#"{"invalid": json}"#;
        
        // This test demonstrates that error handling needs to be added
        // In a real implementation, we'd want Result<T, E> support
        let result = pof_fn(invalid_json)
            .map(|s| {
                match serde_json::from_str::<Value>(s) {
                    Ok(v) => Some(v),
                    Err(_) => None,
                }
            })
            .map(|opt| opt.unwrap_or_else(|| json!({"error": "Invalid JSON"})))
            .val()
            .await;
        
        assert_eq!(result["error"], "Invalid JSON");
    }

    #[tokio::test]
    async fn test_nested_async_operations() {
        async fn fetch_user_data(id: u32) -> Person {
            tokio::time::sleep(tokio::time::Duration::from_millis(1)).await;
            Person {
                name: format!("User {}", id),
                age: 20 + id,
                email: Some(format!("user{}@test.com", id)),
            }
        }
        
        // Use pof_fut to handle the async function properly
        let person = pof_fut(fetch_user_data(1))
            .val()
            .await;
        
        // Then process it
        let processed = process_person(person);
        let result_value = serde_json::to_value(processed).unwrap();
        
        assert_eq!(result_value["person"]["name"], "User 1");
        assert_eq!(result_value["score"], 31.5);
    }

    #[tokio::test]
    async fn test_chain_limitations() {
        // This test demonstrates the current limitations of the chain method
        // The current implementation doesn't properly handle different monad types
        
        // For now, we need to extract values before chaining
        let intermediate = pof_fn(5)
            .val()
            .await;
        
        let result = pof_fn(intermediate + 10)
            .val()
            .await;
        
        assert_eq!(result, 15);
        
        // Alternative approach using map
        let result2 = pof_fn(5)
            .map(|x| x + 10)
            .val()
            .await;
        
        assert_eq!(result2, 15);
    }
}

// Example of how to use the monads with arbitrary JSON input
pub async fn process_arbitrary_json(json_input: &str) -> Result<Value, String> {
    // Parse and validate JSON
    let parsed: Value = serde_json::from_str(json_input)
        .map_err(|e| format!("JSON parsing error: {}", e))?;
    
    // Process using async monad
    let result = pof_fn(parsed)
        .map(|v| {
            // Transform the JSON in some way
            let mut obj = v.as_object().cloned().unwrap_or_default();
            obj.insert("processed_at".to_string(), json!("2024-01-01"));
            Value::Object(obj)
        })
        .map(|v| {
            // Add metadata
            json!({
                "success": true,
                "data": v,
                "version": "1.0"
            })
        })
        .val()
        .await;
    
    Ok(result)
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    
    #[tokio::test]
    async fn test_process_arbitrary_json() {
        let input = r#"{
            "action": "create_user",
            "payload": {
                "name": "Test User",
                "age": 25,
                "email": "test@example.com"
            }
        }"#;
        
        let result = process_arbitrary_json(input).await.unwrap();
        
        assert_eq!(result["success"], true);
        assert_eq!(result["data"]["processed_at"], "2024-01-01");
        assert_eq!(result["data"]["action"], "create_user");
    }

    #[tokio::test]
    async fn test_process_arbitrary_json_array() {
        let input = r#"[
            {"id": 1, "value": "first"},
            {"id": 2, "value": "second"}
        ]"#;
        
        let parsed: Value = serde_json::from_str(input).unwrap();
        
        let result = pof_fn(parsed)
            .map(|v| {
                let arr = v.as_array().unwrap();
                json!({
                    "count": arr.len(),
                    "items": arr
                })
            })
            .val()
            .await;
        
        assert_eq!(result["count"], 2);
        assert_eq!(result["items"][0]["value"], "first");
    }

    #[tokio::test]
    async fn test_real_world_json_transformation() {
        // Simulating a real-world scenario with nested JSON
        let api_response = r#"{
            "status": "success",
            "data": {
                "users": [
                    {
                        "id": 1,
                        "profile": {
                            "name": "Alice Johnson",
                            "preferences": {
                                "theme": "dark",
                                "notifications": true
                            }
                        }
                    },
                    {
                        "id": 2,
                        "profile": {
                            "name": "Bob Smith",
                            "preferences": {
                                "theme": "light",
                                "notifications": false
                            }
                        }
                    }
                ]
            }
        }"#;
        
        let result = pof_fn(api_response)
            .map(|s| serde_json::from_str::<Value>(s).unwrap())
            .map(|v| {
                // Extract and transform user data
                let users = v["data"]["users"].as_array().unwrap();
                let transformed_users: Vec<Value> = users.iter().map(|user| {
                    json!({
                        "userId": user["id"],
                        "displayName": user["profile"]["name"],
                        "isDarkMode": user["profile"]["preferences"]["theme"] == "dark"
                    })
                }).collect();
                
                json!({
                    "transformedUsers": transformed_users,
                    "totalUsers": transformed_users.len()
                })
            })
            .val()
            .await;
        
        assert_eq!(result["totalUsers"], 2);
        assert_eq!(result["transformedUsers"][0]["displayName"], "Alice Johnson");
        assert_eq!(result["transformedUsers"][0]["isDarkMode"], true);
        assert_eq!(result["transformedUsers"][1]["isDarkMode"], false);
    }

    #[tokio::test]
    async fn test_pof_macro_basic() {
	let result = pof!(3)
            .map(|x| x + 1)
            .map(|x| x * 2)
            .val()
            .await;
	assert_eq!(result, 8);
    }

    #[tokio::test]
    async fn test_pof_macro_with_tap() {
	let tapped = Arc::new(AtomicI32::new(0));
	let tapped_clone = tapped.clone();

	let result = pof!(5)
            .tap(move |x| {
		tapped_clone.store(*x, Ordering::Relaxed);
            })
            .map(|x| x * 2)
            .val()
            .await;

	assert_eq!(tapped.load(Ordering::Relaxed), 5);
	assert_eq!(result, 10);
    }
    #[tokio::test]
    async fn test_async_monad_tap_with_large_value() {
	let tapped = Arc::new(AtomicI32::new(0));
	let tapped_clone = tapped.clone();

	let result = pof!(vec![1, 2, 3, 4])
            .tap(move |v| tapped_clone.store(v.len() as i32, Ordering::Relaxed))
            .map(|v| v.iter().sum::<i32>())
            .val()
            .await;

	assert_eq!(result, 10);
	assert_eq!(tapped.load(Ordering::Relaxed), 4);
    }
    #[tokio::test]
    async fn test_async_monad_to_conversion() {
	let result: String = pof!(3)
            .map(|x| x + 7)
            .to(|x| format!("value: {}", x)).await;

	assert_eq!(result, "value: 10");
    }
    #[tokio::test]
    async fn test_async_monad_option_unwrap_or() {
	let result = pof!(Some(5))
            .map(|x| x.unwrap_or(100))
            .val()
            .await;

	assert_eq!(result, 5);
    }
    #[tokio::test]
    async fn test_json_tap_logs_name() {
	let tapped = Arc::new(AtomicI32::new(0));
	let tapped_clone = tapped.clone();

	let person = json!({ "name": "Alice", "age": 20 });
	let result = pof_fn(person)
            .tap(move |v| {
		if let Some(age) = v["age"].as_i64() {
                    tapped_clone.store(age as i32, Ordering::Relaxed);
		}
            })
            .val()
            .await;

	assert_eq!(tapped.load(Ordering::Relaxed), 20);
	assert_eq!(result["name"], "Alice");
    }
    #[tokio::test]
    async fn test_map_identity() {
	let result = pof!(42)
            .map(|x| x)
            .val()
            .await;

	assert_eq!(result, 42);
    }
    #[tokio::test]
    async fn test_pipeline_reuse_isolation() {
	let monad1 = pof_fn(1).map(|x| x + 1).map(|x| x * 2);
	let monad2 = pof_fn(2).map(|x| x + 1).map(|x| x * 2);

	let result1 = monad1.val().await;
	let result2 = monad2.val().await;

	assert_eq!(result1, 4);
	assert_eq!(result2, 6);
    }   #[tokio::test]
    async fn test_json_string_pipeline() {
	let data = r#"{"name": "bob", "age": 40}"#;
	let result = pof_fn(data)
            .map(|s| serde_json::from_str::<Value>(s).unwrap())
            .tap(|v| assert_eq!(v["age"], 40))
            .map(|mut v| {
		v["age"] = json!(v["age"].as_i64().unwrap() + 1);
		v
            })
            .val()
            .await;

	assert_eq!(result["age"], 41);
    }
    #[tokio::test]
    async fn test_deep_map_tap_chain() {
	let result = pof!(2)
            .map(|x| x * 3)
            .tap(|x| assert_eq!(*x, 6))
            .map(|x| x + 4)
            .map(|x| x * 2)
            .val()
            .await;

	assert_eq!(result, 20); // (((2 * 3) + 4) * 2)
    }
    #[tokio::test]
    async fn test_empty_array_json() {
	let result = pof_fn(json!([]))
            .map(|arr| json!({ "count": arr.as_array().unwrap().len() }))
            .val()
            .await;

	assert_eq!(result["count"], 0);
    }
    #[tokio::test]
    async fn test_to_final_projection() {
	let result = pof_fn(100)
            .map(|x| x + 23)
            .to(|x| format!("Final: {}", x)).await;

	assert_eq!(result, "Final: 123");
    }

    #[test]
    fn test_ka_embedded_into_of_chain() {
	let pipeline = ka::<i32>().map(|x| x + 1).map(|x| x * 2);

	let result = of(3).chain(pipeline.into_fn()).map(|x| x - 1).val();
	assert_eq!(result, 7); // ((3 + 1) * 2) - 1 = 7
    }
    #[tokio::test]
    async fn test_aka_embedded_into_pof_fn_chain() {
	let pipeline = aka::<i32>().map(|x| x + 2).map(|x| x * 5);

	let result = pof!(4).chain(pipeline.into_fn()).map(|x| x - 1).val().await;
	assert_eq!(result, 29); // ((4 + 2) * 5) - 1 = 29
    }
    #[tokio::test]
    async fn test_aka_embedded_into_pof_macro_chain() {
	let result = aka::<i32>()
            .map(|x| x * 2)
            .map(|x| x + 3)
            .into_fn()(5)
            .map(|x| x - 1)
            .val()
            .await;

	assert_eq!(result, 12); // ((5 * 2) + 3) - 1 = 12
    }
    #[tokio::test]
    async fn test_aka_with_pof_fut_input() {
	async fn fetch_num() -> i32 {
            9
	}

	let pipeline = aka::<i32>().map(|x| x + 1).map(|x| x * 2);

	let fetched = pof_fut(fetch_num()).val().await;
	let result = pof!(fetched).chain(pipeline.into_fn()).val().await;

	assert_eq!(result, 20); // (9 + 1) * 2
    }
}
