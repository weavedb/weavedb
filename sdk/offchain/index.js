const { clone, mergeLeft } = require("ramda")
const { handle } = require("./contracts/weavedb/contract")
const Base = require("weavedb-base")
const arweave = require("arweave")
const { createId } = require("@paralleldrive/cuid2")

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
      contracts: { ethereum: "ethereum", dfinity: "dfinity" },
    })
    this.initialState = clone(this.state)
    this.height = 0
  }
  getSW() {
    return {
      contract: { id: this.contractTxId },
      arweave,
      block: {
        timestamp: Math.round(Date.now() / 1000),
        height: ++this.height,
      },
      transaction: { id: createId() },
      contracts: {
        viewContractState: async (contract, param, SmartWeave) => {
          const { handle } = require(`./contracts/${contract}/contract`)
          try {
            return await handle({}, { input: param }, SmartWeave)
          } catch (e) {
            console.log(e)
          }
        },
      },
    }
  }
  async read(input) {
    return (await handle(clone(this.state), { input }, this.getSW())).result
  }

  async write(func, param, dryWrite, bundle, relay = false) {
    if (relay) {
      return param
    } else {
      let error = null
      let tx = null
      try {
        tx = await handle(clone(this.state), { input: param }, this.getSW())
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
