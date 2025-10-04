import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { DB as ZKDB } from "zkjson"
import { resolve } from "path"
import { repeat } from "ramda"
import draft_07 from "../src/jsonschema-draft-07.js"

describe("Server", () => {
  it("should connect with a remote server", async () => {
    const zkdb = new ZKDB({
      level: 184,
      level_col: 24,
      size_val: 256,
      size_path: 32,
      wasm: resolve(
        import.meta.dirname,
        "../src/circom/db2/index_js/index.wasm",
      ),
      zkey: resolve(import.meta.dirname, "../src/circom/db2/index_0001.zkey"),
    })
    await zkdb.init()
    await zkdb.addCollection(1)
    const json = {
      text: repeat(
        "abcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcdabcabcabcd",
        32,
      ).join(""), //190
    }
    const col_id = 1
    const doc = "doc1"
    const path = "text"
    await zkdb.insert(col_id, doc, json)
    let params = {
      json,
      col_id,
      path,
      id: doc,
    }
    const proof = await zkdb.genProof(params)
    console.log(proof)
  })
  it.only("should connect with a remote server", async () => {
    const zkdb = new ZKDB({
      level: 184,
      level_col: 24,
      size_val: 256,
      size_path: 32,
      wasm: resolve(
        import.meta.dirname,
        "../src/circom/db2/index_js/index.wasm",
      ),
      zkey: resolve(import.meta.dirname, "../src/circom/db2/index_0001.zkey"),
    })
    await zkdb.init()
    await zkdb.addCollection(1)
    const json = {
      schema: {
        definitions: { draft_07 },
      },
    }
    const col_id = 1
    const doc = "doc1"
    const path = "schema"
    console.log(JSON.stringify(json).length)
    await zkdb.insert(col_id, doc, json)
    let params = {
      json,
      col_id,
      path,
      id: doc,
    }
    const proof = await zkdb.genProof(params)
    console.log(proof)
  })
})
