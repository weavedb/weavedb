const { compareVersions } = require("compare-versions")

const {
  mergeLeft,
  reject,
  invertObj,
  uniq,
  map,
  drop,
  splitWhen,
  init,
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
  clone,
} = require("ramda")
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

const { parseQuery } = require("weavedb-contracts/weavedb/lib/utils")
const md5 = require("md5")
const { createId } = require("@paralleldrive/cuid2")
const is_data = [
  "set",
  "setSchema",
  "setRules",
  "addIndex",
  "removeIndex",
  "add",
  "update",
  "upsert",
]
const no_paths = [
  "nonce",
  "ids",
  "getCrons",
  "getAlgorithms",
  "getLinkedContract",
  "getOwner",
  "getAddressLink",
  "getRelayerJob",
  "listRelayerJobs",
  "getEvolve",
  "getInfo",
  "addCron",
  "removeCron",
  "setAlgorithms",
  "addRelayerJob",
  "removeRelayerJob",
  "linkContract",
  "evolve",
  "migrate",
  "setCanEvolve",
  "setSecure",
  "addOwner",
  "removeOwner",
  "addAddressLink",
  "removeAddressLink",
]
let states = {}
let cachedStates = {}
let timeouts = {}
let dbs = {}
let subs = {}
let submap = {}

let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const Base = require("weavedb-base")
const { handle } = require("weavedb-contracts/weavedb/contract")
const { handle: handle_kv } = require("weavedb-contracts/weavedb-kv/contract")

