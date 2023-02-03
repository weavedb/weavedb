const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const { pluck, isNil, range, indexBy, prop, dissoc } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")

describe("Node Admin Contract", function () {
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

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  beforeEach(async () => {
    ;({ walletAddress, wallet, wallet2, wallet3, wallet4, arweave_wallet } =
      await initBeforeEach())
  })

  const initDB = async () => {
    const users_schema = {
      type: "object",
      required: ["address", "allow"],
      properties: {
        address: {
          type: "string",
        },
        allow: {
          type: "boolean",
        },
      },
    }
    await db.setSchema(users_schema, "users", { ar: arweave_wallet })
    const rules = {
      "allow create,update": {
        and: [
          {
            "==": [{ var: "resource.newData.address" }, { var: "request.id" }],
          },
          { "==": [{ var: "request.auth.signer" }, walletAddress] },
        ],
      },
      "allow delete": { "==": [{ var: "request.auth.signer" }, walletAddress] },
    }
    await db.setRules(rules, "users", { ar: arweave_wallet })
    const contracts_schema = {
      type: "object",
      required: ["address", "txid", "date"],
      properties: {
        address: {
          type: "string",
        },
        txid: {
          type: "string",
        },
        date: {
          type: "number",
        },
      },
    }
    await db.setSchema(contracts_schema, "contracts", { ar: arweave_wallet })
    const contracts_rules = {
      "allow create": {
        and: [
          {
            "==": [{ var: "resource.newData.txid" }, { var: "request.id" }],
          },
          { "==": [{ var: "request.auth.signer" }, walletAddress] },
          {
            "==": [
              { var: "resource.newData.date" },
              { var: "request.block.timestamp" },
            ],
          },
        ],
      },
      "allow delete": { "==": [{ var: "request.auth.signer" }, walletAddress] },
    }
    await db.setRules(contracts_rules, "contracts", { ar: arweave_wallet })
  }

  it("should manage node", async () => {
    await initDB()
    const address = wallet.getAddressString()
    const user = { address, allow: true }
    await db.set(user, "users", user.address, {
      ar: arweave_wallet,
    })
    expect(await db.get("users", user.address)).to.eql(user)
    await db.update({ allow: false }, "users", user.address, {
      ar: arweave_wallet,
    })
    expect(await db.get("users", user.address)).to.eql({
      address,
      allow: false,
    })
    await db.delete("users", user.address, {
      ar: arweave_wallet,
    })
    expect(await db.get("users", user.address)).to.eql(null)

    const contract = { date: db.ts(), address, txid: "abc" }
    await db.set(contract, "contracts", contract.txid, {
      ar: arweave_wallet,
    })
    expect(dissoc("date", await db.get("contracts", contract.txid))).to.eql(
      dissoc("date", contract)
    )
  })
})
