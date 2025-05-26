# WeaveDB Protocol

A Lean 4 implementation of the WeaveDB decentralized database protocol. This implementation provides a pipeline-based architecture for processing database operations with built-in authentication, normalization, and validation.

## Overview

WeaveDB is a NoSQL database protocol that organizes data into directories containing documents. Each operation flows through a configurable pipeline of processing stages, ensuring consistency, security, and correctness at each step.

### Key Features

- **Pipeline Architecture**: Modular processing stages for read/write operations
- **Directory-Based Organization**: Documents are organized into named directories
- **Built-in Authentication**: Configurable auth rules per directory
- **Schema Validation**: Optional JSON Schema validation for documents
- **Nonce-Based Ordering**: Prevents replay attacks and ensures operation ordering
- **Base64url Document IDs**: URL-safe identifiers for documents

## Architecture

### Core Components

1. **Data Layer** (`Data.lean`)
   - `Doc`: Key-value document structure
   - `Dir`: Directory containing documents
   - `Data`: Array of directories

2. **Type System** (`Types.lean`)
   - `WriteM`: Monad for write operations
   - `Context`: Operation context with state, message, environment
   - `WriteResult`: Success/error result type

3. **Pipeline Stages**
   - `Init.lean`: Initialize operation context
   - `Normalize.lean`: Process headers and extract operation
   - `Verify.lean`: Verify nonce and update accounts
   - `Parse.lean`: Parse query and prepare data
   - `Auth.lean`: Check permissions based on rules
   - `Write.lean`: Execute write operations

4. **Build System** (`Build.lean`)
   - Configurable pipeline composition
   - Read/write operation builders

## Directory Structure

```
.
├── Weavedb.lean       # Root module
├── Main.lean          # Example usage
└── Weavedb/
    ├── Data.lean      # Core data structures
    ├── Types.lean     # Type definitions
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

WeaveDB uses special system directories:

- **Directory 0 (`_`)**: Metadata about user-defined directories
- **Directory 1 (`_config`)**: Database configuration
- **Directory 2 (`__accounts__`)**: Account nonces for replay protection
- **Directory 3 (`__indexes__`)**: Index structures

## Usage

### Basic Example

```lean
import Weavedb
open Weavedb.Data

-- Create a document
let userDoc := Doc.fromList [
  ("name", "Alice"),
  ("email", "alice@example.com"),
  ("role", "admin")
]

-- Create a directory and add the document
let usersDir := Dir.empty.set "user1" userDoc

-- Create data structure with the directory
let data := empty.addDir usersDir
```

### Pipeline Operations

Operations flow through the pipeline:

```
Write: normalize → verify → parse → auth → write
Read:  normalize → parse → read
```

Each stage transforms the context, with errors short-circuiting the pipeline.

### Creating a Database Instance

```lean
import Weavedb.DB

-- The default database instance with configured pipelines
let db := Weavedb.DB.db
```

## Data Model

### Documents

Documents are key-value stores with string keys and values:

```lean
let doc := Doc.fromList [
  ("field1", "value1"),
  ("field2", "value2")
]
```

### Directories

Directories contain documents indexed by base64url IDs:

```lean
let dir := Dir.empty
  |>.set "docId1" doc1
  |>.set "docId2" doc2