const _on = async (state, input, handle) => {
  const block = input.interaction.block
  if (!isNil(state)) {
    states[input.contractTxId] = state
    for (const txid in subs) {
      for (const hash in subs[txid]) {
        const query = subs[txid][hash].query
        try {
          const res = await handle(
            clone(state),
            {
              input: { function: "cget", query },
            },
            this.getSW()
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

class SDK extends Base {
  constructor({
    arweave,
    arweave_wallet,
    contractTxId,
    wallet,
    name = "weavedb",
    version = "1",
    web3,
    subscribe = true,
    network,
    port = 1820,
    cache = "lmdb",
    cache_prefix = null,
    lmdb = {},
    redis = {},
    old = false,
    onUpdate,
    progress,
    logLevel = "error",
    nocache,
    LmdbCache,
    createClient,
    WarpSubscriptionPlugin,
    remoteStateSyncSource,
    useVM2,
    type = 1,
  }) {
    super()
    this.remoteStateSyncSource = remoteStateSyncSource
    this.queue = []
    this.ongoing = false
    this.results = {}
    this.LitJsSdk = require("@lit-protocol/sdk-browser")
    this.kvs = {}
    this.type = type
    this.handle = this.type === 1 ? handle : handle_kv
    if (!isNil(useVM2)) this.useVM2 = useVM2
    this.LmdbCache = LmdbCache
    this.createClient = createClient
    this.WarpSubscriptionPlugin = WarpSubscriptionPlugin
    this.nocache_default = !isNil(nocache) ? nocache : false
    this.progress = progress
    this.virtual_nonces = {}
    this.cache_prefix = cache_prefix
    this.onUpdate = onUpdate
    this.subscribe = typeof window !== "undefined" ? false : subscribe
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
    this.redis = redis
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
    this.Warp.LoggerFactory.INST.logLevel(logLevel)
    if (typeof window === "object") {
      window.buffer = require("buffer")
      require("@metamask/legacy-web3")
      this.web3 = window.web3
    }
    this.network =
      network ||
      (arweave.host === "host.docker.internal" || arweave.host === "localhost"
        ? "localhost"
        : "mainnet")

    if (this.network === "localhost") this.cache = "leveldb"
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
      this.warp = this.Warp.WarpFactory.forMainnet(
        undefined,
        undefined,
        this.arweave
      )
    }
    this.contractTxId = contractTxId
    if (all(complement(isNil))([contractTxId, wallet, name, version])) {
      this.initialize({
        contractTxId,
        wallet,
        name,
        version,
        subscribe,
      })
    }
  }

  async readState(attempt = 1) {
    return new Promise(async res => {
      setTimeout(async () => {
        let _state = null
        try {
          _state = await this.db.readState()
        } catch (e) {}
        if (!isNil(_state) && this.sortKey !== _state.sortKey) {
          this.state = _state.cachedValue.state
          this.sortKey = _state.sortKey
          states[this.contractTxId] = this.state
          res(_state)
          try {
            if (
              compareVersions(this.state?.version || "0.26.0", "0.27.0") >= 0
            ) {
              this.handle = handle_kv
            } else {
              this.handle = handle
            }
          } catch (e) {}
        } else {
          if (attempt > 5) {
            res(_state)
          } else {
            res(await this.readState((attempt += 1)))
          }
        }
      }, 1000)
    })
  }

  async addFunds(wallet) {
    const walletAddress = await this.arweave.wallets.getAddress(wallet)
    await this.arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
    await this.arweave.api.get("mine")
  }

  async initializeWithoutWallet(params) {
    await this.init(params)
  }
  async init(params = {}) {
    let { wallet } = params
    wallet ??= await this.arweave.wallets.generate()
    if (this.network === "localhost") await this.addFunds(wallet)
    let evaluationOptions = {}
    try {
      evaluationOptions = (
        await this.warp.definitionLoader.load(this.contractTxId)
      ).manifest.evaluationOptions
    } catch (e) {}
    this.initialize({ wallet, evaluationOptions, ...params })
  }
  initialize({
    contractTxId,
    wallet,
    name = "weavedb",
    version = "1",
    subscribe,
    onUpdate,
    cache_prefix,
    evaluationOptions = {},
  }) {
    if (!isNil(contractTxId)) this.contractTxId = contractTxId
    if (!isNil(subscribe)) this.subscribe = subscribe
    if (!isNil(onUpdate)) this.onUpdate = onUpdate
    if (!isNil(cache_prefix)) this.cache_prefix = cache_prefix
    if (
      !isNil(this.cache_prefix) &&
      (/\./.test(this.cache_prefix) || /\|/.test(this.cache_prefix))
    ) {
      throw new Error(". and | are not allowed in prefix")
    }
    if (typeof window === "undefined") {
      if (this.cache !== "leveldb") {
        this.warp.useKVStorageFactory(
          contractTxId =>
            new this.LmdbCache({
              ...defaultCacheOptions,
              dbLocation: `./cache/warp/kv/lmdb/${contractTxId}`,
            })
        )
      }
      if (this.cache === "lmdb") {
        this.warp
          .useStateCache(
            new this.LmdbCache({
              ...this.Warp.defaultCacheOptions,
              dbLocation: `./cache/warp/state`,
              ...(this.lmdb.state || {}),
            })
          )
          .useContractCache(
            new this.LmdbCache({
              ...this.Warp.defaultCacheOptions,
              dbLocation: `./cache/warp/contracts`,
              ...(this.lmdb.contracts || {}),
            }),
            new this.LmdbCache({
              ...this.Warp.defaultCacheOptions,
              dbLocation: `./cache/warp/src`,
              ...(this.lmdb.src || {}),
            })
          )
      } else if (this.cache === "redis") {
        const { RedisCache } = require("./RedisCache")
        const opt = { url: this.redis.url || null }
        this.redis_client = this.redis.client || this.createClient(opt)
        if (isNil(this.redis.client)) this.redis_client.connect()
        if (
          !isNil(this.redis.prefix) &&
          (/\./.test(this.redis.prefix) || /\|/.test(this.redis.prefix))
        ) {
          throw new Error(". and | are not allowed in prefix")
        }
        this.warp
          .useStateCache(
            new RedisCache({
              client: this.redis_client,
              prefix: `${this.redis.prefix || "warp"}.${
                this.contractTxId
              }.state`,
            })
          )
          .useContractCache(
            new RedisCache({
              client: this.redis_client,
              prefix: `${this.redis.prefix || "warp"}.${
                this.contractTxId
              }.contracts`,
            }),
            new RedisCache({
              client: this.redis_client,
              prefix: `${this.redis.prefix || "warp"}.${this.contractTxId}.src`,
            })
          )
      }
    }
    if (isNil(wallet)) throw Error("wallet missing")
    if (isNil(this.contractTxId)) throw Error("contractTxId missing")
    this.wallet = wallet
    this.db = this.warp
      .contract(this.contractTxId)
      .connect(wallet)
      .setEvaluationOptions(
        mergeLeft(evaluationOptions, {
          internalWrites: true,
          remoteStateSyncEnabled: this.isNode
            ? false
            : this.network !== "localhost",
          remoteStateSyncSource:
            this.remoteStateSyncSource ?? "https://dre-2.warp.cc/contract",
          allowBigInt: true,
          useVM2: !isNil(this.useVM2)
            ? this.useVM2
            : typeof window !== "undefined"
            ? false
            : !this.old,
          useKVStorage: true,
        })
      )
    dbs[this.contractTxId] = this
    this.domain = { name, version, verifyingContract: this.contractTxId }
    const self = this
    if (this.network !== "localhost") {
      if (this.subscribe) {
        class CustomSubscriptionPlugin extends this.WarpSubscriptionPlugin {
          async process(input) {
            try {
              const lastStoredKey = (
                await self.warp.stateEvaluator.latestAvailableState(
                  self.contractTxId
                )
              )?.sortKey
              let data =
                lastStoredKey?.localeCompare(input.lastSortKey) === 0
                  ? await dbs[self.contractTxId].db.readStateFor(
                      input.lastSortKey,
                      [input.interaction]
                    )
                  : await dbs[self.contractTxId].db.readState()

              const state = data.cachedValue.state

              try {
                _on(state, input)
              } catch (e) {}
              if (!isNil(self.onUpdate)) {
                let query = null
                try {
                  for (let v of input.interaction.tags) {
                    if (v.name === "Input") {
                      query = JSON.parse(v.value)
                    }
                  }
                } catch (e) {}
                await self.pubsubReceived(state, query, input)
              }
            } catch (e) {
              console.log(e)
            }
          }
        }

        this.warp.use(
          new CustomSubscriptionPlugin(this.contractTxId, this.warp)
        )
      }
      if (is(Function, this.progress)) {
        class EvaluationProgressPlugin {
          constructor(emitter, notificationFreq) {}
          process(input) {
            self.progress(input)
          }
          type() {
            return "evaluation-progress"
          }
        }
        this.warp.use(new EvaluationProgressPlugin())
      }
      if (is(Function, this.progress)) {
        class EvaluationProgressPlugin {
          constructor(emitter, notificationFreq) {}
          process(input) {
            self.progress(input)
          }
          type() {
            return "evaluation-progress"
          }
        }
        this.warp.use(new EvaluationProgressPlugin())
      }
      this.readState()
    } else {
      if (this.subscribe) {
        /*
        clearInterval(this.interval)
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
        */
      }
    }
  }
  getSW() {
    return {
      kv: {
        get: async key => {
          let val = this.kvs[key] || null
          if (isNil(val)) {
            const result = (await this.db.getStorageValues([key])).cachedValue
            val = result.get(key) || null
          }
          return val
        },
        put: async (key, val) => {
          this.kvs[key] = val
        },
      },
      contract: { id: this.contractTxId },
      arweave: this.arweave,
      block: {
        timestamp: Math.round(Date.now() / 1000),
        height: ++this.height,
      },
      transaction: { id: createId() },
      contracts: {
        viewContractState: async (contract, param, SmartWeave) => {
          const key = invertObj(
            (cachedStates[this.contractTxId] || states[this.contractTxId])
              .contracts
          )[contract]
          const { handle } = require(`weavedb-contracts/${key}/contract`)
          try {
            return await handle({}, { input: param }, SmartWeave)
          } catch (e) {
            console.log(e)
          }
        },
      },
    }
  }
  async viewState(params, attempt = 0) {
    try {
      return await this.db.viewState(params)
    } catch (e) {
      if (attempt < 5) {
        return this.viewState(params, ++attempt)
      } else {
        throw e
      }
    }
  }
  async read(params, nocache = this.nocache_default) {
    if (!nocache && !isNil(this.state)) {
      try {
        return (
          await this.handle(
            cachedStates[this.contractTxId] || states[this.contractTxId],
            { input: params },
            this.getSW()
          )
        ).result
      } catch (e) {
        throw e
      }
    }
    const res = await this.viewState(params)
    if (res.type === "ok") {
      this.state = res.state
      states[this.contractTxId] = this.state
    } else {
      throw new Error(res?.errorMessage || "unknown error")
    }
    return res.result
  }

  async write(func, param, dryWrite, bundle, relay = false, onDryWrite) {
    let cache = !isNil(onDryWrite?.cache)
      ? onDryWrite.cache
      : !this.nocache_default
    return new Promise(async (_res, rej) => {
      if (relay) {
        _res(param)
      } else {
        let sent = false
        let dryResult = null
        const start = Date.now()
        if (cache !== false || !isNil(cachedStates[this.contractTxId])) {
          if (
            !includes(func)([
              "set",
              "upsert",
              "update",
              "delete",
              "addOwner",
              "removeOwner",
              "setAlgorithms",
              "setCanEvolve",
              "setSecure",
              "addIndex",
              "setSchema",
              "removeIndex",
              "setRules",
              "removeCron",
              "addRelayerJob",
              "removeRelayerJob",
              "linkContract",
              "unlinkContract",
              "removeAddressLink",
              "addCron",
              "addAddressLink",
              "evolve",
              "add",
              "batch",
              "relay",
            ])
          ) {
            cache = false
          } else {
            let cacheState = null
            let err = null
            let success = true
            try {
              cacheState = await this.handle(
                clone(
                  cachedStates[this.contractTxId] || states[this.contractTxId]
                ),
                {
                  input: param,
                },
                this.getSW()
              )
            } catch (e) {
              err = e
              success = false
              console.log(e)
            }
            const self = this
            let cacheResult = {
              nonce: param.nonce,
              signer: param.caller,
              cache: true,
              success,
              duration: Date.now() - start,
              error:
                typeof err === "string"
                  ? err
                  : typeof err?.message === "string"
                  ? err.message
                  : !isNil(err)
                  ? "unknown error"
                  : null,
              function: param.function,
              state: cacheState?.state || null,
              result: cacheState?.result || null,
              results: [],
              getResult: isNil(cacheState?.result?.transaction?.id)
                ? null
                : async () =>
                    new Promise(async res =>
                      res(
                        await self.checkResult(
                          cacheState.result.transaction.id,
                          self
                        )
                      )
                    ),
            }
            sent = true
            if (success) {
              this.virtual_nonces[cacheState.result.original_signer] =
                param.nonce
              clearTimeout(timeouts[this.contractTxId])
              cachedStates[this.contractTxId] = cacheResult.state
              timeouts[this.contractTxId] = setTimeout(() => {
                delete cachedStates[this.contractTxId]
                delete this.virtual_nonces[cacheState.result.original_signer]
              }, 5000)
              if (!isNil(onDryWrite?.read)) {
                cacheResult.results = await this.dryRead(
                  cacheResult.state,
                  onDryWrite.read
                )
              }
            }

            if (!isNil(onDryWrite?.cb)) onDryWrite.cb(cacheResult)
            dryResult = cacheResult
            _res(cacheResult)
          }
        }
        if (isNil(dryResult)) {
          let dryState = await this.db.dryWrite(param)
          dryResult =
            dryState.type !== "ok"
              ? {
                  nonce: param.nonce,
                  signer: param.caller,
                  cache: false,
                  success: false,
                  duration: Date.now() - start,
                  error: { message: "dryWrite failed", dryWrite: dryState },
                  function: param.function,
                  state: null,
                  result: null,
                  results: [],
                }
              : {
                  nonce: param.nonce,
                  signer: param.caller,
                  cache: false,
                  success: true,
                  duration: Date.now() - start,
                  error: null,
                  function: param.function,
                  state: dryState.state,
                  result: dryState?.result || null,
                  results: [],
                }
        }
        if (is(Function, onDryWrite?.cb) && cache === false) {
          if (dryResult.success) {
            dryResult.results = await this.dryRead(
              dryResult.state,
              onDryWrite.read
            )
            if (dryResult.success) {
              clearTimeout(timeouts[this.contractTxId])
              cachedStates[this.contractTxId] = dryResult.state
              timeouts[this.contractTxId] = setTimeout(() => {
                delete cachedStates[this.contractTxId]
                this.kvs = {}
              }, 5000)
            }
          }
          onDryWrite.cb(dryResult)
        }
        let read = onDryWrite?.read
        if (isNil(read) && is(Object, dryWrite?.read)) read = dryWrite.read
        if (!dryResult.success) {
          if (!isNil(dryResult?.result?.transaction?.id)) {
            this.results[dryResult.result.transaction.id] = dryResult
          }
          if (!sent) _res(dryResult)
        } else {
          this.queue.push({
            id: dryResult?.result?.transaction?.id || null,
            res: !sent ? _res : null,
            query: [param, bundle, start, read],
          })
          if (this.queue.length === 1) this.execNext()
        }
      }
    })
  }
  async execNext() {
    if (!this.ongoing) {
      this.ongoing = true
      if (
        this.queue.length > 1 &&
        compareVersions(await this.getVersion(), "0.26.0") >= 0
      ) {
        const queue = clone(this.queue)
        const param = await this.sign("bundle", map(v => v.query[0])(queue), {
          ar: this.wallet,
        })
        const res = await this.send(
          param,
          this.network === "mainnet",
          Date.now(),
          []
        )
        let i = 0
        for (let v of queue) {
          this.results[v.id] = {
            originalTxId: res.originalTxId,
            bundle: true,
            function: v.query[0].function,
            nonce: v.query[0].nonce,
            signer: v.query[0].caller,
            duration: res.duration,
            success: res.success,
            results: [],
            error: res.error,
          }
          i++
        }
        this.queue = reject(v => includes(v.id)(pluck("id")(queue)))(this.queue)
        this.ongoing = false
      } else {
        const q = this.queue[0]
        if (!isNil(q)) {
          const [param, bundle, start, read] = q.query
          try {
            const res = await this.send(param, bundle, start, read)
            if (!isNil(q.id)) this.results[q.id] = res
            if (!isNil(q.res)) q.res(res)
          } catch (e) {
            console.log(e)
          }
          this.queue.shift()
        }
        this.ongoing = false
        if (this.queue.length !== 0) this.execNext()
      }
    }
  }
  async checkResult(id, self) {
    return new Promise(res => {
      if (!isNil(self.results[id])) {
        res(self.results[id])
      } else {
        setTimeout(async () => res(await self.checkResult(id, self)), 500)
      }
    })
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
  async send(param, bundle, start, read) {
    let tx = null
    try {
      tx = await this.db[
        bundle && this.network !== "localhost"
          ? "bundleInteraction"
          : "writeInteraction"
      ](param, {})
    } catch (e) {
      console.log(e)
    }
    if (this.network === "localhost") await this.mineBlock()
    let state
    if (isNil(tx.originalTxId)) {
      return {
        success: false,
        nonce: param.nonce,
        signer: param.caller,
        duration: Date.now() - start,
        error: { message: "tx didn't go through" },
        function: param.function,
        results: [],
      }
    } else {
      state = await this.readState()
      const valid = state.cachedValue.validity[tx.originalTxId]
      if (valid === false) {
        return {
          success: false,
          nonce: param.nonce,
          signer: param.caller,
          duration: Date.now() - start,
          error: { message: "tx not valid" },
          function: param.function,
          ...tx,
          results: [],
        }
      } else if (isNil(valid)) {
        return {
          success: false,
          nonce: param.nonce,
          signer: param.caller,
          duration: Date.now() - start,
          error: { message: "tx validity missing" },
          function: param.function,
          ...tx,
          results: [],
        }
      }
    }

    let res = {
      success: true,
      error: null,
      function: param.function,
      query: param.query,
      nonce: param.nonce,
      signer: param.caller,
      ...tx,
      results: await this.dryRead(state.cachedValue.state, read || []),
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
            await this.handle(
              state.cachedValue.state,
              {
                input: { function: "ids", tx: tx.originalTxId },
              },
              this.getSW()
            )
          ).result[0]
          res.path = o(append(res.docID), tail)(query)
        } else {
          res.path = tail(query)
          res.docID = last(res.path)
        }
        res.doc = (
          await this.handle(
            clone(state.cachedValue.state),
            {
              input: { function: "get", query: res.path },
            },
            this.getSW()
          )
        ).result
      } catch (e) {
        console.log(e)
      }
    }
    res.duration = Date.now() - start

    if (
      this.network === "localhost" &&
      this.subscribe &&
      !isNil(this.onUpdate) &&
      res.success
    ) {
      const state = await this.readState()
      const info = await this.arweave.network.getInfo()
      setTimeout(async () => {
        await this.pubsubReceived(state.cachedValue.state, param, {
          interaction: { id: res.originalTxId },
        })
      }, 0)
      await _on(
        state,
        {
          contractTxId: this.contractTxId,
          interaction: {
            block: {
              height: info.height,
              timestamp: Math.round(Date.now() / 1000),
              id: info.current,
            },
          },
        },
        this.handle
      )
    }
    return res
  }

  async subscribe(isCon, ...query) {
    const { path } = parseQuery(query)
    const isDoc = path.length % 2 === 0
    subs[this.contractTxId] ||= {}
    const cb = query.pop()
    const hash = md5(JSON.stringify(query))
    const id = createId()
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
      .catch(e => console.log("cget error"))
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
      await this.handle(
        clone(states[this.contractTxId]),
        {
          input: { function: "get", query },
        },
        this.getSW()
      )
    ).result
  }

  async cgetCache(...query) {
    if (isNil(states[this.contractTxId])) return null
    return (
      await this.handle(
        clone(states[this.contractTxId]),
        {
          input: { function: "cget", query },
        },
        this.getSW()
      )
    ).result
  }

  async on(...query) {
    return await this.subscribe(false, ...query)
  }

  async con(...query) {
    return await this.subscribe(true, ...query)
  }

  static getPath(func, query) {
    if (includes(func, no_paths)) return []
    let _path = clone(query)
    if (includes(func, is_data)) _path = tail(_path)
    return splitWhen(complement(is)(String), _path)[0]
  }

  static getCollectionPath(func, query) {
    let _query = SDK.getPath(func, query)
    const len = _query.length
    return len === 0
      ? "__root__"
      : (len % 2 === 0 ? init(_query) : _query).join("/")
  }

  static getDocPath(func, query) {
    let _query = SDK.getPath(func, query)
    const len = _query.length
    return len === 0 ? "__root__" : len % 2 === 1 ? "__col__" : _query.join("/")
  }

  static getKey(contractTxId, func, query, prefix) {
    let colPath = SDK.getCollectionPath(func, query)
    let docPath = SDK.getDocPath(func, query)
    let key = [
      contractTxId,
      /^__.*__$/.test(colPath) ? colPath : md5(colPath),
      /^__.*__$/.test(docPath) ? docPath : md5(docPath),
      func === "get" ? "cget" : func,
      md5(query),
    ]
    if (!isNil(prefix)) key.unshift(prefix)
    return key.join(".")
  }

  static getKeyInfo(contractTxId, query, prefix = null) {
    const path = SDK.getPath(query.function, query.query)
    const len = path.length
    return {
      type: len === 0 ? "root" : len % 2 === 0 ? "doc" : "collection",
      path,
      collectionPath: SDK.getCollectionPath(query.function, query.query),
      docPath: SDK.getDocPath(query.function, query.query),
      contractTxId,
      prefix,
      func: query.function === "get" ? "cget" : query.function,
      query: query.query,
      key: SDK.getKey(contractTxId, query.function, query.query, prefix),
    }
  }

  static getKeys(contractTxId, query, prefix = null) {
    let keys = []
    try {
      if (query.function === "batch") {
        keys = map(
          v =>
            SDK.getKeyInfo(
              contractTxId,
              { function: v[0], query: tail(v) },
              prefix
            ),
          query.query
        )
      } else {
        const q =
          query.function === "relay"
            ? SDK.getKeyInfo(contractTxId, query.query[1], prefix)
            : SDK.getKeyInfo(contractTxId, query, prefix)
        keys.push(q)
      }
    } catch (e) {
      console.log(e)
    }
    return keys
  }

  async pubsubReceived(state, query, input) {
    const keys = SDK.getKeys(this.contractTxId, query, this.cache_prefix)
    const updates = {}
    const deletes = []
    for (let v of keys) {
      let _query = null
      if (v.func === "add") {
        const docID = (
          await this.handle(
            clone(state),
            {
              function: "ids",
              input: { tx: input.interaction.id },
            },
            this.getSW()
          )
        ).result[0]
        _query = append(docID, v.path)
      } else if (includes(v.func)(["upsert", "set", "update"])) {
        _query = v.path
      }
      if (!isNil(_query)) {
        let val = (
          await this.handle(
            clone(state),
            {
              input: { function: "cget", query: _query },
            },
            this.getSW()
          )
        ).result
        if (!isNil(val)) delete val.block
        const key = SDK.getKey(
          this.contractTxId,
          "cget",
          _query,
          this.cache_prefix
        )
        updates[key] = val
      }
      if (v.func === "delete") {
        _query = v.path
        const key = SDK.getKey(
          this.contractTxId,
          "cget",
          _query,
          this.cache_prefix
        )
        updates[key] = null
      }
    }
    for (const k in updates) {
      if (updates[k] === null) {
        deletes.push(k)
        delete updates[k]
      }
      deletes.push(`${k.split(".").slice(0, 3).join(".")}.__col__.*`)
    }
    this.onUpdate(
      state,
      query,
      {
        keys,
        updates,
        deletes: uniq(deletes),
      },
      input
    )
  }

  async getNonce(address, nocache) {
    return !isNil(this.virtual_nonces[address])
      ? this.virtual_nonces[address] + 1
      : (await this.read(
          {
            function: "nonce",
            address,
          },
          nocache
        )) + 1
  }
}

module.exports = SDK
