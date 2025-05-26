import Weavedb.Build
import Weavedb.Normalize
import Weavedb.Verify
import Weavedb.Parse
import Weavedb.Auth
import Weavedb.Set
import Weavedb.Init
import Weavedb.Store
import Weavedb.Types

namespace Weavedb.DB

open Weavedb.Types
open Weavedb.Build
open Weavedb.Write.Normalize
open Weavedb.Write.Verify
open Weavedb.Write.Parse
open Weavedb.Write.Auth
open Weavedb.Write.Set
open Weavedb.Write.Init
open Weavedb.Store

/-- Get operation for read pipeline -/
def get : WriteM := fun ctx =>
  let state' := { ctx.state with
    op := some "get",
    query := ctx.state.query  -- Keep existing query
  }
  WriteResult.ok { ctx with state := state' }

/-- Cget operation for read pipeline -/
def cget : WriteM := fun ctx =>
  let state' := { ctx.state with
    op := some "cget",
    query := ctx.state.query  -- Keep existing query
  }
  WriteResult.ok { ctx with state := state' }

/-- Read operation (placeholder - would implement actual read logic) -/
def read : WriteM := fun ctx =>
  -- In a real implementation, this would:
  -- 1. Use ctx.state.dirIndex and ctx.state.docId
  -- 2. Fetch the document from ctx.data
  -- 3. Return it in some way (perhaps in ctx.state)
  WriteResult.ok ctx

/-- Default database instance using build -/
def db := build {
  write := [normalize, verify, parse, auth, set]
  read := [normalize, parse, read]
  init := init
  store := store
}

end Weavedb.DB
