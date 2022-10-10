const { all, complement, init, is, last, isNil } = require("ramda")
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

class SDK extends Base {
  constructor({ rpc, contractTxId, wallet, name, version, EthWallet, web3 }) {
    super()
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

  async _request(func, query) {
    const request = {
      method: func,
      query: JSON.stringify(query),
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
