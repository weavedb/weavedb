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

-- Custom bind instance for do notation
instance : Bind Monad' where
  bind := fun ma f => chain f ma

instance : Pure Monad' where
  pure := of

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
def tap (f : α → Task Unit) (m : AsyncMonad α) : AsyncMonad α :=
  ⟨m.task.bind fun a => f a |>.map fun _ => a⟩

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

-- Function pipeline for composing operations
structure Pipeline (α : Type u) where
  steps : List (α → α)

namespace Pipeline

-- Create empty pipeline
def empty : Pipeline α := ⟨[]⟩

-- Add map step
def map (f : α → α) (p : Pipeline α) : Pipeline α :=
  ⟨p.steps ++ [f]⟩

-- Add tap step
def tap (f : α → Unit) (p : Pipeline α) : Pipeline α :=
  let tapFn := fun a =>
    let _ := f a
    a
  ⟨p.steps ++ [tapFn]⟩

-- Execute pipeline
def execute (p : Pipeline α) (input : α) : Monad' α :=
  let result := p.steps.foldl (fun acc f => f acc) input
  Monad'.of result

-- Convert to function
def toFn (p : Pipeline α) : α → Monad' α :=
  fun input => p.execute input

end Pipeline

-- Async pipeline for composing async operations
structure AsyncPipeline (α : Type u) where
  steps : List (α → Task α)

namespace AsyncPipeline

-- Create empty async pipeline
def empty : AsyncPipeline α := ⟨[]⟩

-- Add async map step
def map (f : α → Task α) (p : AsyncPipeline α) : AsyncPipeline α :=
  ⟨p.steps ++ [f]⟩

-- Add async tap step
def tap (f : α → Task Unit) (p : AsyncPipeline α) : AsyncPipeline α :=
  let tapFn := fun a => f a |>.map fun _ => a
  ⟨p.steps ++ [tapFn]⟩

-- Execute async pipeline
def execute (p : AsyncPipeline α) (input : α) : AsyncMonad α :=
  let runSteps := p.steps.foldl
    (fun accTask f => accTask.bind f)
    (Task.pure input)
  AsyncMonad.fromTask runSteps

-- Convert to async function
def toFn (p : AsyncPipeline α) : α → AsyncMonad α :=
  fun input => p.execute input

end AsyncPipeline

-- Helper functions similar to JS/Rust versions

-- Create sync pipeline (similar to 'fn' in JS, 'ka' in Rust)
def fn : Pipeline α := Pipeline.empty

-- Create async pipeline (similar to 'pfn' in JS, 'aka' in Rust)
def pfn : AsyncPipeline α := AsyncPipeline.empty

-- Option handling for error recovery
def opt (m : Except ε α) : Option α :=
  match m with
  | .ok a => some a
  | .error _ => none

-- Async option handling
def popt (m : Task (Except ε α)) : Task (Option α) :=
  m.map opt

-- Examples showing clean usage
namespace Examples

open Monad' AsyncMonad

-- Simple synchronous example
def syncExample : Nat :=
  let m := of 10
  let m' := m.map (· * 2)
  let m'' := m'.map (· + 5)
  m''.to id  -- Result: 25

-- Pipeline example
def pipelineExample : Nat :=
  let pipeline := fn
    |>.map (· * 2)
    |>.tap (fun x => dbgTrace s!"Value is {x}" fun _ => ())
    |>.map (· + 10)

  (pipeline.execute 5).val  -- Result: 20

-- Async example
def asyncExample : Task Nat :=
  let m := pof 42
  let m' := m.map (fun x => x * 2)
  let m'' := m'.map (fun x => x + 10)
  m''.val

-- Chaining example using do notation
def chainExample : String := Id.run do
  let mx ← pure (of 5)
  let x := mx.val
  let my ← pure (of (x * 2))
  let y := my.val
  pure s!"Result is {y}"  -- Result: "Result is 10"

-- Alternative chaining without do notation
def chainExample2 : String :=
  let m := of 5
  let m' := m.chain (fun x => of (x * 2))
  let m'' := m'.chain (fun x => of s!"Result is {x}")
  m''.val  -- Result: "Result is 10"

end Examples
