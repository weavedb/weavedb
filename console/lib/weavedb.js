const { Ed25519KeyIdentity } = require("@dfinity/identity")
import Arweave from "arweave"
import lf from "localforage"
import SDK from "weavedb-sdk"
import Client from "weavedb-client"
import { ethers } from "ethers"
import { AuthClient } from "@dfinity/auth-client"
import { WarpFactory } from "warp-contracts"
import {
  assocPath,
  is,
  includes,
  difference,
  keys,
  compose,
  map,
  clone,
  indexBy,
  prop,
  pluck,
  mergeLeft,
  isNil,
  concat,
  last,
  path,
} from "ramda"
import { Buffer } from "buffer"
let sdk
const weavedbSrcTxId = "4lSfFFQIpX37GMdab6c4ZdWli33b70qu_KJan5vB1ZI"
//const intmaxSrcTxId = "OTfBnNttwsi8b_95peWJ53eJJRqPrVh0s_0V-e5-s94"
const dfinitySrcTxId = "3OnjOPuWzB138LOiNxqq2cKby2yANw6RWcQVEkztXX8"
const ethereumSrcTxId = "Awwzwvw7qfc58cKS8cG3NsPdDet957-Bf-S1RcHry0w"
let arweave_wallet
let funded = false
async function addFunds(arweave, wallet) {
  const walletAddress = await arweave.wallets.getAddress(wallet)
  await arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
  await arweave.api.get("mine")
}

