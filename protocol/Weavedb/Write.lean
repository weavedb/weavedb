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
      | none => WriteResult.error s!"dir doesn't exist: {dirName}"
      | some dirMeta =>
        -- Get schema from directory metadata
        match dirMeta.get "schema" with
        | none => WriteResult.ok ctx  -- No schema means any data is valid
        | some _ =>
          -- Simplified validation - in practice would use proper JSON Schema validator
          -- For now, just check that data is not empty
          if data.data.isEmpty then
            WriteResult.error "invalid schema"
          else
            WriteResult.ok ctx

/-- Add index for a directory -/
def addIndex : WriteM := fun ctx =>
  match ctx.state.dirIndex with
  | none => WriteResult.error "No directory in state"
  | some dirIdx =>
    -- In practice, would update indexing structures
    -- For now, just verify directory exists
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx
      if (sysDir.get dirName).isNone then
        WriteResult.error s!"dir doesn't exist: {dirName}"
      else
        -- Would update index structures here
        WriteResult.ok ctx

/-- Remove index for a directory -/
def removeIndex : WriteM := fun ctx =>
  match ctx.state.dirIndex with
  | none => WriteResult.error "No directory in state"
  | some _ =>
    -- In practice, would remove indexing structures
    WriteResult.ok ctx

/-- Put data into the database -/
def putData : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.docId, ctx.state.doc with
  | none, _, _ => WriteResult.error "No directory in state"
  | _, none, _ => WriteResult.error "No document ID in state"
  | _, _, none => WriteResult.error "No document data in state"
  | some dirIdx, some docId, some data =>
    -- Verify directory exists
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx
      if (sysDir.get dirName).isNone then
        WriteResult.error "dir doesn't exist"
      else
        -- Get or create directory data
        let dirData := ctx.data.dirs[dirIdx]?.getD Dir.empty

        -- Add document to directory
        let newDir := dirData.set docId data
        let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)

        let newData := { ctx.data with dirs := newDirs }
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
      if (sysDir.get dirName).isNone then
        WriteResult.error "dir doesn't exist"
      else
        -- Get directory data
        match ctx.data.dirs[dirIdx]? with
        | none => WriteResult.error "Directory not found"
        | some dirData =>
          -- Check if document exists
          match dirData.get docId with
          | none => WriteResult.error "Document not found"
          | some _ =>
            -- Remove document from directory
            let newDir := { docs := dirData.docs.erase docId }
            let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
            let newData := { ctx.data with dirs := newDirs }
            WriteResult.ok { ctx with data := newData }

/-- Initialize database -/
def initDB : WriteM := fun ctx =>
  -- Check if already initialized
  if ctx.state.isInitialized then
    WriteResult.error "Database already initialized"
  else
    -- Create system directory with initial config
    let configDoc := Doc.fromList [
      ("dbId", ctx.env.processId),
      ("owner", ctx.env.owner.getD ""),
      ("version", "1.0.0")
    ]

    -- Create system directory
    let sysDir : Dir := Dir.empty.set "_config" configDoc

    -- Initialize data with system directory
    let newData := { dirs := #[sysDir] }
    let newState := { ctx.state with isInitialized := true }

    WriteResult.ok { ctx with data := newData, state := newState }

/-- Process batch operations -/
def batch : WriteM := fun ctx =>
  match ctx.state.query with
  | none => WriteResult.error "No query in state"
  | some _ =>
    -- In practice, would parse query array and process each operation
    -- For now, just return success
    WriteResult.ok ctx

/-- Helper to chain WriteM operations -/
def bind : WriteResult Context → (Context → WriteResult Context) → WriteResult Context
  | WriteResult.ok x, f => f x
  | WriteResult.error e, _ => WriteResult.error e

/-- Operation handlers map -/
def getWriter (opcode : String) : Option WriteM :=
  match opcode with
  | "init" => some initDB
  | "set" => some (fun ctx => bind (validateSchema ctx) putData)
  | "add" => some (fun ctx => bind (validateSchema ctx) putData)
  | "upsert" => some (fun ctx => bind (validateSchema ctx) putData)
  | "update" => some (fun ctx => bind (validateSchema ctx) putData)
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
    | some writer => writer ctx

/-- Commit changes (simplified) -/
def commit : WriteM := fun ctx =>
  -- In a real implementation, this would:
  -- 1. Serialize the data changes
  -- 2. Update any indexes
  -- 3. Persist to storage
  -- 4. Return transaction receipt

  -- For now, just mark as successful
  WriteResult.ok ctx

/-- Main entry point for set operations -/
def set : WriteM := fun ctx =>
  -- Run the write operation
  match write ctx with
  | WriteResult.error e => WriteResult.error e
  | WriteResult.ok ctx' =>
    -- Commit unless no_commit flag is set
    -- (In practice, would check env.no_commit)
    commit ctx'

end Weavedb.Write.Write
