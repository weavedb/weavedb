import Weavedb.Data
import Std.Data.HashMap

namespace Weavedb.Types

open Weavedb.Data

/-- Query operation type -/
inductive Operation where
  | get
  | cget
  | set
  | add
  | update
  | upsert
  | del
  | batch
  | addIndex
  | removeIndex
  | init
  deriving Inhabited, BEq

/-- Convert operation to string -/
def Operation.toString : Operation → String
  | .get => "get"
  | .cget => "cget"
  | .set => "set"
  | .add => "add"
  | .update => "update"
  | .upsert => "upsert"
  | .del => "del"
  | .batch => "batch"
  | .addIndex => "addIndex"
  | .removeIndex => "removeIndex"
  | .init => "init"

/-- Query type representing the parsed query -/
inductive Query where
  | get (dir : String) (doc : String)
  | cget (dir : String) (doc : String)
  | set (data : Doc) (dir : String) (doc : String)
  | add (data : Doc) (dir : String)
  | update (data : Doc) (dir : String) (doc : String)
  | upsert (data : Doc) (dir : String) (doc : String)
  | del (dir : String) (doc : String)
  | batch (ops : List Query)
  | addIndex (dir : String) (index : List (String × String))
  | removeIndex (dir : String) (index : List (String × String))
  | init (config : Doc)
  deriving Inhabited

/-- Extract operation from query -/
def Query.operation : Query → Operation
  | .get _ _ => .get
  | .cget _ _ => .cget
  | .set _ _ _ => .set
  | .add _ _ => .add
  | .update _ _ _ => .update
  | .upsert _ _ _ => .upsert
  | .del _ _ => .del
  | .batch _ => .batch
  | .addIndex _ _ => .addIndex
  | .removeIndex _ _ => .removeIndex
  | .init _ => .init

/-- Directory configuration -/
structure DirConfig where
  name : String  -- base64url
  auth : List String := []  -- Auth rules
  schema : String := "{}"   -- JSON Schema
  deriving Inhabited

/-- HTTP headers for WeaveDB messages -/
structure Headers where
  signature : String
  signatureInput : String
  nonce : Nat
  id : String     -- base64url database process id
  contentDigest : String
  deriving Inhabited

/-- HTTP message structure -/
structure Msg where
  headers : Headers
  body : String
  parsedQuery : Query  -- The query is already parsed
  deriving Inhabited

/-- Mutable state during write processing -/
structure State where
  -- Add fields as needed by devices
  nonce : Option Nat := none
  parsedQuery : Option Query := none
  op : Option String := none
  dirIndex : Option Nat := none
  docId : Option String := none
  doc : Option Doc := none
  address : Option String := none
  keyId : Option String := none
  isInitialized : Bool := false
  deriving Inhabited

/-- Environment (built by init, then immutable) -/
structure Env where
  -- From opt (original environment)
  processId : String
  dirConfigs : Array DirConfig := #[]

  -- From kv.get("_config", "info")
  dbId : Option String := none
  owner : Option String := none

  -- kv reference is in Context.data
  deriving Inhabited

/-- Context for write operations -/
structure Context where
  state : State
  msg : Msg
  env : Env
  data : Data  -- This is 'kv' in JavaScript
  deriving Inhabited

/-- Write operation result -/
inductive WriteResult (α : Type) where
  | ok : α → WriteResult α
  | error : String → WriteResult α
  deriving Inhabited

/-- The Write monad type -/
def WriteM := Context → WriteResult Context

/-- Helper to create initial context -/
def mkContext (data : Data) (msg : Msg) (opt : Env) : Context :=
  { state := {}
    msg := msg
    env := opt
    data := data }

/-- Create a message with parsed query -/
def createMsg (query : Query) (nonce : Nat) (processId : String) : Msg :=
  { headers := {
      signature := ""
      signatureInput := ""
      nonce := nonce
      id := processId
      contentDigest := ""
    }
    body := ""
    parsedQuery := query }

end Weavedb.Types
