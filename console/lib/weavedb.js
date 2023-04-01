import { nanoid } from "nanoid"
const { Ed25519KeyIdentity } = require("@dfinity/identity")
import Arweave from "arweave"
import lf from "localforage"
import SDK from "weavedb-sdk"
import Client from "weavedb-client"
import { ethers } from "ethers"
import { AuthClient } from "@dfinity/auth-client"
import { WarpFactory } from "warp-contracts"
const { DeployPlugin, ArweaveSigner } = require("warp-contracts-plugin-deploy")
import {
  trim,
  clone,
  prepend,
  assocPath,
  is,
  mergeLeft,
  isNil,
  includes,
  uniq,
  dissoc,
  isEmpty,
} from "ramda"
import { Buffer } from "buffer"
import { weavedbSrcTxId, dfinitySrcTxId, ethereumSrcTxId, lens } from "./const"
let arweave_wallet, sdk, nodesdk
const a = addr =>
  /^0x.+$/.test(trim(addr)) ? trim(addr).toLowerCase() : trim(addr)
const ret = res =>
  !isNil(res) && !isNil(res.err)
    ? `Error: ${res.err.errorMessage}`
    : JSON.stringify(res)

class Log {
  constructor(sdk, method, query, opt, fn, signer, id) {
    this.contractTxId = sdk.contractTxId
    this.node = isNil(sdk.client) ? null : sdk.client.hostname_
    this.start = Date.now()
    this.method = method
    this.query = query
    this.fn = fn
    this.opt = opt
    this.sdk = sdk
    this.signer = signer
    this.id = id || nanoid()
  }
  async rec(array = false) {
    let res = {},
      err,
      _res
    try {
      res = isNil(this.opt)
        ? array
          ? await this.sdk[this.method](...this.query)
          : await this.sdk[this.method](this.query)
        : array
        ? await this.sdk[this.method](...this.query, this.opt)
        : await this.sdk[this.method](this.query, this.opt)
      _res = res?.tx || res
    } catch (e) {
      err = e
      console.log(e)
    }
    err = err?.message || _res?.error || _res?.error?.code || null
    if (!isNil(err) && typeof err === "string" && /wrong nonce/.test(err)) {
      this.opt ||= {}
      delete this.opt.nonce
      try {
        res = array
          ? await this.sdk[this.method](...this.query, this.opt)
          : await this.sdk[this.method](this.query, this.opt)
        _res = res?.tx || res
      } catch (e) {
        err = e
        console.log(e)
      }
      err = err?.message || _res?.error || _res?.error?.code || null
    }
    const date = Date.now()
    let log = {
      id: this.id,
      err,
      virtual_txid: _res?.result?.transaction?.id || null,
      txid:
        !isNil(_res) && !isNil(_res.originalTxId) ? _res.originalTxId : null,
      node: this.node,
      date,
      duration: date - this.start,
      method: this.method,
      query: this.query,
      contractTxId: this.contractTxId,
      res: _res,
      success: isNil(_res) || isNil(_res.err),
    }
    this.fn(addLog)({ log })
    if (_res?.success && !isNil(_res.nonce)) {
      if (!isNil(this.signer)) {
        this.fn(setNonce)({ nonce: _res.nonce + 1, signer: this.signer })
      }
    }
    if (!isNil(_res?.getResult)) {
      _res
        .getResult()
        .then(result => {
          if (!isNil(result)) {
            this.fn(updateLog)({
              virtual_txid: log.virtual_txid,
              txid: result.originalTxId,
            })
          }
        })
        .catch(e => {
          console.log(e)
        })
    }
    if (!isNil(err))
      throw new Error(
        typeof err === "string"
          ? err
          : typeof err?.message === "string"
          ? err.message
          : "unknown error"
      )
    return clone(res)
  }
}

