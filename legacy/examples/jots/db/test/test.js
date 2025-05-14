const DB = require("weavedb-offchain")
const { expect } = require("chai")
const setup = require("../scripts/lib/setup")
const EthCrypto = require("eth-crypto")
const settings = require("../scripts/lib/settings")
const { pluck } = require("ramda")
const user1 = EthCrypto.createIdentity()
const user2 = EthCrypto.createIdentity()
const user3 = EthCrypto.createIdentity()
const users = [user1, user2, user3]
const a = user => user.address.toLowerCase()
const p = user => ({ privateKey: user.privateKey })

describe("WeaveDB", () => {
  let db, owner, relayer, user, ownerAuth, relayerAuth, userAuth
  beforeEach(async () => {
    owner = EthCrypto.createIdentity()
    relayer = EthCrypto.createIdentity()
    user = EthCrypto.createIdentity()
    ownerAuth = { privateKey: owner.privateKey }
    relayerAuth = { privateKey: relayer.privateKey }
    userAuth = { privateKey: user.privateKey }
    db = new DB({ type: 3, state: { owner: owner.address.toLowerCase() } })
    await db.initialize()
    await setup({ db, conf: settings(), privateKey: owner.privateKey })
  })
  it("should execute queries", async () => {
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
      p(relayer)
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
    await db.relay("article", art2, { body: "https://body2" }, p(relayer))
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
  })
})
