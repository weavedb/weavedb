const { nanoid } = require("nanoid")
const { expect } = require("chai")
const DB = require("../sdk/offchain")
const Arweave = require("arweave")
const {} = require("ramda")
const EthWallet = require("ethereumjs-wallet").default
const { parseQuery } = require("../sdk/contracts/weavedb-bpt/lib/utils")
const EthCrypto = require("eth-crypto")
const setupDB = require("../scripts/setupDB")
const { offchain } = require("../examples/jots/lib/db_settings")

describe("WeaveDB Offchain BPT", function () {
  let wallet,
    walletAddress,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId,
    bundlerTxId,
    arweave
  const owner = EthCrypto.createIdentity()
  const relayer = EthCrypto.createIdentity()
  const acc1 = EthCrypto.createIdentity()
  const acc2 = EthCrypto.createIdentity()
  this.timeout(0)

  before(async () => {
    dfinityTxId = "dfinity"
    ethereumTxId = "ethereum"
    bundlerTxId = "bundler"
    wallet = EthWallet.generate()
    arweave = Arweave.init()
    arweave_wallet = await arweave.wallets.generate()
    walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
  })

  beforeEach(async () => {
    contractTxId = "offchain"
    walletAddress = await arweave.wallets.jwkToAddress(arweave_wallet)
    db = new DB({
      state: { secure: true, owner: owner.address.toLowerCase() },
      type: 3,
    })
    await setupDB({
      db,
      conf: offchain,
      privateKey: owner.privateKey.toLowerCase(),
      relayer: relayer.address.toLowerCase(),
    })
  })

  it("should setup service", async () => {
    const auth = { privateKey: owner.privateKey }

    const bob = { address: acc1.address.toLowerCase() }
    const alice = { address: owner.address.toLowerCase() }
    const beth = { address: acc2.address.toLowerCase() }

    // invite by the owner
    await db.set({}, "users", alice.address, auth)
    await db.set({}, "users", bob.address, auth)

    // give invites
    await db.update({ invites: 3 }, "users", bob.address, auth)
    expect((await db.get("users", bob.address)).invited_by).to.eql(
      owner.address.toLowerCase()
    )

    // invite by a user
    await db.set({}, "users", beth.address, {
      privateKey: acc1.privateKey,
    })

    // update user profile
    await db.update({ handle: "beth", name: "Beth" }, "users", beth.address, {
      privateKey: acc2.privateKey,
    })
    await db.update({ handle: "beth", name: "Bob" }, "users", bob.address, {
      privateKey: acc1.privateKey,
    })
    expect((await db.get("users", beth.address)).handle).to.eql("beth")
    expect((await db.get("users", bob.address)).handle).to.eql(undefined)

    // follow user
    await db.set({}, "follows", `${alice.address}:${bob.address}`, auth)
    expect(
      (await db.get("follows", `${alice.address}:${bob.address}`)).from
    ).to.eql(alice.address)

    // unfollow user
    await db.delete("follows", `${alice.address}:${bob.address}`, auth)
    expect(await db.get("follows", `${alice.address}:${bob.address}`)).to.eql(
      null
    )

    // post
    let post = {
      description: "body",
      type: "article",
      hashes: [],
      mentions: [],
      title: "post",
    }
    const { docID: id1 } = await db.add(post, "posts", auth)
    const { docID: id2 } = await db.add(
      { type: "status", repost: id1 },
      "posts",
      auth
    )
    const { docID: id3 } = await db.add(
      { type: "status", repost: id1, description: "awesome" },
      "posts",
      auth
    )
    const { docID: id4 } = await db.add(
      { type: "status", repost: id1 },
      "posts",
      auth
    )
    let status = {
      description: "body",
      type: "status",
      hashes: [],
      mentions: [],
    }
    let reply_to = {
      description: "body",
      type: "status",
      reply_to: id1,
      hashes: [],
      mentions: [],
      parents: [id1],
    }
    const { docID: id5 } = await db.add(status, "posts", auth)
    const { docID: id6 } = await db.add(reply_to, "posts", auth)
    await db.update({ date: db.del() }, "posts", id6, auth)
    await db.update({ title: "post2" }, "posts", id1, auth)
    await db.set({}, "likes", `${id6}:${alice.address}`, auth)
  })
})
