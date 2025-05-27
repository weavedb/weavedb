import Weavedb.Types
import Weavedb.Data
import Weavedb.Store
import Weavedb.Init
import Weavedb.Monade

namespace Weavedb.Build

open Weavedb.Types
open Weavedb.Data
open Weavedb.Store
open Weavedb.Write.Init

/-- Build configuration matching JS -/
structure BuildConfig where
  async : Bool := false
  write : Option (List (KleisliArrow Context Context)) := none
  read : Option (List (KleisliArrow Context Context)) := none
  customWrite : List (String × List (KleisliArrow Context Context)) := []
  customRead : List (String × List (KleisliArrow Context Context)) := []
  init : Context → Context := id  -- Default init
  store : Data → Store := store

/-- Device methods structure -/
structure DBMethods where
  write : Option (Data → Msg → Env → Data)
  pwrite : Option (Data → Msg → Env → Task Data)
  read : Option (Data → Msg → Env → Context)
  customMethods : List (String × (Data → List Dynamic → Context))

/-- Default environment -/
def defaultEnv (processId : String) : Env :=
  { processId := processId
    dirConfigs := #[]
    dbId := none
    owner := none }

/-- Default init function matching JS _init -/
def defaultInit (input : Context) : Context :=
  -- In JS: gets info from kv.get("_config", "info")
  -- For now, just return input with empty state
  { input with state := {} }

/-- Chain multiple arrows together -/
def chainArrows [Inhabited (Monad' Context)] : List (KleisliArrow Context Context) → KleisliArrow Context Context
  | [] => KleisliArrow.ka Context
  | [a] => a
  | a :: rest =>
    rest.foldl (fun (acc : KleisliArrow Context Context) (arrow : KleisliArrow Context Context) =>
      acc.chainArrow arrow) a

/-- Build write method -/
def buildWriteMethod (config : BuildConfig) (_kv : Data) (opt : Env)
    : Option (Data → Msg → Env → Data) :=
  config.write.map fun writeDevs =>
    fun currentKv msg _opt =>
      -- Create initial context
      let ctx : Context := {
        data := currentKv
        msg := msg
        env := { opt with processId := _opt.processId }
        state := {}
      }

      -- Build the pipeline: init then chain all write devices
      let pipeline := KleisliArrow.ka Context
        |>.map config.init
        |>.chainArrow (chainArrows writeDevs)

      -- Execute pipeline
      let result := of ctx |>.chain pipeline.fn |>.val

      -- Return the updated data
      result.data

/-- Build async write method (pwrite) -/
def buildPWriteMethod (config : BuildConfig) (_kv : Data) (opt : Env)
    : Option (Data → Msg → Env → Task Data) :=
  if config.async && config.write.isSome then
    config.write.map fun writeDevs =>
      fun currentKv msg _opt =>
        Task.pure <| Id.run do
          let ctx : Context := {
            data := currentKv
            msg := msg
            env := { opt with processId := _opt.processId }
            state := {}
          }
          let pipeline := KleisliArrow.ka Context
            |>.map config.init
            |>.chainArrow (chainArrows writeDevs)
          let result := of ctx |>.chain pipeline.fn |>.val
          result.data
  else
    none

/-- Build read method -/
def buildReadMethod (config : BuildConfig) (_kv : Data) (opt : Env)
    : Option (Data → Msg → Env → Context) :=
  config.read.map fun readDevs =>
    fun currentKv msg _opt =>
      let ctx : Context := {
        data := currentKv
        msg := msg
        env := { opt with processId := _opt.processId }
        state := {}
      }
      let pipeline := KleisliArrow.ka Context
        |>.map config.init
        |>.chainArrow (chainArrows readDevs)
      of ctx |>.chain pipeline.fn |>.val

/-- Build custom methods -/
def buildCustomMethods (customOps : List (String × List (KleisliArrow Context Context)))
    (_kv : Data) (opt : Env) (init : Context → Context)
    : List (String × (Data → List Dynamic → Context)) :=
  customOps.map fun (name, ops) =>
    (name, fun currentKv _args =>
      -- In JS: msg is spread from args, here we create a dummy msg
      let msg := {
        headers := {
          signature := ""
          signatureInput := ""
          nonce := 0
          id := ""
          contentDigest := ""
        }
        body := ""
        parsedQuery := Query.get "" ""  -- Dummy query
      }
      let ctx : Context := {
        data := currentKv
        msg := msg
        env := opt
        state := {}
      }
      let pipeline := KleisliArrow.ka Context
        |>.map init
        |>.chainArrow (chainArrows ops)
      of ctx |>.chain pipeline.fn |>.val)

/-- Main build function matching JS implementation -/
def build (config : BuildConfig) : Data → Env → Device Data DBMethods :=
  fun kv opt =>
    -- Build store (in JS this wraps kv with additional methods)
    -- For now, we'll just use kv directly since store returns Store type

    -- Build methods
    let writeMeth := buildWriteMethod config kv opt
    let pwriteMeth := buildPWriteMethod config kv opt
    let readMeth := buildReadMethod config kv opt
    let customWrites := buildCustomMethods config.customWrite kv opt config.init
    let customReads := buildCustomMethods config.customRead kv opt config.init

    let methods : DBMethods := {
      write := writeMeth
      pwrite := pwriteMeth
      read := readMeth
      customMethods := customWrites ++ customReads
    }

    -- Create device using dev
    -- Note: In JS, store wraps kv, but here we use kv directly
    Device.dev methods kv

/-- Helper to create a simple write pipeline -/
def simpleWritePipeline : List (KleisliArrow Context Context) :=
  [ KleisliArrow.ka Context |>.map (fun ctx =>
    -- In Lean, state has type State (not Data), so we need to convert
    { ctx with state := {} }) ]

/-- Helper to create a simple read pipeline -/
def simpleReadPipeline : List (KleisliArrow Context Context) :=
  [ KleisliArrow.ka Context |>.map id ]  -- Just pass through

/-- Example usage matching JS pattern -/
def exampleBuild : Data → Device Data DBMethods :=
  let config : BuildConfig := {
    write := some simpleWritePipeline
    read := some simpleReadPipeline
    init := defaultInit
    store := store
  }
  fun kv => build config kv (defaultEnv "example-process")

/-- Execute write on device -/
def executeWrite (db : Device Data DBMethods) (msg : Msg) (env : Env) : Device Data DBMethods :=
  match db.methods.write with
  | some writeFn =>
    let newData := writeFn db.value msg env
    Device.dev db.methods newData
  | none => db

/-- Execute read on device -/
def executeRead (db : Device Data DBMethods) (msg : Msg) (env : Env) : Option Context :=
  match db.methods.read with
  | some readFn => some (readFn db.value msg env)
  | none => none

/-- Execute custom method on device -/
def executeCustom (db : Device Data DBMethods) (methodName : String) (args : List Dynamic)
    : Option Context :=
  match db.methods.customMethods.find? (fun (name, _) => name == methodName) with
  | some (_, method) => some (method db.value args)
  | none => none

end Weavedb.Build
