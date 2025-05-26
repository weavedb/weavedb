import Weavedb.Types
import Weavedb.Data

namespace Weavedb.Write.Normalize

open Weavedb.Types
open Weavedb.Data

/-- Convert string to lowercase -/
def toLowerCase (s : String) : String :=
  s.data.map Char.toLower |> String.mk

/-- Base64url characters -/
def BASE64_CHARS : String :=
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

/-- Convert address from public key (simplified - would use SHA256 in practice) -/
def toAddr (keyid : String) : String :=
  -- In practice, this would:
  -- 1. base64url decode the keyid
  -- 2. SHA256 hash the bytes
  -- 3. base64url encode the result
  -- For now, just prefix with "addr_"
  s!"addr_{keyid}"

/-- Parse signature input parameters -/
structure SignatureInput where
  label : String
  fields : List String
  alg : Option String
  keyid : Option String
  created : Option Nat
  expires : Option Nat
  nonce : Option String
  deriving Inhabited

/-- Parse the Signature-Input header -/
def parseSI (input : String) : Option SignatureInput :=
  -- Simplified parser - in practice would parse the full format:
  -- sig1=(query nonce id);alg="eddsa";keyid="abc123"

  -- For now, return a mock result
  some {
    label := "sig1"
    fields := ["query", "nonce", "id", "content-digest"]
    alg := some "eddsa"
    keyid := some "test-key"
    created := none
    expires := none
    nonce := none
  }

/-- Convert header keys to lowercase for signature/signature-input -/
def toLower : WriteM := fun ctx =>
  let headers := ctx.msg.headers

  -- In JS, this normalizes signature and signature-input to lowercase
  -- Since our Headers structure has fixed fields, we just ensure they're set
  WriteResult.ok ctx

/-- Pick relevant headers based on signature input -/
def pickInput : WriteM := fun ctx =>
  match parseSI ctx.msg.headers.signatureInput with
  | none => WriteResult.error "Invalid Signature-Input"
  | some si =>
    match si.keyid with
    | none => WriteResult.error "Missing keyid in Signature-Input"
    | some keyid =>
      -- Update state with parsed values
      let state := ctx.state
      let state' := { state with
        address := some (toAddr keyid)
        keyId := some keyid
        query := some ctx.msg.headers.query
        nonce := some ctx.msg.headers.nonce
      }

      -- Validate required headers
      if ctx.msg.headers.id.isEmpty then
        WriteResult.error "id missing"
      else if ctx.msg.headers.nonce == 0 then
        WriteResult.error "nonce missing"
      else
        WriteResult.ok { ctx with state := state' }

/-- Parse operation from query -/
def parseOp : WriteM := fun ctx =>
  match ctx.state.query with
  | none => WriteResult.error "No query in state"
  | some queryStr =>
    -- Parse the query to extract operation
    -- Expected format: ["op", ...args]
    -- For now, simplified parsing
    let op :=
      if queryStr.startsWith "[\"get\"" then some "get"
      else if queryStr.startsWith "[\"set\"" then some "set"
      else if queryStr.startsWith "[\"update\"" then some "update"
      else if queryStr.startsWith "[\"upsert\"" then some "upsert"
      else if queryStr.startsWith "[\"del\"" then some "del"
      else none

    match op with
    | none => WriteResult.error "Unknown operation in query"
    | some opStr =>
      let state' := { ctx.state with op := some opStr }
      WriteResult.ok { ctx with state := state' }

/-- The normalize pipeline -/
def normalize : WriteM := fun ctx =>
  -- Chain the operations: toLower -> pickInput -> parseOp
  match toLower ctx with
  | WriteResult.error e => WriteResult.error e
  | WriteResult.ok ctx' =>
    match pickInput ctx' with
    | WriteResult.error e => WriteResult.error e
    | WriteResult.ok ctx'' =>
      parseOp ctx''

end Weavedb.Write.Normalize
