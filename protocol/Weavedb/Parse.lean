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
      let dirName := toString dirIdx
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
def mergeData (data : Doc) (state : State) (old : Option Doc) (env : Env) : Doc :=
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
      match sysDir.get dirName with
      | none => WriteResult.error s!"dir doesn't exist: {dirName}"
      | some _ =>
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
      match sysDir.get dirName with
      | none => WriteResult.error s!"dir doesn't exist: {dirName}"
      | some _ =>
        -- Get existing document if it exists
        let oldDoc := match ctx.data.dirs[dirIdx]? with
          | none => none
          | some dir => dir.get docId

        -- Merge data
        let mergedData := mergeData data ctx.state oldDoc ctx.env
        let newState := { ctx.state with doc := some mergedData }
        WriteResult.ok { ctx with state := newState }

/-- Get directory index from name -/
def getDirIndex (dirName : String) : Option Nat :=
  -- Map directory names to indices
  -- In practice, would look up in directory configuration
  if dirName == "_" then some 0
  else if dirName == "_config" then some 1
  else if dirName == "_accounts" then some 2
  else if dirName == "__indexes__" then some 3
  else dirName.toNat?  -- Try to parse as number for user directories

/-- Parse operation and extract parameters from typed Query -/
def parse : WriteM := fun ctx =>
  match ctx.state.parsedQuery with
  | none => WriteResult.error "No query in state"
  | some query =>
    match query with
    | Query.get dir doc =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        let state' := { ctx.state with
          dirIndex := some dirIdx
          docId := some doc
        }
        WriteResult.ok { ctx with state := state' }

    | Query.cget dir doc =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        let state' := { ctx.state with
          dirIndex := some dirIdx
          docId := some doc
        }
        WriteResult.ok { ctx with state := state' }

    | Query.del dir doc =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        -- Check doc ID validity
        if !checkDocID doc then
          WriteResult.error s!"invalid docID: {doc}"
        else
          -- Get existing document for "before" state
          let before := match ctx.data.dirs[dirIdx]? with
            | none => none
            | some d => d.get doc

          let state' := { ctx.state with
            dirIndex := some dirIdx
            docId := some doc
            doc := before  -- Store old data in doc field for reference
            -- Note: State doesn't have 'before' field in current definition
          }
          WriteResult.ok { ctx with state := state' }

    | Query.add data dir =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        let state' := { ctx.state with
          dirIndex := some dirIdx
          doc := some data
        }
        -- Chain to genDocID and setData
        match genDocID { ctx with state := state' } with
        | WriteResult.error e => WriteResult.error e
        | WriteResult.ok ctx' => setData ctx'

    | Query.set data dir doc =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        if !checkDocID doc then
          WriteResult.error s!"invalid docID: {doc}"
        else
          let state' := { ctx.state with
            dirIndex := some dirIdx
            docId := some doc
            doc := some data
          }
          setData { ctx with state := state' }

    | Query.update data dir doc =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        if !checkDocID doc then
          WriteResult.error s!"invalid docID: {doc}"
        else
          let state' := { ctx.state with
            dirIndex := some dirIdx
            docId := some doc
            doc := some data
          }
          updateData { ctx with state := state' }

    | Query.upsert data dir doc =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        if !checkDocID doc then
          WriteResult.error s!"invalid docID: {doc}"
        else
          let state' := { ctx.state with
            dirIndex := some dirIdx
            docId := some doc
            doc := some data
          }
          upsertData { ctx with state := state' }

    | Query.batch ops =>
      -- For batch operations, would need to process each operation
      -- For now, just return success
      WriteResult.ok ctx

    | Query.addIndex dir index =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        let state' := { ctx.state with
          dirIndex := some dirIdx
          -- Would store index configuration somewhere
        }
        WriteResult.ok { ctx with state := state' }

    | Query.removeIndex dir index =>
      match getDirIndex dir with
      | none => WriteResult.error s!"Invalid directory: {dir}"
      | some dirIdx =>
        let state' := { ctx.state with
          dirIndex := some dirIdx
          -- Would remove index configuration
        }
        WriteResult.ok { ctx with state := state' }

    | Query.init config =>
      -- Init operation - would initialize database with config
      let state' := { ctx.state with
        doc := some config  -- Store config in doc field
      }
      WriteResult.ok { ctx with state := state' }

end Weavedb.Write.Parse
