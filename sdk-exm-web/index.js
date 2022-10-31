const Base = require("weavedb-base")
const { isNil, clone, keys } = require("ramda")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const { handle } = require("./lib/reads")
require("isomorphic-fetch")

class SDK extends Base {
  constructor({ endpoint, functionId, token }) {
    super()
    this.functionId = functionId
    this.endpoint = endpoint
    this.arweave = Arweave.init()
    this.token = token
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
      const state = await fetch(
        `https://api.exm.dev/read/${this.functionId}`
      ).then(v => v.json())
      return await handle(state, { input: opt })
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
      const body = {
        functionId: this.functionId,
        inputs: [
          {
            input: JSON.stringify(param),
            tags: [],
          },
        ],
      }
      return await fetch(
        `https://api.exm.dev/api/transactions?token=${this.token}`,
        {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      ).then(v => v.json())
    } else {
      return await fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify({ input: param, functionId: this.functionId }),
      }).then(v => v.json())
    }
  }
}

module.exports = SDK
