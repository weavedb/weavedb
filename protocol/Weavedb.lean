-- This module serves as the root of the `Weavedb` library.
-- Import modules here that should be built as part of the library.

-- Core data structures and types
import Weavedb.Data
import Weavedb.Types

-- Write pipeline components (in order of execution)
import Weavedb.Init
import Weavedb.Normalize
import Weavedb.Verify
import Weavedb.Parse
import Weavedb.Auth
import Weavedb.Write

-- Storage layer
import Weavedb.Store

-- Build system
import Weavedb.Build

-- High-level database interface
import Weavedb.DB

/-!
# WeaveDB Protocol Implementation

WeaveDB is a decentralized NoSQL database protocol implemented in Lean 4.

## Architecture

The system follows a pipeline architecture for processing database operations:

1. **Normalize**: Validates and normalizes incoming messages
2. **Verify**: Checks nonces and updates account state
3. **Parse**: Extracts operation parameters from queries
4. **Auth**: Validates permissions based on auth rules
5. **Write**: Executes the database operation

## Key Components

- `Data`: Core data structure representing the database
- `Types`: Type definitions including Query, Operation, State, etc.
- `Store`: Storage layer abstraction
- `Build`: System for building database instances with pipelines
- `DB`: High-level database interface

## Directory Structure

The database uses a fixed directory structure:
- Index 0: System directory ("_")
- Index 1: Config directory ("_config")
- Index 2: Accounts directory ("__accounts__")
- Index 3: Indexes directory ("__indexes__")
- Index 4+: User-defined directories

-/
