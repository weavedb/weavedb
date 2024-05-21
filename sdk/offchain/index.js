const { tail, isNil, clone, mergeLeft } = require("ramda")
const Base = require("weavedb-base")
let arweave = require("arweave")
if (!isNil(arweave.default)) arweave = arweave.default
let contracts, handle_bpt, version, version_bpt

class OffChain extends Base {
  constructor({
    state = {},
    cache = "memory",
    type = 1,
    contractTxId,
    noauth = false,
    caller = null,
    secure = true,
    local = false,
    _contracts = "weavedb-contracts",
  } = {}) {
    super()
    version_bpt = require(`${_contracts}/weavedb-bpt/lib/version`)
    this.queue = []
    this.ongoing = false

    this.caller = caller
    this.noauth = noauth
    this.kvs = {}
    this.network = "offchain"
    this.cache = cache
    this.type = type

    this.handles = {}
    ;({ handle: handle_bpt } = require(`${_contracts}/weavedb-bpt/contract`))
    this.handle = this.type === 3 ? handle_bpt : handle_bpt
    this.local = local
    this.validity = {}
    this.txs = []
    this.arweave = arweave.init()
    this.contractTxId = contractTxId || "offchain"
    this.domain = {
      name: "weavedb",
      version: "1",
      verifyingContract: this.contractTxId,
    }
    this.state = mergeLeft(state, {
      version: version_bpt,
      canEvolve: true,
      evolve: null,
      secure,
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
        polygonID: "polygon-id",
      },
      bridges: [],
    })
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
      await arweave.crypto.hash(arweave.utils.stringToBuffer(str)),
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
    const sw = await this.getSW(input, date)
    const handle = await this.getHandle(this.state.version, sw)
    return (await handle(clone(this.state), { input }, sw)).result
  }

  async dryRead(state, queries, date) {
    let results = []
    for (const v of queries || []) {
      let res = { success: false, err: null, result: null }
      const input = { function: v[0], query: tail(v) }
      const sw = await this.getSW(input, date)
      const handle = await this.getHandle(this.state.version, sw)
      try {
        res.result = (await handle(clone(state), { input }, sw)).result
        res.success = true
      } catch (e) {
        res.err = e
      }
      results.push(res)
    }
    return results
  }
  async next() {
    if (!this.ongoing) {
      if (this.queue.length > 0) {
        this.ongoing = true
        const q = this.queue.shift()
        await q[0](await this._writeContract(...q[1]))
        this.ongoing = false
        if (this.queue.length > 0) this.next()
      }
    }
  }
  async write(...params) {
    return await new Promise(res => {
      this.queue.push([res, params])
      this.next()
    })
  }
  async _writeContract(
    func,
    param,
    dryWrite,
    bundle,
    relay = false,
    onDryWrite,
    date,
    caller,
  ) {
    if (JSON.stringify(param).length > 15000) {
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
      const input = param
      const handle = await this.getHandle(this.state.version, sw)
      try {
        tx = await handle(
          clone(this.state),
          { caller: caller ?? this.caller, input: param },
          sw,
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
        messages: tx?.result?.messages ?? [],
        events: tx?.result?.events ?? [],
        attributes: tx?.result?.attributes ?? [],
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
