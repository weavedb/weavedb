import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { wait, acc } from "wao/test"
import { kv, build } from "../../core/src/index.js"
import { signer } from "../../core/src/utils.js"
import { init_query } from "../../core/src/preset.js"
import {
  dev_normalize,
  dev_verify,
  dev_parse,
  dev_auth,
  dev_write,
  dev_read,
} from "../../core/src/devs.js"

const users_query = [
  "set:dir",
  {
    schema: { type: "object", required: ["name", "age"] },
    auth: [
      ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
    ],
  },
  "_",
  "users",
]

const bob = { name: "Bob", age: 23 }

function get({ state, msg }) {
  state.opcode = "get"
  state.query = ["get", ...msg]
  return arguments[0]
}

function cget({ state, msg }) {
  state.opcode = "cget"
  state.query = ["cget", ...msg]
  return arguments[0]
}

describe("WeaveDB SDK", () => {
  before(async () => {})
  it("should deploy a database", async () => {
    let store = {}
    const io = {
      put: async (key, val) => (store[key] = val),
      get: key => store[key] ?? null,
      transaction: async fn => fn(),
    }

    const sign = signer({ jwk: acc[0].jwk, id: "db-1" })
    const wdb = build({
      write: [dev_normalize, dev_verify, dev_parse, dev_auth, dev_write],
      read: [dev_normalize, dev_parse, dev_read],
      __read__: {
        get: [get, dev_parse, dev_read],
        cget: [cget, dev_parse, dev_read],
      },
    })
    const db = wdb(kv(io, c => {}))
    const res = await db.write(await sign("init", init_query)).val()
    console.log(res)
    await db.write(await sign(...users_query))
    await db.write(await sign("set:user", bob, "users", "bob"))
    console.log(await db.get("users").val())
  })
})
