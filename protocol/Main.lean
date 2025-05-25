import Weavedb

open Weavedb.Data

def main : IO Unit := do
  IO.println "WeaveDB NoSQL Operations Test"

  -- Create empty data structure
  let mut data := empty

  -- Create a directory
  let mut userDir := Dir.empty

  -- SET operation: Set entire documents (using base64url ids)
  let user1 := Doc.fromList [
    ("name", "Alice"),
    ("email", "alice@example.com"),
    ("role", "admin")
  ]

  userDir := userDir.set "dXNlcjE" user1  -- base64url for "user1"

  -- UPSERT operation: Insert or update entire document
  let user2 := Doc.fromList [
    ("name", "Bob"),
    ("email", "bob@example.com"),
    ("role", "user")
  ]

  userDir := userDir.upsert "dXNlcjI" user2  -- base64url for "user2"

  -- UPDATE operation: Replace entire document (only if exists)
  let updatedUser1 := Doc.fromList [
    ("name", "Alice"),
    ("email", "alice@example.com"),
    ("role", "superadmin"),
    ("lastLogin", "2024-01-15")
  ]

  userDir := userDir.update "dXNlcjE" updatedUser1
  IO.println "Updated user1 document"

  -- Add the directory to data
  data := data.addDir userDir

  -- DEL operation: Delete entire document
  match data.getDir 0 with
  | some dir0 =>
    -- First, let's add another user to delete
    let user3 := Doc.fromList [("name", "Charlie"), ("email", "charlie@example.com")]
    let dir0 := dir0.set "dXNlcjM" user3
    data := data.updateDir 0 dir0

    -- Now delete user3
    let dir0 := dir0.del "dXNlcjM"
    data := data.updateDir 0 dir0
    IO.println "Deleted user3 document"
  | none => IO.println "Directory not found"

  -- Query the data
  match data.getDir 0 with
  | some dir =>
    IO.println s!"\nDirectory 0 has {dir.docs.size} documents:"

    -- Display all documents
    for (docId, doc) in dir.docs.toList do
      IO.println s!"\nDocument ID: {docId}"
      for (key, value) in doc.data.toList do
        IO.println s!"  {key}: {value}"
  | none => IO.println "Directory not found"

  -- Example of getting a specific key from a document
  match data.getDir 0 with
  | some dir =>
    match dir.get "dXNlcjE" with
    | some doc =>
      match doc.get "role" with
      | some role => IO.println s!"\nUser1's role: {role}"
      | none => IO.println "Role key not found"
    | none => IO.println "User1 not found"
  | none => IO.println "Directory not found"

  -- Test base64url validation
  let validId := "abc-123_XYZ"
  let invalidId := "abc+123/XYZ="
  IO.println s!"\n'{validId}' is valid base64url: {isValidBase64Url validId}"
  IO.println s!"'{invalidId}' is valid base64url: {isValidBase64Url invalidId}"
