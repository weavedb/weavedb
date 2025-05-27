-- Monade.lean
-- A clean monad implementation matching monade.js functionality

universe u v

-- Core monad structure with marker
structure Monad' (α : Type u) where
  value : α
  isMonad : Bool := true
deriving Inhabited

namespace Monad'

-- Constructor function similar to 'of' in JS
def of (a : α) : Monad' α := ⟨a, true⟩

-- Functor map
def map (f : α → β) (m : Monad' α) : Monad' β :=
  of (f m.value)

-- Tap for side effects (returns original monad)
def tap (f : α → Unit) (m : Monad' α) : Monad' α :=
  let _ := f m.value
  m

-- Monadic bind/chain with validation
def chain [Inhabited (Monad' β)] (f : α → Monad' β) (m : Monad' α) : Monad' β :=
  let res := f m.value
  if res.isMonad then res
  else panic! "fn must return monad"

-- Extract and transform value
def to (f : α → β) (m : Monad' α) : β :=
  f m.value

-- Extract value
def val (m : Monad' α) : α :=
  m.value

end Monad'

-- Task-based monad for async operations with marker
structure AsyncMonad (α : Type u) where
  task : Task α
  isMonad : Bool := true
deriving Inhabited

namespace AsyncMonad

-- Constructor for async monad
def pof (a : α) : AsyncMonad α :=
  ⟨Task.pure a, true⟩

-- Create from Task
def fromTask (t : Task α) : AsyncMonad α := ⟨t, true⟩

-- Async map
def map (f : α → β) (m : AsyncMonad α) : AsyncMonad β :=
  ⟨m.task.map f, true⟩

-- Async tap
def tap (f : α → Unit) (m : AsyncMonad α) : AsyncMonad α :=
  ⟨m.task.map (fun a => let _ := f a; a), true⟩

-- Async chain - in JS this automatically handles both sync and async
-- In Lean, we need explicit type handling due to static typing
def chain (f : α → AsyncMonad β) (m : AsyncMonad α) : AsyncMonad β :=
  fromTask <| m.task.bind fun a =>
    let res := f a
    res.task

-- Helper to lift sync functions to async for chaining
def liftSync (f : α → Monad' β) : α → AsyncMonad β :=
  fun a => pof (f a).value

-- Chain sync function into async monad (convenience method)
-- In JS, this is automatic. In Lean, we provide this for ergonomics
def chainSync (f : α → Monad' β) (m : AsyncMonad α) : AsyncMonad β :=
  m.chain (liftSync f)

-- Extract with transformation
def to (f : α → β) (m : AsyncMonad α) : Task β :=
  m.task.map f

-- Get underlying task
def val (m : AsyncMonad α) : Task α :=
  m.task

end AsyncMonad

-- Kleisli arrow builder structure
structure KleisliArrow (α β : Type u) where
  run : α → Monad' β
  isKa : Bool := true

namespace KleisliArrow

-- Identity arrow
def ka (α : Type u) : KleisliArrow α α :=
  ⟨Monad'.of, true⟩

-- Map operation
def map (f : β → γ) (k : KleisliArrow α β) : KleisliArrow α γ :=
  ⟨fun a => k.run a |>.map f, true⟩

-- Tap operation
def tap (f : β → Unit) (k : KleisliArrow α β) : KleisliArrow α β :=
  ⟨fun a => k.run a |>.tap f, true⟩

-- Chain operation - prevents passing arrows directly like in JS
def chain [Inhabited (Monad' γ)] (f : β → Monad' γ) (k : KleisliArrow α β) : KleisliArrow α γ :=
  -- In JS, this checks if f.__ka__ and throws error
  -- In Lean, we handle this differently but maintain the same API
  ⟨fun a => k.run a |>.chain f, true⟩

-- Chain with another arrow using its fn()
def chainArrow [Inhabited (Monad' γ)] (other : KleisliArrow β γ) (k : KleisliArrow α β) : KleisliArrow α γ :=
  ⟨fun a => k.run a |>.chain other.run, true⟩

-- Convert to function
def fn (k : KleisliArrow α β) : α → Monad' β :=
  k.run

-- Make it directly callable (returns monad like in JS)
instance : CoeFun (KleisliArrow α β) (fun _ => α → Monad' β) where
  coe k := k.run

end KleisliArrow

-- Async Kleisli arrow
structure AsyncKleisliArrow (α β : Type u) where
  run : α → AsyncMonad β
  isKa : Bool := true
  isAsync : Bool := true

namespace AsyncKleisliArrow

-- Identity arrow
def pka (α : Type u) : AsyncKleisliArrow α α :=
  ⟨AsyncMonad.pof, true, true⟩

-- Map operation
def map (f : β → γ) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α γ :=
  ⟨fun a => k.run a |>.map f, true, true⟩

-- Tap operation
def tap (f : β → Unit) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α β :=
  ⟨fun a => k.run a |>.tap f, true, true⟩

-- Chain operation
def chain (f : β → AsyncMonad γ) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α γ :=
  ⟨fun a => k.run a |>.chain f, true, true⟩

-- Chain sync function into async arrow (lifts sync to async)
def chainSync (f : β → Monad' γ) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α γ :=
  ⟨fun a => k.run a |>.chainSync f, true, true⟩

-- Chain sync arrow into async arrow
def chainSyncArrow (syncArrow : KleisliArrow β γ) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α γ :=
  k.chainSync syncArrow.fn

-- Convert to function
def fn (k : AsyncKleisliArrow α β) : α → AsyncMonad β :=
  k.run

-- Make it directly callable
instance : CoeFun (AsyncKleisliArrow α β) (fun _ => α → AsyncMonad β) where
  coe := fn

end AsyncKleisliArrow

-- Convert sync arrow to async arrow (defined after both types)
def KleisliArrow.toAsync (k : KleisliArrow α β) : AsyncKleisliArrow α β :=
  ⟨fun a => AsyncMonad.pof (k.run a).value, true, true⟩

-- Device structure for domain-specific wrappers
structure Device (α : Type u) (Methods : Type v) where
  value : α
  methods : Methods
  isDevice : Bool := true

namespace Device

-- Create a device with custom methods
def dev (methods : Methods) (a : α) : Device α Methods :=
  ⟨a, methods, true⟩

-- Core monad operations
def map (f : α → β) (d : Device α Methods) : Device β Methods :=
  ⟨f d.value, d.methods, true⟩

def tap (f : α → Unit) (d : Device α Methods) : Device α Methods :=
  let _ := f d.value
  d

def chain (f : α → Device β Methods) (d : Device α Methods) : Device β Methods :=
  f d.value

def to (f : α → β) (d : Device α Methods) : β :=
  f d.value

def val (d : Device α Methods) : α :=
  d.value

-- Convert to monad
def monad (d : Device α Methods) : Monad' α :=
  Monad'.of d.value

end Device

-- Async Device
structure AsyncDevice (α : Type u) (Methods : Type v) where
  task : Task α
  methods : Methods
  isDevice : Bool := true
  isAsync : Bool := true

namespace AsyncDevice

-- Create an async device
def pdev (methods : Methods) (a : α) : AsyncDevice α Methods :=
  ⟨Task.pure a, methods, true, true⟩

def fromTask (methods : Methods) (t : Task α) : AsyncDevice α Methods :=
  ⟨t, methods, true, true⟩

-- Core async monad operations
def map (f : α → β) (d : AsyncDevice α Methods) : AsyncDevice β Methods :=
  ⟨d.task.map f, d.methods, true, true⟩

def tap (f : α → Unit) (d : AsyncDevice α Methods) : AsyncDevice α Methods :=
  ⟨d.task.map (fun a => let _ := f a; a), d.methods, true, true⟩

def chain (f : α → AsyncDevice β Methods) (d : AsyncDevice α Methods) : AsyncDevice β Methods :=
  ⟨d.task.bind fun a => (f a).task, d.methods, true, true⟩

def to (f : α → β) (d : AsyncDevice α Methods) : Task β :=
  d.task.map f

def val (d : AsyncDevice α Methods) : Task α :=
  d.task

-- Convert to async monad
def monad (d : AsyncDevice α Methods) : AsyncMonad α :=
  AsyncMonad.fromTask d.task

end AsyncDevice

-- Option handling
def opt {α ε : Type u} (computeMonad : Unit → Except ε (Monad' α)) : Monad' (Option α) :=
  match computeMonad () with
  | .ok m => Monad'.of (some m.value)
  | .error _ => Monad'.of none

def popt {α ε : Type u} (computeAsync : Unit → Task (Except ε α)) : AsyncMonad (Option α) :=
  let task := computeAsync ()
  AsyncMonad.fromTask <| task.map fun res =>
    match res with
    | .ok a => some a
    | .error _ => none

-- Simple API exports
def of {α : Type u} := @Monad'.of α
def pof {α : Type u} := @AsyncMonad.pof α
def ka (α : Type u) := KleisliArrow.ka α
def pka (α : Type u) := AsyncKleisliArrow.pka α
def dev {α : Type u} {Methods : Type v} := @Device.dev α Methods
def pdev {α : Type u} {Methods : Type v} := @AsyncDevice.pdev α Methods

-- Example structure for device methods
structure NumberMethods where
  add : Nat → Nat → Nat
  multiply : Nat → Nat → Nat

-- Examples demonstrating the API
namespace Examples

-- Simple sync example matching JS
def syncExample : String :=
  of 5
  |>.map (· * 2)
  |>.map (· + 10)
  |>.tap (fun x => dbgTrace s!"Value: {x}" fun _ => ())
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 20"

-- Kleisli arrow example matching JS
def kaExample : String :=
  let pipeline := ka Nat
    |>.map (· * 2)
    |>.tap (fun x => dbgTrace s!"Value: {x}" fun _ => ())
    |>.map (· + 10)

  of 5
  |>.chain pipeline.fn
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 20"

-- Direct arrow call matching JS - arrow returns monad
def directArrowExample : String :=
  let transform := ka Nat
    |>.map (· * 2)
    |>.map (· + 10)
    |>.map (fun x => s!"Result: {x}")

  (transform 5).val  -- transform is directly callable and returns Monad'

-- Arrow embedding in chain - exactly like JS
def arrowEmbeddingExample : String :=
  let doubleArrow := ka Nat |>.map (· * 2)
  let addTenArrow := ka Nat |>.map (· + 10)

  -- Can embed arrows in monad chains using fn()
  of 5
  |>.chain doubleArrow.fn   -- Must use .fn() like in JS
  |>.chain addTenArrow.fn
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 20"

-- Async example
def asyncExample : Task String :=
  pof 5
  |>.map (· * 2)
  |>.map (· + 10)
  |>.map (fun x => s!"Result: {x}")
  |>.val

-- Async Kleisli arrow
def pkaExample : Task String :=
  let pipeline := pka Nat
    |>.map (· * 2)
    |>.map (· + 10)

  (pof 5
    |>.chain pipeline.fn
    |>.map (fun x => s!"Result: {x}"))
    |>.val  -- "Result: 20"

-- Device example showing monad conversion
def deviceMonadConversionExample : String :=
  let methods : NumberMethods := ⟨(· + ·), (· * ·)⟩
  let numDevice := dev methods 10

  -- Device has all monad operations
  let processed := numDevice
    |>.map (· * 2)
    |>.map (· + 5)  -- value is now 25

  -- Convert device to regular monad
  let asMonad : Monad' Nat := processed.monad

  -- Now we can use it where a Monad' is expected
  asMonad
  |>.map (fun x => s!"Value: {x}")
  |>.val  -- "Value: 25"

-- Why convert device to monad?
def deviceToMonadUseCaseExample : String :=
  -- Function that only accepts Monad'
  let processMonad (m : Monad' Nat) : Monad' String :=
    m.map (fun x => s!"Processed: {x}")

  let methods : NumberMethods := ⟨(· + ·), (· * ·)⟩
  let device := dev methods 42

  -- Can't pass device directly to processMonad
  -- device |> processMonad  -- Error: type mismatch

  -- But we can convert it first
  (processMonad device.monad).val  -- "Processed: 42"

-- Async device to async monad conversion
def asyncDeviceMonadExample : Task String :=
  let methods : NumberMethods := ⟨(· + ·), (· * ·)⟩
  let asyncDev := pdev methods 100

  -- Process as device
  let processed := asyncDev |>.map (· / 2)

  -- Convert to AsyncMonad for use with async functions
  let asAsyncMonad : AsyncMonad Nat := processed.monad

  -- Now can use with functions expecting AsyncMonad
  asAsyncMonad
  |>.chain (fun x => pof (x + 50))
  |>.map (fun x => s!"Final: {x}")
  |>.val  -- "Final: 100"

-- Chain validation example
def chainValidationExample : Nat :=
  let goodFn (x : Nat) : Monad' Nat := of (x * 2)
  -- let badFn (x : Nat) : Nat := x * 2  -- Not a monad! Would fail at runtime

  of 5
  |>.chain goodFn  -- Works fine
  |>.val  -- 10

-- Composition example using chain - matching JS pattern
def compositionExample : String :=
  let doubleMonad (x : Nat) : Monad' Nat := of (x * 2)
  let addTenMonad (x : Nat) : Monad' Nat := of (x + 10)

  let pipeline := ka Nat
    |>.chain doubleMonad
    |>.chain addTenMonad
    |>.map (fun x => s!"Result: {x}")

  (pipeline 5).val  -- Direct call returns monad

-- Arrow composition - JS style
def arrowCompositionExample : String :=
  let double := ka Nat |>.map (· * 2)
  let addTen := ka Nat |>.map (· + 10)
  let toString' := ka Nat |>.map (fun x => s!"Result: {x}")

  -- Chain arrows together using fn() in chain
  let combined := ka Nat
    |>.chain double.fn
    |>.chain addTen.fn
    |>.chain toString'.fn

  (combined 5).val  -- "Result: 20"

-- Mixed monad and arrow composition - exactly like JS
def mixedCompositionExample : String :=
  let processArrow := ka Nat
    |>.map (· * 3)
    |>.tap (fun x => dbgTrace s!"Processing: {x}" fun _ => ())

  -- Start with monad, chain arrow, continue with monad ops
  of 10
  |>.chain processArrow.fn  -- Must use .fn() to chain arrow
  |>.map (· + 5)
  |>.map (fun x => s!"Final: {x}")
  |>.val  -- "Final: 35"

-- Example: aka.chain(ka) - async arrow chains sync arrow
def asyncChainSyncArrowExample : Task String :=
  let asyncStart := pka Nat
    |>.map (· * 2)
    |>.tap (fun x => dbgTrace s!"Async processing: {x}" fun _ => ())

  let syncProcess := ka Nat
    |>.map (· + 10)
    |>.map (fun x => s!"Sync result: {x}")

  -- Async arrow can chain sync arrow (need to lift)
  let combined := pka Nat
    |>.chain asyncStart.fn
    |>.chainSync syncProcess.fn  -- Chain sync arrow into async

  (combined 5).val  -- "Sync result: 20"

-- More direct example without chainSync
def asyncChainSyncManualExample : Task String :=
  let asyncDouble := pka Nat |>.map (· * 2)
  let syncAddTen := ka Nat |>.map (· + 10)

  -- Build async pipeline that incorporates sync arrow
  let pipeline := pka Nat
    |>.chain asyncDouble.fn
    |>.chain (fun x => pof (syncAddTen x).val)  -- Manually lift sync result

  (pipeline 5).map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 20"

-- Using helper to make it cleaner
def asyncChainSyncCleanExample : Task String :=
  let asyncOp := pka Nat
    |>.map (· * 3)

  let syncOp := ka Nat
    |>.map (· + 7)
    |>.map (fun x => s!"Value: {x}")

  -- Convert sync arrow function to async-compatible
  let liftedSync : Nat → AsyncMonad String :=
    AsyncMonad.liftSync syncOp.fn

  let combined := pka Nat
    |>.chain asyncOp.fn
    |>.chain liftedSync  -- Now it works with async chain

  (combined 10).val  -- "Value: 37"

-- Real-world example: async fetching with sync processing
def asyncFetchSyncProcessExample : Task String :=
  -- Simulate async data fetching
  let fetchData := pka Nat
    |>.map (fun n => n * 100)  -- Simulate fetched value
    |>.tap (fun x => dbgTrace s!"Fetched: {x}" fun _ => ())

  -- Sync processing pipeline
  let processData := ka Nat
    |>.map (fun n => n / 10)
    |>.map (fun n => if n > 50 then "High" else "Low")
    |>.tap (fun s => dbgTrace s!"Category: {s}" fun _ => ())

  -- Combine: async fetch then sync process
  let workflow := pka Nat
    |>.chain fetchData.fn
    |>.chainSync processData.fn  -- Sync processing in async context
    |>.map (fun category => s!"Data is {category}")

  (workflow 8).val  -- "Data is High"

-- Sync to Async conversion example
def syncToAsyncExample : Task String :=
  -- Once you go async, everything becomes async
  let syncValue := of 5 |>.map (· * 2)

  -- Convert sync to async by lifting the value
  pof syncValue.val
  |>.map (· + 10)
  |>.map (fun x => s!"Result: {x}")
  |>.val

-- Async arrow with sync start
def asyncArrowExample : Task String :=
  let asyncPipeline := pka Nat
    |>.map (· * 2)
    |>.map (· + 10)

  -- Start with sync value, but pipeline makes it async
  (asyncPipeline 5)  -- Returns AsyncMonad
  |>.map (fun x => s!"Result: {x}")
  |>.val

-- Cannot mix async into sync - this would be an error
-- def invalidMixExample : Monad' String :=
--   of 5
--   |>.chain (pka Nat |>.map (· * 2)).fn  -- Error: pka returns AsyncMonad, not Monad'
--   |>.val

-- Proper async composition
def properAsyncComposition : Task String :=
  let asyncDouble := pka Nat |>.map (· * 2)
  let asyncAddTen := pka Nat |>.map (· + 10)

  pof 5
  |>.chain asyncDouble.fn  -- pka returns AsyncMonad
  |>.chain asyncAddTen.fn
  |>.map (fun x => s!"Result: {x}")
  |>.val

-- Mixing sync arrows in async chains - multiple approaches
def mixSyncInAsyncExample : Task String :=
  let syncDouble := ka Nat |>.map (· * 2)     -- Returns Monad'
  let asyncAddTen := pka Nat |>.map (· + 10)  -- Returns AsyncMonad

  -- Approach 1: Using chainSync (convenience method)
  pof 5
  |>.chainSync syncDouble.fn   -- Sync arrow works in async chain!
  |>.chain asyncAddTen.fn      -- Async arrow uses regular chain
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 20"

-- Using regular chain with lifted sync functions (no chainSync)
def liftedSyncExample : Task String :=
  let syncDouble := ka Nat |>.map (· * 2)
  let syncAddTen := ka Nat |>.map (· + 10)

  -- Approach 2: Manually lift sync to async
  pof 5
  |>.chain (AsyncMonad.liftSync syncDouble.fn)  -- Lift sync arrow
  |>.chain (AsyncMonad.liftSync syncAddTen.fn)  -- Lift another sync arrow
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 20"

-- Using toAsync to convert arrows
def toAsyncExample : Task String :=
  let syncDouble := ka Nat |>.map (· * 2)
  let asyncDouble := syncDouble.toAsync  -- Convert to async arrow

  pof 5
  |>.chain asyncDouble.fn  -- Now it's async, works with chain
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 10"

-- Sync functions in async chains
def syncFnInAsyncExample : Task String :=
  let syncFn (x : Nat) : Monad' Nat := of (x * 3)
  let asyncFn (x : Nat) : AsyncMonad Nat := pof (x + 7)

  -- Without chainSync, manually lift
  pof 10
  |>.chain (AsyncMonad.liftSync syncFn)  -- Lift sync function
  |>.chain asyncFn                        -- Async function works directly
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 37"

-- Direct composition with lift
def directLiftExample : Task String :=
  let syncPipeline := ka Nat
    |>.map (· * 2)
    |>.map (· + 10)

  -- Convert sync arrow to async arrow for direct use
  let asyncPipeline : Nat → AsyncMonad Nat :=
    AsyncMonad.liftSync syncPipeline.fn

  pof 5
  |>.chain asyncPipeline
  |>.map (fun x => s!"Result: {x}")
  |>.val  -- "Result: 20"

-- Real-world example: mixing sync and async operations
def realWorldExample : Task String :=
  let validateSync (x : Nat) : Monad' Nat :=
    if x > 0 then of x else of 1

  let processAsync := pka Nat
    |>.map (· * 2)
    |>.tap (fun x => dbgTrace s!"Processing: {x}" fun _ => ())

  let formatSync := ka Nat
    |>.map (fun x => s!"Final value: {x}")

  -- Mix sync and async freely in async context
  pof 15
  |>.chainSync validateSync     -- Sync validation
  |>.chain processAsync.fn      -- Async processing
  |>.chainSync formatSync.fn    -- Sync formatting
  |>.val

-- Direct pof.chain(ka) example
def pofChainKaExample : Task String :=
  let syncArrow := ka Nat
    |>.map (· * 2)
    |>.map (· + 10)
    |>.map (fun x => s!"Result: {x}")

  -- pof can chain sync arrow using chainSync
  pof 5
  |>.chainSync syncArrow.fn  -- Works perfectly!
  |>.val  -- "Result: 20"

-- Another pof.chain(ka) pattern
def asyncMonadWithSyncArrowExample : Task String :=
  let processSync := ka Nat
    |>.tap (fun x => dbgTrace s!"Processing: {x}" fun _ => ())
    |>.map (· * 3)

  let formatSync := ka Nat
    |>.map (fun x => s!"Formatted: {x}")

  -- Chain multiple sync arrows in async monad
  pof 7
  |>.chainSync processSync.fn   -- First sync arrow
  |>.chainSync formatSync.fn    -- Second sync arrow
  |>.val  -- "Formatted: 21"

-- Manual lifting example
def manualLiftExample : Task String :=
  let syncTransform := ka Nat
    |>.map (· * 5)
    |>.map (fun x => s!"Times 5 = {x}")

  -- Without chainSync, manually lift
  pof 4
  |>.chain (fun x => pof (syncTransform x).val)
  |>.val  -- "Times 5 = 20"

-- Async device example
def asyncDeviceExample : Task Nat :=
  let methods : NumberMethods := ⟨(· + ·), (· * ·)⟩
  let asyncDevice := pdev methods 10

  asyncDevice
  |>.map (· * 2)
  |>.val

end Examples

-- API Summary matching JS
namespace APISummary

/-
Unified API matching JavaScript implementation:

**Core Monads:**
- `of(value)` - create sync monad with isMonad marker
- `pof(value)` - create async monad
- `map(fn)` - transform value, returns new monad
- `tap(fn)` - side effects, returns same monad
- `chain(fn)` - flat map, validates fn returns monad
- `to(fn)` - extract and transform value
- `val()` - extract raw value

**Kleisli Arrows (Builders):**
- `ka()` - create sync arrow with isKa marker
- `pka()` - create async arrow with isKa and isAsync markers
- `map(fn)` - add transformation step
- `tap(fn)` - add side effect step
- `chain(fn)` - add monadic step
- `fn()` - convert arrow to function

**Devices (Domain-Specific Wrappers):**
- `dev(methods)(value)` - create sync device with isDevice marker
- `pdev(methods)(value)` - create async device
- Supports all monad operations (map, tap, chain, to, val)
- Custom methods accessible via device.methods
- `monad()` - extract the wrapped value as a regular monad:
  - `Device → Monad'` for sync devices
  - `AsyncDevice → AsyncMonad` for async devices
- Use case: When you need to pass device data to functions expecting monads

**Option Handling:**
- `opt(compute)` - safe sync extraction to Option
- `popt(compute)` - safe async extraction to Option

**Sync/Async Rules (matching JS):**
- Sync operations CAN be used in async contexts (must be lifted)
- Async operations CANNOT be used in sync contexts
- `of/ka/dev` are sync, `pof/pka/pdev` are async
- Once async, always async - no way back to sync

**Handling sync in async (comparing languages):**
- **JavaScript**: Automatic lifting in chain (detects sync/async at runtime)
- **Rust**: Uses different types (SyncMonad vs AsyncMonad, no mixing)
- **Lean**: Requires explicit lifting via:
  1. `chainSync` - convenience method
  2. `liftSync` - manual lifting: `chain (liftSync syncFn)`
  3. `toAsync` - convert arrows: `syncArrow.toAsync`

**Example patterns:**
```lean
-- JS style (automatic): pof(5).chain(syncFn).chain(asyncFn)
-- Lean equivalent: pof 5 |>.chainSync syncFn |>.chain asyncFn
-- Or manually: pof 5 |>.chain (liftSync syncFn) |>.chain asyncFn
```

**Why the difference?**
- JS uses dynamic typing and runtime detection
- Rust keeps sync/async completely separate
- Lean provides explicit conversion methods for type safety

**Key Features from JS:**
- Marker fields (isMonad, isKa, isDevice, isAsync)
- Chain validation (must return monad)
- Method chaining with immutable updates
- Custom device methods
- Direct arrow invocation via fn()
- Strict sync/async separation with sync-to-async lifting

**Differences from JS:**
- Type parameters must be explicit in some cases
- No runtime type checking for arrow prevention in chain
- Device methods must be predefined in a structure
- Option handling uses computation functions instead of direct monads
- Async uses Task instead of Promise
-/

end APISummary
