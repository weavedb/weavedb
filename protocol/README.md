# WeaveDB Protocol

A Lean 4 implementation of the WeaveDB decentralized database protocol. This implementation provides a pipeline-based architecture for processing database operations with built-in authentication, normalization, and validation.

## Overview

WeaveDB is a NoSQL database protocol that organizes data into directories containing documents. Each operation flows through a configurable pipeline of processing stages, ensuring consistency, security, and correctness at each step.

### Key Features

- **Pipeline Architecture**: Modular processing stages for read/write operations
- **Directory-Based Organization**: Documents are organized into named directories
- **Built-in Authentication**: Configurable auth rules per directory with FPJSON expressions
- **Schema Validation**: Optional JSON Schema validation for documents
- **Nonce-Based Ordering**: Prevents replay attacks and ensures operation ordering
- **Base64url Document IDs**: URL-safe identifiers with auto-increment support
- **Monadic Error Handling**: Type-safe error propagation through WriteM monad

## Architecture

### Core Components

1. **Data Layer** (`Data.lean`)
   - `Doc`: Key-value document structure (simplified JSON)
   - `Dir`: Directory containing documents indexed by base64url IDs
   - `Data`: Array of directories with fixed system directories

2. **Type System** (`Types.lean`)
   - `WriteM`: Monad for write operations with error handling
   - `Context`: Operation context containing state, message, environment, and data
   - `Query`: Strongly-typed query representations
   - `WriteResult`: Success/error result type

3. **Pipeline Stages**
   - `Init.lean`: Initialize operation context from KV store
   - `Normalize.lean`: Process headers, extract signer from signature
   - `Verify.lean`: Verify and increment nonce in accounts directory
   - `Parse.lean`: Parse query, resolve directories, and prepare data
   - `Auth.lean`: Check permissions based on configurable rules
   - `Write.lean`: Execute write operations and update indexes

4. **Infrastructure**
   - `Store.lean`: Storage abstraction with get/put/del operations
   - `Build.lean`: Pipeline builder and device construction
   - `Monade.lean`: Monadic utilities and Kleisli arrows
   - `DB.lean`: High-level database interface

## Directory Structure

```
.
├── Weavedb.lean       # Root module with imports
├── Main.lean          # Example usage and tests
├── lakefile.lean      # Lake build configuration
└── Weavedb/
    ├── Data.lean      # Core data structures
    ├── Types.lean     # Type definitions
    ├── Monade.lean    # Monadic utilities
    ├── Init.lean      # Context initialization
    ├── Normalize.lean # Header normalization
    ├── Verify.lean    # Nonce verification
    ├── Parse.lean     # Query parsing
    ├── Auth.lean      # Authentication
    ├── Write.lean     # Write operations
    ├── Store.lean     # Storage abstraction
    ├── Build.lean     # Pipeline builder
    └── DB.lean        # High-level interface
```

## System Directories

WeaveDB uses special system directories with fixed indices:

- **Directory 0 (`_`)**: Metadata about user-defined directories
  - Stores directory names, schemas, auth rules, and auto-increment counters
- **Directory 1 (`_config`)**: Database configuration
  - `config`: Database settings (id, owner, secure, version)
  - `info`: Basic database info (id, owner)
- **Directory 2 (`__accounts__`)**: Account nonces for replay protection
  - Each signer has a document tracking their current nonce
- **Directory 3 (`__indexes__`)**: Index structures
  - Stores index definitions and data for efficient queries

## Usage

### Basic Example

```lean
import Weavedb
open Weavedb.Data
open Weavedb.Types
open Weavedb.DB

-- Create a document
let userDoc := Doc.fromList [
  ("name", "Alice"),
  ("email", "alice@example.com"),
  ("role", "admin")
]

-- Create a set query
let query := Query.set userDoc "users" "user1"

-- Create a message
let msg := createMsg query 1 "my-process-id"

-- Execute through the database pipeline
let env := Env.mk "my-process-id" #[] none none
let ctx := mkContext initialData msg env

-- Process the write operation
match db.methods.write with
| some writeFn => 
    let newData := writeFn ctx.data msg env
    -- newData now contains the updated database
| none => -- handle no write method
```

