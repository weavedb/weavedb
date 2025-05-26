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

/-- Get a document from a directory by name -/
def get (data : Data) (dirName : String) (docId : String) : Option Doc :=
  -- Find directory by name
  let dirIndex :=
    if dirName == "_" then some 0
    else if dirName == "_config" then some 1
    else if dirName == "_accounts" then some 2
    else if dirName == "__indexes__" then some 3
    else none  -- Could search through dir configs for custom dirs

  match dirIndex with
  | some idx =>
    match data.dirs[idx]? with
    | some dir => dir.get docId
    | none => none
  | none => none

/-- Put a document into a directory by name -/
def put (data : Data) (dirName : String) (docId : String) (doc : Doc) : Data :=
  -- Find directory by name
  let dirIndex :=
    if dirName == "_" then some 0
    else if dirName == "_config" then some 1
    else if dirName == "_accounts" then some 2
    else if dirName == "__indexes__" then some 3
    else none

  match dirIndex with
  | some idx =>
    -- Ensure directory exists
    let data' := if idx < data.dirs.size then data else
      { data with dirs := data.dirs ++ Array.replicate (idx + 1 - data.dirs.size) Dir.empty }

    match data'.dirs[idx]? with
    | some dir =>
      let dir' := dir.set docId doc
      { data' with dirs := data'.dirs.modify idx (fun _ => dir') }
    | none => data'
  | none => data

/-- Delete a document from a directory by name -/
def del (data : Data) (dirName : String) (docId : String) : Data :=
  -- Find directory by name
  let dirIndex :=
    if dirName == "_" then some 0
    else if dirName == "_config" then some 1
    else if dirName == "_accounts" then some 2
    else if dirName == "__indexes__" then some 3
    else none

  match dirIndex with
  | some idx =>
    match data.dirs[idx]? with
    | some dir =>
      let dir' := dir.del docId
      { data with dirs := data.dirs.modify idx (fun _ => dir') }
    | none => data
  | none => data

/-- Commit changes (placeholder - in JS this would persist to storage) -/
def commit (data : Data) : Data :=
  -- In a real implementation, this would persist changes
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
  commit : Unit → Data
  reset : Unit → Data

/-- Create a store from data -/
def store (kv : Data) : Store :=
  { data := kv
    get := get kv
    put := put kv
    del := del kv
    commit := fun _ => commit kv
    reset := fun _ => reset kv }

/-- Helper to get directory index by name -/
def getDirIndex (dirName : String) : Option Nat :=
  if dirName == "_" then some 0
  else if dirName == "_config" then some 1
  else if dirName == "_accounts" then some 2
  else if dirName == "__indexes__" then some 3
  else none  -- Could be extended to search custom directories

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

end Weavedb.Store
