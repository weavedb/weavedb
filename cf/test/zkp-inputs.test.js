// Unit tests for cf/src/zkp-inputs.js.
//
// Validate the inputs we'll hand to a client-side prover:
// shape, lengths, encoding determinism, error paths. The siblings/root
// section is null in PR 3; PR 4 fills it.

import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import doKv from "../src/do-kv.js"
import { MockStorage } from "./mock-storage.js"
import { computeZkpInputs } from "../src/zkp-inputs.js"

async function ioWithFixture() {
  const io = await doKv(new MockStorage())
  io.put(["_", "users"], { index: 3, schema: { type: "object" }, auth: [] })
  io.put(["users", "alice"], { name: "Alice", age: 30 })
  io.put(["users", "bob"], { name: "Bob", age: 24, tags: ["x", "y"] })
  await io.flush()
  return io
}

describe("computeZkpInputs: success path", () => {
  let io
  beforeEach(async () => {
    io = await ioWithFixture()
  })

  it("returns success with encoded json/path/val", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.success, true)
    assert.ok(Array.isArray(r.inputs.json), "json must be array")
    assert.ok(Array.isArray(r.inputs.path), "path must be array")
    assert.ok(Array.isArray(r.inputs.val), "val must be array")
  })

  it("pads json to size_json (default 256)", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.inputs.json.length, 256)
  })

  it("pads path to size_path (default 4)", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.inputs.path.length, 4)
  })

  it("pads val to size_val (default 8)", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.inputs.val.length, 8)
  })

  it("custom params override defaults", () => {
    const r = computeZkpInputs({
      io,
      dir: "users",
      doc: "alice",
      path: "name",
      params: { size_json: 256, size_path: 32, size_val: 256, level_col: 24, level: 184 },
    })
    assert.equal(r.inputs.path.length, 32)
    assert.equal(r.inputs.val.length, 256)
    assert.equal(r.meta.params.level_col, 24)
    assert.equal(r.meta.params.level, 184)
  })

  it("sets col_key from dirinfo.index", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.inputs.col_key, 3)
    assert.equal(r.meta.col_id, 3)
  })

  it("sets key as toIndex(doc)", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    // toIndex is deterministic — same doc id always maps to same key.
    const r2 = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.inputs.key, r2.inputs.key)
    assert.notEqual(r.inputs.key, "")
  })

  it("marks the result as not complete (siblings missing)", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.meta.complete, false)
    assert.equal(r.inputs.siblings, null)
    assert.equal(r.inputs.col_siblings, null)
    assert.equal(r.inputs.root, null)
    assert.equal(r.inputs.col_root, null)
  })

  it("encoding is deterministic across calls", () => {
    const a = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    const b = computeZkpInputs({ io, dir: "users", doc: "alice", path: "name" })
    assert.deepEqual(a.inputs.json, b.inputs.json)
    assert.deepEqual(a.inputs.path, b.inputs.path)
    assert.deepEqual(a.inputs.val, b.inputs.val)
  })

  it("empty path is allowed (proves the whole doc)", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "alice" })
    assert.equal(r.success, true)
    assert.equal(r.inputs.path.length, 4)
  })

  it("path resolves nested values", () => {
    const r1 = computeZkpInputs({ io, dir: "users", doc: "bob", path: "name" })
    const r2 = computeZkpInputs({ io, dir: "users", doc: "bob", path: "age" })
    // Different paths produce different val signal arrays.
    assert.notDeepEqual(r1.inputs.val, r2.inputs.val)
  })

  it("query mode encodes the query into val instead of fetched value", () => {
    const r1 = computeZkpInputs({
      io,
      dir: "users",
      doc: "bob",
      path: "age",
    })
    const r2 = computeZkpInputs({
      io,
      dir: "users",
      doc: "bob",
      path: "age",
      query: ["$gte", 18],
    })
    assert.notDeepEqual(r1.inputs.val, r2.inputs.val)
  })
})

describe("computeZkpInputs: error paths", () => {
  let io
  beforeEach(async () => {
    io = await ioWithFixture()
  })

  it("rejects missing dir", () => {
    const r = computeZkpInputs({ io, doc: "alice" })
    assert.equal(r.success, false)
    assert.match(r.err, /dir is required/)
  })

  it("rejects empty dir", () => {
    const r = computeZkpInputs({ io, dir: "", doc: "alice" })
    assert.equal(r.success, false)
  })

  it("rejects underscore-prefixed dir (config namespace)", () => {
    const r = computeZkpInputs({ io, dir: "_config", doc: "schema_3" })
    assert.equal(r.success, false)
    assert.match(r.err, /underscore-prefixed/)
  })

  it("rejects missing doc", () => {
    const r = computeZkpInputs({ io, dir: "users" })
    assert.equal(r.success, false)
    assert.match(r.err, /doc is required/)
  })

  it("rejects unknown dir", () => {
    const r = computeZkpInputs({ io, dir: "nope", doc: "x" })
    assert.equal(r.success, false)
    assert.match(r.err, /dir doesn't exist/)
  })

  it("rejects unknown doc", () => {
    const r = computeZkpInputs({ io, dir: "users", doc: "ghost" })
    assert.equal(r.success, false)
    assert.match(r.err, /doc doesn't exist/)
  })

  it("rejects dir without zk index", async () => {
    const io2 = await doKv(new MockStorage())
    io2.put(["_", "users"], { schema: { type: "object" }, auth: [] }) // no index
    io2.put(["users", "alice"], { name: "Alice" })
    await io2.flush()
    const r = computeZkpInputs({ io: io2, dir: "users", doc: "alice", path: "name" })
    assert.equal(r.success, false)
    assert.match(r.err, /no zk collection index/)
  })
})
