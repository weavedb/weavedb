const { Ed25519KeyIdentity } = require("@dfinity/identity")
const { providers, Wallet, utils } = require("ethers")
const { expect } = require("chai")
const {
  isNil,
  range,
  pick,
  pluck,
  dissoc,
  compose,
  map,
  mergeLeft,
} = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const buildEddsa = require("circomlibjs").buildEddsa
const Account = require("intmax").Account
const { readFileSync } = require("fs")
const { resolve } = require("path")
const EthCrypto = require("eth-crypto")
const EthWallet = require("ethereumjs-wallet").default
describe("WeaveDB", function () {
  let wallet,
    walletAddress,
    wallet2,
    db,
    arweave_wallet,
    contractTxId,
    dfinityTxId,
    ethereumTxId
  const Arweave = require("arweave")
  this.timeout(0)

  before(async () => {
    db = await init("web", 1, false)
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({
      arweave_wallet,
      walletAddress,
      wallet,
      wallet2,
      dfinityTxId,
      ethereumTxId,
      contractTxId,
    } = await initBeforeEach(true, false, "ar"))
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  it("should post messages", async () => {
    const schema_users = {
      type: "object",
      required: ["name", "uid", "handle"],
      properties: {
        name: {
          type: "string",
        },
        uid: {
          type: "string",
        },
        handle: {
          type: "string",
        },
      },
    }
    await db.setSchema(schema_users, "users", {
      ar: arweave_wallet,
    })

    const schema_posts = {
      type: "object",
      required: ["user", "body", "date", "id"],
      properties: {
        id: {
          type: "string",
        },
        body: {
          type: "string",
        },
        user: {
          type: "string",
        },
        date: {
          type: "number",
        },
      },
    }

    await db.setSchema(schema_posts, "posts", {
      ar: arweave_wallet,
    })

    const rules_users = {
      "allow create,update": {
        and: [
          { "==": [{ var: "resource.newData.uid" }, { var: "request.id" }] },
          {
            "==": [
              { var: "resource.newData.uid" },
              { var: "request.auth.signer" },
            ],
          },
        ],
      },
      "allow update": {
        and: [
          { "==": [{ var: "resource.data.uid" }, { var: "request.id" }] },
          {
            "==": [
              { var: "resource.data.uid" },
              { var: "request.auth.signer" },
            ],
          },
        ],
      },

      "allow delete": {
        and: [
          {
            "==": [{ var: "request.id" }, { var: "resource.data.uid" }],
          },
        ],
      },
    }
    await db.setRules(rules_users, "users", {
      ar: arweave_wallet,
    })
    const rules_posts = {
      "let create": {
        id: [
          "join",
          ":",
          [{ var: "resource.newData.user" }, { var: "resource.newData.id" }],
        ],
      },
      "let delete": {
        id: [
          "join",
          ":",
          [{ var: "resource.data.user" }, { var: "resource.data.id" }],
        ],
      },
      "allow create": {
        and: [
          {
            "==": [
              { var: "resource.newData.user" },
              { var: "request.auth.signer" },
            ],
          },
          {
            "==": [{ var: "id" }, { var: "request.id" }],
          },
        ],
      },
      "allow delete": {
        and: [
          {
            "==": [
              { var: "resource.data.user" },
              { var: "request.auth.signer" },
            ],
          },
          {
            "==": [{ var: "id" }, { var: "request.id" }],
          },
        ],
      },
    }
    await db.setRules(rules_posts, "posts", {
      ar: arweave_wallet,
    })
    const data = {
      name: "Bob",
      uid: walletAddress,
      handle: "bob.lens",
      image: "https://image.com/bob.png",
    }
    await db.set(data, "users", walletAddress)
    expect(await db.get("users", walletAddress)).to.eql(data)
    await db.delete("users", walletAddress)
    expect(await db.get("users", walletAddress)).to.eql(null)
    const post = {
      body: "test",
      user: walletAddress,
      id: "post1",
      date: Date.now(),
    }
    await db.set(post, "posts", `${walletAddress}:post1`)
    expect(await db.get("posts", `${walletAddress}:post1`)).to.eql(post)
    await db.delete("posts", `${walletAddress}:post1`)
    expect(await db.get("posts", `${walletAddress}:post1`)).to.eql(null)
  })
})
