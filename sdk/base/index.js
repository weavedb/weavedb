const pako = require("pako")
const elliptic = require("elliptic")
const EthCrypto = require("eth-crypto")
const { providers, Contract, utils } = require("ethers")
const md5 = require("md5")

const {
  startAuthentication,
  startRegistration,
  base64URLStringToBuffer,
} = require("./webauthn")
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server")

//const buildEddsa = require("circomlibjs").buildEddsa
const {
  pick,
  includes,
  all,
  complement,
  init,
  is,
  last,
  isNil,
  mergeLeft,
  clone,
  tail,
  map,
  splitWhen,
} = require("ramda")
const ethSigUtil = require("@metamask/eth-sig-util")
const { privateToAddress } = require("ethereumjs-util")
const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "string" },
]

const is_data = [
  "set",
  "setSchema",
  "setRules",
  "addIndex",
  "removeIndex",
  "add",
  "update",
  "upsert",
  "addTrigger",
  "removeTrigger",
]

const no_paths = [
  "nonce",
  "ids",
  "validities",
  "getCrons",
  "getAlgorithms",
  "getLinkedContract",
  "getOwner",
  "getAddressLink",
  "getRelayerJob",
  "listRelayerJobs",
  "getEvolve",
  "getInfo",
  "getBundlers",
  "addCron",
  "removeCron",
  "setAlgorithms",
  "addRelayerJob",
  "removeRelayerJob",
  "linkContract",
  "evolve",
  "migrate",
  "setCanEvolve",
  "setSecure",
  "addOwner",
  "removeOwner",
  "addAddressLink",
  "removeAddressLink",
]

const lens = {
  contract: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
  pkp_address: "0xcdfaD4e9729f878d6334ae72Fcc6B45Ac3C70425".toLowerCase(),
  pkp_publicKey:
    "0x0443bab1da3778e77aff775ecbbc3a46512160f67ffc063c960501446d51e416445b16d74a61d7edb7eb1d599d73d3044ea2a48b7eae8fba6d6a0f5e40327ac8f6",
  ipfsId: "QmYq1RhS5A1LaEFZqN5rCBGnggYC9orEgHc9qEwnPfJci8",
  abi: [
    {
      inputs: [{ internalType: "address", name: "wallet", type: "address" }],
      name: "defaultProfile",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "profileId", type: "uint256" }],
      name: "getProfile",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "pubCount", type: "uint256" },
            { internalType: "address", name: "followModule", type: "address" },
            { internalType: "address", name: "followNFT", type: "address" },
            { internalType: "string", name: "handle", type: "string" },
            { internalType: "string", name: "imageURI", type: "string" },
            { internalType: "string", name: "followNFTURI", type: "string" },
          ],
          internalType: "struct DataTypes.ProfileStruct",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
}

const webauthn = {
  pkp_address: "0xdadd5Ad754190eCa1150ef1c802F6867F8cFcA65".toLowerCase(),
  pkp_publicKey:
    "0x0453d638b15b62cd62973bc2748339e9223460091fb8f16ce57cfa46f8acaaf0b46f9266b99932232d23e3c9fd0bc5ff45eff63016cba685db105ff2dfb85271b7",
  ipfsId: "QmTziR8846wWM69FLsYpUD8LzQERAw4b6eAWUCDryZUTsy",
}

function to8(base64) {
  var binary_string = atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes
}

class Base {
  constructor() {
    this.reads = [
      "get",
      "cget",
      "getIndexes",
      "getTriggers",
      "getCrons",
      "getSchema",
      "getRules",
      "getIds",
      "getValidities",
      "getOwner",
      "getAddressLink",
      "getAlgorithms",
      "getLinkedContract",
      "getEvolve",
      "getVersion",
      "getHash",
      "getRelayerJob",
      "listRelayerJobs",
      "listCollections",
      "getInfo",
      "getNonce",
      "getBundlers",
    ]
  }
  zkp(proof, pub_signals) {
    return { __op: "zkp", proof, pub_signals }
  }

  data(key) {
    return { __op: "data", key }
  }

  signer() {
    return { __op: "signer" }
  }

  ts() {
    return { __op: "ts" }
  }

