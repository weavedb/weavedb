import assert from "assert"
import { describe, it } from "node:test"
import { acc } from "wao/test"
import { DB } from "wdb-sdk"
import { init } from "./utils.js"
import { resolve } from "path"

const actor1 = acc[1]
const actor2 = acc[2]

const wasm = resolve(
  import.meta.dirname,
  "../../../circom/build/circuits/ipfs/index_js/index.wasm",
)
const zkey = resolve(
  import.meta.dirname,
  "../../../circom/build/circuits/ipfs/index_0001.zkey",
)

describe("Social Dapp", () => {
  it.only("should post json", async () => {
    const { id, db, q: mem, err } = await init()
    const a1 = new DB({ jwk: actor1.jwk, id, mem })
    const a2 = new DB({ jwk: actor2.jwk, id, mem })
    const json = { str: "abc" }
    const r = await a1.set("add:json", { json }, "ipfs")
    const cid = r.result.data.cid
    console.log(await db.get("ipfs", ["cid", "==", cid]))
  })
})
