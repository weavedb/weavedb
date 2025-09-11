import assert from "assert"
import { describe, it } from "node:test"
import { acc } from "wao/test"
import { DB } from "../../sdk/src/index.js"
import { mem } from "../../core/src/index.js"

const owner = acc[0]
const actor1 = acc[1]
const actor2 = acc[2]

const schema = {
  notes: {
    type: "object",
    required: ["id", "actor", "content", "published", "likes"],
    properties: {
      id: { type: "string" },
      actor: { type: "string", pattern: "^[a-zA-Z0-9_-]{43}$" },
      content: { type: "string", minLength: 1, maxLength: 140 },
      published: { type: "integer" },
      likes: { type: "integer" },
    },
    additionalProperties: false,
  },
  likes: {
    type: "object",
    required: ["actor", "object", "published"],
    properties: {
      actor: { type: "string", pattern: "^[a-zA-Z0-9_-]{43}$" },
      object: { type: "string" },
      published: { type: "integer" },
    },
    additionalProperties: false,
  },
}

const rules = {
  notes: [
    [
      "add:note",
      [
        ["fields()", ["*content"]],
        ["mod()", { id: "$doc", actor: "$signer", published: "$ts", likes: 0 }],
        ["allow()"],
      ],
    ],
  ],
  likes: [
    [
      "add:like",
      [
        ["fields()", ["*object"]],
        ["mod()", { actor: "$signer", published: "$ts" }],
        [
          "=$likes",
          [
            "get()",
            [
              "likes",
              ["actor", "==", "$signer"],
              ["object", "==", "$req.object"],
            ],
          ],
        ],
        ["=$ok", ["o", ["equals", 0], ["length"], "$likes"]],
        ["denyifany()", ["!$ok"]],
        ["allow()"],
      ],
    ],
  ],
}

const indexes = {
  notes: [[["actor"], ["published", "desc"]]],
  likes: [
    [["object"], ["published", "desc"]],
    [["actor"], ["object"]],
  ],
}

const triggers = {
  likes: [
    {
      key: "inc_likes",
      on: "create",
      fn: [
        ["update()", [{ likes: { _$: ["inc"] } }, "notes", "$after.object"]],
      ],
    },
  ],
}

describe("Jots", () => {
  it.only("should connect with remote nodes", async () => {
    const { q } = mem()
    const db = new DB({ jwk: owner.jwk, hb: null, mem: q })
    const pid = await db.init({ id: "jots" })
    const a1 = new DB({ jwk: actor1.jwk, hb: null, id: "jots", mem: q })
    const a2 = new DB({ jwk: actor2.jwk, hb: null, id: "jots", mem: q })

    await db.mkdir({ name: "notes", schema: schema.notes, auth: rules.notes })
    await db.mkdir({ name: "likes", schema: schema.likes, auth: rules.likes })
    for (const k in indexes) for (const i of indexes[k]) await db.addIndex(i, k)
    for (const k in triggers) {
      for (const t of triggers[k]) await db.addTrigger(t, k)
    }

    const note1 = await a1.set("add:note", { content: "hello a1" }, "notes")
    assert(note1.success)
    const note2 = await a2.set("add:note", { content: "hello a2" }, "notes")
    assert(note2.success)

    const tl = await db.get("notes", ["published", "desc"])
    assert(tl.length === 2)
    const object = tl[0].id

    // Test likes
    const like1 = await a1.set("add:like", { object }, "likes")
    assert(like1.success)
    const like2 = await a2.set("add:like", { object }, "likes")
    assert(like2.success)
    const like3 = await a2.set("add:like", { object }, "likes")
    assert.equal(like3.success, false)

    assert.equal((await db.get("notes", ["likes", "desc"], 1))[0].likes, 2)
    console.log(await db.get("notes"))
  })
})
