import Weavedb

open Weavedb.DB

def main : IO Unit := do
  IO.println "WeaveDB Test"

  -- Create and use the database
  let db := empty
  let db := insert db "key1" "value1"
  let db := insert db "key2" "value2"

  match get db "key1" with
  | some v => IO.println s!"Found: {v}"
  | none => IO.println "Not found"

  IO.println "Done!"
