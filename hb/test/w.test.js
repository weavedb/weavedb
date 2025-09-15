import assert from "assert"
import { describe, it } from "node:test"
import { acc } from "wao/test"
import { DB, wdb23, wdb160 } from "../../sdk/src/index.js"
import { init } from "./utils.js"
import { pluck } from "ramda"

const owner = acc[0]
const user1 = acc[1]
const user2 = acc[2]

const users = [user1, user2]

describe("W", () => {
  it.only("should run a social app", async () => {
    // init app
    const { id, err, db, q: mem } = await init()
    const dbs = [
      new DB({ jwk: user1.jwk, id, mem }),
      new DB({ jwk: user2.jwk, id, mem }),
    ]
    assert.equal(err, null)

    // add owner
    const txx = await db.set("set:reg_owner", {}, "users", wdb23(owner.addr))
    const r = await db.set(
      "update:give_invites",
      { invites: 3 },
      "users",
      wdb23(owner.addr),
    )
    assert.equal(
      (await db.get("users", wdb23(owner.addr))).address_full,
      owner.addr,
    )

    // invite users
    for (const [i, v] of users.entries()) {
      await db.set(
        "set:invite_user",
        { address_full: v.addr },
        "users",
        wdb23(v.addr),
      )
      await dbs[i].set(
        "update:profile",
        {
          handle: `handle-${i}`,
          name: `name-${i}`,
        },
        "users",
        wdb23(v.addr),
      )
      assert.equal((await db.get("users", wdb23(v.addr))).name, `name-${i}`)
    }
    assert.equal(pluck("address", await db.get("users")).length, 3)

    // follow
    const followID = (from, to) => wdb160([from, to])

    for (const [i, v] of users.entries()) {
      if (v.addr !== user1.addr) {
        await dbs[0].set(
          "set:follow",
          { from: wdb23(user1.addr), to: wdb23(v.addr) },
          "follows",
          followID(wdb23(user1.addr), wdb23(v.addr)),
        )
      }
    }
    assert.equal((await db.get("follows")).length, 1)
    assert((await db.get("users", wdb23(user1.addr))).following, 1)
    for (const [i, v] of users.entries()) {
      if (v.addr !== user1.addr) {
        await dbs[0].set(
          "del:unfollow",
          "follows",
          followID(wdb23(user1.addr), wdb23(v.addr)),
        )
      }
    }
    assert.equal((await db.get("follows")).length, 0)

    for (const [i, v] of users.entries()) {
      for (const [i2, v2] of users.entries()) {
        if (v.addr !== v2.addr) {
          await dbs[i].set(
            "set:follow",
            { from: wdb23(v.addr), to: wdb23(v2.addr) },
            "follows",
            followID(wdb23(v.addr), wdb23(v2.addr)),
          )
        }
      }
    }
    assert.equal((await db.get("follows")).length, 2)

    // post
    const tx = await dbs[0].set(
      "add:status",
      { description: "post-1" },
      "posts",
    )
    const likeID = (aid, from) => wdb160([aid, from])

    // likes
    await dbs[1].set(
      "set:like",
      { aid: tx.result.doc, user: wdb23(user2.addr) },
      "likes",
      likeID(tx.result.doc, wdb23(user2.addr)),
    )

    assert.equal((await db.get("likes"))[0].aid, tx.result.doc)
    assert.equal((await db.get("posts", tx.result.doc)).likes, 1)

    // post article
    const tx2 = await dbs[0].set(
      "add:article",
      {
        title: "post-1",
        description: "post-1",
        body: "https://body",
        cover: "https://cover",
      },
      "posts",
    )
    assert.equal((await db.get("posts", tx2.result.doc)).body, "https://body")

    // edit
    const art2 = await dbs[0].set(
      "update:edit",
      { title: "edit-6", body: "https://body2" },
      "posts",
      tx2.result.doc,
    )
    assert.equal((await db.get("posts", tx2.result.doc)).title, "edit-6")

    // delete post
    const rr = await dbs[0].set("update:del_post", {}, "posts", tx2.result.doc)
    assert.equal((await db.get("posts", tx2.result.doc)).date, undefined)

    // repost
    const tx3 = await dbs[0].set(
      "add:repost",
      { repost: tx.result.doc },
      "posts",
    )
    assert.equal((await db.get("posts", tx3.result.doc)).repost, tx.result.doc)

    // quote
    const tx4 = await dbs[0].set(
      "add:quote",
      { repost: tx.result.doc, description: "quote-4" },
      "posts",
    )
    assert.equal((await db.get("posts", tx4.result.doc)).description, "quote-4")

    assert.equal((await db.get("posts", tx.result.doc)).reposts, 2)

    // reply
    const tx5 = await dbs[0].set(
      "add:reply",
      { reply_to: tx.result.doc, description: "reply-5" },
      "posts",
    )
    assert.deepEqual((await db.get("posts", tx5.result.doc)).parents, [
      tx.result.doc,
    ])

    // timeline
    await db.set("upsert:cron", { calc_pt: { _$: "ts" } }, "crons", "timeline")
    assert(typeof (await db.get("posts", "A")).pt === "number")
    await db.set("upsert:cron", { del_pt: { _$: "ts" } }, "crons", "timeline")
  })
})