```

### Operations

- **set**: Create or overwrite a document
- **update**: Update an existing document
- **upsert**: Update if exists, insert if not
- **del**: Delete a document
- **get**: Retrieve a document
- **cget**: Cached get operation

## Authentication

Each directory can have authentication rules that control access:

```lean
let dirMeta := Doc.fromList [
  ("name", "users"),
  ("auth", "[\"set,update:owner\", \"del:admin\"]")
]
```

## Message Format

Operations are sent as messages with headers:

```lean
let msg : Msg := {
  headers := {
    signature := "..."
    signatureInput := "sig1=(query nonce id);alg=\"eddsa\";keyid=\"...\""
    nonce := 1
    query := "[\"set\", {...}, \"users\", \"docId\"]"
    id := "process-id"
    contentDigest := "..."
  }
  body := ""
}
```

## Development

### Building

```bash
lake build
```

### Running

```bash
.lake/build/bin/weavedb
```

### Adding New Pipeline Stages

1. Create a new module implementing `WriteM`
2. Add it to the pipeline configuration in `DB.lean`
3. Import it in `Weavedb.lean`

## Design Principles

1. **Modularity**: Each pipeline stage is independent and composable
2. **Type Safety**: Lean's type system ensures correctness
3. **Immutability**: Data structures are immutable, operations return new versions
4. **Error Handling**: Explicit error handling with `WriteResult`
5. **Extensibility**: Easy to add new operations or pipeline stages

## Mathematical Provability

WeaveDB is the **first ever mathematically provable modular database protocol**. By implementing the protocol in Lean 4, we can:

- **Formally verify** correctness properties of each pipeline stage
- **Prove invariants** about data consistency and operation ordering
- **Guarantee** that authentication rules are properly enforced
- **Mathematically ensure** that the pipeline composition preserves safety properties

This level of formal verification is unprecedented in database systems and provides unparalleled confidence in the protocol's correctness.

## Ultimate Modularity: Swap Your Database Backend

The true power of WeaveDB's modular architecture is that you can **completely swap out the underlying database implementation** by changing pipeline devices. The same protocol can power:

### NoSQL Database (Default)
```javascript
export default build({
  write: [normalize, verify, parse, auth, write],
  read: [normalize, parse, read]
})
```

### SQL Database
```javascript
export default build({
  write: [normalize, verify, parse_sql, write_sql],
  __read__: { sql: [sql] }
})
```

### Vector Database
```javascript
export default build({
  async: true,
  write: [normalize, verify, parse_vec, write_vec],
  __read__: { 
    search: [search], 
    vectorSearch: [vectorSearch], 
    query: [query] 
  }
})
```

This means you can:
- Use the **same authentication system** across different database types
- Apply the **same validation rules** whether using SQL or NoSQL
- Maintain **consistent operation semantics** regardless of backend
- **Mix and match** different storage engines for different directories

No other database protocol offers this level of flexibility while maintaining mathematical guarantees about correctness. WeaveDB truly is a universal database protocol that adapts to your needs.

## WeaveDB: The First zkDB

WeaveDB is the first zero-knowledge database (zkDB) protocol. As detailed in the v0.3 litepaper, it combines several technical innovations to create a new category of database system:

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
- **Permanent Storage**: Arweave with ARJSON encoding (up to 20x more efficient than MessagePack/CBOR for heavily patterned data)
- **Performance**: Cloud-grade latency through rollup architecture

**Access Control**
- **FPJSON**: Functional programming DSL with 250+ functions encoded in JSON
- **Smart Contract Logic**: Data mutations during authentication
- **Permissionless Updates**: Anyone can submit queries with proper authorization

### Technical Specifications

**Database Constraints**
- Document IDs: Base64url, up to 20 bytes
- Collections: 2^20 documents per collection
- Query Performance: Millisecond response times
- Proof Size: Typically under 10KB

**Supported Paradigms**
- NoSQL (default implementation)
- SQL (via index/schema modifications)
- Vector (embedding layer addition)
- Graph (relationship indexing)

**Scalability**
- Vertical: Limited only by hardware
- Horizontal: KV store partitioning
- Storage: Incremental bit-level updates

### Implementation Details

**Pipeline Architecture**
```
Write: init → normalize → verify → parse → auth → write → commit
Read: init → normalize → parse → read
```

**System Directories**
- `dir[0]`: Metadata about user directories
- `dir[1]`: Database configuration
- `dir[2]`: Account nonces (replay protection)
- `dir[3]`: Index structures

**Message Format**
```javascript
{
  headers: {
    signature: "...",
    "signature-input": "sig1=(...);alg=\"ecdsa\";keyid=\"...\"",
    nonce: 1,
    query: "[\"set\", {...}, \"users\", \"docId\"]",
    id: "database-process-id",
    "content-digest": "sha256-..."
  }
}
```

### Use Cases

**Off-Chain State Storage**
- Reduce on-chain storage costs by 1000x
- Maintain cryptographic verifiability
- Enable complex queries not possible on-chain

**Privacy-Preserving Queries**
- Prove data membership without revealing content
- Selective disclosure with ZK proofs
- GDPR-compliant data handling

**Cross-Chain Data Sharing**
- Verifiable state across multiple blockchains
- Universal data layer for multi-chain apps
- Trustless bridges via merkle proofs

**Verifiable Data Pipelines**
- Auditable data transformations
- Provable data lineage
- Integrity guarantees for ML training data

### Economic Model

**Self-Sustaining Operation**
- Restaking mechanism for protocol security
- Bonding curves for database liquidity
- Query costs covered by staking yields
- No external funding required for operation

**Token Mechanics**
- `$DB`: Protocol token for staking/operations
- `$OWNER`: Per-database ownership token
- Validators stake for rewards
- Delegators earn proportional returns

WeaveDB represents a new approach to decentralized databases by combining permanent storage, zero-knowledge proofs, and self-sustaining economics. The protocol is designed to operate indefinitely without external funding while providing verifiable, private, and performant data storage.
