-- Monade.lean
-- A clean monad implementation inspired by monade.js and monade.rs

universe u v

-- Core monad structure for synchronous operations
structure Monad' (α : Type u) where
  value : α

namespace Monad'

-- Constructor function similar to 'of' in JS / Rust
def of (a : α) : Monad' α := ⟨a⟩

-- Functor map
def map (f : α → β) (m : Monad' α) : Monad' β :=
  of (f m.value)

-- Tap for side effects (returns original monad)
def tap (f : α → Unit) (m : Monad' α) : Monad' α :=
  let _ := f m.value
  m

-- Monadic bind/chain
def chain (f : α → Monad' β) (m : Monad' α) : Monad' β :=
  f m.value

-- Extract and transform value
def to (f : α → β) (m : Monad' α) : β :=
  f m.value

-- Extract value
def val (m : Monad' α) : α :=
  m.value

end Monad'

-- Task-based monad for async operations
structure AsyncMonad (α : Type u) where
  task : Task α

namespace AsyncMonad

-- Constructor for async monad
def pof (a : α) : AsyncMonad α :=
  ⟨Task.pure a⟩

-- Create from Task
def fromTask (t : Task α) : AsyncMonad α := ⟨t⟩

-- Async map
def map (f : α → β) (m : AsyncMonad α) : AsyncMonad β :=
  ⟨m.task.map f⟩

-- Async tap
def tap (f : α → Unit) (m : AsyncMonad α) : AsyncMonad α :=
  ⟨m.task.map (fun a => let _ := f a; a)⟩

-- Async chain
def chain (f : α → AsyncMonad β) (m : AsyncMonad α) : AsyncMonad β :=
  ⟨m.task.bind fun a => (f a).task⟩

-- Extract with transformation
def to (f : α → β) (m : AsyncMonad α) : Task β :=
  m.task.map f

-- Get underlying task
def val (m : AsyncMonad α) : Task α :=
  m.task

end AsyncMonad

-- Kleisli arrow builder for sync operations
structure KleisliArrow (α β : Type u) where
  run : α → Monad' β

namespace KleisliArrow

-- Identity arrow
def id : KleisliArrow α α := ⟨Monad'.of⟩

-- Map operation
def map (f : β → γ) (k : KleisliArrow α β) : KleisliArrow α γ :=
  ⟨fun a => k.run a |>.map f⟩

-- Tap operation
def tap (f : β → Unit) (k : KleisliArrow α β) : KleisliArrow α β :=
  ⟨fun a => k.run a |>.tap f⟩

-- Chain operation
def chain (f : β → Monad' γ) (k : KleisliArrow α β) : KleisliArrow α γ :=
  ⟨fun a => k.run a |>.chain f⟩

-- Compose arrows
def compose (k2 : KleisliArrow β γ) (k1 : KleisliArrow α β) : KleisliArrow α γ :=
  ⟨fun a => k1.run a |>.chain k2.run⟩

-- Convert to function
def fn (k : KleisliArrow α β) : α → Monad' β :=
  k.run

-- Make it directly callable
instance : CoeFun (KleisliArrow α β) (fun _ => α → Monad' β) where
  coe := fn

end KleisliArrow

-- Async Kleisli arrow builder
structure AsyncKleisliArrow (α β : Type u) where
  run : α → AsyncMonad β

namespace AsyncKleisliArrow

-- Identity arrow
def id : AsyncKleisliArrow α α := ⟨AsyncMonad.pof⟩

-- Map operation
def map (f : β → γ) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α γ :=
  ⟨fun a => k.run a |>.map f⟩

-- Tap operation
def tap (f : β → Unit) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α β :=
  ⟨fun a => k.run a |>.tap f⟩

-- Chain operation
def chain (f : β → AsyncMonad γ) (k : AsyncKleisliArrow α β) : AsyncKleisliArrow α γ :=
  ⟨fun a => k.run a |>.chain f⟩

-- Compose arrows
def compose (k2 : AsyncKleisliArrow β γ) (k1 : AsyncKleisliArrow α β) : AsyncKleisliArrow α γ :=
  ⟨fun a => k1.run a |>.chain k2.run⟩

-- Convert to function
def fn (k : AsyncKleisliArrow α β) : α → AsyncMonad β :=
  k.run

-- Make it directly callable
instance : CoeFun (AsyncKleisliArrow α β) (fun _ => α → AsyncMonad β) where
  coe := fn

end AsyncKleisliArrow

-- Simple API

-- Kleisli arrow constructors
def ka (α : Type u) : KleisliArrow α α := KleisliArrow.id
def pka (α : Type u) : AsyncKleisliArrow α α := AsyncKleisliArrow.id

-- Option handling
def opt (m : Except ε α) : Option α :=
  match m with
  | .ok a => some a
  | .error _ => none

def popt (m : Task (Except ε α)) : Task (Option α) :=
  m.map opt

-- Examples
namespace Examples

open Monad' AsyncMonad KleisliArrow AsyncKleisliArrow

-- Define reusable functions
def double (x : Nat) : Nat := x * 2
def addTen (x : Nat) : Nat := x + 10
def toString (x : Nat) : String := s!"Result: {x}"
def logValue (x : Nat) : Unit := dbgTrace s!"Value: {x}" fun _ => ()

-- Simple sync example
def syncExample : String :=
  Monad'.of 5
  |>.map double
  |>.map addTen
  |>.map toString
  |>.val  -- Result: "Result: 20"

-- Kleisli arrow example
def kaExample : String :=
  let pipeline := ka Nat
    |>.map double
    |>.tap logValue
    |>.map addTen

  Monad'.of 5
  |>.chain pipeline.fn
  |>.map toString
  |>.val  -- Result: "Result: 20"

-- Direct arrow call
def directArrowExample : String :=
  let transform := ka Nat
    |>.map double
    |>.map addTen
    |>.map toString

  (transform 5).val  -- Result: "Result: 20"

-- Async example
def asyncExample : Task String :=
  AsyncMonad.pof 5
  |>.map double
  |>.map addTen
  |>.map toString
  |>.val

-- Async Kleisli arrow
def pkaExample : Task String :=
  let pipeline := pka Nat
    |>.map double
    |>.map addTen

  (AsyncMonad.pof 5
    |>.chain pipeline.fn
    |>.map toString)
    |>.val  -- Result: "Result: 20"

-- Composition example using chain
def compositionExample : String :=
  let doubleMonad (x : Nat) : Monad' Nat := Monad'.of (double x)
  let addTenMonad (x : Nat) : Monad' Nat := Monad'.of (addTen x)

  let pipeline := ka Nat
    |>.chain doubleMonad
    |>.chain addTenMonad
    |>.map toString

  (pipeline 5).val  -- Result: "Result: 20"

-- Arrow composition example
def arrowCompositionExample : String :=
  let double := ka Nat |>.map (· * 2)
  let addTen := ka Nat |>.map (· + 10)
  let toString' := ka Nat |>.map toString
  -- Compose manually using chain
  let combined : KleisliArrow Nat String := ⟨fun x =>
    double.run x |>.chain addTen.run |>.chain toString'.run⟩

  (combined 5).val  -- Result: "Result: 20"

end Examples

-- API Summary
namespace APISummary

/-
Unified API across JS/Rust/Lean:

**Monads:**
- `of` / `pof` - create sync/async monads
- `map` - transform value
- `tap` - side effects
- `chain` - flat map
- `to` - extract with transformation
- `val` - extract value

**Kleisli Arrows:**
- `ka` / `pka` - create sync/async arrows
- `map` - transform output
- `tap` - side effects on output
- `chain` - compose with other functions
- `fn` - convert to function

Arrow composition:
- JavaScript: `ka1.chain(ka2)`
- Lean: Manual composition via chain or helper functions
-/

end APISummary
