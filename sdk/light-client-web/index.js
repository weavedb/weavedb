const { DBClient } = require("./weavedb_grpc_web_pb")
const { WeaveDBRequest } = require("./weavedb_pb")
const {
  isEmpty,
  includes,
  all,
  complement,
  last,
  isNil,
  is,
  init,
  dissoc,
} = require("ramda")
const Base = require("weavedb-base")
let Arweave = require("arweave")
Arweave = Arweave.default || Arweave

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

  async write(func, query, nocache, bundle, relay = false) {
    if (!includes(func)(this.reads)) {
      if (relay) return query
      if (is(Boolean, nocache)) {
        nocache = !nocache
      } else if (is(Object, nocache)) {
        query.dryWrite = nocache
        nocache = false
        query ||= {}
      }
    } else {
      query ||= []
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
            try {
              const result =
                response.toObject().result === ""
                  ? null
                  : JSON.parse(response.toObject().result)
              if (!isNil(result?.result?.transaction?.id)) {
                result.getResult = async () =>
                  await this.node({
                    op: "tx_result",
                    txid: result?.result?.transaction?.id,
                  })
              }
              ret({ result, err: null })
            } catch (e) {
              ret({ result: null, err: e })
            }
          } else {
            ret({ result: null, err: response.toObject().err })
          }
        })
      })
    let q = await _query()
    if (!isNil(q.err)) throw new Error(q.err)
    return q.result
  }

  async read(params, nocache) {
    let query = dissoc("function")(params)
    if (isEmpty(query)) {
      query = null
    } else if (!isNil(query.query)) {
      query = query.query
    }

    return await this.write(params.function, query, nocache)
  }
  async getHash(nocache) {
    return this.readQuery("getHash", null, nocache)
  }
  async getVersion(nocache) {
    return this.readQuery("getVersion", null, nocache)
  }
  async getIds(tx, nocache) {
    return this.readQuery("getIds", tx, nocache)
  }
  async getNonce(addr) {
    return this.readQuery("getNonce", addr, true)
  }
  async getAddressLink(address, nocache) {
    return this.readQuery("getAddressLink", address, nocache)
  }
  async admin(op, opt) {
    return this._write2("admin", op, opt)
  }
  async node(op, opt) {
    return this.write("admin", { query: op })
  }
}

module.exports = SDK
