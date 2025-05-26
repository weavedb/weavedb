import Weavedb.Types
import Weavedb.Data

namespace Weavedb.Write.Parse

open Weavedb.Types
open Weavedb.Data

/-- Base64url characters -/
def BASE64_CHARS : String :=
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

/-- Convert number to base64url -/
def tob64 (n : Nat) : String :=
  if n == 0 then BASE64_CHARS.get ⟨0⟩ |>.toString
  else
    let rec loop (n : Nat) (acc : String) : String :=
      if h : n = 0 then acc
      else
        let c := BASE64_CHARS.get ⟨n % 64⟩
        have : n / 64 < n := Nat.div_lt_self (Nat.zero_lt_of_ne_zero h) (by decide : 1 < 64)
        loop (n / 64) (c.toString ++ acc)
    termination_by n
    loop n ""

/-- Check if document ID is valid base64url -/
def checkDocID (id : String) : Bool :=
  id.all fun c =>
    c.isAlphanum || c == '-' || c == '_'

/-- Generate auto-incrementing document ID -/
def genDocID : WriteM := fun ctx =>
  match ctx.state.dirIndex with
  | none => WriteResult.error "No directory index in state"
  | some dirIdx =>
    -- Get directory metadata from "_" directory
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx  -- Simplified - should map to actual dir name
      match sysDir.get dirName with
      | none =>
        -- Directory doesn't exist in metadata
        WriteResult.error s!"dir doesn't exist: {dirName}"
      | some dirMeta =>
        -- Get current autoid
        let autoid := match dirMeta.get "autoid" with
          | none => 0
          | some id => id.toNat?.getD 0

        -- Find next available ID
        let nextId := match ctx.data.dirs[dirIdx]? with
          | none => autoid + 1
          | some dir =>
            let rec findNextId (i : Nat) (fuel : Nat) : Nat :=
              if h : fuel = 0 then i  -- Limit iterations
              else
                let docId := tob64 i
                if dir.docs.contains docId then
                  have : fuel - 1 < fuel := Nat.sub_lt (Nat.zero_lt_of_ne_zero h) (by decide : 0 < 1)
                  findNextId (i + 1) (fuel - 1)
                else i
            termination_by fuel
            findNextId (autoid + 1) 1000  -- Max 1000 iterations

        let docId := tob64 nextId

        -- Update directory metadata with new autoid
        let newDirMeta := Doc.fromList (("autoid", toString nextId) ::
          dirMeta.data.toList.filter (fun (k, _) => k != "autoid"))
        let newSysDir := sysDir.set dirName newDirMeta
        let newDirs := ctx.data.dirs.modify 0 (fun _ => newSysDir)
        let newData := { ctx.data with dirs := newDirs }

        -- Update state with generated doc ID
        let newState := { ctx.state with docId := some docId }

        WriteResult.ok { ctx with data := newData, state := newState }

/-- Merge data with special variable substitutions -/
def mergeData (data : Doc) (_state : State) (old : Option Doc) (_env : Env) : Doc :=
  -- Simplified version - in practice would handle:
  -- 1. _$ variable substitutions (signer, ts, id, owner)
  -- 2. _$ operations like "del"
  -- 3. fpjson expressions

  -- For now, just merge with old data if it exists
  match old with
  | none => data
  | some oldDoc =>
    -- Merge new data over old data
    let merged := oldDoc.data.toList.filter (fun (k, _) =>
      not (data.data.contains k))
    Doc.fromList (data.data.toList ++ merged)

/-- Set data for a document -/
def setData : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.doc with
  | none, _ => WriteResult.error "No directory in state"
  | _, none => WriteResult.error "No document data in state"
  | some dirIdx, some data =>
    -- Check if directory exists in metadata
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx
      if sysDir.get dirName |>.isNone then
        WriteResult.error s!"dir doesn't exist: {dirName}"
      else
        -- Merge data with empty old data
        let mergedData := mergeData data ctx.state none ctx.env
        let newState := { ctx.state with doc := some mergedData }
        WriteResult.ok { ctx with state := newState }

/-- Update existing data -/
def updateData : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.docId, ctx.state.doc with
  | none, _, _ => WriteResult.error "No directory in state"
  | _, none, _ => WriteResult.error "No document ID in state"
  | _, _, none => WriteResult.error "No document data in state"
  | some dirIdx, some docId, some data =>
    -- Get existing document
    match ctx.data.dirs[dirIdx]? with
    | none => WriteResult.error "Directory not found"
    | some dir =>
      match dir.get docId with
      | none => WriteResult.error "data doesn't exist"
      | some oldDoc =>
        -- Merge new data with old data
        let mergedData := mergeData data ctx.state (some oldDoc) ctx.env
        let newState := { ctx.state with doc := some mergedData }
        WriteResult.ok { ctx with state := newState }

