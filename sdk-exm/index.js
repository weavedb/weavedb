const Base = require("weavedb-base")
const Arweave = require("arweave")
const { handle } = require("./lib/reads")
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
    this.state = await this.exm.functions.read(this.functionId)
    return await handle(clone(this.state), { input: opt })
  }

  async getNonce(addr) {
    this.state = await this.exm.functions.read(this.functionId)
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
    const tx = await this.exm.functions.write(this.functionId, param)
    this.state = tx.data.execution.state
    return tx
  }
}

module.exports = SDK
