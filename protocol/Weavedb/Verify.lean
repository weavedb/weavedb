import Weavedb.Types
import Weavedb.Data

namespace Weavedb.Write.Verify

open Weavedb.Types
open Weavedb.Data

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
      -- Get account from __accounts__ directory (index 2)
      let accountsDir := ctx.data.dirs[2]?
      match accountsDir with
      | none => WriteResult.error "Accounts directory not found"
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
          -- Update account with new nonce
          let newAcc := match acc with
            | none => Doc.fromList [("nonce", toString (currentNonce + 1))]
            | some doc =>
              -- Update existing account document
              Doc.fromList (("nonce", toString (currentNonce + 1)) ::
                doc.data.toList.filter (fun (k, _) => k != "nonce"))

          -- Put updated account back to __accounts__
          let newDir := dir.set signer newAcc
          let newDirs := ctx.data.dirs.modify 2 (fun _ => newDir)
          let newData := { ctx.data with dirs := newDirs }

          -- Return updated context
          WriteResult.ok { ctx with data := newData }

end Weavedb.Write.Verify
