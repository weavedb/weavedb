import Weavedb.Types
import Weavedb.Data
import Weavedb.Store
import Weavedb.Init  -- Assuming Init.lean is in the Weavedb directory

namespace Weavedb.Build

open Weavedb.Types
open Weavedb.Data
open Weavedb.Store
open Weavedb.Write.Init  -- This namespace is still defined in Init.lean

/- Build function creates a database instance with read/write operations
   JS: const build = ({
     async = false,
     write,
     read,
     __write__ = {},
     __read__ = {},
     init = _init,
     store = _store,
   }) => {
     return (kv, opt = {}) => { ... }
   }
-/

/-- Read operation result -/
structure ReadResult where
  data : Data
  result : Option Doc
  deriving Inhabited

/-- Write operation result -/
structure WriteOpResult where
  data : Data
  success : Bool
  error : Option String
  deriving Inhabited

/-- Database instance with operations -/
structure DB where
  data : Data
  store : Store
  read : Msg → Env → WriteResult Context
  write : Msg → Env → WriteResult Context

/-- Build configuration -/
structure BuildConfig where
  write : List WriteM  -- Write pipeline devices
  read : List WriteM   -- Read pipeline devices (if different from write)
  init : WriteM        -- Init function
  store : Data → Store -- Store wrapper function

/-- Chain multiple WriteM operations together -/
def chainOps (ops : List WriteM) : WriteM :=
  ops.foldl (fun acc op => fun ctx =>
    match acc ctx with
    | WriteResult.ok ctx' => op ctx'
    | WriteResult.error e => WriteResult.error e
  ) (fun ctx => WriteResult.ok ctx)

/-- Default environment -/
def defaultEnv (processId : String) : Env :=
  { processId := processId
    dirConfigs := #[]
    dbId := none
    owner := none }

/-- Default build configuration -/
def defaultConfig : BuildConfig where
  write := []  -- Will be populated with actual devices
  read := []
  init := init
  store := store

/-- Build a database instance -/
def build (config : BuildConfig) (kv : Data) (opt : Env) : DB :=
  let st := config.store kv

  -- Create write operation
  let writeOp : Msg → Env → WriteResult Context := fun msg env =>
    let initialCtx := mkContext kv msg env
    let pipeline := chainOps (config.init :: config.write)
    match pipeline initialCtx with
    | WriteResult.ok ctx =>
      -- In JS, this commits changes to kv
      WriteResult.ok ctx
    | WriteResult.error e =>
      -- In JS, this would call kv.reset()
      WriteResult.error e

  -- Create read operation (similar to write but might have different pipeline)
  let readOp : Msg → Env → WriteResult Context := fun msg env =>
    let initialCtx := mkContext kv msg env
    let pipeline := if config.read.isEmpty then
      chainOps (config.init :: config.write)
    else
      chainOps (config.init :: config.read)
    pipeline initialCtx

  { data := kv
    store := st
    read := readOp
    write := writeOp }

/-- Execute a write operation on the database -/
def DB.execWrite (db : DB) (msg : Msg) (env : Env) : DB :=
  match db.write msg env with
  | WriteResult.ok ctx =>
    -- Update database with new data
    { db with data := ctx.data }
  | WriteResult.error _ =>
    -- Keep original data (like reset in JS)
    db

/-- Execute a read operation on the database -/
def DB.execRead (db : DB) (msg : Msg) (env : Env) : Option Doc :=
  match db.read msg env with
  | WriteResult.ok ctx =>
    -- Extract result from context (implementation depends on read devices)
    none  -- Placeholder
  | WriteResult.error _ => none

/-- Helper to create a message for operations -/
def createMsg (query : String) (nonce : Nat) (processId : String) : Msg :=
  { headers := {
      signature := ""
      signatureInput := ""
      nonce := nonce
      query := query
      id := processId
      contentDigest := ""
    }
    body := "" }

/-- Build a database with default configuration -/
def buildDefault (kv : Data) (processId : String) : DB :=
  build defaultConfig kv (defaultEnv processId)

end Weavedb.Build
