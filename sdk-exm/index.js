const Base = require("weavedb-base")
const Arweave = require("arweave")
const { clone, keys } = require("ramda")
const { Exm } = require("@execution-machine/sdk")

class SDK extends Base {
  constructor({ arweave = {}, arweave_wallet, functionId, token }) {
    super()
    this.exm = new Exm({
      token,
    })
    this.functionId = functionId
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
    const tx = await this.exm.functions.write(this.functionId, opt)
    return tx.data.execution.result
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
    return await this.exm.functions.write(this.functionId, param)
  }

  async evolve(value, opt) {
    return this._write2("evolve", { value }, opt)
  }
}

module.exports = SDK
