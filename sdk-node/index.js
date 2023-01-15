const {
  o,
  includes,
  append,
  equals,
  all,
  complement,
  isNil,
  pluck,
  is,
  last,
  tail,
} = require("ramda")
const { LmdbCache } = require("warp-contracts-lmdb")
const shortid = require("shortid")
const {
  WarpFactory,
  LoggerFactory,
  defaultCacheOptions,
} = require("warp-contracts")

const {
  WarpFactory: WarpFactory_old,
  LoggerFactory: LoggerFactory_old,
  defaultCacheOptions: defaultCacheOptions_old,
} = require("warp-contracts-old")

const { WarpSubscriptionPlugin } = require("warp-contracts-plugin-subscription")
const { get, parseQuery } = require("./off-chain/actions/read/get")
const { ids } = require("./off-chain/actions/read/ids")
const md5 = require("md5")

let states = {}
let dbs = {}
let subs = {}
let submap = {}

let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const Base = require("weavedb-base")

const _on = async (state, contractTxId, block = {}) => {
  if (!isNil(state)) {
    states[contractTxId] = state
    for (const txid in subs) {
      for (const hash in subs[txid]) {
        const query = subs[txid][hash].query
        try {
          const res = await get(
            state,
            {
              input: { query },
            },
            true,
            { block }
          )
          if (!isNil(res)) {
            if (subs[txid][hash].height < block.height) {
              subs[txid][hash].height = block.height
              let prev = isNil(subs[txid][hash].prev)
                ? subs[txid][hash].prev
                : subs[txid][hash].doc
                ? subs[txid][hash].prev.data
                : pluck("data", subs[txid][hash].prev)
              let current = isNil(res.result)
                ? res.result
                : subs[txid][hash].doc
                ? res.result.data
                : pluck("data", res.result)
              if (!equals(current, prev)) {
                for (const k in subs[txid][hash].subs) {
                  try {
                    if (!isNil(res))
                      subs[txid][hash].subs[k].cb(
                        subs[txid][hash].subs[k].con
                          ? res.result
                          : subs[txid][hash].doc
                          ? isNil(res.result)
                            ? null
                            : res.result.data
                          : pluck("data", res.result)
                      )
                  } catch (e) {
                    console.log(e)
                  }
                }
                subs[txid][hash].prev = res.result
              }
            }
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
}

class CustomSubscriptionPlugin extends WarpSubscriptionPlugin {
  async process(input) {
    try {
      let data = await dbs[this.contractTxId].db.readState(
        input.interaction.block.height
      )
      const state = data.cachedValue.state
      await _on(state, this.contractTxId, input.interaction.block)
    } catch (e) {}
  }
}

class SDK extends Base {
  constructor({
    arweave,
    arweave_wallet,
    contractTxId,
    wallet,
    name = "weavedb",
    version = "1",
    EthWallet,
    web3,
    subscribe = true,
    network,
    port = 1820,
    cache = "leveldb",
    lmdb = {},
    old = false,
  }) {
    super()
    this.old = old
    if (!this.old) {
      this.Warp = { WarpFactory, LoggerFactory, defaultCacheOptions }
    } else {
      this.Warp = {
        WarpFactory: WarpFactory_old,
        LoggerFactory: LoggerFactory_old,
        defaultCacheOptions: defaultCacheOptions_old,
      }
    }
    this.cache = cache
    this.lmdb = lmdb
    this.arweave_wallet = arweave_wallet
    if (isNil(arweave)) {
      if (network === "localhost") {
        arweave = {
          host: "localhost",
          port,
          protocol: "http",
        }
      } else {
        arweave = {
          host: "arweave.net",
          port: 443,
          protocol: "https",
        }
      }
    }
    this.arweave = Arweave.init(arweave)
    this.Warp.LoggerFactory.INST.logLevel("error")
    if (typeof window === "object") {
      require("@metamask/legacy-web3")
      this.web3 = window.web3
    }
    this.network =
      network ||
      (arweave.host === "host.docker.internal" || arweave.host === "localhost"
        ? "localhost"
        : "mainnet")

    if (arweave.host === "host.docker.internal") {
      this.warp = this.Warp.WarpFactory.custom(this.arweave, {}, "local")
        .useArweaveGateway()
        .build()
    } else if (this.network === "localhost") {
      this.warp = this.Warp.WarpFactory.forLocal(
        isNil(arweave) || isNil(arweave.port) ? 1820 : arweave.port
      )
    } else if (this.network === "testnet") {
      this.warp = this.Warp.WarpFactory.forTestnet()
    } else {
      this.warp = this.Warp.WarpFactory.forMainnet()
    }
    if (this.cache === "lmdb") {
      this.warp
        .useStateCache(
          new LmdbCache({
            ...this.Warp.defaultCacheOptions,
            dbLocation: `./cache/warp/state`,
            ...(lmdb.state || {}),
          })
        )
        .useContractCache(
          new LmdbCache({
            ...this.Warp.defaultCacheOptions,
            dbLocation: `./cache/warp/contracts`,
            ...(lmdb.contracts || {}),
          })
        )
    }
    this.contractTxId = contractTxId
    if (all(complement(isNil))([contractTxId, wallet, name, version])) {
      this.initialize({
        contractTxId,
        wallet,
        name,
        version,
        EthWallet,
        subscribe,
      })
    }
  }

  async addFunds(wallet) {
    const walletAddress = await this.arweave.wallets.getAddress(wallet)
    await this.arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
    await this.arweave.api.get("mine")
  }

  async initializeWithoutWallet(params = {}) {
    const wallet = await this.arweave.wallets.generate()
    if (this.network === "localhost") await this.addFunds(wallet)
    this.initialize({ wallet, ...params })
  }

  initialize({
    contractTxId,
    wallet,
    name = "weavedb",
    version = "1",
    EthWallet,
    subscribe,
  }) {
    if (!isNil(contractTxId)) this.contractTxId = contractTxId
    if (isNil(wallet)) throw Error("wallet missing")
    if (isNil(this.contractTxId)) throw Error("contractTxId missing")
    this.wallet = wallet
    this.db = this.warp
      .contract(this.contractTxId)
      .connect(wallet)
      .setEvaluationOptions({
        allowBigInt: true,
        useVM2: !this.old,
      })
    dbs[this.contractTxId] = this
    this.domain = { name, version, verifyingContract: this.contractTxId }
    if (!isNil(EthWallet)) this.setEthWallet(EthWallet)
    if (this.network !== "localhost") {
      if (subscribe) {
        this.warp.use(
          new CustomSubscriptionPlugin(this.contractTxId, this.warp)
        )
      }
      this.db
        .readState()
        .then(data => (states[this.contractTxId] = data.cachedValue.state))
        .catch(() => {})
    } else {
      if (subscribe) {
        this.interval = setInterval(() => {
          this.db
            .readState()
            .then(async v => {
              const state = v.cachedValue.state
              if (!equals(state, this.state)) {
                this.state = state
                states[this.contractTxId] = state
                const info = await this.arweave.network.getInfo()
                await _on(state, this.contractTxId, {
                  height: info.height,
                  timestamp: Math.round(Date.now() / 1000),
                  id: info.current,
                })
              }
            })
            .catch(v => {
              console.log("readState error")
              clearInterval(this.interval)
            })
        }, 1000)
      }
    }
  }

  async request(func, ...query) {
    return this.viewState({
      function: func,
      query,
    })
  }

  async viewState(opt) {
    let res = await this.db.viewState(opt)
    return res.result
  }

  async _request(func, param, dryWrite, bundle, relay = false) {
    if (relay) {
      return param
    } else {
      const start = Date.now()
      if (dryWrite) {
        let dryState = await this.db.dryWrite(param)
        if (dryState.type !== "ok")
          return {
            success: false,
            duration: Date.now() - start,
            error: { message: "dryWrite failed", dryWrite: dryState },
            function: param.function,
          }
      }
      return await this.send(param, bundle, start)
    }
  }

  async send(param, bundle, start) {
    let tx = await this.db[
      bundle && this.network !== "localhost"
        ? "bundleInteraction"
        : "writeInteraction"
    ](param, {})
    if (this.network === "localhost") await this.mineBlock()
    let state
    if (isNil(tx.originalTxId)) {
      return {
        success: false,
        duration: Date.now() - start,
        error: { message: "tx didn't go through" },
        function: param.function,
      }
    } else {
      state = await this.db.readState()
      const valid = state.cachedValue.validity[tx.originalTxId]
      if (valid === false) {
        return {
          success: false,
          duration: Date.now() - start,
          error: { message: "tx not valid" },
          function: param.function,
          ...tx,
        }
      } else if (isNil(valid)) {
        return {
          success: false,
          duration: Date.now() - start,
          error: { message: "tx validity missing" },
          function: param.function,
          ...tx,
        }
      }
    }

    let res = {
      success: true,
      error: null,
      function: param.function,
      query: param.query,
      ...tx,
    }
    let func = param.function
    let query = param.query
    if (param.function === "relay") {
      func = query[1].function
      query = query[1].query
      res.relayedFunc = func
      res.relayedQuery = query
    }
    if (includes(func, ["add", "update", "upsert", "set"])) {
      try {
        if (func === "add") {
          res.docID = (
            await ids(state.cachedValue.state, {
              input: { tx: tx.originalTxId },
            })
          ).result[0]
          res.path = o(append(res.docID), tail)(query)
        } else {
          res.path = tail(query)
          res.docID = last(res.path)
        }
        res.doc = (
          await get(state.cachedValue.state, {
            input: { query: res.path },
          })
        ).result
      } catch (e) {
        console.log(e)
      }
    }
    res.duration = Date.now() - start
    return res
  }
  async subscribe(isCon, ...query) {
    const { path } = parseQuery(query)
    const isDoc = path.length % 2 === 0
    subs[this.contractTxId] ||= {}
    const cb = query.pop()
    const hash = md5(JSON.stringify(query))
    const id = shortid()
    subs[this.contractTxId][hash] ||= {
      prev: undefined,
      subs: {},
      query,
      height: 0,
      doc: isDoc,
    }
    subs[this.contractTxId][hash].subs[id] = { cb, con: isCon }
    submap[id] = hash
    this.cget(...query)
      .then(v => {
        if (
          !isNil(subs[this.contractTxId][hash].subs[id]) &&
          subs[this.contractTxId][hash].height === 0
        ) {
          subs[this.contractTxId][hash].prev = v
          cb(isCon ? v : isDoc ? (isNil(v) ? null : v.data) : pluck("data", v))
        }
      })
      .catch(e => {
        console.log("cget error")
      })
    return () => {
      try {
        delete subs[this.contractTxId][hash].subs[id]
        delete submap[id]
      } catch (e) {}
    }
  }

  async getCache(...query) {
    if (isNil(states[this.contractTxId])) return null
    return (
      await get(
        states[this.contractTxId],
        {
          input: { query },
        },
        false,
        { block: {} }
      )
    ).result
  }

  async cgetCache(...query) {
    if (isNil(states[this.contractTxId])) return null
    return (
      await get(
        states[this.contractTxId],
        {
          input: { query },
        },
        true,
        { block: {} }
      )
    ).result
  }

  async on(...query) {
    return await this.subscribe(false, ...query)
  }

  async con(...query) {
    return await this.subscribe(true, ...query)
  }
}

module.exports = SDK
