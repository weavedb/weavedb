const {
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
} = require("ramda")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const Base = require("weavedb-base")
const { WarpFactory, LoggerFactory } = require("warp-contracts")
const { get, parseQuery } = require("./off-chain/actions/read/get")
const { ids } = require("./off-chain/actions/read/ids")

const {
  WarpFactory: WarpFactory_old,
  LoggerFactory: LoggerFactory_old,
} = require("warp-contracts-old")

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
    network,
    port = 1820,
    old = false,
  }) {
    super()
    this.old = old
    if (!this.old) {
      this.Warp = { WarpFactory, LoggerFactory }
    } else {
      this.Warp = {
        WarpFactory: WarpFactory_old,
        LoggerFactory: LoggerFactory_old,
      }
    }

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
      window.buffer = require("buffer")
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
    this.contractTxId = contractTxId
    if (all(complement(isNil))([contractTxId, wallet, name, version])) {
      this.initialize({ wallet, name, version, EthWallet })
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
  }) {
    if (!isNil(contractTxId)) this.contractTxId = contractTxId
    if (isNil(wallet)) throw Error("wallet missing")
    if (isNil(this.contractTxId)) throw Error("contractTxId missing")
    this.db = this.warp
      .contract(this.contractTxId)
      .connect(wallet)
      .setEvaluationOptions({
        allowBigInt: true,
      })
    this.domain = { name, version, verifyingContract: this.contractTxId }
    if (!isNil(EthWallet)) this.setEthWallet(EthWallet)
  }

  async request(func, ...query) {
    let nocache = false
    if (is(Boolean, last(query))) {
      nocache = last(query)
      query = init(query)
    }
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
}

module.exports = SDK
