const Arweave = require("arweave")
const fs = require("fs")
const path = require("path")
const { expect } = require("chai")
const { pluck, isNil, range, indexBy, prop } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")

describe("Todos Example", function () {
  let arlocal, wallet, walletAddress, wallet2, db, wallet3, wallet4
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => {
    await stop()
  })

  beforeEach(async () => {
    ;({
      walletAddress,
      wallet,
      wallet2,
      wallet3,
      wallet4,
    } = await initBeforeEach(true))
  })

  const initDB = async () => {
    const schemas = {
      type: "object",
      required: ["article_id", "date", "user_address", "done"],
      properties: {
        article_id: {
          type: "string",
        },
        user_address: {
          type: "string",
        },
        date: {
          type: "number",
        },
        done: {
          type: "boolean",
        },
      },
    }
    await db.setSchema(schemas, "todos")
    const rules = {
      "allow create": {
        and: [
          {
            "==": [
              { var: "request.auth.signer" },
              { var: "resource.newData.user_address" },
            ],
          },
          {
            "==": [
              { var: "request.block.timestamp" },
              { var: "resource.newData.date" },
            ],
          },
          {
            "==": [{ var: "resource.newData.done" }, false],
          },
        ],
      },
      "allow update": {
        and: [
          {
            "==": [
              { var: "request.auth.signer" },
              { var: "resource.newData.user_address" },
            ],
          },
          {
            "==": [{ var: "resource.newData.done" }, true],
          },
        ],
      },
      "allow delete": {
        "==": [
          { var: "request.auth.signer" },
          { var: "resource.data.user_address" },
        ],
      },
    }
    await db.setRules(rules, "tasks")
  }

  const addTasks = async () => {
    const _addTasks = async (arr, wallet) => {
      let batches = []
      for (let v of arr) {
        batches.push([
          "add",
          {
            done: false,
            date: db.ts(),
            task: "task" + v,
            user_address: db.signer(),
          },
          "tasks",
        ])
      }
      await db.batch(batches, { wallet })
    }
    await _addTasks([1, 2, 3, 4], wallet)
    await _addTasks([2, 3, 4], wallet2)
    await _addTasks([3, 4], wallet3)
    await _addTasks([4], wallet4)
  }

  const completeTasks = async () => {
    const _completeTasks = async wallet => {
      const task_id = (
        await db.cget("tasks", [
          "user_address",
          "=",
          wallet.getAddressString().toLowerCase(),
        ])
      )[0].id
      await db.update({ done: true }, "tasks", task_id, { wallet })
    }
    await _completeTasks(wallet)
    await _completeTasks(wallet2)
    await _completeTasks(wallet3)
    await _completeTasks(wallet4)
  }

  const deleteTasks = async () => {
    const _deleteTasks = async (index, wallet) => {
      const task_id = (
        await db.cget("tasks", [
          "user_address",
          "=",
          wallet.getAddressString().toLowerCase(),
        ])
      )[index].id
      await db.delete("tasks", task_id, { wallet })
    }
    await _deleteTasks(3, wallet)
    await _deleteTasks(2, wallet2)
    await _deleteTasks(1, wallet3)
    await _deleteTasks(0, wallet4)
  }

  it("should manage todos", async () => {
    await initDB()
    await addTasks()
    await completeTasks()
    await deleteTasks()
    expect((await db.get("tasks", ["done", "=", false])).length).to.eql(3)
  })
})