export const getOpt = async ({ val: { contractTxId, read = [] }, get }) => {
  const current = get("temp_current")
  const identity = isNil(current)
    ? null
    : await lf.getItem(`temp_address:${contractTxId}:${current}`)
  let ii = null
  if (is(Array)(identity)) {
    ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(identity))
  }
  let err = null
  let opt = !isNil(ii)
    ? { ii, onDryWrite: { cache: true, read } }
    : !isNil(identity) && !isNil(identity.tx)
    ? {
        wallet: /^lens:/.test(current)
          ? current.split(":").slice(0, -1).join(":")
          : current,
        privateKey: identity.privateKey,
        onDryWrite: { cache: true, read },
      }
    : null
  if (isNil(opt)) err = "not logged in"
  let nonces = (await lf.getItem("nonces")) || {}
  let addr = null
  if (!isNil(identity.address)) {
    addr = a(identity.address)
    if (!isNil(nonces[contractTxId]?.[addr])) {
      opt.nonce = nonces[contractTxId][addr]
    }
  }
  return { opt, err, signer: addr }
}

export const getRawDB = async ({
  val: { contractTxId, rpc, network },
  fn,
  get,
}) => {
  let err = false
  const db = await fn(setupWeaveDB)({
    contractTxId,
    rpc,
  })
  let opt = {}
  const current = get("temp_current_all")
  if (current.type === "ar") {
    const wallet = window.arweaveWallet
    await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
    opt.ar = wallet
  } else if (current.type === "ii") {
    const iiUrl =
      network === "Mainnet"
        ? "https://identity.ic0.app/"
        : `http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai`
    const authClient = await AuthClient.create()
    await new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: iiUrl,
        onSuccess: resolve,
        onError: reject,
      })
    })
    const ii = authClient.getIdentity()
    if (isNil(ii._inner)) return
    opt.ii = ii
  }
  return { opt, db, signer: a(current.addr) }
}

async function addFunds(arweave, wallet) {
  try {
    const walletAddress = await arweave.wallets.getAddress(wallet)
    await arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
    await arweave.api.get("mine")
  } catch (e) {}
}

export const connectLocalhost = async ({ val: { port } }) => {
  const arweave = Arweave.init({
    host: "localhost",
    port,
    protocol: "http",
  })
  try {
    const info = await arweave.network.getInfo()
    return port
  } catch (e) {
    return null
  }
}

