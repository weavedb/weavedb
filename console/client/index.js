import { DBClient } from "./weavedb_grpc_web_pb"
import { WeaveDBRequest } from "./weavedb_pb"
const EthCrypto = require("eth-crypto")
const { all, complement, init, is, last, isNil } = require("ramda")
const ethSigUtil = require("@metamask/eth-sig-util")
const { privateToAddress } = require("ethereumjs-util")

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "string" },
]

class SDK {
  constructor({ rpc, contractTxId, wallet, name, version, EthWallet, web3 }) {
    this.client = new DBClient(rpc)
    if (typeof window === "object") {
      require("@metamask/legacy-web3")
      this.web3 = window.web3
    }
    if (all(complement(isNil))([contractTxId, wallet, name, version])) {
      this.initialize({ contractTxId, wallet, name, version, EthWallet })
    }
  }

  initialize({ contractTxId, wallet, name, version, EthWallet }) {
    this.domain = { name, version, verifyingContract: contractTxId }
    if (!isNil(EthWallet)) this.setEthWallet(EthWallet)
  }

  setEthWallet(wallet) {
    this.wallet = wallet
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
    console.log(q)
    return q.result
  }

  async request(func, ...query) {
    return await this._request(func, query)
  }

  async viewState(opt) {
    let res = await this.db.viewState(opt)
    return res.result
  }

  async get(...query) {
    return this.request("get", ...query)
  }

  async cget(...query) {
    return this.request("cget", ...query)
  }

  async getIndexes(...query) {
    return this.request("getIndexes", ...query)
  }

  async getCrons(...query) {
    return this.request("getCrons", ...query)
  }

  async getSchema(...query) {
    return this.request("getSchema", ...query)
  }

  async getRules(...query) {
    return this.request("getRules", ...query)
  }

  async getNonce(addr) {
    return this.request("getNonce", JSON.stringify([addr]))
  }

  async getIds(tx) {
    return this.request("getIds", JSON.stringify([tx]))
  }

  async _write(func, ...query) {
    let nonce, privateKey, overwrite, wallet, dryWrite, bundle
    if (is(Object, last(query)) && !is(Array, last(query))) {
      ;({ nonce, privateKey, overwrite, wallet, dryWrite, bundle } = last(
        query
      ))
      query = init(query)
    }
    if (func === "batch") query = query[0]
    return await this.write(
      wallet || this.wallet,
      func,
      query,
      nonce,
      privateKey,
      overwrite,
      dryWrite,
      bundle
    )
  }

  async _write2(func, query, opt) {
    let nonce, privateKey, overwrite, wallet, dryWrite, bundle
    if (!isNil(opt)) {
      ;({ nonce, privateKey, overwrite, wallet, dryWrite, bundle } = opt)
    }
    return await this.write(
      wallet || this.wallet,
      func,
      query,
      nonce,
      privateKey,
      overwrite,
      dryWrite,
      bundle
    )
  }

  async createTempAddress(addr) {
    const identity = EthCrypto.createIdentity()
    const nonce = await this.getNonce(addr.toLowerCase())
    const message = {
      nonce,
      query: JSON.stringify({
        func: "auth",
        query: { address: addr.toLowerCase() },
      }),
    }
    const data = {
      types: {
        EIP712Domain,
        Query: [
          { name: "query", type: "string" },
          { name: "nonce", type: "uint256" },
        ],
      },
      domain: this.domain,
      primaryType: "Query",
      message,
    }
    const signature = ethSigUtil.signTypedData({
      privateKey: Buffer.from(identity.privateKey.replace(/^0x/, ""), "hex"),
      data,
      version: "V4",
    })
    const tx = await this.addAddressLink(
      { signature, address: identity.address.toLowerCase() },
      { wallet: this.wallet || addr.toLowerCase(), nonce }
    )
    return isNil(tx.err) ? { tx, identity } : null
  }
  async addAddressLink(query, opt) {
    return await this._write2("addAddressLink", query, opt)
  }

  async removeAddressLink(query, opt) {
    return await this._write2("removeAddressLink", query, opt)
  }

  async set(...query) {
    return this._write("set", ...query)
  }

  async delete(...query) {
    return this._write("delete", ...query)
  }

  async add(...query) {
    return this._write("add", ...query)
  }

  async addIndex(...query) {
    return this._write("addIndex", ...query)
  }

  async addCron(...query) {
    return this._write("addCron", ...query)
  }

  async removeCron(...query) {
    return this._write("removeCron", ...query)
  }

  async removeIndex(...query) {
    return this._write("removeIndex", ...query)
  }

  async update(...query) {
    return this._write("update", ...query)
  }

  async upsert(...query) {
    return this._write("upsert", ...query)
  }

  async setSchema(...query) {
    return this._write("setSchema", ...query)
  }

  async setRules(...query) {
    return this._write("setRules", ...query)
  }

  async batch(...query) {
    return this._write("batch", ...query)
  }

  async write(
    wallet,
    func,
    query,
    nonce,
    privateKey,
    overwrite,
    dryWrite = true,
    bundle
  ) {
    let addr = isNil(privateKey)
      ? null
      : `0x${privateToAddress(
          Buffer.from(privateKey.replace(/^0x/, ""), "hex")
        ).toString("hex")}`
    const isaddr = !isNil(addr)
    if (isNil(addr)) {
      addr = is(String, wallet) ? wallet : wallet.getAddressString()
    }
    addr = addr.toLowerCase()
    let result
    nonce ||= await this.getNonce(addr)
    const message = {
      nonce,
      query: JSON.stringify({ func, query }),
    }
    const data = {
      types: {
        EIP712Domain,
        Query: [
          { name: "query", type: "string" },
          { name: "nonce", type: "uint256" },
        ],
      },
      domain: this.domain,
      primaryType: "Query",
      message,
    }
    const signature =
      !isaddr && !isNil(this.web3)
        ? await this.web3.currentProvider.request({
            method: "eth_signTypedData_v4",
            params: [addr, JSON.stringify(data)],
          })
        : ethSigUtil.signTypedData({
            privateKey: !isNil(privateKey)
              ? Buffer.from(privateKey.replace(/^0x/, ""), "hex")
              : wallet.getPrivateKey(),
            data,
            version: "V4",
          })
    const param = {
      function: func,
      query,
      signature,
      nonce,
      caller:
        overwrite || isNil(wallet)
          ? addr
          : is(String, wallet)
          ? wallet.toLowerCase()
          : wallet.getAddressString(),
    }
    return await this._request("send", param)
  }

  signer() {
    return { __op: "signer" }
  }

  ts() {
    return { __op: "ts" }
  }

  del() {
    return { __op: "del" }
  }

  inc(n) {
    return { __op: "inc", n }
  }

  union(...args) {
    return { __op: "arrayUnion", arr: args }
  }

  remove(...args) {
    return { __op: "arrayRemove", arr: args }
  }
}

module.exports = SDK
