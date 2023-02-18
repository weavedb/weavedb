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
  constructor() {
    this.reads = [
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
      "listRelayerJobs",
      "listCollections",
      "getInfo",
      "getNonce",
    ]
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

  setEthWallet(wallet) {
    this.wallet = wallet
  }

  async getVersion(nocache) {
    return await this.read({ function: "version" }, nocache)
  }

  async getAddressLink(address, nocache) {
    return this.read(
      { function: "getAddressLink", query: { address } },
      nocache
    )
  }

  async getNonce(address, nocache) {
    return (
      (await this.read(
        {
          function: "nonce",
          address,
        },
        nocache
      )) + 1
    )
  }

  async getIds(tx, nocache) {
    return this.read(
      {
        function: "ids",
        tx,
      },
      nocache
    )
  }

  async addOwner(address, opt) {
    return this._write2("addOwner", { address }, opt)
  }

  async migrate(version, opt) {
    return this._write2("migrate", { version }, opt)
  }

  async removeOwner(address, opt) {
    return this._write2("removeOwner", { address }, opt)
  }

  async evolve(value, opt) {
    return this._write2("evolve", { value }, { ...opt, extra: { value } })
  }

  async setCanEvolve(value, opt) {
    return this._write2("setCanEvolve", { value }, opt)
  }

  async setSecure(value, opt) {
    return this._write2("setSecure", { value }, opt)
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
      onDryWrite,
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
        onDryWrite,
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
      onDryWrite,
    ]
    return !isNil(intmax)
      ? await this.writeWithIntmax(intmax, ...params)
      : !isNil(ii)
      ? await this.writeWithII(ii, ...params)
      : !isNil(ar)
      ? await this.writeWithAR(ar, ...params)
      : await this.writeWithEVM(
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
          multisigs,
          onDryWrite
        )
  }

  async createTempAddressWithII(ii, expiry) {
    let addr = ii.toJSON()[0]
    return this._createTempAddress(addr, expiry, {
      ii,
      dryWrite: false,
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
      dryWrite: false,
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
      dryWrite: false,
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
      dryWrite: false,
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

  async writeWithEVM(
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
    multisigs,
    onDryWrite
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
    return await this.write(func, param, dryWrite, bundle, relay, onDryWrite)
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
    multisigs,
    onDryWrite
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
    return await this.write(func, param, dryWrite, bundle, relay, onDryWrite)
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
    multisigs,
    onDryWrite
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
    return await this.write(func, param, dryWrite, bundle, relay, onDryWrite)
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
    multisigs,
    onDryWrite
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
    return await this.write(func, param, dryWrite, bundle, relay, onDryWrite)
  }

  parseQuery(func, query) {
    let nocache = false
    if (includes(func)(this.reads) && is(Boolean, last(query))) {
      nocache = last(query)
      query = init(query)
    }
    return { nocache, query }
  }

  async readQuery(func, ...query) {
    let nocache = false
    ;({ nocache, query } = this.parseQuery(func, query))
    return await this.read({ function: func, query }, nocache)
  }
}

const readQueries = [
  "get",
  "cget",
  "getIndexes",
  "listCollections",
  "getCrons",
  "getAlgorithms",
  "getRelayerJob",
  "listRelayerJobs",
  "getLinkedContract",
  "getSchema",
  "getRules",
]

for (const v of readQueries) {
  Base.prototype[v] = async function (...query) {
    return this.readQuery(v, ...query)
  }
}

const reads = ["getOwner", "getEvolve", "getInfo"]

for (const v of reads) {
  Base.prototype[v] = async function (nocache) {
    return this.read({ function: v }, nocache)
  }
}

const writes = [
  "relay",
  "set",
  "delete",
  "add",
  "addIndex",
  "addCron",
  "removeCron",
  "removeIndex",
  "update",
  "upsert",
  "setSchema",
  "setAlgorithms",
  "addRelayerJob",
  "removeRelayerJob",
  "linkContract",
  "unlinkContract",
  "setRules",
  "batch",
]

for (const v of writes) {
  Base.prototype[v] = async function (...query) {
    return this._write(v, ...query)
  }
}

module.exports = Base
