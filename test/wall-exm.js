const {
  TestFunction,
  createWrite,
  FunctionType,
} = require("@execution-machine/sdk")

const { expect } = require("chai")
const { readFileSync } = require("fs")
const path = require("path")
const Base = require("../sdk/base")
const { all, complement, clone, isNil, keys, range } = require("ramda")
const Arweave = require("arweave")
const { handle } = require("./exm/reads")

class SDK extends Base {
  constructor({ arweave = {}, src, state, arweave_wallet }) {
    super()
    this.src = src
    this.state = state
    this.arweave_wallet = arweave_wallet
    this.arweave = Arweave.init(arweave)
    this.domain = { name: "weavedb", version: "1", verifyingContract: "exm" }
  }

  async request(func, ...query) {
    return this.viewState({
      function: func,
      query,
    })
  }

  async viewState(opt) {
    return await handle(clone(this.state), { input: opt })
  }

  async getNonce(addr) {
    return (
      (await this.viewState({
        function: "nonce",
        address: addr,
      })) + 1
    )
  }

  async getIds(tx) {
    return this.viewState({
      function: "ids",
      tx: keys(tx.validity)[0],
    })
  }

  async _request(func, param) {
    return await this.send(param)
  }

  async send(param) {
    const tx = await TestFunction({
      functionSource: this.src,
      functionType: FunctionType.JAVASCRIPT,
      functionInitState: this.state,
      writes: [createWrite(param)],
    })
    this.state = tx.state
    return tx
  }
}

let arweave_wallet, arweave_wallet2, arweave, addr, addr2, db

describe("Wall on EXM", function () {
  before(async () => {
    arweave = Arweave.init()
  })
  beforeEach(async () => {
    arweave_wallet = await arweave.wallets.generate()
    arweave_wallet2 = await arweave.wallets.generate()
    addr = await arweave.wallets.jwkToAddress(arweave_wallet)
    addr2 = await arweave.wallets.jwkToAddress(arweave_wallet2)
    db = new SDK({
      arweave_wallet,
      src: readFileSync(path.resolve(__dirname, "../dist/exm/exm.js")),
      state: {
        ...JSON.parse(
          readFileSync(
            path.resolve(__dirname, "../dist/exm/initial-state.json")
          )
        ),
        owner: addr,
      },
    })
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
    await db.setSchema(schemas_users, "users")
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
            "!=": [{ var: "resource.id" }, 4],
          },
        ],
      },
    }
    await db.setRules(rules_users, "users")

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
        user: {
          type: "string",
        },
        date: {
          type: "number",
        },
      },
    }
    await db.setSchema(schemas_wall, "wall")

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
    await db.setRules(rules_wall, "wall")
  }
  const addProfile = async () => {
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
    for (const i of range(0, 5)) {
      const post_id = `post${i}`
      const id = `${addr2}:post${i}`
      const msg = { text: `Hello${i}`, user: addr2, date: db.ts(), id: post_id }
      await db.set(msg, "wall", id, { ar: arweave_wallet2 })
    }
  }

  it("should manage the wall", async () => {
    await initDB()
    await addProfile()
    await addMessages()
    expect((await db.get("wall", ["date", "desc"])).length).to.eql(10)
    expect(
      (await db.get("wall", ["user", "=", addr], ["date", "desc"])).length
    ).to.eql(5)
  })
})
