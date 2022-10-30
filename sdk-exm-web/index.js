const Base = require("weavedb-base")
const { isNil, clone, keys } = require("ramda")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const { handle } = require("./lib/reads")

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
    return await fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify({ ...opt, functionId: this.functionId }),
    }).then(v => v.json())
  }

  async getNonce(addr) {
    return await this.viewState({
      function: "nonce",
      address: addr,
    })
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
    return await fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify({ ...param, functionId: this.functionId }),
    }).then(v => v.json())
  }
}

module.exports = SDK
