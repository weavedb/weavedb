const { tail, isNil, clone, mergeLeft } = require("ramda")
const contracts = "weavedb-contracts"
const { handle } = require(`${contracts}/weavedb/contract`)
const { handle: handle_kv } = require(`${contracts}/weavedb-kv/contract`)
const { handle: handle_bpt } = require(`${contracts}/weavedb-bpt/contract`)
const version = require(`${contracts}/weavedb/lib/version`)
const version_kv = require(`${contracts}/weavedb-kv/lib/version`)
const version_bpt = require(`${contracts}/weavedb-bpt/lib/version`)
const Base = require("weavedb-base")
let arweave = require("arweave")
if (!isNil(arweave.default)) arweave = arweave.default

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
            contracts: {
              ethereum: "ethereum",
              dfinity: "dfinity",
              nostr: "nostr",
            },
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
            contracts: {
              ethereum: "ethereum",
              dfinity: "dfinity",
              nostr: "nostr",
            },
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
            },
            crons: {
              lastExecuted: 0,
              crons: {},
            },
            contracts: {
              ethereum: "ethereum",
              dfinity: "dfinity",
              nostr: "nostr",
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

  async getTxId(input, date) {
    const str = JSON.stringify({
      contractTxId: this.contractTxId,
      input,
      timestamp: date,
    })
    return arweave.utils.bufferTob64Url(
      await arweave.crypto.hash(arweave.utils.stringToBuffer(str))
    )
  }

  async getSW(input, date) {
    let kvs = {}
    date ??= Date.now()
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
        timestamp: Math.round(date / 1000),
        height: ++this.height,
      },
      transaction: { id: await this.getTxId(input, date), timestamp: date },
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

  async read(input, date) {
    return (
      await this.handle(
        clone(this.state),
        { input },
        await this.getSW(input, date)
      )
    ).result
  }

  async dryRead(state, queries, date) {
    let results = []
    for (const v of queries || []) {
      let res = { success: false, err: null, result: null }
      const input = { function: v[0], query: tail(v) }
      try {
        res.result = (
          await this.handle(
            clone(state),
            { input },
            await this.getSW(input, date)
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

  async write(func, param, dryWrite, bundle, relay = false, onDryWrite, date) {
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
      let sw = await this.getSW(param, date)
      try {
        tx = await this.handle(
          clone(this.state),
          { caller: this.caller, input: param },
          sw
        )
        this.state = tx.state
        if (typeof this.cache === "object") {
          await this.cache.onWrite(tx, this, param)
        } else if (this.type === 3) {
          for (const k in tx.result.kvs) this.kvs[k] = tx.result.kvs[k]
        }
      } catch (e) {
        console.log(typeof e === "object" ? e.message : e)
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
          results = await this.dryRead(this.state, onDryWrite.read || [], date)
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
