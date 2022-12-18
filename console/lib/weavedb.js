const { Ed25519KeyIdentity } = require("@dfinity/identity")
import Arweave from "arweave"
import client from "weavedb-client"
import lf from "localforage"
//import SDK from "weavedb-sdk"
import SDK from "./sdk"
import { ethers } from "ethers"
import { AuthClient } from "@dfinity/auth-client"
import { WarpFactory } from "warp-contracts"
import {
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
const weavedbSrcTxId = "PliTJIFuE-mC0R1qivwV4Prh7B5OMDLfkL4qk6MbeUw"
const intmaxSrcTxId = "OTfBnNttwsi8b_95peWJ53eJJRqPrVh0s_0V-e5-s94"
const dfinitySrcTxId = "RQpDSz3PSyYSn6LRzWnX85bu6iGqCZKLxkdwQVoKzTI"
const ethereumSrcTxId = "dtLqn4y5fFD5xyiRCzaYjWxz5k8I6VxoVeARFphhuY4"
let arweave_wallet
let funded = false
async function addFunds(arweave, wallet) {
  const walletAddress = await arweave.wallets.getAddress(wallet)
  await arweave.api.get(`/mint/${walletAddress}/1000000000000000`)
  await arweave.api.get("mine")
}

export const connectLocalhost = async ({ conf, set, val: { port } }) => {
  const pkey =
    "rO2Ead7ItgH1B7c3UaLQP2OAIz53yP2vEkemJG81WW_FKPqC2Iu_idz2_wuDXDX10ue9GY29ZyKhDP8F_mC-ZByUGqRpEfw3DIbmI2D_IG56ThwOm_ZskdcDkkUyHG46oKZOI7LSL4zDR9BfoPSE64Qe6OuMrSfwiMURGLvfCnbdotL0OA0_E8gZQmCluS59HFkaJJaXOiu56UpAj80xymOPHPLn_GrcSMzkp_kYZ--SIJmx1KUnlq8NRPRnGZm1w6YD93yMAFLSVjoBe_4YZ-NjMBdN5m-CGyZ45FPURrRVx25nic7-SOoRynjgfhBtdbR_dLyTMb9ElyyEl3AI1x4_Jl3P478vutYv41UeIcGf9dcmFbMHFZBQSGsW2JGNFgBQPlIiWXcvL7IxeJy3whVKseuUyzquTlzQnhR9TLe854KI5QTFDq5m8ltEoMmQe5wQvphLFJKSzAj6TzCMeZrIdEU-FiwFzOTo1uO6KSL12sjJ8-dDH3rDnPWikJMitEKgGe7F1I2h7DjDJKodWPLynuCuGYwL9hnbTP4iQuJrO8WOlcCONj6q4ajE1dksgaDW2a-NLZD-UMSXEZJfMwzn1_2d9FS_f8wsn1G2WMH9ztiv4osShBivXPzxz774kQEpW_BRG7vTD8B8qmhDTaKvHAzSWZahXvNuLofIWiE"

  const data = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "verifyingContract", type: "string" },
      ],
      Query: [
        { name: "query", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    },
    domain: {
      name: "weavedb",
      version: "1",
      verifyingContract: "60wwGv8n9Vkj-XIBW7bY-S3kj6XI7ELdM2W431ui_Cw",
    },
    primaryType: "Query",
    message: {
      nonce: 1,
      query: '{"func":"set","query":[{"name":"Alice3"},"test","Alice3"]}',
    },
  }

  const sig =
    "21f762737ef2373e99c67e896844d8549df969bd86a735ff8199a00094ee749dbcfcd11237ac6dff21d509e13152776353ce3ba7d999a9c81d9d82596dd550ae31034caf49be632965aa545f8f24b56c3459b0cb9dfa6d2a10b9b18e625d21fd1c928b5261bc8e7e75a596c67d1fed9a666e4e71ef2471fcaf949c797558dfd0a3301e52d842e333c098331a77914fb1f749d8906ebac8db4c61eddafb887ddc537dade3d79fec0cf266dfbb839f49e06486905e37a19aaec1c8e8764136af8178baf798564136f5bc82c6b69527ac10e4fc4e5fffbfcbb215e6e63cccb53166bfcb16373a670b9c5649982e44a470855ff9915741bda08a1fc51b174c766cc43b9e6a36471a2e2f69471b4691da39c487c6989656d41ddc3993925da7e300313d16675e686a154f6e3785c634ef44d2cf7e4f895318edfd03f2ee267812a63913302264c01de5735a30ac09ed5e97d4b0fb038dde9f5090d986cd0d2a73126a473871a0b520c58611ef01950e04ffd408bebada4e9574613efdf5a659ba4ef2f991a005793fc30dc155a7a460a681843f75e789c464fb00b81d56f1a6237e367e952a16d7eade294868d8bed08517ba7cea813b536e94b849a7d628cffb50ccbb0a5e4cd1062c1598a278660fecbaf6adeea93e0e7a5f39f0a3d91e7d75345ef1dea7dd3b6c1a3b686ff522490d8575803bda30f6fd737510fd0328b506ddad"

  console.log("...............................................")
  const enc = new TextEncoder()
  const encoded_data = enc.encode(JSON.stringify(data))
  console.log(
    await Arweave.crypto.verify(pkey, encoded_data, Buffer.from(sig, "hex"))
  )
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
  val: { network, contractTxId, port },
}) => {
  let arweave = {
    Localhost: {
      host: "localhost",
      port: port || 1820,
      protocol: "http",
    },
    Testnet: {
      host: "testnet.redstone.tools",
      port: 443,
      protocol: "https",
    },
    Mainnet: {
      host: "arweave.net",
      port: 443,
      protocol: "https",
    },
  }
  sdk = new SDK({
    name: "weavedb",
    version: "1",
    contractTxId: contractTxId,
    arweave: arweave[network],
  })
  if (isNil(arweave_wallet)) {
    const arweave = Arweave.init({
      host: "localhost",
      port: port || 1820,
      protocol: "http",
    })
    arweave_wallet ||= await arweave.wallets.generate()
    await addFunds(arweave, arweave_wallet)
  }
  if (!isNil(contractTxId)) {
    sdk.initialize({
      name: "weavedb",
      version: "1",
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
    console.log(q)
    console.log(opt)
    const wallet = window.arweaveWallet
    await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
    let addr = await wallet.getActiveAddress()
    console.log(addr)
    const res = await sdk[method](...q, { ar: wallet })
    //const res = await sdk[method](...q, opt)
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
    initState: JSON.stringify(initialState),
    src: contractSrc,
  })
  if (!isNil(arweave)) await arweave.api.get("mine")
  return contractTxId
}

async function deployFromSrc({ src, warp, init, extra }) {
  const stateFromFile = JSON.parse(
    await fetch(`/static/${init}.json`).then(v => v.text())
  )
  const initialState = mergeLeft(extra, stateFromFile)
  const { contractTxId } = await warp.createContract.deployFromSourceTx({
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
        algorithms.push("poseidon")
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
      extra: {
        secure: false,
        owner,
        contracts: {
          intmax: intmaxSrcTxId,
          dfinity: dfinitySrcTxId,
          ethereum: ethereumSrcTxId,
        },
        secure,
        canEvolve,
        algorithms,
      },
    })
    return { contractTxId, network, port }
  } else {
    const warp = WarpFactory.forLocal(port)
    const poseidon1TxId = await deploy({
      src: "poseidonConstants",
      init: "initial-state-poseidon-constants",
      warp,
      arweave: sdk.arweave,
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
      arweave: sdk.arweave,
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
      arweave: sdk.arweave,
      extra: {
        owner,
        contracts: {
          poseidonConstants1: poseidon1TxId,
          poseidonConstants2: poseidon2TxId,
        },
      },
    })
    const dfinitySrcTxId = await deploy({
      src: "ii",
      init: "initial-state-ii",
      warp,
      arweave: sdk.arweave,
      extra: {
        owner,
      },
    })
    const ethereumSrcTxId = await deploy({
      src: "eth",
      init: "initial-state-eth",
      warp,
      arweave: sdk.arweave,
      extra: {
        owner,
      },
    })
    const contractTxId = await deploy({
      src: "contract",
      init: "initial-state",
      warp,
      arweave: sdk.arweave,
      extra: {
        secure: false,
        owner,
        contracts: {
          intmax: intmaxSrcTxId,
          dfinity: dfinitySrcTxId,
          ethereum: ethereumSrcTxId,
        },
        secure,
        canEvolve,
        algorithms,
      },
    })
    return { contractTxId, network, port }
  }
}
