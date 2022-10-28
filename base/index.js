const EthCrypto = require("eth-crypto")
const buildEddsa = require("circomlibjs").buildEddsa
const { includes, all, complement, init, is, last, isNil } = require("ramda")
let Arweave = require("arweave")
Arweave = isNil(Arweave.default) ? Arweave : Arweave.default
const ethSigUtil = require("@metamask/eth-sig-util")
const { privateToAddress } = require("ethereumjs-util")

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "string" },
]

const encoding = require("text-encoding")
const encoder = new encoding.TextEncoder()

class Base {
  setEthWallet(wallet) {
    this.wallet = wallet
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

  async getAlgorithms(...query) {
    return this.request("getAlgorithms", ...query)
  }

  async getLinkedContract(...query) {
    return this.request("getLinkedContract", ...query)
  }

  async getSchema(...query) {
    return this.request("getSchema", ...query)
  }

  async getRules(...query) {
    return this.request("getRules", ...query)
  }

  async _write(func, ...query) {
    let opt = null
    if (is(Object, last(query)) && !is(Array, last(query))) {
      opt = last(query)
      query = init(query)
    }
    if (func === "batch") query = query[0]
    return await this._write2(func, query, opt)
  }

  async _write2(func, query, opt) {
    let nonce, privateKey, overwrite, wallet, dryWrite, bundle, ii, ar, intmax
    if (!isNil(opt)) {
      ;({
        nonce,
        privateKey,
        overwrite,
        wallet,
        dryWrite,
        bundle,
        ii,
        ar,
        intmax,
      } = opt)
    }

    if (all(isNil)([wallet, ii, intmax, ar]) && !isNil(this.arweave_wallet)) {
      ar = this.arweave_wallet
    }
    return !isNil(intmax)
      ? await this.writeWithIntmax(intmax, func, query, nonce, dryWrite, bundle)
      : !isNil(ii)
      ? await this.writeWithII(ii, func, query, nonce, dryWrite, bundle)
      : !isNil(ar)
      ? await this.writeWithAR(ar, func, query, nonce, dryWrite, bundle)
      : await this.write(
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

  async createTempAddressWithII(ii) {
    let addr = ii.toJSON()[0]
    return this._createTempAddress(addr, {
      ii,
    })
  }

  async createTempAddressWithAR(ar) {
    const wallet = is(Object, ar) && ar.walletName === "ArConnect" ? ar : null
    let addr = null
    if (!isNil(wallet)) {
      await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
      addr = await wallet.getActiveAddress()
    } else {
      addr = await this.arweave.wallets.jwkToAddress(ar)
    }
    return this._createTempAddress(addr, {
      ar,
    })
  }

  async createTempAddress(addr) {
    return this._createTempAddress(addr, {
      wallet: this.wallet || addr.toLowerCase(),
    })
  }

  async createTempAddressWithIntmax(intmax) {
    const wallet = is(Object, intmax) ? intmax : null
    let addr = null
    if (!isNil(wallet)) {
      addr = !isNil(wallet._account) ? wallet._account.address : intmax._address
    } else {
      throw Error("No Intmax wallet")
      return
    }
    return this._createTempAddress(addr.toLowerCase(), {
      intmax,
    })
  }

  async createTempAddress(addr) {
    return this._createTempAddress(addr.toLowerCase(), {
      wallet: this.wallet || addr.toLowerCase(),
    })
  }

  async _createTempAddress(addr, opt) {
    const identity = EthCrypto.createIdentity()
    const nonce = await this.getNonce(addr)
    const message = {
      nonce,
      query: JSON.stringify({
        func: "auth",
        query: { address: addr },
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
      { nonce, ...opt }
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

  async setAlgorithms(...query) {
    return this._write("setAlgorithms", ...query)
  }

  async linkContract(...query) {
    return this._write("linkContract", ...query)
  }

  async unlinkContract(...query) {
    return this._write("unlinkContract", ...query)
  }

  async setRules(...query) {
    return this._write("setRules", ...query)
  }

  async batch(...query) {
    return this._write("batch", ...query)
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
    bundle ||= this.network === "mainnet"
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
          ? wallet
          : wallet.getAddressString(),
    }
    return await this._request(func, param, dryWrite, bundle)
  }

  async writeWithII(ii, func, query, nonce, dryWrite = true, bundle) {
    let addr = ii.toJSON()[0]
    const isaddr = !isNil(addr)
    addr = addr.toLowerCase()
    let result
    nonce ||= await this.getNonce(addr)
    bundle ||= this.network === "mainnet"
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

    function toHexString(bytes) {
      return new Uint8Array(bytes).reduce(
        (str, byte) => str + byte.toString(16).padStart(2, "0"),
        ""
      )
    }
    const _data = Buffer.from(JSON.stringify(data))
    const signature = toHexString(await ii.sign(_data))
    const param = {
      function: func,
      query,
      signature,
      nonce,
      caller: addr,
      type: "ed25519",
    }
    return await this._request(func, param, dryWrite, bundle)
  }

  async writeWithAR(ar, func, query, nonce, dryWrite = true, bundle) {
    const wallet = is(Object, ar) && ar.walletName === "ArConnect" ? ar : null
    let addr = null
    let pubKey = null
    if (!isNil(wallet)) {
      await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
      addr = await wallet.getActiveAddress()
      pubKey = await wallet.getActivePublicKey()
    } else {
      addr = await this.arweave.wallets.jwkToAddress(ar)
      pubKey = ar.n
    }
    const isaddr = !isNil(addr)
    let result
    nonce ||= await this.getNonce(addr)
    bundle ||= this.network === "mainnet"
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
    const encoded = encoder.encode(JSON.stringify(data))
    const signature = isNil(wallet)
      ? (await this.arweave.wallets.crypto.sign(ar, encoded)).toString("hex")
      : Buffer.from(
          await wallet.signature(encoded, {
            name: "RSA-PSS",
            saltLength: 32,
          })
        ).toString("hex")
    const param = {
      function: func,
      query,
      signature,
      nonce,
      caller: addr,
      pubKey,
      type: "rsa256",
    }
    return await this._request(func, param, dryWrite, bundle)
  }

  async writeWithIntmax(intmax, func, query, nonce, dryWrite = true, bundle) {
    const eddsa = await buildEddsa()
    const wallet = is(Object, intmax) ? intmax : null
    let addr = null
    let pubKey = null
    if (!isNil(wallet)) {
      if (!isNil(wallet._account)) {
        pubKey = wallet._account.publicKey
        addr = wallet._account.address
      } else {
        const packedPublicKey = eddsa.babyJub.packPoint(intmax._publicKey)
        pubKey = "0x" + Buffer.from(packedPublicKey).toString("hex")
        addr = intmax._address
      }
    } else {
      throw Error("No Intmax wallet")
      return
    }
    const isaddr = !isNil(addr)
    let result
    nonce ||= await this.getNonce(addr)
    bundle ||= this.network === "mainnet"
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
    const signature = !isNil(wallet._account)
      ? await intmax.signMessage(JSON.stringify(data))
      : await intmax.sign(JSON.stringify(data))
    const param =
      !isNil(pubKey) && pubKey.length === 66
        ? {
            function: func,
            query,
            signature,
            nonce,
            caller: addr,
            pubKey,
            type: "poseidon",
          }
        : {
            function: func,
            query,
            signature,
            nonce,
            caller: addr,
            type: "secp256k1-2",
          }
    return await this._request(func, param, dryWrite, bundle)
  }
}

module.exports = Base
