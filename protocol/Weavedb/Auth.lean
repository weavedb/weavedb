import Weavedb.Types
import Weavedb.Data

namespace Weavedb.Write.Auth

open Weavedb.Types
open Weavedb.Data

/-- Authentication variables for rule evaluation -/
structure AuthVars where
  op : String
  opcode : String
  operand : String
  id : String
  owner : String
  signer : String
  ts : Nat
  dir : String
  doc : Option String
  query : Query
  before : Option Doc
  after : Option Doc
  allow : Bool
  deriving Inhabited

/-- Convert state and environment to auth variables -/
def mkAuthVars (ctx : Context) : AuthVars :=
  { op := ctx.state.op.getD ""
    opcode := ctx.state.op.getD ""
    operand := ""  -- Not used in current implementation
    id := ctx.env.processId
    owner := ctx.env.owner.getD ""
    signer := ctx.state.address.getD ""
    ts := 0  -- Would come from timestamp in real implementation
    dir := ctx.state.dirIndex.map toString |>.getD ""
    doc := ctx.state.docId
    query := ctx.state.parsedQuery.getD (Query.init Doc.empty)  -- Default query
    before := ctx.state.doc  -- In Parse, we store old doc here for del/update
    after := ctx.state.doc  -- New data
    allow := false
  }

/-- Authentication rule type -/
structure AuthRule where
  pattern : String  -- Operation pattern like "set,update" or "set:init"
  fpjson : List Dynamic  -- FPJson expression (simplified as Dynamic for now)
  deriving Inhabited

/-- Default auth rules for system directory when it doesn't exist -/
def defaultSystemAuth : List AuthRule :=
  [ { pattern := "set:init"
      fpjson := []  -- Would be FPJson expression checking if signer == owner
    }
  ]

/-- Parse auth rules from directory metadata -/
def parseAuthRules (dirMeta : Doc) : List AuthRule :=
  -- In practice, would parse the "auth" field from dirMeta
  -- For now, return empty list
  match dirMeta.get "auth" with
  | none => []
  | some _ => []  -- Would parse JSON array of auth rules

/-- Check if operation matches auth rule pattern -/
def matchesOp (op : String) (pattern : String) : Bool :=
  pattern.splitOn "," |>.any (· == op)

/-- Anyone can execute (used for init and batch) -/
def anyone : WriteM := fun ctx =>
  WriteResult.ok ctx

/-- Only owner can execute -/
def onlyOwner : WriteM := fun ctx =>
  let signer := ctx.state.address.getD ""
  let owner := ctx.env.owner.getD ""
  if signer == owner then
    WriteResult.ok ctx
  else
    WriteResult.error "only owner can execute"

/-- Evaluate auth rule (simplified - would use FPJson evaluator) -/
def evalAuthRule (rule : AuthRule) (vars : AuthVars) (ctx : Context) : Bool :=
  -- For now, implement basic logic for set:init
  if rule.pattern == "set:init" then
    vars.signer == vars.owner
  else
    false  -- Would evaluate FPJson expression

/-- Get value from KV store during auth -/
def authGet (dir : String) (doc : String) (ctx : Context) : Option Doc :=
  match dir.toNat? with
  | none => none
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => none
    | some dirData => dirData.get doc

/-- Set value in KV store during auth -/
def authSet (dir : String) (doc : String) (data : Doc) (ctx : Context) : Context :=
  match dir.toNat? with
  | none => ctx
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => ctx
    | some dirData =>
      let newDir := dirData.set doc data
      let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
      let newData := { ctx.data with dirs := newDirs }
      { ctx with data := newData }

/-- Update value in KV store during auth -/
def authUpdate (dir : String) (doc : String) (data : Doc) (ctx : Context) : Context :=
  match dir.toNat? with
  | none => ctx
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => ctx
    | some dirData =>
      match dirData.get doc with
      | none => ctx
      | some oldDoc =>
        -- Merge new data over old data (left merge - new overwrites old)
        let mergedData := Doc.fromList (data.data.toList ++
          oldDoc.data.toList.filter (fun (k, _) => !data.data.contains k))
        let newDir := dirData.set doc mergedData
        let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
        let newData := { ctx.data with dirs := newDirs }
        { ctx with data := newData }

/-- Upsert value in KV store during auth -/
def authUpsert (dir : String) (doc : String) (data : Doc) (ctx : Context) : Context :=
  match dir.toNat? with
  | none => ctx
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => ctx
    | some dirData =>
      let oldDoc := dirData.get doc |>.getD Doc.empty
      -- Merge new data over old data
      let mergedData := Doc.fromList (data.data.toList ++
        oldDoc.data.toList.filter (fun (k, _) => !data.data.contains k))
      let newDir := dirData.set doc mergedData
      let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
      let newData := { ctx.data with dirs := newDirs }
      { ctx with data := newData }

/-- Delete value from KV store during auth -/
def authDel (dir : String) (doc : String) (ctx : Context) : (Bool × Context) :=
  match dir.toNat? with
  | none => (false, ctx)
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => (false, ctx)
    | some dirData =>
      match dirData.get doc with
      | none => (false, ctx)
      | some _ =>
        let newDir := { docs := dirData.docs.erase doc }
        let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
        let newData := { ctx.data with dirs := newDirs }
        (true, { ctx with data := newData })

/-- Default authentication for operations -/
def defaultAuth : WriteM := fun ctx =>
  match ctx.state.op, ctx.state.dirIndex with
  | none, _ => WriteResult.error "No operation in state"
  | _, none => WriteResult.error "No directory in state"
  | some op, some dirIdx =>
    -- Get directory metadata from system directory
    let dirName := toString dirIdx

    -- Get directory metadata
    let dirMeta := match ctx.data.dirs[0]? with
      | none => none
      | some sysDir => sysDir.get dirName

    -- Get auth rules
    let authRules :=
      if dirIdx == 0 && dirMeta.isNone then
        -- Special case for system directory initialization
        defaultSystemAuth
      else
        match dirMeta with
        | none =>
          -- Directory doesn't exist
          []
        | some meta =>
          parseAuthRules meta

    -- Check if directory exists (unless it's system dir being initialized)
    if authRules.isEmpty && dirIdx ≠ 0 && dirMeta.isNone then
      WriteResult.error s!"dir doesn't exist: {dirName}"
    else
      -- Create auth variables
      let vars := mkAuthVars ctx

      -- Find matching auth rule
      let allow := authRules.any fun rule =>
        if matchesOp op rule.pattern then
          evalAuthRule rule vars ctx
        else
          false

      if !allow && !authRules.isEmpty then
        WriteResult.error "operation not allowed"
      else
        WriteResult.ok ctx

/-- Get authentication function for operation -/
def getAuthFunc (opcode : String) : WriteM :=
  match opcode with
  | "init" => anyone
  | "batch" => anyone
  | "addIndex" => onlyOwner
  | "removeIndex" => onlyOwner
  | _ => defaultAuth

/-- Main authentication function -/
def auth : WriteM := fun ctx =>
  match ctx.state.op with
  | none => WriteResult.error "No operation in state"
  | some op =>
    let authFunc := getAuthFunc op
    authFunc ctx

end Weavedb.Write.Auth
