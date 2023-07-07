const { tail, isNil, clone, mergeLeft } = require("ramda")
const base = "weavedb-contracts"
const { handle } = require(`${base}/weavedb/contract`)
const { handle: handle_kv } = require(`${base}/weavedb-kv/contract`)
const version = require(`${base}/weavedb/lib/version`)
const version_kv = require(`${base}/weavedb-kv/lib/version`)
const Base = require("weavedb-base")
let arweave = require("arweave")
if (!isNil(arweave.default)) arweave = arweave.default
const { createId } = require("@paralleldrive/cuid2")

class OffChain extends Base {
  constructor({ state = {}, cache = "memory", type = 1, contractTxId }) {
    super()
    this.kvs = {}
    this.network = "offchain"
    this.cache = cache
    this.type = type
    this.handle = this.type === 1 ? handle : handle_kv
    this.validity = {}
    this.txs = []
    this.arweave = arweave.init()
    this.contractTxId = contractTxId || "offchain"
    this.domain = {
      name: "weavedb",
      version: "1",
      verifyingContract: this.contractTxId,
    }
    this.state = mergeLeft(
      state,
      this.type === 1
        ? {
            version,
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
          }
        : {
            version: version_kv,
            canEvolve: true,
            evolve: null,
            secure: true,
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
          }
    )
    this.initialState = clone(this.state)
    this.height = 0
  }
  async initialize() {
    if (typeof this.cache === "object") await this.cache.initialize(this)
  }
  getSW() {
    return {
      kv: {
        get: async key => (!isNil(this.kvs[key]) ? clone(this.kvs[key]) : null),
        put: async (key, val) => (this.kvs[key] = val),
      },
      contract: { id: this.contractTxId },
      arweave,
      block: {
        timestamp: Math.round(Date.now() / 1000),
        height: ++this.height,
      },
      transaction: { id: createId() },
      contracts: {
        viewContractState: async (contract, param, SmartWeave) => {
          const { handle } = require(`weavedb-contracts/${contract}/contract`)
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
    return (await this.handle(clone(this.state), { input }, this.getSW()))
      .result
  }
  async dryRead(state, queries) {
    let results = []
    for (const v of queries || []) {
      let res = { success: false, err: null, result: null }
      try {
        res.result = (
          await this.handle(
            clone(state),
            {
              input: { function: v[0], query: tail(v) },
            },
            this.getSW()
          )
        ).result
        res.success = true
      } catch (e) {
        res.err = e
      }
      results.push(res)
    }
    return results
  }

  async write(func, param, dryWrite, bundle, relay = false, onDryWrite) {
    if (relay) {
      return param
    } else {
      let error = null
      let tx = null
      let sw = this.getSW()
      try {
        tx = await this.handle(clone(this.state), { input: param }, sw)
        this.state = tx.state
        if (typeof this.cache === "object") await this.cache.onWrite(tx, this)
      } catch (e) {
        //console.log(typeof e === "object" ? e.message : e)
        error = e
      }
      const start = Date.now()
      this.validity[sw.transaction.id] = error === null
      this.txs.push({
        transaction: sw.transaction,
        block: sw.block,
        param,
        func,
      })
      let results = []
      if (error === null) {
        if (!isNil(onDryWrite?.read)) {
          results = await this.dryRead(this.state, onDryWrite.read || [])
        }
      }
      return {
        results,
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
