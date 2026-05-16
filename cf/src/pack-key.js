// Convert any LMDB-style key (string or array) into a Durable Object storage key.
// LMDB supports composite keys natively; DO storage takes strings only.
//
//   "foo"               → "foo"
//   ["__wal__", 5]      → "__wal__/5"
//   ["a", "b", 0]       → "a/b/0"
//
// `/` is the separator. Keys in core/ never contain `/`, so this is unambiguous.
// (Verified against core/src/{indexer.js, weavekv.js, dev_*.js} key constructions.)
export const packKey = k =>
  Array.isArray(k) ? k.map(String).join("/") : String(k)
