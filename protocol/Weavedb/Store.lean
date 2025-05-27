import Weavedb.Data
import Weavedb.Types

namespace Weavedb.Store

open Weavedb.Data
open Weavedb.Types

/- Store operations wrapper
    JS: const store = kv => {
      const get = (dir, doc) => _kv.get(`${dir}/${doc}`)
      const put = (dir, doc, data) => _kv.put(`${dir}/${doc}`, data)
      const del = (dir, doc) => _kv.del(`${dir}/${doc}`)
      const commit = (...params) => _kv.commit(...params)
      const reset = (...params) => _kv.reset(...params)
      return { ..._kv, get, put, del, commit, reset }
    }
-/

/-- Standard directory indices -/
def SYSTEM_DIR : Nat := 0        -- "_" - system directory
def CONFIG_DIR : Nat := 1        -- "_config" - configuration
def ACCOUNTS_DIR : Nat := 2      -- "__accounts__" - accounts
def INDEXES_DIR : Nat := 3       -- "__indexes__" - indexes

/-- Get directory index by name -/
def getDirIndex (data : Data) (dirName : String) : Option Nat :=
  -- Check standard directories first
  if dirName == "_" then some SYSTEM_DIR
  else if dirName == "_config" then some CONFIG_DIR
  else if dirName == "__accounts__" then some ACCOUNTS_DIR
  else if dirName == "__indexes__" then some INDEXES_DIR
  else
    -- Search in system directory for user-defined directories
    match data.dirs[SYSTEM_DIR]? with
    | none => none
    | some sysDir =>
      -- Check if dirName exists as a key in system directory
      match sysDir.get dirName with
      | none => none
      | some _ => dirName.toNat?  -- Try to parse as number for user directories

/-- Get a document from a directory by name -/
def get (data : Data) (dirName : String) (docId : String) : Option Doc :=
  match getDirIndex data dirName with
  | none => none
  | some idx =>
    match data.dirs[idx]? with
    | none => none
    | some dir => dir.get docId

/-- Put a document into a directory by name -/
def put (data : Data) (dirName : String) (docId : String) (doc : Doc) : Data :=
  match getDirIndex data dirName with
  | none => data  -- Directory not found
  | some idx =>
    -- Ensure directory array is large enough
    let data' := if idx >= data.dirs.size then
      data.setDir idx Dir.empty
    else
      data

    match data'.dirs[idx]? with
    | none => data'  -- Should not happen after setDir
    | some dir =>
      let newDir := dir.set docId doc
      { data' with dirs := data'.dirs.modify idx (fun _ => newDir) }

/-- Delete a document from a directory by name -/
def del (data : Data) (dirName : String) (docId : String) : Data :=
  match getDirIndex data dirName with
  | none => data  -- Directory not found
  | some idx =>
    match data.dirs[idx]? with
    | none => data  -- Directory doesn't exist
    | some dir =>
      let newDir := dir.del docId
      { data with dirs := data.dirs.modify idx (fun _ => newDir) }

/-- Commit changes (placeholder - in JS this would persist to storage) -/
def commit (data : Data) (msg : Option Msg := none) (receipt : Option String := none) (state : Option State := none) : Data :=
  -- In a real implementation, this would:
  -- 1. Persist changes to storage
  -- 2. Generate a transaction receipt
  -- 3. Clear any pending changes
  -- For now, just return the data unchanged
  data

/-- Reset changes (placeholder - in JS this would rollback changes) -/
def reset (data : Data) : Data :=
  -- In a real implementation, this would rollback to last commit
  -- For now, just return the data unchanged
  data

/-- Store structure that wraps data with operations -/
structure Store where
  data : Data
  get : String → String → Option Doc
  put : String → String → Doc → Data
  del : String → String → Data
  commit : Option Msg → Option String → Option State → Data
  reset : Unit → Data

/-- Create a store from data -/
def store (kv : Data) : Store :=
  { data := kv
    get := get kv
    put := put kv
    del := del kv
    commit := fun msg receipt state => commit kv msg receipt state
    reset := fun _ => reset kv }

/-- Get a document using path notation "dir/doc" -/
def getPath (data : Data) (path : String) : Option Doc :=
  match path.splitOn "/" with
  | [dirName, docId] => get data dirName docId
  | _ => none

/-- Put a document using path notation "dir/doc" -/
def putPath (data : Data) (path : String) (doc : Doc) : Data :=
  match path.splitOn "/" with
  | [dirName, docId] => put data dirName docId doc
  | _ => data

/-- Delete a document using path notation "dir/doc" -/
def delPath (data : Data) (path : String) : Data :=
  match path.splitOn "/" with
  | [dirName, docId] => del data dirName docId
  | _ => data

/-- Helper to create initial database structure -/
def initializeDB (owner : String := "") (processId : String := "default") : Data :=
  -- Create system directory
  let sysDir := Dir.empty

  -- Create config directory with initial config and info
  let configDoc := Doc.fromList [
    ("id", processId),
    ("owner", owner),
    ("secure", "false"),
    ("version", "1.0.0")
  ]

  let infoDoc := Doc.fromList [
    ("id", processId),
    ("owner", owner)
  ]

  let configDir := Dir.empty
    |>.set "config" configDoc
    |>.set "info" infoDoc

  -- Create empty accounts and indexes directories
  let accountsDir := Dir.empty
  let indexesDir := Dir.empty

  -- Return initial data structure
  { dirs := #[sysDir, configDir, accountsDir, indexesDir] }

end Weavedb.Store