### Pipeline Operations

Operations flow through configurable pipelines:

```
Write: init → normalize → verify → parse → auth → write
Read:  init → normalize → parse → read

Custom operations can define their own pipelines:
get:   get → parse → read
cget:  cget → parse → read
```

Each stage transforms the context, with errors short-circuiting the pipeline.

### Creating a Custom Database

```lean
import Weavedb.Build

-- Define custom pipeline stages
def myCustomAuth : WriteM := fun ctx =>
  -- Custom authentication logic
  WriteResult.ok ctx

-- Build database with custom configuration
def customDB := build {
  write := some [
    writeMToArrow normalize,
    writeMToArrow verify,
    writeMToArrow parse,
    writeMToArrow myCustomAuth,  -- Custom auth
    writeMToArrow write
  ]
  read := some [
    writeMToArrow normalize,
    writeMToArrow parse,
    writeMToArrow read
  ]
  customWrite := []
  customRead := []
  init := initFn
  store := store
}
```

## Data Model

### Documents

Documents are key-value stores with string keys and values:

```lean
let doc := Doc.fromList [
  ("name", "John Doe"),
  ("age", "30"),
  ("active", "true")
]

-- Access fields
match doc.get "name" with
| some name => -- use name
| none => -- field not found
```

### Directories

Directories contain documents indexed by base64url IDs:

```lean
let dir := Dir.empty
  |>.set "A" doc1      -- Manual ID
  |>.set "B" doc2      -- Manual ID

-- Auto-generated IDs use base64url encoding
-- First auto ID would be "B" (1 in base64url)
```

### Queries

Strongly-typed query representations:

```lean
-- Write operations
Query.set data "users" "docId"     -- Create/overwrite
Query.add data "users"              -- Auto-generate ID
Query.update data "users" "docId"   -- Update existing
Query.upsert data "users" "docId"   -- Update or insert
Query.del "users" "docId"           -- Delete

-- Read operations  
Query.get "users" "docId"           -- Retrieve document
Query.cget "users" "docId"          -- Cached get

-- Batch operations
Query.batch [op1, op2, op3]         -- Multiple operations

-- Index operations
Query.addIndex "users" [("age", "asc"), ("name", "desc")]
Query.removeIndex "users" [("age", "asc")]

-- Initialization
Query.init (Doc.fromList [("owner", "0x..."), ("secure", "true")])
```

## Authentication

Each directory can have authentication rules using pattern matching and expressions:

```lean
-- Directory metadata in system directory
let dirMeta := Doc.fromList [
  ("name", "users"),
  ("autoid", "100"),  -- Next auto-increment ID
  ("schema", "{...}"), -- JSON Schema
  ("auth", "[{\"pattern\": \"set,update\", \"fpjson\": [...]}]")
]
```

Authentication patterns:
- `"set"` - Matches set operations
- `"set,update"` - Matches set OR update
- `"set:init"` - Special pattern for initialization

## Message Format

Operations are sent as messages with HTTP Signature headers:

```lean
let msg : Msg := {
  headers := {
    signature := "sig1=:MEUCIQDx...:"
    signatureInput := "sig1=(query nonce id);alg=\"ecdsa\";keyid=\"...\""
    nonce := 1
    id := "process-id"
    contentDigest := "sha256=X48E9qOokqqrvdts8nOJRJN3OWDUoyWxBf7kbu9DBPE="
  }
  body := ""
  parsedQuery := query  -- Pre-parsed for type safety
}
```

## Error Handling

The `WriteM` monad provides clean error handling:

```lean
def someOperation : WriteM := fun ctx =>
  match ctx.state.dirIndex with
  | none => WriteResult.error "No directory in state"
  | some idx =>
    -- Process operation
    WriteResult.ok { ctx with state := newState }

-- Chain operations with automatic error propagation
def pipeline : WriteM := fun ctx =>
  match operation1 ctx with
  | WriteResult.error e => WriteResult.error e
  | WriteResult.ok ctx' =>
    match operation2 ctx' with
    | WriteResult.error e => WriteResult.error e  
    | WriteResult.ok ctx'' => operation3 ctx''
```

