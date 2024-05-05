const { tail, isNil, clone, mergeLeft } = require("ramda")
const Base = require("weavedb-base")
let arweave = require("arweave")
if (!isNil(arweave.default)) arweave = arweave.default
let contracts, handle, handle_kv, handle_bpt, version, version_kv, version_bpt
const versions = require("./versions")

const isBrowser = new Function(
  "try {return this===window;}catch(e){ return false;}",
)

function normalizeContractSource(contractSrc, useVM2) {
  const lines = contractSrc.trim().split("\n")
  const first = lines[0]
  const last = lines[lines.length - 1]

  if (
    (/\(\s*\(\)\s*=>\s*{/g.test(first) ||
      /\s*\(\s*function\s*\(\)\s*{/g.test(first)) &&
    /}\s*\)\s*\(\)\s*;/g.test(last)
  ) {
    lines.shift()
    lines.pop()
    contractSrc = lines.join("\n")
  }

  contractSrc = contractSrc
    .replace(/export\s+async\s+function\s+handle/gmu, "async function handle")
    .replace(/export\s+function\s+handle/gmu, "function handle")

  if (useVM2) {
    return `
    ${contractSrc}
    module.exports = handle;`
  } else {
    return `
    const window=void 0,document=void 0,Function=void 0,eval=void 0,globalThis=void 0;
    const [SmartWeave, BigNumber, logger${isBrowser() ? ", Buffer, atob, btoa" : ""}] = arguments;
    class ContractError extends Error { constructor(message) { super(message); this.name = 'ContractError' } };
    function ContractAssert(cond, message) { if (!cond) throw new ContractError(message) };
    ${contractSrc};
    return handle;
  `
  }
}

let srcs = {}

const dlContract = async (version, sw) => {
  if (srcs[version]) return srcs[version]
  try {
    const src = await fetch(
      `https://arweave.net/${versions[version].txid}`,
    ).then(v => v.text())
    srcs[version] = src
    return src
  } catch (e) {
    console.log(e)
    return null
  }
}

class OffChain extends Base {
  constructor({
    state = {},
    cache = "memory",
    type = 1,
    contractTxId,
    noauth = false,
    caller = null,
    secure = true,
    _contracts = "weavedb-contracts",
  } = {}) {
    super()
    version = require(`${_contracts}/weavedb/lib/version`)
    version_kv = require(`${_contracts}/weavedb-kv/lib/version`)
    version_bpt = require(`${_contracts}/weavedb-bpt/lib/version`)
    this.queue = []
    this.ongoing = false

    this.versions = versions
    this.caller = caller
    this.noauth = noauth
    this.kvs = {}
    this.network = "offchain"
    this.cache = cache
    this.type = type

    this.handles = {}
    ;({ handle } = require(`${_contracts}/weavedb/contract`))
    ;({ handle: handle_kv } = require(`${_contracts}/weavedb-kv/contract`))
    ;({ handle: handle_bpt } = require(`${_contracts}/weavedb-bpt/contract`))
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
            secure,
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
              polygonID: "polygon-id",
            },
          }
        : this.type === 2
          ? {
              version: version_kv,
              canEvolve: true,
              evolve: null,
              secure,
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
                polygonID: "polygon-id",
              },
            }
          : {
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
            },
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
  async getHandle(ver, sw) {
    try {
      const src = await dlContract(ver, sw)
      const normalizedSource = normalizeContractSource(src)
      const contractFunction = new Function(normalizedSource)
      const swGlobal = sw
      const BigNumber = require("bignumber.js")
      const handler = isBrowser()
        ? contractFunction(swGlobal, BigNumber, null, Buffer, atob, btoa)
        : contractFunction(swGlobal, BigNumber, null)
      return handler ?? this.handle
    } catch (e) {
      return this.handle
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
  ) {
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
      const input = param
      const handle = await this.getHandle(this.state.version, sw)
      try {
        tx = await handle(
          clone(this.state),
          { caller: this.caller, input: param },
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
