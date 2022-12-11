const { equals, all, complement, isNil } = require("ramda")
const shortid = require("shortid")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const Base = require("weavedb-base")
const { WarpFactory, LoggerFactory } = require("warp-contracts")
const { WarpSubscriptionPlugin } = require("warp-contracts-plugin-subscription")
const { get } = require("./off-chain/actions/read/get")
const md5 = require("md5")
let states = {}
let dbs = {}
let subs = {}
let submap = {}

const _on = async (contractTxId, block = {}) => {
  try {
    let data = await dbs[contractTxId].readState()
    const state = data.cachedValue.state
    if (!isNil(state)) {
      states[contractTxId] = state
      for (const cid in subs) {
        for (const q in subs[cid]) {
          const query = subs[cid][q].query
          try {
            const res = await get(
              state,
              {
                input: { query },
              },
              null,
              { block }
            )
            if (!isNil(res)) {
              if (!equals(res.result, subs[cid][q].prev)) {
                for (const k in subs[cid][q].subs) {
                  if (!isNil(res)) subs[cid][q].subs[k].cb(res.result)
                }
                subs[cid][q].prev = res.result
              }
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
}

class CustomSubscriptionPlugin extends WarpSubscriptionPlugin {
  async process(input) {
    await _on(this.contractTxId, input.interaction.block)
  }
}

class SDK extends Base {
  constructor({
    arweave,
    contractTxId,
    wallet,
    name,
    version,
    EthWallet,
    web3,
  }) {
    super()
    if (isNil(contractTxId)) throw Error("contractTxId missing")
    this.contractTxId = contractTxId
    this.arweave = Arweave.init(arweave)
    LoggerFactory.INST.logLevel("error")
    if (typeof window === "object") {
      require("@metamask/legacy-web3")
      this.web3 = window.web3
    }
    this.network =
      arweave.host === "host.docker.internal"
        ? "localhost"
        : arweave.host === "localhost"
        ? "localhost"
        : arweave.host === "arweave.net"
        ? "mainnet"
        : "testnet"
    if (!isNil(arweave) && arweave.host === "host.docker.internal") {
      this.warp = WarpFactory.custom(this.arweave, {}, "local")
        .useArweaveGateway()
        .build()
    } else if (this.network === "localhost") {
      this.warp = WarpFactory.forLocal(
        isNil(arweave) || isNil(arweave.port) ? 1820 : arweave.port
      )
    } else {
      if (isNil(web3)) {
        this.warp = WarpFactory.forMainnet()
      } else {
        this.warp = WarpFactory.forMainnet()
      }
    }
    this.warp.use(new CustomSubscriptionPlugin(contractTxId, this.warp))
    if (all(complement(isNil))([contractTxId, wallet, name, version])) {
      this.initialize({ contractTxId, wallet, name, version, EthWallet })
    }
  }

  initialize({ contractTxId, wallet, name, version, EthWallet }) {
    this.db = this.warp
      .contract(contractTxId)
      .connect(wallet)
      .setEvaluationOptions({
        allowBigInt: true,
      })
    dbs[contractTxId] = this.db
    this.domain = { name, version, verifyingContract: contractTxId }
    if (!isNil(EthWallet)) this.setEthWallet(EthWallet)
  }

  async on(...query) {
    subs[this.contractTxId] ||= {}
    const cb = query.pop()
    const hash = md5(JSON.stringify(query))
    const id = shortid()
    subs[this.contractTxId][hash] ||= { prev: undefined, subs: {}, query }
    subs[this.contractTxId][hash].subs[id] = { cb, once: false }
    submap[id] = hash
    _on(this.contractTxId)
    return () => {
      try {
        delete subs[this.contractTxId][hash].subs[id]
      } catch (e) {}
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

  async _request(func, param, dryWrite, bundle) {
    if (dryWrite) {
      let dryState = await this.db.dryWrite(param)
      if (dryState.type === "error") return { err: dryState }
    }
    return await this.send(param, bundle)
  }

  async send(param, bundle) {
    let tx = await this.db[
      bundle && this.network !== "localhost"
        ? "bundleInteraction"
        : "writeInteraction"
    ](param, {})
    if (this.network === "localhost") await this.mineBlock()
    return tx
  }
}

module.exports = SDK
