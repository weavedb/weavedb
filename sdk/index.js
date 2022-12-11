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

const _on = async (state, contractTxId, block = {}) => {
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
            if (subs[cid][q].height < block.height) {
              subs[cid][q].height = block.height
              if (!equals(res.result, subs[cid][q].prev)) {
                for (const k in subs[cid][q].subs) {
                  try {
                    if (!isNil(res)) subs[cid][q].subs[k].cb(res.result)
                  } catch (e) {
                    console.log(e)
                  }
                }
                subs[cid][q].prev = res.result
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
    contractTxId,
    wallet,
    name,
    version,
    EthWallet,
    web3,
  }) {
    super()
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
      this.warp = WarpFactory.forMainnet()
    }
    if (all(complement(isNil))([contractTxId, wallet, name, version])) {
      this.initialize({ contractTxId, wallet, name, version, EthWallet })
    }
  }

  initialize({ contractTxId, wallet, name, version, EthWallet }) {
    this.contractTxId = contractTxId
    if (isNil(contractTxId)) throw Error("contractTxId missing")
    this.db = this.warp
      .contract(contractTxId)
      .connect(wallet)
      .setEvaluationOptions({
        allowBigInt: true,
      })
    dbs[contractTxId] = this
    this.domain = { name, version, verifyingContract: contractTxId }
    if (!isNil(EthWallet)) this.setEthWallet(EthWallet)
    if (this.network !== "localhost") {
      this.warp.use(new CustomSubscriptionPlugin(contractTxId, this.warp))
    } else {
      setInterval(() => {
        this.db
          .readState()
          .then(async v => {
            const state = v.cachedValue.state
            if (!equals(state, this.state)) {
              this.state = state
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
          })
      }, 1000)
    }
  }

  async on(...query) {
    subs[this.contractTxId] ||= {}
    const cb = query.pop()
    const hash = md5(JSON.stringify(query))
    const id = shortid()
    subs[this.contractTxId][hash] ||= {
      prev: undefined,
      subs: {},
      query,
      height: 0,
    }
    subs[this.contractTxId][hash].subs[id] = { cb, once: false }
    submap[id] = hash
    this.get(...query).then(v => {
      if (
        !isNil(subs[this.contractTxId][hash].subs[id]) &&
        subs[this.contractTxId][hash].height === 0
      ) {
        subs[this.contractTxId][hash].prev = v
        cb(v)
      }
    })
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
    let res = await this.db.viewState(opt, 3)
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
