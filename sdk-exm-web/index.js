const Base = require("weavedb-base")
const { isNil, clone, keys } = require("ramda")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
require("isomorphic-fetch")

class SDK extends Base {
  constructor({ functionId }) {
    super()
    this.functionId = functionId
    this.arweave = Arweave.init()
    this.domain = { name: "weavedb", version: "1", verifyingContract: "exm" }
  }

  async request(func, ...query) {
    return this.viewState({
      function: func,
      query,
    })
  }

  async viewState(opt) {
    const tx = await this.send(opt)
    if (
      isNil(tx.data.execution.result) ||
      tx.data.execution.result.success !== true
    ) {
      throw new Error()
    }
    return tx.data.execution.result.result
  }

  async getNonce(addr) {
    return (
      (await this.viewState({
        function: "nonce",
        address: addr,
      })) + (isNil(this.endpoint) ? 1 : 0)
    )
  }

  async getIdx(tx) {
    return await this.viewState({
      function: "ids",
      tx,
    })
  }

  async _request(func, param) {
    return await this.send(param)
  }

  async send(param) {
    const tx = await fetch(`https://${this.functionId}.exm.run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(param),
    }).then(v => v.json())
    if (
      isNil(tx.data.execution.result) ||
      tx.data.execution.result.success !== true
    ) {
      throw new Error()
    }
    return tx
  }
}

module.exports = SDK