  ms() {
    return { __op: "ms" }
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

  async getHash(nocache) {
    return await this.read({ function: "hash" }, nocache)
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

  async getValidities(tx, nocache) {
    return this.read(
      {
        function: "validities",
        tx,
      },
      nocache
    )
  }

  async bundle(queries, opt) {
    let input = null
    if (!isNil(opt?.t)) {
      if (opt.t.length !== queries.length) {
        throw new Error("timestamp length is different from query length")
      }
      if (!is(Number, opt.n)) throw new Error("height not specified")
      if (!is(String, opt.h)) throw new Error("hash not specified")
      input = JSON.stringify({ q: queries, t: opt.t, h: opt.h, n: opt.n })
    } else {
      input = JSON.stringify(queries)
    }
    const output = pako.deflate(input)
    const base64 = btoa(String.fromCharCode.apply(null, output))
    return this._write2("bundle", base64, opt)
  }

  async nostr(event, opt) {
    return this._write2("nostr", event, opt)
  }

  async addOwner(address, opt) {
    return this._write2("addOwner", { address }, opt)
  }

  async setBundlers(bundlers, opt) {
    return this._write2("setBundlers", { bundlers }, opt)
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
      multisigs,
      linkedAccount,
      noauth,
      data,
      parallel
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
        linkedAccount,
        noauth,
        data,
        parallel,
      } = opt)
    }
    if (!isNil(linkedAccount)) wallet = linkedAccount
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
      data,
      parallel,
    ]
    if (
      ((func === "nostr" || func === "bundle") && this.type === 3) ||
      noauth ||
      this.noauth
    ) {
      return await this.writeWithoutWallet(
        func,
        query,
        dryWrite,
        bundle,
        extra,
        relay,
        jobID,
        multisigs,
        onDryWrite,
        data,
        parallel
      )
    } else if (
      isNil(intmax) &&
      isNil(ii) &&
      isNil(ar) &&
      isNil(wallet) &&
      isNil(privateKey) &&
      !isNil(this.defaultWallet)
    ) {
      switch (this.defaultWallet.type) {
        case "ar":
          ar = this.defaultWallet.wallet
          break
        case "ii":
          ii = this.defaultWallet.wallet
          break
        case "intmax":
          intmax = this.defaultWallet.wallet
          break
        case "evm":
          wallet = this.defaultWallet.wallet
          break
      }
    }
    return !isNil(intmax)
      ? await this.writeWithIntmax(intmax, ...params)
      : !isNil(ii)
      ? await this.writeWithII(ii, ...params)
      : !isNil(ar)
      ? await this.writeWithAR(ar, ...params)
      : await this.writeWithEVM(
          wallet,
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
          onDryWrite,
          data,
          parallel
        )
  }

  setDefaultWallet(wallet, type = "evm") {
    this.defaultWallet = { wallet, type }
  }

  _repeatQuery(func, query, attempt = 1) {
    return new Promise((req, rej) => {
      setTimeout(async () => {
        try {
          req(await func(...query))
        } catch (e) {
          console.log(e)
          if (attempt < 5) {
            req(await this._repeatQuery(func, query, ++attempt))
          } else {
            rej(e)
          }
        }
      }, 1000)
    })
  }

  async repeatQuery(func, query, attempt = 1) {
    try {
      return await func(...query)
    } catch (e) {
      console.log(e)
      return this._repeatQuery(func, query)
    }
  }

  async createTempAddressWithWebAuthn(_identity, expiry, linkTo, opt = {}) {
    if (typeof window === "undefined") {
      throw new Error("WebAuthn is only compaitble with browser")
    }
    const to64 = v => btoa(String.fromCharCode(...new Uint8Array(v)))
    const from8 = v => Buffer.from(v).toString("base64")
    _identity ??= EthCrypto.createIdentity()
    if (isNil(_identity?.pub)) {
      let options = generateRegistrationOptions({
        rpName: "WeaveDB",
        rpID: location.hostname,
        userID: _identity.address,
        userName: _identity.address,
        attestationType: "none",
      })
      options.challenge = _identity.address.slice(2)
      options.pubKeyCredParams = [
        {
          alg: -7,
          type: "public-key",
        },
      ]
      options.authenticatorSelection = {
        residentKey: "preferred",
        userVerification: "preferred",
        requireResidentKey: false,
      }
      const cred = await startRegistration(options)
      _identity.pub = to64(cred.pkey)
      _identity.id = cred.rawId
      const verification = await verifyRegistrationResponse({
        response: cred,
        expectedChallenge: options.challenge,
        expectedOrigin: `${location.protocol}//${location.host}`,
        expectedRPID: location.hostname,
      })
      _identity.credentialID = Buffer.from(
        verification.registrationInfo.credentialID
      ).toString("base64")
    }
    let response = null
    const options2 = generateAuthenticationOptions({
      allowCredentials: [
        {
          id: to8(_identity.credentialID),
          type: "public-key",
        },
      ],
      userVerification: "preferred",
    })
    options2.challenge = _identity.address.slice(2)
    ;({ response } = await startAuthentication(options2))
    const addr = _identity.pub
    let { identity, tx: param } = await this._createTempAddress(
      _identity.address.toLowerCase(),
      null,
      `webauthn:${addr}`,
      {
        privateKey: _identity.privateKey,
        relay: true,
        jobID: "auth:webauthn",
      },
      "webauthn",
      _identity
    )
    const nonce = 1
    const data = {
      clientDataJSON: response.clientDataJSON,
      authenticatorData: response.authenticatorData,
      signature: response.signature,
      pub: _identity.pub,
      param,
      contractTxId: this.contractTxId,
      nonce,
    }
    const { err, signature } = await fetch("/api/webauthn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        param,
        lit_action: {
          ipfsId: webauthn.ipfsId,
          publicKey: webauthn.pkp_publicKey,
        },
      }),
    }).then(v => v.json())
    let relay_params = {
      function: "relay",
      query: ["auth:webauthn", param, { linkTo: param.query.linkTo }],
      signature,
      nonce,
      caller: webauthn.pkp_address,
      type: "secp256k1-2",
    }
    identity.webauthn = _identity
    return { identity, tx: await this.write("relay", relay_params) }
  }

  async createTempAddressWithLens(expiry, linkTo, opt = {}) {
    try {
      if (typeof window === "undefined") {
        throw new Error("Lens is only compaitble with browser")
      }
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x89" }],
        })
      } catch (e) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              chainName: "Polygon Mainnet",
              nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
              rpcUrls: ["https://polygon-rpc.com"],
              blockExplorerUrls: ["https://www.polygonscan.com"],
            },
          ],
        })
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x89" }],
        })
      }
      const provider = new providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new Contract(lens.contract, lens.abi, signer)
      const tokenID = (
        await this.repeatQuery(contract.defaultProfile, [signer.getAddress()])
      ).toNumber()
      if (isNil(tokenID) || tokenID === 0) {
        throw new Error("You don't have a Lens profile")
      }
      let { identity, tx: param } = await this._createTempAddress(
        (await signer.getAddress()).toLowerCase(),
        null,
        `lens:${tokenID}`,
        {
          evm: signer,
          relay: true,
          jobID: "auth:lens",
        },
        "lens"
      )
      const profile = await this.repeatQuery(contract.getProfile, [tokenID])
      identity.profile = pick(
        [
          "followModule",
          "followNFT",
          "followNFTURI",
          "handle",
          "imageURI",
          "pubCount",
        ],
        profile
      )
      identity.profile.pubCount = identity.profile.pubCount.toNumber()
      if (isNil(this.litNodeClient)) {
        this.litNodeClient = new this.LitJsSdk.LitNodeClient({
          litNetwork: "serrano",
        })
        await this.litNodeClient.connect()
      }
      const authSig = await this.LitJsSdk.checkAndSignAuthMessage({
        chain: "polygon",
      })
      const nonce = await this.getNonce(lens.pkp_address)
      const _res = await this.litNodeClient.executeJs({
        ipfsId: lens.ipfsId,
        authSig,
        jsParams: {
          nonce,
          params: param,
          authSig,
          contractTxId: this.contractTxId,
          publicKey: lens.pkp_publicKey,
        },
      })
      if (!isNil(_res.signatures?.sig1)) {
        const _sig = _res.signatures.sig1
        const signature = utils.joinSignature({
          r: "0x" + _sig.r,
          s: "0x" + _sig.s,
          v: _sig.recid,
        })
        let relay_params = {
          function: "relay",
          query: ["auth:lens", param, { linkTo: param.query.linkTo }],
          signature,
          nonce,
          caller: lens.pkp_address,
          type: "secp256k1-2",
        }
        return { identity, tx: await this.write("relay", relay_params) }
      } else {
        throw new Error("lit validation failed")
      }
    } catch (e) {
      throw new Error(e.toString())
    }
  }

  async createTempAddressWithII(ii, expiry, linkTo, opt = {}) {
    let addr = ii.toJSON()[0]
    opt.ii = ii
    return this._createTempAddress(addr, expiry, linkTo, opt, "ii")
  }

  async createTempAddressWithAR(ar, expiry, linkTo, opt = {}) {
    if (isNil(ar)) {
      ar = window.arweaveWallet
      await ar.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
    }
    if (isNil(ar)) throw Error("No Arweave wallet")
    let wallet = is(Object, ar) && ar.walletName === "ArConnect" ? ar : null
    let addr = null
    if (!isNil(wallet)) {
      await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
      addr = await wallet.getActiveAddress()
    } else {
      addr = await this.arweave.wallets.jwkToAddress(ar)
    }
    opt.ar = ar
    return this._createTempAddress(addr, expiry, linkTo, opt, "ar")
  }

  async createTempAddressWithIntmax(intmax, expiry, linkTo, opt = {}) {
    const wallet = is(Object, intmax) ? intmax : null
    let addr = null
    if (!isNil(wallet)) {
      addr = !isNil(wallet._account) ? wallet._account.address : intmax._address
    } else {
      throw Error("No Intmax wallet")
      return
    }
    opt.intmax = intmax
    return this._createTempAddress(
      addr.toLowerCase(),
      expiry,
      linkTo,
      opt,
      "intmax"
    )
  }

  async createTempAddressWithPolygonID(
    identity,
    proof,
    expiry,
    linkTo,
    opt = {}
  ) {
    opt.privateKey = identity.privateKey
    const addr = proof.did
    const nonce = await this.getNonce(addr)
    let param = {
      proof: proof.proof,
      pub_signals: proof.pub_signals,
      address: addr,
    }
    if (!isNil(expiry)) param.expiry = expiry
    if (!isNil(linkTo)) param.linkTo = linkTo
    const tx = await this.addAddressLink(param, { nonce, ...opt })
    identity.signer = tx.signer
    identity.type = "polygon-id"
    identity.linkedAccount = linkTo || proof.did
    return { tx, identity }
  }

  async createTempAddress(evm, expiry, linkTo, opt = {}) {
    const wallet = is(Object, evm) ? evm : null
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
    if (isNil(addr) && !isNil(this.web3)) {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      addr = accounts[0]
    }
    opt.wallet = wallet
    return this._createTempAddress(
      addr.toLowerCase(),
      expiry,
      linkTo,
      opt,
      "evm"
    )
  }

  async _createTempAddress(addr, expiry, linkTo, opt, type = "evm", identity) {
    identity ??= EthCrypto.createIdentity()
    const nonce = await this.getNonce(addr)
    let query = isNil(expiry) ? { address: addr } : { address: addr, expiry }
    if (!isNil(linkTo)) query.linkTo = linkTo
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
    let param = { signature, address: identity.address.toLowerCase() }
    if (!isNil(expiry)) param.expiry = expiry
    if (!isNil(linkTo)) param.linkTo = linkTo
    const tx = await this.addAddressLink(param, { nonce, ...opt })
    identity.signer = tx.signer
    identity.type = type
    identity.linkedAccount = linkTo || tx.signer
    return { tx, identity }
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
    onDryWrite,
    __data__,
    parallel
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
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
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

    let param = mergeLeft(extra, {
      function: func,
      query,
      signature,
      nonce,
      caller,
    })
    if (!isNil(__data__)) param.data = __data__
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    bundle ||= this.network === "mainnet"
    return await this.write(
      func,
      param,
      dryWrite,
      bundle,
      relay,
      onDryWrite,
      parallel
    )
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
    onDryWrite,
    __data__,
    parallel
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
    if (!isNil(__data__)) param.data = __data__
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    return await this.write(
      func,
      param,
      dryWrite,
      bundle,
      relay,
      onDryWrite,
      parallel
    )
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
    onDryWrite,
    __data__,
    parallel
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
    if (!isNil(__data__)) param.data = __data__
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    return await this.write(
      func,
      param,
      dryWrite,
      bundle,
      relay,
      onDryWrite,
      parallel
    )
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
    onDryWrite,
    __data__,
    parallel
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
    if (!isNil(__data__)) param.data = __data__
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    return await this.write(
      func,
      param,
      dryWrite,
      bundle,
      relay,
      onDryWrite,
      parallel
    )
  }

  parseQuery(func, query) {
    let nocache = this.nocache_default || false
    if (includes(func)(this.reads) && is(Boolean, last(query))) {
      nocache = last(query)
      query = init(query)
    }
    return { nocache, query }
  }

  async readQuery(func, ...query) {
    let nocache = this.nocache_default || false
    ;({ nocache, query } = this.parseQuery(func, query))
    return await this.read({ function: func, query }, nocache)
  }

  static getPath(func, query) {
    if (includes(func, no_paths)) return []
    let _path = clone(query)
    if (includes(func, is_data)) _path = tail(_path)
    return splitWhen(complement(is)(String), _path)[0]
  }

  static getCollectionPath(func, query) {
    let _query = Base.getPath(func, query)
    const len = _query.length
    return len === 0
      ? "__root__"
      : (len % 2 === 0 ? init(_query) : _query).join("/")
  }

  static getDocPath(func, query) {
    let _query = Base.getPath(func, query)
    const len = _query.length
    return len === 0 ? "__root__" : len % 2 === 1 ? "__col__" : _query.join("/")
  }

  static getKey(contractTxId, func, query, prefix) {
    let colPath = Base.getCollectionPath(func, query)
    let docPath = Base.getDocPath(func, query)
    let key = [
      contractTxId,
      /^__.*__$/.test(colPath) ? colPath : md5(colPath),
      /^__.*__$/.test(docPath) ? docPath : md5(docPath),
      func === "get" ? "cget" : func,
      md5(query),
    ]
    if (!isNil(prefix)) key.unshift(prefix)
    return key.join(".")
  }

  static getKeyInfo(contractTxId, query, prefix = null) {
    const path = Base.getPath(query.function, query.query)
    const len = path.length
    return {
      type: len === 0 ? "root" : len % 2 === 0 ? "doc" : "collection",
      path,
      collectionPath: Base.getCollectionPath(query.function, query.query),
      docPath: Base.getDocPath(query.function, query.query),
      contractTxId,
      prefix,
      func: query.function === "get" ? "cget" : query.function,
      query: query.query,
      key: Base.getKey(contractTxId, query.function, query.query, prefix),
    }
  }

  static getKeys(contractTxId, query, prefix = null) {
    let keys = []
    try {
      if (query.function === "batch") {
        keys = map(
          v =>
            Base.getKeyInfo(
              contractTxId,
              { function: v[0], query: tail(v) },
              prefix
            ),
          query.query
        )
      } else {
        const q =
          query.function === "relay"
            ? Base.getKeyInfo(contractTxId, query.query[1], prefix)
            : Base.getKeyInfo(contractTxId, query, prefix)
        keys.push(q)
      }
    } catch (e) {
      console.log(e)
    }
    return keys
  }

  async writeWithoutWallet(
    func,
    query,
    dryWrite = true,
    bundle,
    extra = {},
    relay,
    jobID,
    multisigs,
    onDryWrite,
    __data__,
    parallel
  ) {
    const param = mergeLeft(extra, { function: func, query })
    if (!isNil(__data__)) param.data = __data__
    if (!isNil(jobID)) param.jobID = jobID
    if (!isNil(multisigs)) param.multisigs = multisigs
    bundle ||= this.network === "mainnet"
    return await this.write(
      func,
      param,
      dryWrite,
      bundle,
      relay,
      onDryWrite,
      parallel
    )
  }
}

const readQueries = [
  "get",
  "cget",
  "getIndexes",
  "getTriggers",
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

const reads = ["getOwner", "getEvolve", "getInfo", "getBundlers"]

for (const v of reads) {
  Base.prototype[v] = async function (nocache) {
    return this.read({ function: v }, nocache)
  }
}

const writes = [
  "tick",
  "relay",
  "query",
  "set",
  "delete",
  "add",
  "addIndex",
  "addCron",
  "addTrigger",
  "removeTrigger",
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
