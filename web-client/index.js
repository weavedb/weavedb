const { DBClient } = require("./weavedb_grpc_web_pb")
const { WeaveDBRequest } = require("./weavedb_pb")
const { includes, all, complement, last, isNil, is, init } = require("ramda")
const Base = require("weavedb-base")
let Arweave = require("arweave")
Arweave = Arweave.default || Arweave

const reads = [
  "get",
  "cget",
  "getIndexes",
  "getCrons",
  "getSchema",
  "getRules",
  "getIds",
  "getOwner",
  "getAddressLink",
  "getAlgorithms",
  "getLinkedContract",
  "getEvolve",
  "getVersion",
  "getRelayerJob",
  "listCollections",
  "getInfo",
]

class SDK extends Base {
  constructor({
    rpc,
    contractTxId,
    wallet,
    name = "weavedb",
    version = "1",
    EthWallet,
    web3,
    arweave_wallet,
  }) {
    super()
    this.contractTxId = contractTxId
    this.arweave = Arweave.init()
    this.arweave_wallet = arweave_wallet
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

  async _request(func, query, nocache, bundle, relay = false) {
    if (!includes(func)(reads)) {
      nocache = false
      if (relay) {
        return query
      }
    }

    const request = new WeaveDBRequest()
    request.setMethod(`${func}@${this.contractTxId}`)
    request.setQuery(JSON.stringify(query))
    request.setNocache(nocache)
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
    if (!isNil(q.err)) throw new Error(q.err)
    return q.result
  }

  parseQuery(func, query) {
    let nocache = false
    if (includes(func)(reads) && is(Boolean, last(query))) {
      nocache = last(query)
      query = init(query)
    }
    return { nocache, query }
  }

  async request(func, ...query) {
    let nocache = false
    ;({ nocache, query } = this.parseQuery(func, query))
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
