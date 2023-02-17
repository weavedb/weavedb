const {
  dissoc,
  isEmpty,
  init,
  all,
  complement,
  isNil,
  is,
  last,
  includes,
} = require("ramda")
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

class SDK extends Base {
  constructor({
    rpc,
    contractTxId,
    wallet,
    name = "weavedb",
    version = "1",
    EthWallet,
    web3,
    arweave,
    arweave_wallet,
    network,
    port = 1820,
    secure,
    cert = null,
  }) {
    super()
    this.contractTxId = contractTxId
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
    this.network =
      network ||
      (arweave.host === "host.docker.internal" || arweave.host === "localhost"
        ? "localhost"
        : "mainnet")

    const [rpc_host, rpc_port] = rpc.split(":")
    this.secure = +rpc_port === 443 && isNil(secure) ? true : secure || false
    this.client = new weavedb_proto.DB(
      rpc,
      this.secure
        ? grpc.ChannelCredentials.createSsl()
        : grpc.credentials.createInsecure()
    )
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
      nocache = !nocache
    }
    let params = query || []
    const request = {
      method: `${func}@${this.contractTxId}`,
      query: JSON.stringify(params),
      nocache,
    }
    const _query = () =>
      new Promise(ret => {
        this.client.query(request, (err, response) => {
          if (!isNil(err)) {
            ret({ result: null, err })
          } else {
            if (response.err === "") {
              try {
                const result =
                  response.result === "" ? null : JSON.parse(response.result)
                ret({ result, err: null })
              } catch (e) {
                ret({ result: null, err: e })
              }
            } else {
              ret({ result: null, err: response.err })
            }
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

  async getNonce(addr) {
    return this.readQuery("getNonce", addr, true)
  }
  async getVersion(nocache) {
    return this.readQuery("getVersion", null, nocache)
  }
  async getIds(tx, nocache) {
    return this.readQuery("getIds", tx, nocache)
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
