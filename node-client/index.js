const { init, all, complement, isNil, is, last, includes } = require("ramda")
const Base = require("weavedb-base")
const PROTO_PATH = __dirname + "/weavedb.proto"
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const weavedb_proto = grpc.loadPackageDefinition(packageDefinition).weavedb
let Arweave = require("arweave")

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
]

class SDK extends Base {
  constructor({
    rpc,
    contractTxId,
    wallet,
    name,
    version,
    EthWallet,
    web3,
    arweave,
    arweave_wallet,
  }) {
    super()
    this.contractTxId = contractTxId
    this.arweave_wallet = arweave_wallet
    this.arweave = Arweave.init(arweave)
    this.client = new weavedb_proto.DB(rpc, grpc.credentials.createInsecure())
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

  parseQuery(func, query) {
    let nocache = false
    if (includes(func)(reads) && is(Boolean, last(query))) {
      nocache = last(query)
      query = init(query)
    }
    return { nocache, query }
  }

  async _request(func, query, nocache = false) {
    if (!includes(func)(reads)) nocache = false
    const request = {
      method: `${func}@${this.contractTxId}`,
      query: JSON.stringify(query),
      nocache,
    }
    const _query = () =>
      new Promise(ret => {
        this.client.query(request, (err, response) => {
          if (!isNil(err)) {
            ret({ result: null, err })
          } else {
            if (response.err === "") {
              const result = JSON.parse(response.result)
              ret({ result, err: null })
            } else {
              ret({ result: null, err: response.err })
            }
          }
        })
      })
    let q = await _query()
    if (isNil(q.err)) {
      return q.result
    } else {
      throw new Error(q.err)
    }
  }

  async request(func, ...query) {
    let nocache = false
    ;({ nocache, query } = this.parseQuery(func, query))
    return await this._request(func, query, nocache)
  }

  async getNonce(addr) {
    return this.request("getNonce", addr, true)
  }

  async getIds(tx) {
    return this.request("getIds", tx)
  }
}

module.exports = SDK