## Development

### Building

```bash
lake build
```

### Running Tests

```bash
lake exe weavedb
```

### Adding New Pipeline Stages

1. Create a new module implementing `WriteM`:
   ```lean
   def myStage : WriteM := fun ctx =>
     -- Process context
     WriteResult.ok { ctx with state := updatedState }
   ```

2. Add it to the pipeline configuration:
   ```lean
   write := some [
     writeMToArrow normalize,
     writeMToArrow myStage,  -- New stage
     writeMToArrow verify,
     -- ...
   ]
   ```

3. Import the module in `Weavedb.lean`

## Design Principles

1. **Modularity**: Each pipeline stage is independent and composable
2. **Type Safety**: Lean's type system ensures correctness at compile time
3. **Immutability**: All data structures are immutable, operations return new versions
4. **Error Handling**: Explicit error handling with `WriteResult` type
5. **Extensibility**: Easy to add new operations, stages, or storage backends

## Mathematical Provability

WeaveDB is the **first ever mathematically provable modular database protocol**. By implementing the protocol in Lean 4, we can:

- **Formally verify** correctness properties of each pipeline stage
- **Prove invariants** about data consistency and operation ordering
- **Guarantee** that authentication rules are properly enforced
- **Mathematically ensure** that the pipeline composition preserves safety properties

Example properties that can be proven:
```lean
-- Nonce monotonicity
theorem nonce_increases (ctx : Context) (ctx' : Context) :
  verify ctx = WriteResult.ok ctx' → 
  ctx'.state.nonce > ctx.state.nonce

-- Directory existence preservation
theorem dir_exists_after_write (ctx : Context) (ctx' : Context) :
  write ctx = WriteResult.ok ctx' →
  ctx.state.dirIndex.isSome →
  ∃ dir, ctx'.data.getDir ctx.state.dirIndex = some dir
```

## Ultimate Modularity: Swap Your Database Backend

The true power of WeaveDB's modular architecture is that you can **completely swap out the underlying database implementation** by changing pipeline devices. The same protocol can power:

### NoSQL Database (Default)
```lean
def nosqlDB := build {
  write := some [normalize, verify, parse, auth, write]
  read := some [normalize, parse, read]
  -- ...
}
```

### SQL Database
```lean
def sqlDB := build {
  write := some [normalize, verify, parse_sql, auth, write_sql]
  customRead := [("sql", [parse_sql, execute_sql])]
  -- ...
}
```

### Vector Database
```lean
def vectorDB := build {
  async := true
  write := some [normalize, verify, parse_vec, auth, write_vec]
  customRead := [
    ("search", [parse_search, vector_search]),
    ("similarity", [parse_similarity, similarity_search])
  ]
  -- ...
}
```

This means you can:
- Use the **same authentication system** across different database types
- Apply the **same validation rules** whether using SQL or NoSQL
- Maintain **consistent operation semantics** regardless of backend
- **Mix and match** different storage engines for different directories

## WeaveDB: The First zkDB

WeaveDB pioneers the zero-knowledge database (zkDB) category by combining:

### Core Technologies

**Mathematical Foundation**
- All operations expressed as monads in Category Theory
- Formally verifiable in Lean 4
- Composable and swappable pipeline stages

**Zero-Knowledge Capabilities**
- **zkJSON**: Packs arbitrary JSON into uint256 arrays for efficient ZK circuits
- **zkDB**: Nested Sparse Merkle Trees enable proofs of specific data without revealing other content
- **Proof Generation**: ~2-5 seconds on consumer hardware

**Storage Architecture**
- **WAL Layer**: HyperBEAM (AO Core Protocol) for verifiable state transitions
- **Permanent Storage**: Arweave with ARJSON encoding
- **Performance**: Cloud-grade latency through rollup architecture