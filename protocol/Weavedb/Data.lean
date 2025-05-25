import Std.Data.HashMap

namespace Weavedb.Data

/-- A document ID is a base64url string -/
abbrev DocId := String

/-- A document is a HashMap of String to String (simplified JSON-like structure) -/
structure Doc where
  data : Std.HashMap String String
  deriving Inhabited

/-- A directory contains documents indexed by their DocId -/
structure Dir where
  docs : Std.HashMap DocId Doc
  deriving Inhabited

/-- The main data structure is an array of directories -/
structure Data where
  dirs : Array Dir
  deriving Inhabited

/-- Create an empty Data structure -/
def empty : Data :=
  { dirs := #[] }

/-- Create an empty Doc -/
def Doc.empty : Doc :=
  { data := {} }

/-- Create a Doc from key-value pairs -/
def Doc.fromList (pairs : List (String × String)) : Doc :=
  { data := Std.HashMap.ofList pairs }

/-- Create an empty Dir -/
def Dir.empty : Dir :=
  { docs := {} }

/-- Get a key from a document -/
def Doc.get (doc : Doc) (key : String) : Option String :=
  doc.data[key]?

/-- Get all keys from a document -/
def Doc.keys (doc : Doc) : List String :=
  doc.data.toList.map (·.1)

/-- Set a document in a directory (overwrites entire doc if exists) -/
def Dir.set (dir : Dir) (docId : DocId) (doc : Doc) : Dir :=
  { docs := dir.docs.insert docId doc }

/-- Update a document in a directory (only if docId exists, replaces entire doc) -/
def Dir.update (dir : Dir) (docId : DocId) (doc : Doc) : Dir :=
  if dir.docs.contains docId then
    { docs := dir.docs.insert docId doc }
  else
    dir

/-- Upsert a document in a directory (update if exists, insert if not) -/
def Dir.upsert (dir : Dir) (docId : DocId) (doc : Doc) : Dir :=
  { docs := dir.docs.insert docId doc }

/-- Get a document from a directory -/
def Dir.get (dir : Dir) (docId : DocId) : Option Doc :=
  dir.docs[docId]?

/-- Delete a document from a directory -/
def Dir.del (dir : Dir) (docId : DocId) : Dir :=
  { docs := dir.docs.erase docId }

/-- Add a new directory to Data -/
def Data.addDir (data : Data) (dir : Dir) : Data :=
  { dirs := data.dirs.push dir }

/-- Get a directory by index -/
def Data.getDir (data : Data) (index : Nat) : Option Dir :=
  data.dirs[index]?

/-- Set a directory at a specific index (overwrites if exists, extends array if needed) -/
def Data.setDir (data : Data) (index : Nat) (dir : Dir) : Data :=
  let currentSize := data.dirs.size
  if index < currentSize then
    -- Use modify to update at index
    { dirs := data.dirs.modify index (fun _ => dir) }
  else
    -- Extend array with empty dirs if needed
    let padding := Array.replicate (index - currentSize) Dir.empty
    { dirs := (data.dirs ++ padding).push dir }

/-- Update a directory at a specific index (only if index exists) -/
def Data.updateDir (data : Data) (index : Nat) (dir : Dir) : Data :=
  if index < data.dirs.size then
    { dirs := data.dirs.modify index (fun _ => dir) }
  else
    data

/-- Get the number of directories -/
def Data.numDirs (data : Data) : Nat :=
  data.dirs.size

/-- Helper to check if a string is valid base64url -/
def isValidBase64Url (s : String) : Bool :=
  s.all fun c => c.isAlphanum || c == '-' || c == '_'

end Weavedb.Data
