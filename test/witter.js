const { expect } = require("chai")
const { mergeLeft, pluck, isNil, compose, map, pick, dissoc } = require("ramda")
const { fpj, ac_funcs } = require("../sdk/contracts/common/lib/pure")
const _ii = [
  "302a300506032b6570032100ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
  "010925abb4cf8ccb7accbcfcbf0a6adf1bbdca12644694bb47afc7182a4ade66ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
]
const Account = require("intmax").Account
const EthCrypto = require("eth-crypto")
const EthWallet = require("ethereumjs-wallet").default
const { readFileSync } = require("fs")
const { resolve } = require("path")

const user1 = EthCrypto.createIdentity()
const user2 = EthCrypto.createIdentity()
const user3 = EthCrypto.createIdentity()
const users = [user1, user2, user3]
const a = user => user.address.toLowerCase()
const p = user => ({
  privateKey: user.privateKey,
})

const tests = {
  "should set rules for jots": async ({ db, owner, relayer }) => {
    // add owner
    await db.query("set:reg_owner", {}, "users", a(owner), p(owner))
    await db.query(
      "update:give_invites",
      { invites: 4 },
      "users",
      a(owner),
      p(owner)
    )
    expect((await db.get("users", a(owner))).address).to.eql(a(owner))

    for (const [i, v] of users.entries()) {
      await db.query("set:invite_user", {}, "users", a(v), p(owner))
      await db.query(
        "update:profile",
        {
          handle: `handle-${i}`,
          name: `name-${i}`,
        },
        "users",
        a(v),
        p(v)
      )
      expect((await db.get("users", a(v))).name).to.eql(`name-${i}`)
    }
    expect(pluck("address", await db.get("users")).length).to.eql(4)

    // follow
    for (const [i, v] of users.entries()) {
      if (v.address !== user1.address) {
        await db.query(
          "set:follow",
          {},
          "follows",
          `${a(user1)}:${a(v)}`,
          p(user1)
        )
      }
    }
    expect((await db.get("follows")).length).to.eql(2)
    for (const [i, v] of users.entries()) {
      if (v.address !== user1.address) {
        await db.query(
          "delete:unfollow",
          "follows",
          `${a(user1)}:${a(v)}`,
          p(user1)
        )
      }
    }
    expect((await db.get("follows")).length).to.eql(0)

    for (const [i, v] of users.entries()) {
      for (const [i2, v2] of users.entries()) {
        if (v.address !== v2.address) {
          await db.query("set:follow", {}, "follows", `${a(v)}:${a(v2)}`, p(v))
        }
      }
    }

    // posts
    const tx = await db.query(
      "add:status",
      { description: "post-1" },
      "posts",
      p(user1)
    )

    // likes
    await db.query("set:like", {}, "likes", `${tx.docID}:${a(user2)}`, p(user2))
    expect((await db.get("likes"))[0].aid).to.eql(tx.docID)

    // post article

    const art = await db.sign(
      "query",
      "add:article",
      { title: "post-1", description: "post-1", body: db.data("body") },
      "posts",
      { ...p(user1), jobID: "article" }
    )

    const tx2 = await db.relay(
      "article",
      art,
      { body: "https://body", cover: "https://cover" },
      a(relayer)
    )
    expect((await db.get("posts", tx2.docID)).body).to.eql("https://body")

    // edit
    const art2 = await db.sign(
      "query",
      "update:edit",
      { title: "edit-6", body: db.data("body") },
      "posts",
      tx2.docID,
      { ...p(user1), jobID: "article" }
    )
    await db.relay("article", art2, { body: "https://body2" }, a(relayer))
    expect((await db.get("posts", tx2.docID)).title).to.eql("edit-6")

    await db.query("update:del_post", {}, "posts", tx2.docID, p(user1))
    expect((await db.get("posts", tx2.docID)).date).to.eql(undefined)
    const tx3 = await db.query(
      "add:repost",
      { repost: tx.docID },
      "posts",
      p(user1)
    )
    expect((await db.get("posts", tx3.docID)).repost).to.eql(tx.docID)

    const tx4 = await db.query(
      "add:quote",
      { repost: tx.docID, description: "quote-4" },
      "posts",
      p(user1)
    )
    expect((await db.get("posts", tx4.docID)).description).to.eql("quote-4")

    const tx5 = await db.query(
      "add:reply",
      { reply_to: tx.docID, description: "reply-5" },
      "posts",
      p(user1)
    )
    expect((await db.get("posts", tx5.docID)).parents).to.eql([tx.docID])
  },
}

module.exports = (it, its, local = {}) => {
  const _tests = mergeLeft(local, tests)
  for (const k in mergeLeft(local, _tests)) {
    const [name, type] = k.split(".")
    ;(isNil(type) ? it : it[type])(name, async () => _tests[k](its()))
  }
}
