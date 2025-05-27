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

/-- Convert public key to address (simplified - would use SHA256 in practice) -/
def toAddr (keyid : String) : String :=
  -- In practice, this would:
  -- 1. base64url decode the keyid
  -- 2. SHA256 hash the bytes
  -- 3. base64url encode the result
  -- For now, just prefix with "addr_"
  s!"addr_{keyid}"

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

/-- Parse signature input parameters -/
structure SignatureInput where
  label : String
  fields : List String
  alg : String
  keyid : String
  created : Option Nat := none
  expires : Option Nat := none
  nonce : Option String := none
  deriving Inhabited

/-- Parse the Signature-Input header -/
def parseSI (input : String) : Except String SignatureInput :=
  -- Find the '=' separator
  match input.splitOn "=" with
  | label :: rest =>
    let restStr := "=".intercalate rest
    -- Check for fields list
    if restStr.startsWith "(" then
      match restStr.splitOn ")" with
      | fieldsRaw :: paramsRest =>
        let fields := fieldsRaw.drop 1 |>.split (· == ' ') |>.filter (· ≠ "") |>.map toLowerCase

        -- Parse parameters after the fields list
        let paramsStr := ")".intercalate paramsRest
        let params := paramsStr.splitOn ";" |>.filter (· ≠ "")

        -- Extract alg and keyid (required)
        let alg := params.find? (·.startsWith "alg=") |>.map (fun s =>
          s.drop 4 |>.data.filter (· ≠ '"') |> String.mk)
        let keyid := params.find? (·.startsWith "keyid=") |>.map (fun s =>
          s.drop 6 |>.data.filter (· ≠ '"') |> String.mk)

        match alg, keyid with
        | some algVal, some keyidVal =>
          Except.ok {
            label := label.trim
            fields := fields
            alg := algVal
            keyid := keyidVal
          }
        | none, _ => Except.error "Missing `alg` in Signature-Input"
        | _, none => Except.error "Missing `keyid` in Signature-Input"
      | _ => Except.error "Invalid Signature-Input (unclosed fields list)"
    else
      Except.error "Invalid Signature-Input (fields list missing)"
  | _ => Except.error "Invalid Signature-Input (no `=` found)"

/-- Convert header keys to lowercase for signature/signature-input -/
def toLower : WriteM := fun ctx =>
  -- In JS, this normalizes signature and signature-input headers to lowercase
  -- Since our Headers structure has fixed fields, we just ensure they're set
  WriteResult.ok ctx

/-- Pick relevant headers based on signature input -/
def pickInput : WriteM := fun ctx =>
  match parseSI ctx.msg.headers.signatureInput with
  | Except.error e => WriteResult.error s!"Invalid Signature-Input: {e}"
  | Except.ok si =>
    -- Validate required headers
    if ctx.msg.headers.id.isEmpty then
      WriteResult.error "id missing"
    else if ctx.msg.headers.nonce == 0 then
      WriteResult.error "nonce missing"
    else
      -- Update state with parsed values
      let signer := toAddr si.keyid

      -- The query is already parsed in the message
      let state' := { ctx.state with
        address := some signer
        parsedQuery := some ctx.msg.parsedQuery
        nonce := some ctx.msg.headers.nonce
      }
      WriteResult.ok { ctx with state := state' }

/-- Parse operation from query -/
def parseOp : WriteM := fun ctx =>
  match ctx.state.parsedQuery with
  | none => WriteResult.error "No query in state"
  | some query =>
    -- Extract operation from the typed Query
    let op := query.operation.toString
    let state' := { ctx.state with op := some op }
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