export const connectLocalhost = async ({ conf, set, val: { port } }) => {
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
  conf,
  set,
  val: { network, contractTxId, port, rpc },
}) => {
  let isRPC = !isNil(rpc) && !/^\s*$/.test(rpc)
  if (isRPC) {
    try {
      sdk = new Client({
        rpc,
        contractTxId,
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    sdk = new SDK({
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
    sdk.initialize({
      contractTxId: contractTxId,
      wallet: arweave_wallet,
    })
  }
  window.Buffer = Buffer
  set(true, "initWDB")
  return sdk
}

export const createTempAddressWithII = async ({
  conf,
  set,
  val: { contractTxId, network },
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
  conf,
  set,
  val: { contractTxId, network },
}) => {
  const wallet = window.arweaveWallet
  await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
  let addr = await wallet.getActiveAddress()
  const ex_identity = await lf.getItem(`temp_address:${contractTxId}:${addr}`)
  let identity = ex_identity
  let tx
  if (isNil(identity)) {
    ;({ tx, identity } = await sdk.createTempAddressWithAR(wallet))
    const linked = await sdk.getAddressLink(identity.address)
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
    identity.tx = tx
    identity.linked_address = addr
    await lf.setItem("temp_address:current", addr)
    identity.network = network
    identity.type = "ar"
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    set(addr, "temp_current")
    set({ addr, type: "ar", network }, "temp_current_all")
  }
}

export const connectAddress = async ({ conf, set, val: { network } }) => {
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

export const connectAddressWithII = async ({ conf, set, val: { network } }) => {
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

export const connectAddressWithAR = async ({ conf, set, val: { network } }) => {
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
  conf,
  set,
  val: { contractTxId, network },
}) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
  await provider.send("eth_requestAccounts", [])
  const signer = provider.getSigner()
  const addr = await signer.getAddress()
  const ex_identity = await lf.getItem(`temp_address:${contractTxId}:${addr}`)
  let identity = ex_identity
  let tx
  if (isNil(identity)) {
    ;({ tx, identity } = await sdk.createTempAddress(addr))
    const linked = await sdk.getAddressLink(identity.address)
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
    identity.tx = tx
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
  conf,
  set,
  val: { contractTxId },
}) {
  const current = await lf.getItem(`temp_address:current`)
  if (!isNil(current)) {
    const identity = await lf.getItem(`temp_address:${contractTxId}:${current}`)
    set(!isNil(identity) ? current : null, "temp_current")
    if (!isNil(identity)) {
      set(
        { addr: current, type: "evm", network: identity.network },
        "temp_current_all"
      )
    }
  } else {
    set(null, "temp_current")
  }
}

export const checkTempAddress = async function ({
  conf,
  set,
  val: { contractTxId },
}) {
  const current = await lf.getItem(`temp_address:current`)
  if (!isNil(current)) {
    const identity = await lf.getItem(`temp_address:${contractTxId}:${current}`)
    if (!isNil(identity)) set(current, "temp_current")
  }
}

export const logoutTemp = async ({ conf, set }) => {
  await lf.removeItem("temp_address:current")
  set(null, "temp_current")
  set(null, "temp_current_all")
}

export const queryDB = async ({
  val: { query, method, contractTxId },
  global,
  set,
  fn,
  conf,
  get,
}) => {
  try {
    const current = get("temp_current")
    let q
    eval(`q = [${query}]`)
    const identity = isNil(current)
      ? null
      : await lf.getItem(`temp_address:${contractTxId}:${current}`)
    let ii = null
    if (is(Array)(identity)) {
      ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(identity))
    }
    const opt = !isNil(ii)
      ? { ii }
      : !isNil(identity) && !isNil(identity.tx)
      ? {
          wallet: current,
          privateKey: identity.privateKey,
        }
      : null
    if (isNil(opt)) {
      alert("not logged in")
      return
    }
    const res = await sdk[method](...q, opt)
    if (!isNil(res.err)) {
      return `Error: ${res.err.errorMessage}`
    } else {
      return JSON.stringify(res)
    }
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _addOwner = async ({
  val: { address, contractTxId },
  global,
  set,
  fn,
  conf,
  get,
}) => {
  try {
    const current = get("temp_current")
    const identity = isNil(current)
      ? null
      : await lf.getItem(`temp_address:${contractTxId}:${current}`)
    let ii = null
    if (is(Array)(identity)) {
      ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(identity))
    }
    const opt = !isNil(ii)
      ? { ii }
      : !isNil(identity) && !isNil(identity.tx)
      ? {
          wallet: current,
          privateKey: identity.privateKey,
        }
      : null
    if (isNil(opt)) {
      alert("not logged in")
      return
    }
    const res = await sdk.addOwner(address, opt)
    if (!isNil(res.err)) {
      return `Error: ${res.err.errorMessage}`
    } else {
      return JSON.stringify(res)
    }
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _removeOwner = async ({
  val: { address, contractTxId },
  global,
  set,
  fn,
  conf,
  get,
}) => {
  try {
    const current = get("temp_current")
    const identity = isNil(current)
      ? null
      : await lf.getItem(`temp_address:${contractTxId}:${current}`)
    let ii = null
    if (is(Array)(identity)) {
      ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(identity))
    }
    const opt = !isNil(ii)
      ? { ii }
      : !isNil(identity) && !isNil(identity.tx)
      ? {
          wallet: current,
          privateKey: identity.privateKey,
        }
      : null
    if (isNil(opt)) {
      alert("not logged in")
      return
    }
    const res = await sdk.removeOwner(address, opt)
    if (!isNil(res.err)) {
      return `Error: ${res.err.errorMessage}`
    } else {
      return JSON.stringify(res)
    }
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
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
    wallet,
    initState: JSON.stringify(initialState),
    srcTxId: src,
  })
  return contractTxId
}

export const deployDB = async ({
  val: { owner, network, port, secure, canEvolve, auths },
  global,
  set,
  fn,
  conf,
  get,
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
    const warp = WarpFactory.forMainnet()
    const contractTxId = await deployFromSrc({
      src: weavedbSrcTxId,
      init: "initial-state",
      warp,
      algorithms,
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
    })
    return { contractTxId, network, port }
  } else {
    const warp = WarpFactory.forLocal(port)
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

export const _setCanEvolve = async ({
  val: { value, contractTxId },
  global,
  set,
  fn,
  conf,
  get,
}) => {
  try {
    const current = get("temp_current")
    const identity = isNil(current)
      ? null
      : await lf.getItem(`temp_address:${contractTxId}:${current}`)
    let ii = null
    if (is(Array)(identity)) {
      ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(identity))
    }
    const opt = !isNil(ii)
      ? { ii }
      : !isNil(identity) && !isNil(identity.tx)
      ? {
          wallet: current,
          privateKey: identity.privateKey,
        }
      : null
    if (isNil(opt)) {
      alert("not logged in")
      return
    }
    const res = await sdk.setCanEvolve(value, opt)
    if (!isNil(res.err)) {
      return `Error: ${res.err.errorMessage}`
    } else {
      return JSON.stringify(res)
    }
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

export const _setAlgorithms = async ({
  val: { algorithms, contractTxId },
  global,
  set,
  fn,
  conf,
  get,
}) => {
  try {
    const current = get("temp_current")
    const identity = isNil(current)
      ? null
      : await lf.getItem(`temp_address:${contractTxId}:${current}`)
    let ii = null
    if (is(Array)(identity)) {
      ii = Ed25519KeyIdentity.fromJSON(JSON.stringify(identity))
    }
    const opt = !isNil(ii)
      ? { ii }
      : !isNil(identity) && !isNil(identity.tx)
      ? {
          wallet: current,
          privateKey: identity.privateKey,
        }
      : null
    if (isNil(opt)) {
      alert("not logged in")
      return
    }
    const res = await sdk.setAlgorithms(algorithms, opt)
    if (!isNil(res.err)) {
      return `Error: ${res.err.errorMessage}`
    } else {
      return JSON.stringify(res)
    }
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}
