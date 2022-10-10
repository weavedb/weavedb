const { DBClient } = require("./weavedb_grpc_web_pb")
const { WeaveDBRequest } = require("./weavedb_pb")
const EthCrypto = require("eth-crypto")
const { all, complement, init, is, last, isNil } = require("ramda")
const ethSigUtil = require("@metamask/eth-sig-util")
const { privateToAddress } = require("ethereumjs-util")
const encoding = require("text-encoding")
const encoder = new encoding.TextEncoder()
const Base = require("weavedb-base")
const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "string" },
]

class SDK extends Base {
  constructor({ rpc, contractTxId, wallet, name, version, EthWallet, web3 }) {
    super()
    this.client = new DBClient(rpc)
    if (typeof window === "object") {
      require("@metamask/legacy-web3")
      this.web3 = window.web3
    }
    if (all(complement(isNil))([contractTxId, name, version])) {
      this.initialize({ contractTxId, name, version, EthWallet })
    }
  }

  initialize({ contractTxId, name, version, EthWallet }) {
    this.domain = { name, version, verifyingContract: contractTxId }
    if (!isNil(EthWallet)) this.setEthWallet(EthWallet)
  }

  async _request(func, query) {
    const request = new WeaveDBRequest()
    request.setMethod(func)
    request.setQuery(JSON.stringify(query))
    const _query = () =>
      new Promise(ret => {
        this.client.query(request, {}, (err, response) => {
          if (!isNil(err)) {
            ret({ result: null, err })
          } else if (response.toObject().err === "") {
            ret({ result: JSON.parse(response.toObject().result), err: null })
          } else {
            ret({ result: null, err: response.toObject().err })
          }
        })
      })
    let q = await _query()
    return q.result
  }

  async request(func, ...query) {
    return await this._request(func, query)
  }

  async getNonce(addr) {
    return this.request("getNonce", addr, true)
  }

  async getIds(tx) {
    return this.request("getIds", tx)
  }
}

module.exports = SDK
