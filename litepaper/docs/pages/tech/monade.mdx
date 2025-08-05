# Monade API - Mathematical Explanation

## Core Concepts

### Monad M
A monad is a type constructor `M` with two operations:
- **return** (we call it `of`): `a → M a`
- **bind** (we call it `chain`): `M a → (a → M b) → M b`

### Kleisli Arrow
A Kleisli arrow is a function of type `a → M b` where `M` is a monad.

---

## API Operations

### 1. **of / pof** - Monad Constructor
```
of : a → M a
pof : a → P a  (where P is the async monad)
```

**Example:**
```javascript
of(5)    // Wraps 5 in a monad: M(5)
pof(5)   // Wraps 5 in an async monad: P(5)
```

**Mathematical meaning:** The `return` operation that lifts a pure value into the monad.

---

### 2. **map** - Functor Map
```
map : (a → b) → M a → M b
```

**Example:**
```javascript
of(5).map(x => x * 2)  // M(5) → M(10)
```

**Mathematical composition:**
```
map f = chain (of ∘ f)
```
This is why we can chain maps: each map preserves the monadic structure.

---

### 3. **tap** - Side Effect
```
tap : (a → ()) → M a → M a
```

**Example:**
```javascript
of(5).tap(x => console.log(x))  // M(5), logs 5, returns M(5)
```

**Mathematical meaning:** Performs side effects without changing the wrapped value.

---

### 4. **chain** - Monadic Bind
```
chain : (a → M b) → M a → M b
```

**Example:**
```javascript
of(5).chain(x => of(x * 2))  // M(5) → M(10)
```

**Mathematical meaning:** This is the monadic bind (>>=) operation. It's associative:
```
(m >>= f) >>= g ≡ m >>= (λx. f x >>= g)
```

---

### 5. **to** - Extract with Transformation
```
to : (a → b) → M a → b
```

**Example:**
```javascript
of(5).to(x => x * 2)  // M(5) → 10 (unwrapped)
```

**Mathematical meaning:** Extracts and transforms in one step. Breaks the monad.

---

### 6. **val** - Extract Value
```
val : M a → a
```

**Example:**
```javascript
of(5).val()  // M(5) → 5
```

**Mathematical meaning:** Extracts the wrapped value. Note: This makes our monad "pointed" (not all monads have this).

---

## Kleisli Arrows (ka/pka)

### Construction
```
ka : () → (a → M a)
pka : () → (a → P a)
```

### Operations on Arrows
```
map : (b → c) → (a → M b) → (a → M c)
chain : (b → M c) → (a → M b) → (a → M c)
```

**Example:**
```javascript
const arrow = ka()
  .map(x => x * 2)    // Creates: a → M(2a)
  .map(x => x + 10)   // Creates: a → M(2a + 10)
  .fn()               // Converts to usable function
```

---

## Why Chaining Works Mathematically

### Functor Laws
```
1. map id = id                    // Identity
2. map (g ∘ f) = map g ∘ map f   // Composition
```

### Monad Laws
```
1. of(a).chain(f) ≡ f(a)                    // Left identity
2. m.chain(of) ≡ m                          // Right identity  
3. m.chain(f).chain(g) ≡ m.chain(x => f(x).chain(g))  // Associativity
```

### Kleisli Composition
For functions `f: a → M b` and `g: b → M c`:
```
(f >=> g) = λa. f(a).chain(g)
```

This is associative, which is why we can chain operations cleanly!

---

## Cleanest Example

```javascript
// Pure functions
const validate = x => x > 0 ? x : 0
const double = x => x * 2
const format = x => `Result: ${x}`

// Monadic pipeline
const result = of(5)          // M(5)
  .map(validate)              // M(5)
  .map(double)                // M(10)
  .map(format)                // M("Result: 10")
  .val()                      // "Result: 10"

// Kleisli arrow (equivalent)
const pipeline = ka()         // Creates identity arrow
  .map(validate)              // a → M(validate(a))
  .map(double)                // a → M(double(validate(a)))
  .map(format)                // a → M(format(double(validate(a))))
  .fn()                       // Extracts the function

const result2 = pipeline(5).val()  // "Result: 10"
```

## Key Insight

The beauty of this API is that it maintains the monad laws while providing an intuitive interface:

1. **of** lifts values into the monad
2. **map** transforms values inside the monad
3. **chain** sequences monadic computations
4. **ka/pka** builds reusable monadic functions

Everything composes cleanly because we're following the mathematical laws of functors and monads!