/-- Upsert data (update if exists, insert if not) -/
def upsertData : WriteM := fun ctx =>
  match ctx.state.dirIndex, ctx.state.docId, ctx.state.doc with
  | none, _, _ => WriteResult.error "No directory in state"
  | _, none, _ => WriteResult.error "No document ID in state"
  | _, _, none => WriteResult.error "No document data in state"
  | some dirIdx, some docId, some data =>
    -- Check if directory exists
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx
      if sysDir.get dirName |>.isNone then
        WriteResult.error s!"dir doesn't exist: {dirName}"
      else
        -- Get existing document if it exists
        let oldDoc := match ctx.data.dirs[dirIdx]? with
          | none => none
          | some dir => dir.get docId

        -- Merge data
        let mergedData := mergeData data ctx.state oldDoc ctx.env
        let newState := { ctx.state with doc := some mergedData }
        WriteResult.ok { ctx with state := newState }

/-- Parse operation and extract parameters -/
def parse : WriteM := fun ctx =>
  match ctx.state.op, ctx.state.query with
  | none, _ => WriteResult.error "No operation in state"
  | _, none => WriteResult.error "No query in state"
  | some op, some _queryStr =>
    -- Parse query array (simplified - would use proper JSON parser)
    -- Expected formats:
    -- ["op", data, dir, doc] for set/update/upsert
    -- ["op", dir, doc] for get/del
    -- ["op", data, dir] for add

    if op == "get" || op == "cget" then
      -- Parse: [dir, doc]
      let state' := { ctx.state with
        dirIndex := some 0  -- Simplified - would parse from query
        docId := some "doc1"  -- Simplified - would parse from query
      }
      WriteResult.ok { ctx with state := state' }

    else if op == "del" then
      -- Parse: [dir, doc]
      let dirIdx := 0  -- Simplified
      let docId := "doc1"  -- Simplified

      -- Check doc ID validity
      if !checkDocID docId then
        WriteResult.error s!"invalid docID: {docId}"
      else
        -- Get existing document for "before" state
        let before := match ctx.data.dirs[dirIdx]? with
          | none => none
          | some dir => dir.get docId

        let state' := { ctx.state with
          dirIndex := some dirIdx
          docId := some docId
          doc := before  -- Store old data in doc field
        }
        WriteResult.ok { ctx with state := state' }

    else if op == "add" then
      -- Parse: [data, dir]
      let data := Doc.fromList [("field", "value")]  -- Simplified
      let dirIdx := 0  -- Simplified

      let state' := { ctx.state with
        dirIndex := some dirIdx
        doc := some data
      }

      -- Chain to genDocID and setData
      match genDocID { ctx with state := state' } with
      | WriteResult.error e => WriteResult.error e
      | WriteResult.ok ctx' => setData ctx'

    else if op == "set" then
      -- Parse: [data, dir, doc]
      let data := Doc.fromList [("field", "value")]  -- Simplified
      let dirIdx := 0  -- Simplified
      let docId := "doc1"  -- Simplified

      if !checkDocID docId then
        WriteResult.error s!"invalid docID: {docId}"
      else
        let state' := { ctx.state with
          dirIndex := some dirIdx
          docId := some docId
          doc := some data
        }
        setData { ctx with state := state' }

    else if op == "update" then
      -- Similar to set but requires existing doc
      let data := Doc.fromList [("field", "value")]  -- Simplified
      let dirIdx := 0  -- Simplified
      let docId := "doc1"  -- Simplified

      if !checkDocID docId then
        WriteResult.error s!"invalid docID: {docId}"
      else
        -- Get existing document (stored in state by updateData)
        let state' := { ctx.state with
          dirIndex := some dirIdx
          docId := some docId
          doc := some data
        }
        updateData { ctx with state := state' }

    else if op == "upsert" then
      -- Parse: [data, dir, doc]
      let data := Doc.fromList [("field", "value")]  -- Simplified
      let dirIdx := 0  -- Simplified
      let docId := "doc1"  -- Simplified

      if !checkDocID docId then
        WriteResult.error s!"invalid docID: {docId}"
      else
        let state' := { ctx.state with
          dirIndex := some dirIdx
          docId := some docId
          doc := some data
        }
        upsertData { ctx with state := state' }

    else
      WriteResult.error s!"Unknown operation: {op}"

end Weavedb.Write.Parse
