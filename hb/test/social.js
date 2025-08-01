import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { HyperBEAM, wait, acc } from "wao/test"
import { DB } from "../../sdk/src/index.js"
import server from "../src/server.js"
import { resolve } from "path"
import { genDir } from "./test-utils.js"
import { pluck } from "ramda"
const schema = {
  type: "object",
  required: ["uid", "body", "date"],
  properties: {
    uid: { type: "string", pattern: "^[a-zA-Z0-9_-]{43}$" },
    body: { type: "string", minLength: 1, maxLength: 280 },
    date: { type: "integer", minimum: 0, maximum: 9999999999999 },
  },
}
const auth_add_post = [["mod()", { uid: "$signer", date: "$ts" }], ["allow()"]]
const auth_del_post = [
  ["=$isOwner", ["equals", "$signer", "$before.uid"]],
  ["allowif()", "$isOwner"],
]
const posts = {
  name: "posts",
  schema,
  auth: [
    ["add:post", auth_add_post],
    ["del:post", auth_del_post],
  ],
}
const post1 = { body: "my first post", date: Date.now() }
const post2 = { body: "my second post" }
const post3 = { body: "my third post" }

const bob = { name: "Bob", age: 23 }
describe("WeaveDB SDK", () => {
  let db, db2, hbeam
  before(async () => {
    hbeam = await new HyperBEAM({ as: ["weavedb"] }).ready()
    await hbeam.hb.get({ path: "/~weavedb@1.0/start" })
    db = new DB({ hb: hbeam.url, jwk: hbeam.jwk })
  })
  after(() => hbeam.kill())
  it("should build a social app", async () => {
    const pid = await db.spawn()
    db2 = new DB({ hb: hbeam.url, jwk: acc[1].jwk, id: pid })
    assert((await db.mkdir(posts)).success)
    assert((await db.set("add:post", post1, "posts")).success)
    assert((await db2.set("add:post", post2, "posts")).sucess)
    assert((await db.set("add:post", post3, "posts")).success)
    console.log((await db.get("posts", ["date", "desc"], 2)).success)
    assert(
      (
        await db.addIndex(
          [
            ["uid", "asc"],
            ["date", "desc"],
          ],
          "posts",
        )
      ).success,
    )
    await db.get("posts", ["uid", "==", hbeam.addr], ["date", "desc"])
    const cur = await db.iter("posts", ["date", "desc"], 2)
    const cur2 = await cur.next()
    assert((await db.set("del:post", "posts", "A")).success)
    assert.deepEqual(pluck("body", await db.get("posts")), [
      "my second post",
      "my third post",
    ])
  })
})
