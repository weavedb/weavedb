import Weavedb.Types
import Weavedb.Data

namespace Weavedb.Write.Init

open Weavedb.Types
open Weavedb.Data

/-- Initialize the write context
    JS: const _init = ({ kv, msg, opt }) => ({
      state: {},
      msg,
      env: { ...opt, kv, ...kv.get("_config", "info") },
    })
-/
def init : WriteM := fun ctx =>
  -- Extract config info from kv.get("_config", "info")
  let configInfo : Option Doc :=
    match ctx.data.dirs[1]? with  -- _config directory at index 1
    | some configDir =>
      configDir.get "info"
    | none => none

  -- Extract id and owner from config info
  let (dbId, owner) := match configInfo with
    | some doc => (doc.get "id", doc.get "owner")
    | none => (none, none)

  -- Build new context with:
  -- - state: {} (empty)
  -- - msg: unchanged
  -- - env: { ...opt, kv, ...configInfo }
  WriteResult.ok {
    state := {}  -- Empty state
    msg := ctx.msg  -- Pass through unchanged
    env := {
      -- Spread opt (original env)
      processId := ctx.env.processId
      dirConfigs := ctx.env.dirConfigs

      -- Add kv reference (in our case, it's accessible via ctx.data)

      -- Spread config info
      dbId := dbId
      owner := owner
    }
    data := ctx.data  -- Keep data unchanged
  }

end Weavedb.Write.Init
