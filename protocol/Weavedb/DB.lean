import Weavedb.Build
import Weavedb.Normalize
import Weavedb.Verify
import Weavedb.Parse
import Weavedb.Auth
import Weavedb.Write
import Weavedb.Init
import Weavedb.Store
import Weavedb.Types
import Weavedb.Monade

namespace Weavedb.DB

open Weavedb.Types
open Weavedb.Build
open Weavedb.Write.Normalize
open Weavedb.Write.Verify
open Weavedb.Write.Parse
open Weavedb.Write.Auth
open Weavedb.Write.Write
open Weavedb.Write.Init
open Weavedb.Store

/-- Convert WriteM to KleisliArrow for compatibility -/
def writeMToArrow (wm : WriteM) : KleisliArrow Context Context :=
  KleisliArrow.ka Context
    |>.chain fun ctx =>
      match wm ctx with
      | WriteResult.ok ctx' => Monad'.of ctx'
      | WriteResult.error _ => Monad'.of ctx  -- Return original on error

/-- Get operation for read pipeline -/
def get : WriteM := fun ctx =>
  let state' := { ctx.state with
    op := some "get"
    -- parsedQuery is already set by normalize
  }
  WriteResult.ok { ctx with state := state' }

/-- Cget operation for read pipeline -/
def cget : WriteM := fun ctx =>
  let state' := { ctx.state with
    op := some "cget"
    -- parsedQuery is already set by normalize
  }
  WriteResult.ok { ctx with state := state' }

/-- Read operation (placeholder - would implement actual read logic) -/
def read : WriteM := fun ctx =>
  -- In a real implementation, this would:
  -- 1. Use ctx.state.dirIndex and ctx.state.docId
  -- 2. Fetch the document from ctx.data
  -- 3. Return it in some way (perhaps in ctx.state)
  WriteResult.ok ctx

/-- Convert WriteM init to regular function -/
def initFn : Context → Context := fun ctx =>
  match init ctx with
  | WriteResult.ok ctx' => ctx'
  | WriteResult.error _ => ctx  -- Return original on error

/-- Default database instance using build -/
def db := build {
  write := some [
    writeMToArrow normalize,
    writeMToArrow verify,
    writeMToArrow parse,
    writeMToArrow auth,
    writeMToArrow write
  ]
  read := some [
    writeMToArrow normalize,
    writeMToArrow parse,
    writeMToArrow read
  ]
  customWrite := []
  customRead := [
    ("get", [writeMToArrow get, writeMToArrow parse, writeMToArrow read]),
    ("cget", [writeMToArrow cget, writeMToArrow parse, writeMToArrow read])
  ]
  init := initFn
  store := store
}

end Weavedb.DB
