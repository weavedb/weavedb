const { clone, mergeLeft } = require("ramda")
const { handle } = require("./contract")
const Base = require("weavedb-base")
const arweave = require("arweave")

class OffChain extends Base {
  constructor(state = {}) {
    super()
    this.arweave = arweave.init()
    this.contractTxId = "offchain"
    this.domain = {
      name: "weavedb",
      version: "1",
      verifyingContract: this.contractTxId,
    }
    this.state = mergeLeft(state, {
      version: "0.21.0",
      canEvolve: true,
      evolve: null,
      secure: true,
      data: {},
      nonces: {},
      ids: {},
      indexes: {},
      auth: {
        algorithms: ["secp256k1", "secp256k1-2", "ed25519", "rsa256"],
        name: "weavedb",
        version: "1",
        links: {},
      },
      crons: {
        lastExecuted: 0,
        crons: {},
      },
      contracts: {},
    })
    this.initialState = clone(this.state)
    this.height = 0
  }

  async read(input) {
    return (await handle(clone(this.state), { input }, this.contractTxId))
      .result
  }

  async write(func, param, dryWrite, bundle, relay = false) {
    if (relay) {
      return param
    } else {
      let error = null
      let tx = null
      try {
        tx = await handle(
          clone(this.state),
          { input: param },
          this.contractTxId,
          ++this.height
        )
        this.state = tx.state
      } catch (e) {
        error = e
      }
      const start = Date.now()
      return {
        originalTxId: tx?.result?.transaction?.id || null,
        transaction: tx?.result?.transaction || null,
        block: tx?.result?.block || null,
        success: error === null,
        nonce: param.nonce,
        signer: param.caller,
        duration: Date.now() - start,
        error,
        function: param.function,
      }
    }
  }
}

module.exports = OffChain
