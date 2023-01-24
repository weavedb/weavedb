const EthCrypto = require("eth-crypto")
//const buildEddsa = require("circomlibjs").buildEddsa
const {
  includes,
  all,
  complement,
  init,
  is,
  last,
  isNil,
  mergeLeft,
} = require("ramda")
const ethSigUtil = require("@metamask/eth-sig-util")
const { privateToAddress } = require("ethereumjs-util")
const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "string" },
]

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

  async getRelayerJob(...query) {
    return this.request("getRelayerJob", ...query)
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

  async getInfo() {
    return this.request("getInfo")
  }

  async listCollections(...query) {
    return this.request("listCollections", ...query)
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
    let nonce,
      privateKey,
      wallet,
      dryWrite,
      bundle,
      ii,
      ar,
      intmax,
      extra,
      relay,
      jobID,
      multisigs
    if (!isNil(opt)) {
      ;({
        jobID,
        relay,
        nonce,
        privateKey,
        wallet,
        dryWrite,
        bundle,
        ii,
        ar,
        intmax,
        extra,
        multisigs,
      } = opt)
    }
    if (all(isNil)([wallet, ii, intmax, ar]) && !isNil(this.arweave_wallet)) {
      ar = this.arweave_wallet
    }
    const params = [
      func,
      query,
      nonce,
      dryWrite,
      bundle,
      extra,
      relay,
      jobID,
      multisigs,
    ]
    return !isNil(intmax)
      ? await this.writeWithIntmax(intmax, ...params)
      : !isNil(ii)
      ? await this.writeWithII(ii, ...params)
      : !isNil(ar)
      ? await this.writeWithAR(ar, ...params)
      : await this.write(
          wallet || this.wallet,
          func,
          query,
          nonce,
          privateKey,
          dryWrite,
          bundle,
          extra,
          relay,
          jobID,
          multisigs
        )
  }

  async createTempAddressWithII(ii, expiry) {
    let addr = ii.toJSON()[0]
    return this._createTempAddress(addr, expiry, {
      ii,
    })
  }

  async createTempAddressWithAR(ar, expiry) {
    const wallet = is(Object, ar) && ar.walletName === "ArConnect" ? ar : null
    let addr = null
    if (!isNil(wallet)) {
      await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
      addr = await wallet.getActiveAddress()
    } else {
      addr = await this.arweave.wallets.jwkToAddress(ar)
    }
    return this._createTempAddress(addr, expiry, {
      ar,
    })
  }

  async createTempAddressWithIntmax(intmax, expiry) {
    const wallet = is(Object, intmax) ? intmax : null
    let addr = null
    if (!isNil(wallet)) {
      addr = !isNil(wallet._account) ? wallet._account.address : intmax._address
    } else {
      throw Error("No Intmax wallet")
      return
    }
    return this._createTempAddress(addr.toLowerCase(), expiry, {
      intmax,
    })
  }

  async createTempAddress(evm, expiry) {
    const wallet = is(Object, evm) ? evm : this.wallet
    let addr = null
    if (!isNil(wallet)) {
      addr = is(String, evm)
        ? evm
        : is(Object, wallet)
        ? wallet.getAddressString()
        : null
      if (isNil(addr)) {
        throw Error("No address specified")
        return
      }
    } else if (is(String, evm)) {
      addr = evm
    }
    return this._createTempAddress(addr.toLowerCase(), expiry, {
      wallet,
    })
  }

  async _createTempAddress(addr, expiry, opt) {
    const identity = EthCrypto.createIdentity()
    const nonce = await this.getNonce(addr)
    const query =
      typeof expiry === "undefined"
        ? { address: addr }
        : { address: addr, expiry }
    const message = {
      nonce,
      query: JSON.stringify({
        func: "auth",
        query,
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
      { signature, address: identity.address.toLowerCase(), expiry },
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

  async relay(...query) {
    return this._write("relay", ...query)
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

  async addRelayerJob(...query) {
    return this._write("addRelayerJob", ...query)
  }

  async removeRelayerJob(...query) {
    return this._write("removeRelayerJob", ...query)
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
    dryWrite = true,
    bundle,
    extra = {},
    relay,
    jobID,
    multisigs
  ) {
    let signer, caller, pkey
    if (!isNil(privateKey)) {
      signer = `0x${privateToAddress(
        Buffer.from(privateKey.replace(/^0x/, ""), "hex")
      ).toString("hex")}`
      pkey = Buffer.from(privateKey.replace(/^0x/, ""), "hex")
    } else if (is(Object, wallet)) {
      signer = wallet.getAddressString()
      pkey = wallet.getPrivateKey()
    } else if (!isNil(this.web3)) {
      const accounts = await ethereum.request({ method: "eth_accounts" })
      signer = accounts[0]
    }
    if (isNil(signer)) throw Error("No wallet to sign")
    signer = signer.toLowerCase()

    nonce ||= await this.getNonce(signer)
    caller = is(String, wallet)
      ? /^0x+$/.test(wallet)
        ? wallet.toLowerCase()
        : wallet
      : signer

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

    const signature = isNil(pkey)
      ? await this.web3.currentProvider.request({
          method: "eth_signTypedData_v4",
          params: [signer, JSON.stringify(data)],
        })
      : ethSigUtil.signTypedData({
          privateKey: pkey,
          data,
          version: "V4",
        })

    const param = mergeLeft(extra, {
      function: func,
      query,
      signature,
      nonce,
      caller,
    })

    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    bundle ||= this.network === "mainnet"
    return await this._request(func, param, dryWrite, bundle, relay)
  }

  async writeWithII(
    ii,
    func,
    query,
    nonce,
    dryWrite = true,
    bundle,
    extra,
    relay,
    jobID,
    multisigs
  ) {
    let addr = ii.toJSON()[0]
    const isaddr = !isNil(addr)
    addr = addr.toLowerCase()
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
    let param = mergeLeft(extra, {
      function: func,
      query,
      signature,
      nonce,
      caller: addr,
      type: "ed25519",
    })
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    return await this._request(func, param, dryWrite, bundle, relay)
  }

  async writeWithAR(
    ar,
    func,
    query,
    nonce,
    dryWrite = true,
    bundle,
    extra,
    relay,
    jobID,
    multisigs
  ) {
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
    const enc = new TextEncoder()
    const encoded = enc.encode(JSON.stringify(data))
    const signature = isNil(wallet)
      ? (await this.arweave.wallets.crypto.sign(ar, encoded)).toString("hex")
      : Buffer.from(
          await wallet.signature(encoded, {
            name: "RSA-PSS",
            saltLength: 32,
          })
        ).toString("hex")
    let param = mergeLeft(extra, {
      function: func,
      query,
      signature,
      nonce,
      caller: addr,
      pubKey,
      type: "rsa256",
    })
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    return await this._request(func, param, dryWrite, bundle, relay)
  }

  async writeWithIntmax(
    intmax,
    func,
    query,
    nonce,
    dryWrite = true,
    bundle,
    extra,
    relay,
    jobID,
    multisigs
  ) {
    const wallet = is(Object, intmax) ? intmax : null
    let addr = null
    let pubKey = null
    if (!isNil(wallet)) {
      if (!isNil(wallet._account)) {
        pubKey = wallet._account.publicKey
        addr = wallet._account.address
      } else {
        throw new Error("Intmax Network is disabled.")
        return
        /*
          const eddsa = await buildEddsa()
          const packedPublicKey = eddsa.babyJub.packPoint(intmax._publicKey)
          pubKey = "0x" + Buffer.from(packedPublicKey).toString("hex")
          addr = intmax._address
        */
      }
    } else {
      throw Error("No Intmax wallet")
      return
    }
    const isaddr = !isNil(addr)
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
    let param = mergeLeft(
      extra,
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
    )
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    return await this._request(func, param, dryWrite, bundle, relay)
  }

  async getOwner() {
    return this.request("getOwner")
  }

  async addOwner(address, opt) {
    return this._write2("addOwner", { address }, opt)
  }

  async removeOwner(address, opt) {
    return this._write2("removeOwner", { address }, opt)
  }

  async getEvolve() {
    return await this.viewState({
      function: "getEvolve",
    })
  }

  async evolve(value, opt) {
    return this._write2("evolve", { value }, { ...opt, extra: { value } })
  }

  async setCanEvolve(value, opt) {
    return this._write2("setCanEvolve", { value }, opt)
  }

  async getAddressLink(address) {
    return this.viewState({ function: "getAddressLink", query: { address } })
  }

  async getVersion() {
    return await this.viewState({
      function: "version",
    })
  }

  async getNonce(addr) {
    return (
      (await this.viewState({
        function: "nonce",
        address: addr,
      })) + 1
    )
  }

  async getIds(tx) {
    return this.viewState({
      function: "ids",
      tx,
    })
  }

  async mineBlock() {
    await this.arweave.api.get("mine")
  }

  async sign(func, ...query) {
    if (is(Object, last(query)) && !is(Array, last(query))) {
      query[query.length - 1].relay = true
    } else {
      query.push({ relay: true })
    }
    return await this[func](...query)
  }
}

module.exports = Base
