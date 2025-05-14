const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const { pluck, isNil, range, indexBy, prop } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")

describe("Wall Example", function () {
  let arlocal,
    wallet,
    walletAddress,
    wallet2,
    db,
    wallet3,
    wallet4,
    arweave_wallet
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => {
    await stop()
  })

  beforeEach(async () => {
    ;({ walletAddress, wallet, wallet2, wallet3, wallet4, arweave_wallet } =
      await initBeforeEach(true))
  })

  const initDB = async () => {
    const schemas_users = {
      type: "object",
      required: ["address", "name"],
      properties: {
        address: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
    }
    await db.setSchema(schemas_users, "users", { ar: arweave_wallet })
    const rules_users = {
      "allow create,update": {
        and: [
          {
            "==": [{ var: "resource.id" }, { var: "request.auth.signer" }],
          },
          {
            "==": [
              { var: "request.auth.signer" },
              { var: "resource.newData.address" },
            ],
          },
          {
            "!=": [{ var: "resource.newData.name" }, ""],
          },
        ],
      },
      "allow delete": {
        and: [
          {
            "==": [{ var: "resource.id" }, { var: "request.auth.signer" }],
          },
        ],
      },
    }
    await db.setRules(rules_users, "users", { ar: arweave_wallet })

    const schemas_wall = {
      type: "object",
      required: ["text", "user", "date", "id"],
      properties: {
        id: {
          type: "string",
        },
        text: {
          type: "string",
        },
        name: {
          type: "string",
        },
        date: {
          type: "number",
        },
      },
    }
    await db.setSchema(schemas_wall, "wall", { ar: arweave_wallet })

    const rules_wall = {
      "let create": {
        id: [
          "join",
          ":",
          [{ var: "resource.newData.user" }, { var: "resource.newData.id" }],
        ],
      },
      "allow create": {
        and: [
          {
            "==": [{ var: "resource.id" }, { var: "id" }],
          },
          {
            "==": [
              { var: "request.auth.signer" },
              { var: "resource.newData.user" },
            ],
          },
          {
            "==": [
              { var: "request.block.timestamp" },
              { var: "resource.newData.date" },
            ],
          },
          {
            "!=": [{ var: "resource.newData.text" }, ""],
          },
        ],
      },
      "allow delete": {
        "==": [{ var: "request.auth.signer" }, { var: "resource.data.user" }],
      },
    }
    await db.setRules(rules_wall, "wall", { ar: arweave_wallet })
  }

  const addProfile = async () => {
    const addr = wallet.getAddressString().toLowerCase()
    const user = { name: "Bob", address: addr }
    const user2 = { name: "Alice", address: addr }

    await db.set(user, "users", addr)
    expect(await db.get("users", addr)).to.eql(user)

    await db.update({ name: "Alice" }, "users", addr)
    expect(await db.get("users", addr)).to.eql(user2)

    await db.delete("users", addr)
    expect(await db.get("users", addr)).to.eql(null)

    await db.set(user, "users", addr)
    expect(await db.get("users", addr)).to.eql(user)
  }

  const addMessages = async () => {
    const addr = wallet.getAddressString().toLowerCase()
    const msg = { text: "Hello!", user: addr, date: db.ts(), id: "post1" }
    const id = `${addr}:post1`
    await db.set(msg, "wall", id)
    expect((await db.get("wall", id)).text).to.eql(msg.text)
    await db.delete("wall", id)
    expect(await db.get("wall", id)).to.eql(null)
    for (const i of range(0, 5)) {
      const post_id = `post${i}`
      const id = `${addr}:post${i}`
      const msg = { text: `Hello${i}`, user: addr, date: db.ts(), id: post_id }
      await db.set(msg, "wall", id)
    }
    const addr2 = wallet2.getAddressString().toLowerCase()
    for (const i of range(0, 5)) {
      const post_id = `post${i}`
      const id = `${addr2}:post${i}`
      const msg = { text: `Hello${i}`, user: addr2, date: db.ts(), id: post_id }
      await db.set(msg, "wall", id, { wallet: wallet2 })
    }
  }

  it("should manage the wall", async () => {
    await initDB()
    await addProfile()
    await addMessages()
    const addr = wallet.getAddressString().toLowerCase()
    expect((await db.get("wall", ["date", "desc"])).length).to.eql(10)
    expect(
      (await db.get("wall", ["user", "==", addr], ["date", "desc"])).length
    ).to.eql(5)
    const arweave_wallet = await db.arweave.wallets.generate()
    const { identity } = await db.createTempAddressWithAR(arweave_wallet)
    const addr2 = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const user = { name: "Bob", address: addr2 }
    await db.set(user, "users", addr2, {
      wallet: addr2,
      privateKey: identity.privateKey,
    })
    expect(await db.get("users", addr2)).to.eql(user)
  })
})
