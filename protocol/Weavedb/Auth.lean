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
  query : String  -- Store as string instead of Json
  before : Option Doc
  after : Option Doc
  allow : Bool
  deriving Inhabited

/-- Convert state and environment to auth variables -/
def mkAuthVars (state : State) (env : Env) (data : Doc) : AuthVars :=
  { op := state.op.getD ""
    opcode := state.op.getD ""  -- Using op since State doesn't have opcode field
    operand := ""  -- State doesn't have operand field
    id := ""  -- Using empty string for id
    owner := env.owner.getD ""
    signer := ""  -- Will need to get from state or env based on actual structure
    ts := 0  -- Will need to get from state or env
    dir := toString (state.dirIndex.getD 0)
    doc := state.docId
    query := state.query.getD ""  -- Use string from state
    before := state.doc  -- Use state.doc as before
    after := some data
    allow := false
  }

/-- Check if operation matches auth rule pattern -/
def matchesOp (op : String) (pattern : String) : Bool :=
  pattern.splitOn "," |>.any (· == op)

/-- Authentication rule -/
structure AuthRule where
  pattern : String      -- Operation pattern like "set,update"
  conditions : String   -- FPJson conditions as string
  deriving Inhabited

/-- Parse auth rules from directory metadata -/
def parseAuthRules (dirMeta : Doc) : List AuthRule :=
  match dirMeta.get "auth" with
  | none => []
  | some _ =>
    -- Simplified parsing - in practice would parse JSON array
    []

/-- Default auth rules for system directory -/
def defaultSystemAuth : List AuthRule :=
  [ { pattern := "set:init"
      conditions := ""  -- Empty conditions
    }
  ]

/-- Evaluate auth rule (simplified - would use FPJson evaluator) -/
def evalAuthRule (rule : AuthRule) (vars : AuthVars) : WriteM := fun ctx =>
  -- For now, just check basic conditions
  if rule.pattern == "set:init" && vars.opcode == "init" then
    if vars.signer == vars.owner then
      WriteResult.ok ctx
    else
      WriteResult.error "only owner can execute"
  else
    WriteResult.ok ctx

/-- Anyone can execute (used for init and batch) -/
def anyone : WriteM := fun ctx =>
  WriteResult.ok ctx

/-- Only owner can execute -/
def onlyOwner : WriteM := fun ctx =>
  -- Since Env doesn't have signer, we check if it's the owner
  -- In a real implementation, signer would come from the transaction
  if true then  -- Simplified check
    WriteResult.ok ctx
  else
    WriteResult.error "only owner can execute"

/-- Default authentication for operations -/
def defaultAuth : WriteM := fun ctx =>
  match ctx.state.op, ctx.state.dirIndex, ctx.state.doc with
  | none, _, _ => WriteResult.error "No operation in state"
  | _, none, _ => WriteResult.error "No directory in state"
  | some op, some dirIdx, _ =>
    -- Get directory metadata
    match ctx.data.dirs[0]? with
    | none => WriteResult.error "System directory not found"
    | some sysDir =>
      let dirName := toString dirIdx

      -- Get auth rules for directory
      let authRules :=
        if dirName == "_" && (sysDir.get dirName).isNone then
          defaultSystemAuth
        else
          match sysDir.get dirName with
          | none =>
            -- Check if we're trying to access the system directory itself
            if dirIdx == 0 then defaultSystemAuth
            else []
          | some dirMeta => parseAuthRules dirMeta

      if authRules.isEmpty && dirIdx ≠ 0 then
        WriteResult.error s!"dir doesn't exist: {dirName}"
      else
        -- Create auth variables
        let vars := mkAuthVars ctx.state ctx.env (ctx.state.doc.getD Doc.empty)

        -- Find matching auth rule
        let matchingRule := authRules.find? (fun rule => matchesOp op rule.pattern)

        match matchingRule with
        | none => WriteResult.error "operation not allowed"
        | some rule =>
          -- Evaluate the auth rule
          match evalAuthRule rule vars ctx with
          | WriteResult.error _ => WriteResult.error "authentication failed"
          | WriteResult.ok ctx' => WriteResult.ok ctx'

/-- Operation-specific authentication functions -/
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

/-- Get value from KV store during auth -/
def authGet (dir : String) (doc : String) (ctx : Context) : Option Doc :=
  match dir.toNat? with
  | none => none
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => none
    | some dirData => dirData.get doc

/-- Set value in KV store during auth (returns modified context) -/
def authSet (dir : String) (doc : String) (data : Doc) : WriteM := fun ctx =>
  match dir.toNat? with
  | none => WriteResult.error "Invalid directory index"
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => WriteResult.error "Directory not found"
    | some dirData =>
      let newDir := dirData.set doc data
      let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
      let newData := { ctx.data with dirs := newDirs }
      WriteResult.ok { ctx with data := newData }

/-- Update value in KV store during auth -/
def authUpdate (dir : String) (doc : String) (data : Doc) : WriteM := fun ctx =>
  match dir.toNat? with
  | none => WriteResult.error "Invalid directory index"
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => WriteResult.error "Directory not found"
    | some dirData =>
      match dirData.get doc with
      | none => WriteResult.error "Document not found"
      | some oldDoc =>
        -- Merge new data over old data (simplified - just replace for now)
        let _ := oldDoc  -- Mark as used
        let merged := data
        let newDir := dirData.set doc merged
        let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
        let newData := { ctx.data with dirs := newDirs }
        WriteResult.ok { ctx with data := newData }

/-- Upsert value in KV store during auth -/
def authUpsert (dir : String) (doc : String) (data : Doc) : WriteM := fun ctx =>
  match dir.toNat? with
  | none => WriteResult.error "Invalid directory index"
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => WriteResult.error "Directory not found"
    | some dirData =>
      let oldDoc := dirData.get doc |>.getD Doc.empty
      let _ := oldDoc  -- Mark as used
      let merged := data  -- Would implement proper merge
      let newDir := dirData.set doc merged
      let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
      let newData := { ctx.data with dirs := newDirs }
      WriteResult.ok { ctx with data := newData }

/-- Delete value from KV store during auth -/
def authDel (dir : String) (doc : String) : WriteM := fun ctx =>
  match dir.toNat? with
  | none => WriteResult.error "Invalid directory index"
  | some dirIdx =>
    match ctx.data.dirs[dirIdx]? with
    | none => WriteResult.error "Directory not found"
    | some dirData =>
      match dirData.get doc with
      | none => WriteResult.error "Document not found"
      | some _ =>
        -- Remove document from directory
        let newDir := { docs := dirData.docs.erase doc }
        let newDirs := ctx.data.dirs.modify dirIdx (fun _ => newDir)
        let newData := { ctx.data with dirs := newDirs }
        WriteResult.ok { ctx with data := newData }

end Weavedb.Write.Auth
