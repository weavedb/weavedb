import Weavedb.Types
import Weavedb.Data

namespace Weavedb.Write.Write

open Weavedb.Types
open Weavedb.Data

/-- Validate data against directory schema -/
def validateSchema : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.doc with
  | none, _ => WriteResult.error "No directory in state"
  | _, none => WriteResult.error "No document data in state"
  | some dirIdx, some data =>
    -- Get directory metadata from system directory
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx
      match sysDir.get dirName with
      | none => WriteResult.ok ctx  -- No directory metadata means no schema
      | some dirMeta =>
        -- Get schema from directory metadata
        match dirMeta.get "schema" with
        | none => WriteResult.ok ctx  -- No schema means any data is valid
        | some schemaStr =>
          -- In practice would validate against JSON Schema
          -- For now, just ensure data is not empty
          if data.data.isEmpty then
            WriteResult.error "invalid schema"
          else
            WriteResult.ok ctx

/-- Add index for a directory -/
def addIndex : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.parsedQuery with
  | none, _ => WriteResult.error "No directory in state"
  | _, none => WriteResult.error "No query in state"
  | some dirIdx, some query =>
    match query with
    | Query.addIndex _ indexDef =>
      -- In practice, would update indexing structures in __indexes__ directory
      -- For now, just verify directory exists
      match ctx.data.dirs[0]? with
      | none => WriteResult.error "System directory not found"
      | some sysDir =>
        let dirName := toString dirIdx
        match sysDir.get dirName with
        | none => WriteResult.error s!"dir doesn't exist: {dirName}"
        | some _ =>
          -- Would update index structures in __indexes__ directory
          -- Key would be: __indexes__/{dir}/{indexName}
          WriteResult.ok ctx
    | _ => WriteResult.error "Invalid query for addIndex"

/-- Remove index for a directory -/
def removeIndex : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.parsedQuery with
  | none, _ => WriteResult.error "No directory in state"
  | _, none => WriteResult.error "No query in state"
  | some dirIdx, some query =>
    match query with
    | Query.removeIndex _ indexDef =>
      -- In practice, would remove indexing structures from __indexes__ directory
      WriteResult.ok ctx
    | _ => WriteResult.error "Invalid query for removeIndex"

/-- Put data into the database -/
def putData : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.docId, ctx.state.doc with
  | none, _, _ => WriteResult.error "No directory in state"
  | _, none, _ => WriteResult.error "No document ID in state"
  | _, _, none => WriteResult.error "No document data in state"
  | some dirIdx, some docId, some data =>
    -- Verify directory exists in metadata
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx
      match sysDir.get dirName with
      | none => WriteResult.error "dir doesn't exist"
      | some _ =>
        -- Ensure directory array is large enough
        let dataWithDir := if ctx.data.dirs.size <= dirIdx then
          ctx.data.setDir dirIdx Dir.empty
        else
          ctx.data

        -- Get directory
        match dataWithDir.dirs[dirIdx]? with
        | none => WriteResult.error "Failed to access directory"
        | some dirData =>
          -- Add/update document in directory
          let newDir := dirData.set docId data
          let newDirs := dataWithDir.dirs.modify dirIdx (fun _ => newDir)
          let newData := { dataWithDir with dirs := newDirs }

          -- In JS, this also updates indexes via put() from indexer.js
          WriteResult.ok { ctx with data := newData }

/-- Delete data from the database -/
def delData : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.docId with
  | none, _ => WriteResult.error "No directory in state"
  | _, none => WriteResult.error "No document ID in state"
  | some dirIdx, some docId =>
    -- Verify directory exists
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx
      match sysDir.get dirName with
      | none => WriteResult.error "dir doesn't exist"
      | some _ =>
        -- Get directory data
        match ctx.data.dirs[dirIdx]? with
        | none => WriteResult.ok ctx  -- Directory doesn't exist, nothing to delete
        | some dirData =>
          -- Remove document from directory
          let newDir := dirData.del docId
          let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
          let newData := { ctx.data with dirs := newDirs }

          -- In JS, this also updates indexes via del() from indexer.js
          WriteResult.ok { ctx with data := newData }

/-- Initialize database -/
def initDB : WriteM := fun ctx =>
  match ctx.state.parsedQuery with
  | none => WriteResult.error "No query in state"
  | some (Query.init config) =>
    -- Extract configuration from init query
    let dbId := config.get "id" |>.getD ctx.env.processId
    let owner := config.get "owner" |>.getD ""
    let secure := config.get "secure" |>.getD "false"

    -- Create initial config document
    let configDoc := Doc.fromList [
      ("id", dbId),
      ("owner", owner),
      ("secure", secure),
      ("version", "1.0.0")
    ]

    -- Create info document with dbId and owner
    let infoDoc := Doc.fromList [
      ("id", dbId),
      ("owner", owner)
    ]

    -- Create system directory with both documents
    let sysDir := Dir.empty
      |>.set "config" configDoc
      |>.set "info" infoDoc

    -- Initialize data with system directory at index 0
    let newData := { dirs := #[sysDir] }
    let newState := { ctx.state with isInitialized := true }

    WriteResult.ok { ctx with data := newData, state := newState }
  | _ => WriteResult.error "Invalid query for init"

/-- Process batch operations -/
def batch : WriteM := fun ctx =>
  match ctx.state.parsedQuery with
  | some (Query.batch ops) =>
    -- In JS, this recursively processes each operation
    -- For simplicity, we'll just validate that it's a batch
    -- In practice, would need to process each op through the pipeline
    WriteResult.ok ctx
  | _ => WriteResult.error "Invalid query for batch"

/-- Helper to chain WriteM operations with tap (execute but keep original context) -/
def tap (f : WriteM) : WriteM := fun ctx =>
  match f ctx with
  | WriteResult.error e => WriteResult.error e
  | WriteResult.ok _ => WriteResult.ok ctx  -- Return original context

/-- Helper to chain WriteM operations -/
def bind : WriteResult Context → (Context → WriteResult Context) → WriteResult Context
  | WriteResult.ok x, f => f x
  | WriteResult.error e, _ => WriteResult.error e

/-- Operation handlers map -/
def getWriter (opcode : String) : Option WriteM :=
  match opcode with
  | "init" => some initDB
  | "set" => some (fun ctx => bind (tap validateSchema ctx) putData)
  | "add" => some (fun ctx => bind (tap validateSchema ctx) putData)
  | "upsert" => some (fun ctx => bind (tap validateSchema ctx) putData)
  | "update" => some (fun ctx => bind (tap validateSchema ctx) putData)
  | "del" => some delData
  | "addIndex" => some addIndex
  | "removeIndex" => some removeIndex
  | "batch" => some batch
  | _ => none

/-- Main write function -/
def write : WriteM := fun ctx =>
  match ctx.state.op with
  | none => WriteResult.error "No operation in state"
  | some op =>
    match getWriter op with
    | none => WriteResult.error s!"Unknown operation: {op}"
    | some writer =>
      -- Execute the writer
      match writer ctx with
      | WriteResult.error e => WriteResult.error e
      | WriteResult.ok ctx' =>
        -- In JS, commit happens here unless no_commit is true
        -- For now, just return the context
        WriteResult.ok ctx'

end Weavedb.Write.Write
