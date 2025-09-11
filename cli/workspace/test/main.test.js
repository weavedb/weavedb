import assert from "assert"
import { describe, it } from "node:test"
import { acc } from "wao/test"
import { DB } from "wdb-sdk"
import { init } from "./utils.js"

const actor1 = acc[1]
const actor2 = acc[2]

describe("Jots", () => {
  it.only("should post notes", async () => {
    const { id, db, q } = await init()
    const a1 = new DB({ jwk: actor1.jwk, hb: null, id: "jots", mem: q })
    const a2 = new DB({ jwk: actor2.jwk, hb: null, id: "jots", mem: q })

    const note1 = await a1.set("add:note", { content: "hello a1" }, "notes")
    assert(note1.success)
    const note2 = await a2.set("add:note", { content: "hello a2" }, "notes")
    assert(note2.success)

    const tl = await db.get("notes", ["published", "desc"])
    assert(tl.length === 2)
    const object = tl[0].id

    const like1 = await a1.set("add:like", { object }, "likes")
    assert(like1.success)
    const like2 = await a2.set("add:like", { object }, "likes")
    assert(like2.success)
    const like3 = await a2.set("add:like", { object }, "likes")
    assert(!like3.success)

    assert.equal((await db.get("notes", ["likes", "desc"], 1))[0].likes, 2)
  })
})
