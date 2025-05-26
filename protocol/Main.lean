import Weavedb
import Weavedb.Write

open Weavedb.Data
open Weavedb.Write

def main : IO Unit := do
  IO.println "WeaveDB Write Device Test"
  IO.println "========================\n"

  -- Create a write device with a process ID
  let processId := "my-db-process-123"
  let mut device := WriteDevice.new processId

  -- Test 1: SET operation via message
  IO.println "1. Testing SET operation:"
  let user1 := Doc.fromList [
    ("name", "Alice"),
    ("email", "alice@example.com"),
    ("role", "admin")
  ]

  -- Create a message for SET operation
  let setMsg : Msg := {
    headers := {
      signature := "test-signature"
      signatureInput := "test-input"
      nonce := 1
      query := "[\"set\", {...}, 0, \"dXNlcjE\"]"  -- Simplified JSON representation
      id := processId
      contentDigest := "sha256-abc123"
    }
    body := ""
  }

  -- Since parseWriteQuery is a placeholder, we'll execute directly
  -- In production, the message would be parsed and executed
  match executeWrite device.data (mkSetQuery user1 0 "dXNlcjE") with
  | WriteResult.success newData =>
    device := { device with data := newData }
    IO.println "✓ SET user1 successful"
  | WriteResult.error err =>
    IO.println s!"✗ SET failed: {err}"

  -- Test 2: UPSERT operation
  IO.println "\n2. Testing UPSERT operation:"
  let user2 := Doc.fromList [
    ("name", "Bob"),
    ("email", "bob@example.com"),
    ("role", "user")
  ]

  match executeWrite device.data (mkUpsertQuery user2 0 "dXNlcjI") with
  | WriteResult.success newData =>
    device := { device with data := newData }
    IO.println "✓ UPSERT user2 successful"
  | WriteResult.error err =>
    IO.println s!"✗ UPSERT failed: {err}"

  -- Test 3: UPDATE operation (update existing document)
  IO.println "\n3. Testing UPDATE operation:"
  let updatedUser1 := Doc.fromList [
    ("name", "Alice"),
    ("email", "alice@example.com"),
    ("role", "superadmin"),
    ("lastLogin", "2024-01-15")
  ]

  match executeWrite device.data (mkUpdateQuery updatedUser1 0 "dXNlcjE") with
  | WriteResult.success newData =>
    device := { device with data := newData }
    IO.println "✓ UPDATE user1 successful"
  | WriteResult.error err =>
    IO.println s!"✗ UPDATE failed: {err}"

  -- Test 4: UPDATE non-existent document (should fail)
  IO.println "\n4. Testing UPDATE on non-existent document:"
  let nonExistent := Doc.fromList [("test", "data")]

  match executeWrite device.data (mkUpdateQuery nonExistent 0 "dXNlcjk5OQ") with
  | WriteResult.success _ =>
    IO.println "✗ UPDATE should have failed!"
  | WriteResult.error err =>
    IO.println s!"✓ UPDATE correctly failed: {err}"

  -- Test 5: DEL operation
  IO.println "\n5. Testing DEL operation:"
  -- First add user3 to delete
  let user3 := Doc.fromList [("name", "Charlie"), ("email", "charlie@example.com")]
  match executeWrite device.data (mkSetQuery user3 0 "dXNlcjM") with
  | WriteResult.success newData =>
    device := { device with data := newData }
    IO.println "✓ Added user3"

    -- Now delete user3
    match executeWrite device.data (mkDelQuery 0 "dXNlcjM") with
    | WriteResult.success newData =>
      device := { device with data := newData }
      IO.println "✓ DEL user3 successful"
    | WriteResult.error err =>
      IO.println s!"✗ DEL failed: {err}"
  | WriteResult.error err =>
    IO.println s!"✗ Failed to add user3: {err}"

  -- Test 6: Message validation
  IO.println "\n6. Testing message validation:"
  let invalidMsg : Msg := {
    headers := {
      signature := "test-signature"
      signatureInput := "test-input"
      nonce := 0  -- Invalid nonce
      query := "[\"set\", {...}, 0, \"test\"]"
      id := processId
      contentDigest := "sha256-xyz"
    }
    body := ""
  }

  IO.println "Testing invalid nonce (0):"
  device ← device.processMessage invalidMsg

  let wrongIdMsg : Msg := {
    headers := {
      signature := "test-signature"
      signatureInput := "test-input"
      nonce := 5
      query := "[\"set\", {...}, 0, \"test\"]"
      id := "wrong-process-id"  -- Wrong process ID
      contentDigest := "sha256-xyz"
    }
    body := ""
  }

  IO.println "\nTesting wrong process ID:"
  device ← device.processMessage wrongIdMsg

  -- Display final state
  IO.println "\n7. Final database state:"
  IO.println "========================"
  match device.data.getDir 0 with
  | some dir =>
    IO.println s!"Directory 0 has {dir.docs.size} documents:"
    for (docId, doc) in dir.docs.toList do
      IO.println s!"\nDocument ID: {docId}"
      for (key, value) in doc.data.toList do
        IO.println s!"  {key}: {value}"
  | none => IO.println "No directory found"

  -- Test multi-directory operations
  IO.println "\n8. Testing multi-directory operations:"
  IO.println "======================================"

  -- Add document to directory 2 (skipping directory 1)
  let configDoc := Doc.fromList [
    ("setting", "darkMode"),
    ("value", "true")
  ]

  match executeWrite device.data (mkSetQuery configDoc 2 "Y29uZmlnMQ") with
  | WriteResult.success newData =>
    device := { device with data := newData }
    IO.println "✓ Added config to directory 2"
    IO.println s!"Total directories: {device.data.numDirs}"

    -- Check directory 1 (should be empty)
    match device.data.getDir 1 with
    | some dir =>
      IO.println s!"Directory 1 has {dir.docs.size} documents (should be 0)"
    | none =>
      IO.println "Directory 1 not found"

    -- Check directory 2
    match device.data.getDir 2 with
    | some dir =>
      IO.println s!"Directory 2 has {dir.docs.size} documents"
    | none =>
      IO.println "Directory 2 not found"
  | WriteResult.error err =>
    IO.println s!"✗ Failed to add to directory 2: {err}"

  IO.println "\n✓ All tests completed!"
