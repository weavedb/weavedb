import Weavedb.Types
import Weavedb.Data

namespace Weavedb.Write.Verify

open Weavedb.Types
open Weavedb.Data

/-- Get accounts directory index -/
def ACCOUNTS_DIR : Nat := 2

/-- Get accounts directory name -/
def ACCOUNTS_DIR_NAME : String := "__accounts__"

/-- Verify nonce and update account
    JS: function verify({ state, msg, env: { kv } }) {
      const acc = kv.get("__accounts__", state.signer)
      const nonce = acc?.nonce ?? 0
      if (+state.nonce !== nonce + 1) throw Error(`the wrong nonce: ${state.nonce}`)
      kv.put("__accounts__", state.signer, { ...acc, nonce: nonce + 1 })
      return arguments[0]
    }
-/
def verify : WriteM := fun ctx =>
  -- Get signer address from state
  match ctx.state.address with
  | none => WriteResult.error "No signer address in state"
  | some signer =>
    -- Get nonce from state
    match ctx.state.nonce with
    | none => WriteResult.error "No nonce in state"
    | some stateNonce =>
      -- Ensure accounts directory exists
      let data' := if ctx.data.dirs.size <= ACCOUNTS_DIR then
        ctx.data.setDir ACCOUNTS_DIR Dir.empty
      else
        ctx.data

      -- Get accounts directory
      match data'.dirs[ACCOUNTS_DIR]? with
      | none => WriteResult.error "Failed to access accounts directory"
      | some dir =>
        -- Get account document for signer
        let acc := dir.get signer
        let currentNonce := match acc with
          | none => 0  -- New account starts at nonce 0
          | some doc =>
            match doc.get "nonce" with
            | none => 0
            | some n => n.toNat?.getD 0

        -- Verify nonce is currentNonce + 1
        if stateNonce != currentNonce + 1 then
          WriteResult.error s!"the wrong nonce: {stateNonce}"
        else
          -- Create updated account document
          let newNonce := currentNonce + 1
          let newAcc := match acc with
            | none =>
              -- New account with just nonce
              Doc.fromList [("nonce", toString newNonce)]
            | some doc =>
              -- Update existing account document preserving other fields
              let otherFields := doc.data.toList.filter (fun (k, _) => k != "nonce")
              Doc.fromList (("nonce", toString newNonce) :: otherFields)

          -- Put updated account back to __accounts__
          let newDir := dir.set signer newAcc
          let newDirs := data'.dirs.modify ACCOUNTS_DIR (fun _ => newDir)
          let newData := { data' with dirs := newDirs }

          -- Return updated context
          WriteResult.ok { ctx with data := newData }

end Weavedb.Write.Verify
