const { tail, isNil, clone, mergeLeft } = require("ramda")
const base = "weavedb-contracts"
const { handle } = require(`${base}/weavedb/contract`)
const { handle: handle_kv } = require(`${base}/weavedb-kv/contract`)
const { handle: handle_bpt } = require(`${base}/weavedb-bpt/contract`)
const version = require(`${base}/weavedb/lib/version`)
const version_kv = require(`${base}/weavedb-kv/lib/version`)
const version_bpt = require(`${base}/weavedb-bpt/lib/version`)
const Base = require("weavedb-base")
let arweave = require("arweave")
if (!isNil(arweave.default)) arweave = arweave.default
const md5 = require("md5")

class OffChain extends Base {
  constructor({
    state = {},
    cache = "memory",
    type = 1,
    contractTxId,
    noauth = false,
    caller = null,
  }) {
    super()
    this.caller = caller
    this.noauth = noauth
    this.kvs = {}
    this.network = "offchain"
    this.cache = cache
    this.type = type
    this.handle =
      this.type === 1 ? handle : this.type === 2 ? handle_kv : handle_bpt
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
        : this.type === 2
        ? {
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
        : {
            version: version_bpt,
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
            contracts: {
              ethereum: "ethereum",
              dfinity: "dfinity",
              bundler: "bundler",
            },
          }
    )
    if (noauth) delete this.state.auth
    this.initialState = clone(this.state)
    this.height = 0
  }

  async initialize() {
    if (typeof this.cache === "object") await this.cache.initialize(this)
  }

  getTxId(input) {
    return md5(JSON.stringify({ contractTxId: this.contractTxId, input }))
  }

  getSW(input) {
    let kvs = {}
    return {
      kv: {
        get: async key =>
          !isNil(kvs[key])
            ? clone(kvs[key])
            : typeof this.cache === "object"
            ? await this.cache.get(key, this)
            : this.kvs[key] ?? null,
        put: async (key, val) => (kvs[key] = val),
      },
      contract: { id: this.contractTxId },
      arweave,
      block: {
        timestamp: Math.round(Date.now() / 1000),
        height: ++this.height,
      },
      transaction: { id: this.getTxId(input) },
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
    return (await this.handle(clone(this.state), { input }, this.getSW(input)))
      .result
  }

  async dryRead(state, queries) {
    let results = []
    for (const v of queries || []) {
      let res = { success: false, err: null, result: null }
      const input = { function: v[0], query: tail(v) }
      try {
        res.result = (
          await this.handle(clone(state), { input }, this.getSW(input))
        ).result
        res.success = true
      } catch (e) {
        res.err = e
      }
      results.push(res)
    }
    return results
  }

  async write(func, param, dryWrite, bundle, relay = false, onDryWrite, noOnWrite=false) {
    console.log("offchain write func=", func  )
    console.log("offchain write param=", param  )
    if (JSON.stringify(param).length > 3900) {
      return {
        nonce: param.nonce,
        signer: param.caller,
        cache: false,
        success: false,
        duration: 0,
        error: { message: "data too large" },
        function: param.function,
        state: null,
        result: null,
        results: [],
      }
    }
    if (relay) {
      return param
    } else {
      let error = null
      let tx = null
      let sw = this.getSW(param)
      try {
        tx = await this.handle(
          clone(this.state),
          { caller: this.caller, input: param },
          sw
        )
        this.state = tx.state
        if (param?.noOnWrite != true) {
          console.log("param?.noOnWrite != true")
        } else {
          console.log("param?.noOnWrite == true")
        }
        if (typeof this.cache === "object" 
        // && param?.noOnWrite != true
          // && noOnWrite==false
        ) {
          await this.cache.onWrite(tx, this, param)
        } else if (this.type === 3 && noOnWrite==false ){
          console.log("offchain this.type===3")
          console.log("offchain noOnWrite: ", noOnWrite)

          for (const k in tx.result.kvs) this.kvs[k] = tx.result.kvs[k]
        } else {
          console.log("offchain noOnWrite: ", noOnWrite)
          console.log("offchain this.type: ", this.type)
        }
      } catch (e) {
        console.log(e)
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
      let res = {
        docID: tx?.result?.docID ?? null,
        doc: tx?.result?.doc ?? null,
        path: tx?.result?.path ?? null,
        results,
        originalTxId: tx?.result?.transaction?.id ?? null,
        transaction: tx?.result?.transaction ?? null,
        block: tx?.result?.block ?? null,
        success: error === null,
        nonce: param.nonce,
        signer: param.caller,
        duration: Date.now() - start,
        error,
        function: param.function,
      }
      let _func = param.function
      let _query = param.query
      if (param.function === "relay") {
        _func = _query[1].function
        _query = _query[1].query
        res.relayedFunc = _func
        res.relayedQuery = _query
      }
      return res
    }
  }
}

module.exports = OffChain
