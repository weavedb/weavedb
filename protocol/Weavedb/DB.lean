
import Std.Data.HashMap

namespace Weavedb.DB

/-- A minimal key-value DB mapping `String` → `String`. -/
structure DB where
  /-- The raw store for this simple DB. -/
  data : Std.HashMap String String

/-- The empty DB. -/
def empty : DB :=
  { data := {} }

/-- Insert a key-value pair into the DB. -/
def insert (db : DB) (key : String) (val : String) : DB :=
  { data := db.data.insert key val }

/-- Read a value by key from the DB. -/
def get (db : DB) (key : String) : Option String :=
  db.data[key]?

end Weavedb.DB
