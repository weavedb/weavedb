import Weavedb.Data
import Std.Data.HashMap

namespace Weavedb.Types

open Weavedb.Data

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
  query : String  -- Stringified JSON query
  id : String     -- base64url database process id
  contentDigest : String
  deriving Inhabited

/-- HTTP message structure -/
structure Msg where
  headers : Headers
  body : String
  deriving Inhabited

/-- Mutable state during write processing -/
structure State where
  -- Add fields as needed by devices
  nonce : Option Nat := none
  query : Option String := none
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

end Weavedb.Types
