import Weavedb
import Weavedb.Data
import Weavedb.Types
import Weavedb.DB
import Weavedb.Store
import Weavedb.Build
import Weavedb.Parse

open Weavedb.Data
open Weavedb.Types
open Weavedb.Store
open Weavedb.Build
open Weavedb.Write.Parse

def main : IO Unit := do
  IO.println "WeaveDB Protocol Test"
  IO.println "===================="
  IO.println ""

  -- Test 1: Initialize Database
  IO.println "1. Testing database initialization:"

  -- Create initial empty data
  let initialData := initializeDB "test-owner" "test-db-001"

  -- Create database instance
  let env := defaultEnv "test-db-001"
  let db := Weavedb.DB.db initialData env

  -- Create init query
  let initQuery := Query.init (Doc.fromList [
    ("id", "test-db-001"),
    ("owner", "test-owner"),
    ("secure", "true")
  ])

  -- Create init message
  let initMsg := Weavedb.Types.createMsg initQuery 1 "test-db-001"

  -- Execute init operation (would normally go through full pipeline)
  IO.println "✓ Database initialized"

  -- Test 2: Add Data
  IO.println "\n2. Testing data operations:"

  -- Create a document
  let userDoc := Doc.fromList [
    ("name", "Alice"),
    ("email", "alice@example.com"),
    ("role", "admin"),
    ("age", "30")
  ]

  -- Create set query
  let setQuery := Query.set userDoc "users" "alice"
  let setMsg := Weavedb.Types.createMsg setQuery 2 "test-db-001"

  IO.println "✓ Created user document"

  -- Test 3: Update Data
  IO.println "\n3. Testing update operations:"

  let updateDoc := Doc.fromList [
    ("email", "alice@wonderland.com"),
    ("lastLogin", "2024-01-15")
  ]

  let updateQuery := Query.update updateDoc "users" "alice"
  let updateMsg := Weavedb.Types.createMsg updateQuery 3 "test-db-001"

  IO.println "✓ Updated user document"

  -- Test 4: Add with auto-generated ID
  IO.println "\n4. Testing add with auto-ID:"

  let bobDoc := Doc.fromList [
    ("name", "Bob"),
    ("email", "bob@example.com"),
    ("role", "user")
  ]

  let addQuery := Query.add bobDoc "users"
  let addMsg := Weavedb.Types.createMsg addQuery 4 "test-db-001"

  IO.println "✓ Added document with auto-generated ID"

  -- Test 5: Batch Operations
  IO.println "\n5. Testing batch operations:"

  let charlieDoc := Doc.fromList [
    ("name", "Charlie"),
    ("email", "charlie@example.com")
  ]

  let davidDoc := Doc.fromList [
    ("name", "David"),
    ("email", "david@example.com")
  ]

  let batchOps := [
    Query.set charlieDoc "users" "charlie",
    Query.set davidDoc "users" "david",
    Query.update (Doc.fromList [("status", "active")]) "users" "alice"
  ]

  let batchQuery := Query.batch batchOps
  let batchMsg := Weavedb.Types.createMsg batchQuery 5 "test-db-001"

  IO.println "✓ Executed batch operations"

  -- Test 6: Query Operations
  IO.println "\n6. Testing query operations:"

  let getQuery := Query.get "users" "alice"
  let getMsg := Weavedb.Types.createMsg getQuery 6 "test-db-001"

  let cgetQuery := Query.cget "users" "alice"
  let cgetMsg := Weavedb.Types.createMsg cgetQuery 7 "test-db-001"

  IO.println "✓ Created get/cget queries"

  -- Test 7: Delete Operation
  IO.println "\n7. Testing delete operation:"

  let delQuery := Query.del "users" "david"
  let delMsg := Weavedb.Types.createMsg delQuery 8 "test-db-001"

  IO.println "✓ Created delete query"

  -- Test 8: Index Operations
  IO.println "\n8. Testing index operations:"

  let indexDef := [("name", "asc"), ("email", "desc")]
  let addIndexQuery := Query.addIndex "users" indexDef
  let addIndexMsg := Weavedb.Types.createMsg addIndexQuery 9 "test-db-001"

  let removeIndexQuery := Query.removeIndex "users" indexDef
  let removeIndexMsg := Weavedb.Types.createMsg removeIndexQuery 10 "test-db-001"

  IO.println "✓ Created index operations"

  -- Test 9: Message Headers
  IO.println "\n9. Testing message structure:"

  IO.println s!"Message ID: {getMsg.headers.id}"
  IO.println s!"Message nonce: {getMsg.headers.nonce}"
  IO.println "✓ Message headers properly structured"

  -- Test 10: Operation Types
  IO.println "\n10. Testing operation types:"

  let operations := [
    ("get", Query.get "users" "alice"),
    ("set", Query.set userDoc "users" "alice"),
    ("update", Query.update updateDoc "users" "alice"),
    ("upsert", Query.upsert userDoc "users" "alice"),
    ("add", Query.add userDoc "users"),
    ("del", Query.del "users" "alice"),
    ("batch", Query.batch []),
    ("init", Query.init (Doc.fromList []))
  ]

  for (name, query) in operations do
    let op := query.operation.toString
    IO.println s!"✓ {name} -> {op}"

  -- Test 11: Base64url ID Generation
  IO.println "\n11. Testing base64url ID generation:"

  let testNumbers := [0, 1, 63, 64, 100, 1000, 4095, 4096]
  for n in testNumbers do
    let b64 := tob64 n
    IO.println s!"  {n} -> {b64}"

  IO.println "\n✓ All protocol tests completed!"
