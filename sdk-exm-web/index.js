const Base = require("weavedb-base")
const { isNil, clone, keys } = require("ramda")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
require("isomorphic-fetch")

class SDK extends Base {
  constructor({ endpoint, functionId }) {
    super()
    this.functionId = functionId
    this.endpoint = endpoint
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
    if (isNil(this.endpoint)) {
      return (
        await fetch(`https://${this.functionId}.exm.run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opt),
        }).then(v => v.json())
      ).data.execution.result
    } else {
      return await fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify({ ...opt, functionId: this.functionId }),
      }).then(v => v.json())
    }
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
    if (isNil(this.endpoint)) {
      return await fetch(`https://${this.functionId}.exm.run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(param),
      }).then(v => v.json())
    } else {
      return await fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify({ input: param, functionId: this.functionId }),
      }).then(v => v.json())
    }
  }
}

module.exports = SDK
