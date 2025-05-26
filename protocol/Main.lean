import Weavedb
import Weavedb.Data
import Weavedb.Types

open Weavedb.Data
open Weavedb.Types

def main : IO Unit := do
  IO.println "WeaveDB System Test"
  IO.println "==================\n"

  -- Test 1: Basic Data Operations
  IO.println "1. Testing basic data operations:"

  -- Create documents
  let userDoc := Doc.fromList [
    ("name", "Alice"),
    ("email", "alice@example.com"),
    ("role", "admin")
  ]

  let configDoc := Doc.fromList [
    ("theme", "dark"),
    ("language", "en"),
    ("notifications", "true")
  ]

  -- Create directories
  let usersDir := Dir.empty.set "user1" userDoc
  let configDir := Dir.empty.set "settings" configDoc

  -- Create data structure with directories
  let data := empty.addDir usersDir |>.addDir configDir

  IO.println s!"✓ Created {data.numDirs} directories"

  -- Test 2: Document Operations
  IO.println "\n2. Testing document operations:"

  -- Get a document
  match data.getDir 0 >>= (·.get "user1") with
  | some doc =>
    IO.println "✓ Retrieved user1:"
    for (key, value) in doc.data.toList do
      IO.println s!"  {key}: {value}"
  | none =>
    IO.println "✗ Failed to retrieve user1"

  -- Update a document
  let updatedUserDoc := Doc.fromList [
    ("name", "Alice"),
    ("email", "alice@wonderland.com"),
    ("role", "superadmin"),
    ("lastLogin", "2024-01-15")
  ]

  match data.getDir 0 with
  | some dir =>
    let updatedDir := dir.set "user1" updatedUserDoc
    let updatedData := data.updateDir 0 updatedDir
    IO.println "✓ Updated user1"

    -- Add another user
    let user2Doc := Doc.fromList [
      ("name", "Bob"),
      ("email", "bob@example.com"),
      ("role", "user")
    ]

    let dirWithBob := updatedDir.set "user2" user2Doc
    let dataWithBob := updatedData.updateDir 0 dirWithBob
    IO.println "✓ Added user2"

    -- Test 3: Upsert operation
    IO.println "\n3. Testing upsert operation:"

    let user3Doc := Doc.fromList [
      ("name", "Charlie"),
      ("email", "charlie@example.com")
    ]

    let dirWithCharlie := dirWithBob.upsert "user3" user3Doc
    let finalUsersData := dataWithBob.updateDir 0 dirWithCharlie
    IO.println "✓ Upserted user3"

    -- Update existing with upsert
    let updatedUser2 := Doc.fromList [
      ("name", "Bob"),
      ("email", "bob@newdomain.com"),
      ("role", "admin")
    ]

    let dirWithUpdatedBob := dirWithCharlie.upsert "user2" updatedUser2
    let finalData := finalUsersData.updateDir 0 dirWithUpdatedBob
    IO.println "✓ Upserted (updated) user2"

    -- Test 4: Delete operation
    IO.println "\n4. Testing delete operation:"

    let dirAfterDelete := dirWithUpdatedBob.del "user3"
    let dataAfterDelete := finalData.updateDir 0 dirAfterDelete
    IO.println "✓ Deleted user3"

    -- Test 5: List all documents
    IO.println "\n5. Final state of users directory:"
    match dataAfterDelete.getDir 0 with
    | some finalDir =>
      IO.println s!"Total users: {finalDir.docs.size}"
      for (docId, doc) in finalDir.docs.toList do
        IO.println s!"\nDocument ID: {docId}"
        for (key, value) in doc.data.toList do
          IO.println s!"  {key}: {value}"
    | none => pure ()

    -- Test 6: Working with multiple directories
    IO.println "\n6. Testing multiple directories:"

    -- Add a document to config directory
    let apiConfigDoc := Doc.fromList [
      ("endpoint", "https://api.example.com"),
      ("timeout", "30"),
      ("retries", "3")
    ]

    match dataAfterDelete.getDir 1 with
    | some cfgDir =>
      let updatedCfgDir := cfgDir.set "api" apiConfigDoc
      let multiDirData := dataAfterDelete.updateDir 1 updatedCfgDir

      IO.println "✓ Added API config to directory 1"

      -- Show all directories
      IO.println "\nAll directories:"
      for i in [0:multiDirData.numDirs] do
        match multiDirData.getDir i with
        | some dir =>
          IO.println s!"\nDirectory {i}: {dir.docs.size} documents"
          for (docId, _) in dir.docs.toList do
            IO.println s!"  - {docId}"
        | none => pure ()
    | none =>
      IO.println "✗ Config directory not found"

  | none =>
    IO.println "✗ Users directory not found"

  -- Test 7: Edge cases
  IO.println "\n7. Testing edge cases:"

  -- Try to update non-existent document
  match data.getDir 0 with
  | some dir =>
    let beforeUpdate := dir.docs.size
    let afterUpdate := dir.update "nonexistent" userDoc
    if beforeUpdate == afterUpdate.docs.size then
      IO.println "✓ Update correctly ignored non-existent document"
    else
      IO.println "✗ Update incorrectly modified directory"
  | none => pure ()

  -- Access non-existent directory
  match data.getDir 999 with
  | some _ => IO.println "✗ Should not find directory 999"
  | none => IO.println "✓ Correctly returned none for non-existent directory"

  -- Test 8: Base64url validation
  IO.println "\n8. Testing base64url validation:"

  let validIds := ["abc123", "test-doc", "user_1", "ABC-xyz_123"]
  let invalidIds := ["test doc", "user@1", "doc#1", "test/doc"]

  for id in validIds do
    if isValidBase64Url id then
      IO.println s!"✓ '{id}' is valid base64url"
    else
      IO.println s!"✗ '{id}' should be valid"

  for id in invalidIds do
    if !isValidBase64Url id then
      IO.println s!"✓ '{id}' is correctly invalid"
    else
      IO.println s!"✗ '{id}' should be invalid"

  IO.println "\n✓ All tests completed!"