export const setupWeaveDB = async ({
  val: { network, contractTxId, port, rpc, temp = false },
}) => {
  let _sdk
  let isRPC = !isNil(rpc) && !/^\s*$/.test(rpc)
  if (isRPC) {
    try {
      _sdk = new Client({
        rpc,
        contractTxId,
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    _sdk = new SDK({
      network: network.toLowerCase(),
      port,
      contractTxId,
    })
  }
  if (isNil(arweave_wallet)) {
    const arweave = Arweave.init({
      host: "localhost",
      port: port || 1820,
      protocol: "http",
    })
    arweave_wallet ||= await arweave.wallets.generate()
    try {
      await addFunds(arweave, arweave_wallet)
    } catch (e) {}
  }
  if (!isRPC && !isNil(contractTxId)) {
    _sdk.initialize({
      contractTxId: contractTxId,
      wallet: arweave_wallet,
    })
  }
  window.Buffer = Buffer
  if (!temp) sdk = _sdk
  return _sdk
}

export const createTempAddressWithII = async ({
  set,
  val: { contractTxId, network, node },
}) => {
  const iiUrl =
    network === "Mainnet"
      ? "https://identity.ic0.app/"
      : `http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai`
  const authClient = await AuthClient.create()
  await new Promise((resolve, reject) => {
    authClient.login({
      identityProvider: iiUrl,
      onSuccess: resolve,
      onError: reject,
    })
  })
  const ii = authClient.getIdentity()
  if (isNil(ii._inner)) return
  const addr = ii._inner.toJSON()[0]
  if (node) {
    set({ addr, type: "evm", network }, "temp_current_all")
    return
  }
  const ex_identity = await lf.getItem(`temp_address:${contractTxId}:${addr}`)
  let identity = ex_identity
  let tx
  identity = ii._inner.toJSON()
  identity.network = network
  identity.type = "ii"
  await lf.setItem("temp_address:current", addr)
  await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
  set(addr, "temp_current")
  set({ addr, type: "ii", network }, "temp_current_all")
}

export const createTempAddressWithAR = async ({
  set,
  fn,
  val: { contractTxId, network, node },
}) => {
  const wallet = window.arweaveWallet
  await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
  let addr = await wallet.getActiveAddress()
  if (node) {
    set({ addr, type: "ar", network }, "temp_current_all")
    return
  }
  const ex_identity = await lf.getItem(`temp_address:${contractTxId}:${addr}`)
  let identity = ex_identity
  let tx
  if (isNil(identity)) {
    ;({ tx, identity } = await new Log(
      sdk,
      "createTempAddressWithAR",
      wallet,
      null,
      fn
    ).rec())
    const linked = await new Log(
      sdk,
      "getAddressLink",
      identity.address,
      null,
      fn
    ).rec()
    if (isNil(linked)) {
      alert("something went wrong")
      return
    }
  } else {
    await lf.setItem("temp_address:current", addr)
    set(addr, "temp_current")
    set({ addr, type: "ar", network }, "temp_current_all")
    return
  }
  if (!isNil(tx) && isNil(tx.err)) {
    identity.tx = dissoc("getResult", tx)
    identity.linked_address = addr
    await lf.setItem("temp_address:current", addr)
    identity.network = network
    identity.type = "ar"
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    set(addr, "temp_current")
    set({ addr, type: "ar", network }, "temp_current_all")
  }
}

export const createTempAddressWithLens = async ({
  set,
  fn,
  val: { contractTxId, network, node },
}) => {
  let identity, tx, addr, err
  try {
    ;({ tx, identity } = await new Log(
      sdk,
      "createTempAddressWithLens",
      null,
      null,
      fn
    ).rec())
  } catch (e) {
    throw e
  }
  const linked = await new Log(
    sdk,
    "getAddressLink",
    identity.address,
    null,
    fn
  ).rec()
  if (isNil(linked)) {
    throw new Error("something went wrong")
    return
  } else {
    addr = linked.address
  }
  if (!isNil(tx) && isNil(tx.err)) {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(lens.contract, lens.abi, signer)
    const handle = await sdk.repeatQuery(contract.getHandle, [
      addr.split(":")[1],
    ])
    addr += `:${handle}`
    identity.tx = dissoc("getResult", tx)
    identity.linked_address = addr
    await lf.setItem("temp_address:current", addr)
    identity.network = network
    identity.type = "lens"
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    set(addr, "temp_current")
    set({ addr, type: "lens", network }, "temp_current_all")
  }
}

export const createTempAddressWithWebAuthn = async ({
  set,
  fn,
  val: { contractTxId, network, node },
}) => {
  let _webauthn, identity, tx, addr, err
  try {
    _webauthn = (await lf.getItem("webauthn")) || null
    ;({ tx, identity } = await new Log(
      sdk,
      "createTempAddressWithWebAuthn",
      [_webauthn],
      null,
      fn
    ).rec(true))
  } catch (e) {
    throw e
  }
  const linked = await new Log(
    sdk,
    "getAddressLink",
    identity.address,
    null,
    fn
  ).rec()
  if (isNil(linked)) {
    throw new Error("something went wrong")
    return
  } else {
    addr = linked.address
  }
  if (!isNil(tx) && isNil(tx.err)) {
    await lf.getItem("webauthn", identity.webauthn)
    identity.tx = dissoc("getResult", tx)
    identity.linked_address = addr
    await lf.setItem("temp_address:current", addr)
    identity.network = network
    identity.type = "webauthn"
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    set(addr, "temp_current")
    set({ addr, type: "webauthn", network }, "temp_current_all")
  }
  return
}

export const connectAddress = async ({ set, val: { network } }) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
  await provider.send("eth_requestAccounts", [])
  const signer = provider.getSigner()
  const addr = await signer.getAddress()
  if (!isNil(addr)) {
    set({ addr, type: "evm", network }, "temp_current_all")
  } else {
    alert("couldn't connect address")
  }
  return
}

export const connectAddressWithII = async ({ set, val: { network } }) => {
  const iiUrl =
    network === "Mainnet"
      ? "https://identity.ic0.app/"
      : `http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai`
  const authClient = await AuthClient.create()
  await new Promise((resolve, reject) => {
    authClient.login({
      identityProvider: iiUrl,
      onSuccess: resolve,
      onError: reject,
    })
  })
  const ii = authClient.getIdentity()
  if (isNil(ii._inner)) return
  const addr = ii._inner.toJSON()[0]
  if (!isNil(addr)) {
    set({ addr, type: "ii", network }, "temp_current_all")
  } else {
    alert("couldn't connect address")
  }
  return
}

export const connectAddressWithAR = async ({ set, val: { network } }) => {
  const wallet = window.arweaveWallet
  await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
  let addr = await wallet.getActiveAddress()
  if (!isNil(addr)) {
    set({ addr, type: "ar", network }, "temp_current_all")
  } else {
    alert("couldn't connect address")
  }
  return
}

export const createTempAddress = async ({
  set,
  fn,
  val: { contractTxId, network, node },
}) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
  await provider.send("eth_requestAccounts", [])
  const signer = provider.getSigner()
  const addr = await signer.getAddress()
  if (node) {
    set({ addr, type: "evm", network }, "temp_current_all")
    return
  }
  const ex_identity = await lf.getItem(`temp_address:${contractTxId}:${addr}`)
  let identity = ex_identity
  let tx
  if (isNil(identity)) {
    ;({ tx, identity } = await new Log(
      sdk,
      "createTempAddress",
      addr,
      null,
      fn
    ).rec())
    const linked = await new Log(
      sdk,
      "getAddressLink",
      identity.address,
      null,
      fn
    ).rec()

    if (isNil(linked)) {
      alert("something went wrong")
      return
    }
  } else {
    await lf.setItem("temp_address:current", addr)
    set(addr, "temp_current")
    set({ addr, type: "evm", network }, "temp_current_all")
    return
  }
  if (!isNil(tx) && isNil(tx.err)) {
    identity.tx = dissoc("getResult", tx)
    identity.linked_address = addr
    identity.network = network
    identity.type = "evm"
    await lf.setItem("temp_address:current", addr)
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    set(addr, "temp_current")
    set({ addr, type: "evm", network }, "temp_current_all")
  }
}

export const switchTempAddress = async function ({
  set,
  val: { contractTxId },
}) {
  const current = await lf.getItem(`temp_address:current`)
  if (!isNil(current)) {
    const identity = await lf.getItem(`temp_address:${contractTxId}:${current}`)
    set(!isNil(identity) ? current : null, "temp_current")
    if (!isNil(identity)) {
      set(
        { addr: current, type: identity.type, network: identity.network },
        "temp_current_all"
      )
    }
  } else {
    set(null, "temp_current")
  }
}

export const checkTempAddress = async function ({
  set,
  val: { contractTxId },
}) {
  const current = await lf.getItem(`temp_address:current`)
  if (!isNil(current)) {
    const identity = await lf.getItem(`temp_address:${contractTxId}:${current}`)
    if (!isNil(identity)) set(current, "temp_current")
  }
}

export const logoutTemp = async ({ set }) => {
  await lf.removeItem("temp_address:current")
  set(null, "temp_current")
  set(null, "temp_current_all")
}

const Constants = require("./poseidon_constants_opt.js")

async function deploy({ src, warp, init, extra, arweave }) {
  const contractSrc = await fetch(`/static/${src}.js`).then(v => v.text())
  const stateFromFile = JSON.parse(
    await fetch(`/static/${init}.json`).then(v => v.text())
  )
  const initialState = mergeLeft(extra, stateFromFile)
  const { contractTxId } = await warp.createContract.deploy({
    wallet: arweave_wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  if (!isNil(arweave)) await arweave.api.get("mine")
  return contractTxId
}

async function deployFromSrc({ src, warp, init, extra, algorithms }) {
  const stateFromFile = JSON.parse(
    await fetch(`/static/${init}.json`).then(v => v.text())
  )
  let initialState = mergeLeft(extra, stateFromFile)
  if (!isNil(algorithms)) {
    initialState = assocPath(["auth", "algorithms"], algorithms, initialState)
  }
  let wallet = arweave_wallet
  if (isNil(wallet)) {
    const arweave = Arweave.init({
      host: "arweave.net",
      protocol: "https",
    })
    wallet = await arweave.wallets.generate()
  }
  const { contractTxId } = await warp.createContract.deployFromSourceTx({
    wallet: new ArweaveSigner(wallet),
    initState: JSON.stringify(initialState),
    srcTxId: src,
  })
  return contractTxId
}

export const deployDB = async ({
  val: { owner, network, port, secure, canEvolve, auths },
}) => {
  let algorithms = []
  for (let v of auths) {
    switch (v) {
      case "EVM":
        algorithms.push("secp256k1")
        break
      case "Arweave":
        algorithms.push("rsa256")
        break
      case "Intmax":
        algorithms.push("secp256k1-2")
        //algorithms.push("poseidon")
        break
      case "DFINITY":
        algorithms.push("ed25519")
        break
      case "Lens":
        algorithms.push("secp256k1-2")
        break
    }
  }
  if (isNil(owner)) {
    alert("Contract Owner is missing")
    return {}
  }
  if (owner.length === 42 && owner.slice(0, 2) == "0x") {
    owner = owner.toLowerCase()
  }
  if (network === "Mainnet") {
    const warp = WarpFactory.forMainnet().use(new DeployPlugin())
    let initial_state = {
      src: weavedbSrcTxId,
      init: "initial-state",
      warp,
      algorithms: uniq(algorithms),
      extra: {
        secure: false,
        owner,
        contracts: {
          //          intmax: intmaxSrcTxId,
          dfinity: dfinitySrcTxId,
          ethereum: ethereumSrcTxId,
        },
        secure,
        canEvolve,
      },
    }
    initial_state.extra.relayers = {}
    if (includes("Lens", auths)) {
      initial_state.extra.relayers["auth:lens"] = {
        relayers: ["0xF810D4a6F0118E6a6a86A9FBa0dd9EA669e1CC2E".toLowerCase()],
        schema: {
          type: "object",
          required: ["linkTo"],
          properties: {
            linkTo: {
              type: "string",
            },
          },
        },
      }
    }
    if (includes("WebAuthn", auths)) {
      initial_state.extra.relayers["auth:webauthn"] = {
        relayers: ["0xdadd5Ad754190eCa1150ef1c802F6867F8cFcA65".toLowerCase()],
        schema: {
          type: "object",
          required: ["linkTo"],
          properties: {
            linkTo: {
              type: "string",
            },
          },
        },
      }
    }
    const contractTxId = await deployFromSrc(initial_state)
    return { contractTxId, network, port }
  } else {
    const warp = WarpFactory.forLocal(port).use(new DeployPlugin())
    const arweave = Arweave.init({
      host: "localhost",
      port: port || 1820,
      protocol: "http",
    })
    if (isNil(arweave_wallet)) {
      arweave_wallet ||= await arweave.wallets.generate()
      try {
        await addFunds(arweave, arweave_wallet)
      } catch (e) {}
    }
    /*
    const poseidon1TxId = await deploy({
      src: "poseidonConstants",
      init: "initial-state-poseidon-constants",
      warp,
      arweave,
      extra: {
        owner,
        poseidonConstants: {
          C: Constants.C,
          M: Constants.M,
          P: Constants.P,
        },
      },
    })
    const poseidon2TxId = await deploy({
      src: "poseidonConstants",
      init: "initial-state-poseidon-constants",
      warp,
      arweave,
      extra: {
        owner,
        poseidonConstants: {
          S: Constants.S,
        },
      },
    })
    const intmaxSrcTxId = await deploy({
      src: "intmax",
      init: "initial-state-intmax",
      warp,
      arweave,
      extra: {
        owner,
        contracts: {
          poseidonConstants1: poseidon1TxId,
          poseidonConstants2: poseidon2TxId,
        },
      },
      })*/
    const dfinitySrcTxId = await deploy({
      src: "ii",
      init: "initial-state-ii",
      warp,
      arweave,
      extra: {
        owner,
      },
    })
    const ethereumSrcTxId = await deploy({
      src: "eth",
      init: "initial-state-eth",
      warp,
      arweave,
      extra: {
        owner,
      },
    })

    const contractTxId = await deploy({
      src: "contract",
      init: "initial-state",
      warp,
      arweave,
      algorithms,
      extra: {
        secure,
        owner,
        contracts: {
          //intmax: intmaxSrcTxId,
          dfinity: dfinitySrcTxId,
          ethereum: ethereumSrcTxId,
        },
        secure,
        canEvolve,
      },
    })
    return { contractTxId, network, port }
  }
}

export const _setCanEvolve = async ({ val: { value, contractTxId }, fn }) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["getInfo"]],
    })
    if (!isNil(err)) return alert(err)
    return ret(await new Log(sdk, "setCanEvolve", value, opt, fn, signer).rec())
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _setSecure = async ({ val: { value, contractTxId }, fn }) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["getInfo"]],
    })
    if (!isNil(err)) return alert(err)
    return ret(await new Log(sdk, "setSecure", value, opt, fn, signer).rec())
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _setAlgorithms = async ({
  val: { algorithms, contractTxId },
  fn,
}) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["getInfo"]],
    })
    if (!isNil(err)) return alert(err)
    return ret(
      await new Log(sdk, "setAlgorithms", algorithms, opt, fn, signer).rec()
    )
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _evolve = async ({ val: { contractTxId }, fn }) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["getInfo"]],
    })
    if (!isNil(err)) return alert(err)
    return ret(
      await new Log(sdk, "evolve", weavedbSrcTxId, opt, fn, signer).rec()
    )
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _migrate = async ({ val: { contractTxId, version }, fn }) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["getInfo"]],
    })
    if (!isNil(err)) return alert(err)
    return ret(await new Log(sdk, "migrate", version, opt, fn, signer).rec())
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _admin = async ({
  val: { rpc, contractTxId, txid, network = "Mainnet" },
  fn,
}) => {
  try {
    const _txid = trim(txid)
    const { db, opt, signer } = await fn(getRawDB)({
      contractTxId,
      rpc,
      network,
    })
    const query = { op: "add_contract", contractTxId: _txid }
    return await new Log(db, "admin", query, opt, fn, signer).rec()
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _remove = async ({
  val: { rpc, contractTxId, txid, network = "mainnet" },
  fn,
}) => {
  try {
    const { db, opt, signer } = await fn(getRawDB)({
      contractTxId,
      rpc,
      network,
    })
    const query = { op: "remove_contract", contractTxId: txid }
    return await new Log(db, "admin", query, opt, fn, signer).rec()
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _addNodeOwner = async ({
  val: { address, contractTxId, rpc, network = "Mainnet" },
  fn,
}) => {
  try {
    const { db, opt, signer } = await fn(getRawDB)({
      contractTxId,
      rpc,
      network,
    })
    const addr = a(address)
    return await new Log(db, "addOwner", addr, opt, fn, signer).rec()
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _removeNodeOwner = async ({
  val: { address, contractTxId, rpc, network = "Mainnet" },
  fn,
}) => {
  try {
    const { db, opt, signer } = await fn(getRawDB)({
      contractTxId,
      rpc,
      network,
    })
    return await new Log(db, "removeOwner", address, opt, fn, signer).rec()
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _whitelist = async ({
  val: { address, contractTxId, rpc, network = "Mainnet", limit, allow },
  fn,
}) => {
  try {
    const { db, opt, signer } = await fn(getRawDB)({
      contractTxId,
      rpc,
      network,
    })
    const addr = a(address)
    let params = { allow, address: addr }
    if (!isNil(limit)) params.limit = limit
    const query = { op: "whitelist", ...params }
    return await new Log(db, "admin", query, opt, fn, signer).rec()
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}
let tx_logs = []
export const addLog = async ({ set, get, val: { log } }) => {
  tx_logs = prepend(log, tx_logs)
  set(tx_logs, "tx_logs")
}

export const updateLog = async ({ set, get, val: { virtual_txid, txid } }) => {
  let logs = clone(tx_logs)
  for (let v of logs) {
    if (v.virtual_txid === virtual_txid) v.txid = txid
  }
  tx_logs = logs
  set(logs, "tx_logs")
}

export const addRelayerJob = async ({
  val: {
    relayers,
    signers,
    name,
    multisig,
    multisig_type,
    contractTxId,
    schema,
  },
  fn,
}) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["listRelayerJobs"]],
    })
    if (!isNil(err)) return alert(err)
    let job = {
      relayers,
      signers,
      multisig,
      multisig_type,
    }
    if (!/^\s*$/.test(schema)) job.schema = schema
    return ret(
      await new Log(sdk, "addRelayerJob", [name, job], opt, fn, signer).rec(
        true
      )
    )
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const removeRelayerJob = async ({ val: { name, contractTxId }, fn }) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["listRelayerJobs"]],
    })
    if (!isNil(err)) return alert(err)
    return ret(
      await new Log(sdk, "removeRelayerJob", name, opt, fn, signer).rec()
    )
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _addOwner = async ({ val: { address, contractTxId }, fn }) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["getInfo"]],
    })
    if (!isNil(err)) return alert(err)
    const addr = a(address)
    return ret(await new Log(sdk, "addOwner", addr, opt, fn, signer).rec())
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _removeOwner = async ({ val: { address, contractTxId }, fn }) => {
  try {
    const { err, opt, signer } = await fn(getOpt)({
      contractTxId,
      read: [["getInfo"]],
    })
    if (!isNil(err)) return alert(err)
    return ret(
      await new Log(sdk, "removeOwner", address, opt, fn, signer).rec()
    )
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}
export const checkJSON = val => {
  let json = null
  try {
    eval(`json = ${val}`)
  } catch (e) {
    console.log(e)
  }
  return isNil(json)
}
export const queryDB = async ({
  val: { query, method, contractTxId, dryRead },
  fn,
}) => {
  try {
    let q
    eval(`q = [${query}]`)
    let { err, opt, signer } = includes(method)(sdk.reads)
      ? { err: null, opt: {} }
      : await fn(getOpt)({ contractTxId })
    if (!isNil(err)) return alert(err)
    if (!isNil(dryRead)) {
      opt.onDryWrite = { cache: true, read: dryRead }
    }
    return ret(await new Log(sdk, method, q, opt, fn, signer).rec(true))
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const queryDB2 = async ({
  val: { query, method, contractTxId, dryRead, id },
  fn,
}) => {
  try {
    let { err, opt, signer } = includes(method)(sdk.reads)
      ? { err: null, opt: {} }
      : await fn(getOpt)({ contractTxId })
    if (!isNil(err)) return alert(err)
    if (!includes(method)(sdk.reads) && !isNil(dryRead)) {
      opt.onDryWrite = { cache: true, read: dryRead }
    }
    return ret(
      await new Log(
        sdk,
        method,
        query,
        includes(method)(sdk.reads) && isEmpty(opt) ? null : opt,
        fn,
        signer,
        id
      ).rec(true)
    )
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const read = async ({ val: { q, m, db, arr = true }, fn }) =>
  await new Log(db, m, q, null, fn).rec(arr)

export const checkNonce = async ({ val: {}, fn, get }) => {
  const addr = await lf.getItem(`temp_address:current`)
  const _addr = await lf.getItem(`temp_address:${sdk.contractTxId}:${addr}`)
  if (isNil(_addr)) return
  let nonces = (await lf.getItem("nonces")) || {}
  const __addr = a(_addr.address || "")
  nonces[sdk.contractTxId] ||= {}
  nonces[sdk.contractTxId][__addr] = await sdk.getNonce(__addr)
  await lf.setItem("nonces", nonces)
}

export const setNonce = async ({ val: { nonce, signer }, fn, get }) => {
  let nonces = (await lf.getItem("nonces")) || {}
  nonces[sdk.contractTxId] ||= {}
  if (!isNil(signer)) {
    const addr = a(signer)
    nonces[sdk.contractTxId][addr] = nonce
    await lf.setItem("nonces", nonces)
  }
}
