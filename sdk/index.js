const { all, complement, isNil } = require("ramda")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const Base = require("weavedb-base")
const { WarpFactory, LoggerFactory } = require("warp-contracts")

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
      arweave.host === "localhost"
        ? "localhost"
        : arweave.host === "arweave.net"
        ? "mainnet"
        : "testnet"
    if (this.network === "localhost") {
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
    this.domain = { name, version, verifyingContract: contractTxId }
    if (!isNil(EthWallet)) this.setEthWallet(EthWallet)
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
    let tx = await this.db[bundle ? "bundleInteraction" : "writeInteraction"](
      param
    )
    if (this.network === "localhost") await this.mineBlock()
    return tx
  }
}

module.exports = SDK
