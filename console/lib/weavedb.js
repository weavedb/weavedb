const { Ed25519KeyIdentity } = require("@dfinity/identity")
import arweave from "arweave"
import client from "weavedb-client"
import lf from "localforage"
import SDK from "weavedb-sdk"
import { ethers } from "ethers"
import { AuthClient } from "@dfinity/auth-client"
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
import weavedb from "lib/weavedb.json"
let sdk

export const setupWeaveDB = async ({
  conf,
  set,
  val: { network, contractTxId },
}) => {
  let arweave = {
    Localhost: {
      host: "localhost",
      port: 1820,
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
    wallet: weavedb.arweave,
    name: weavedb.weavedb.name,
    version: weavedb.weavedb.version,
    contractTxId: contractTxId,
    arweave: arweave[network],
  })
  window.Buffer = Buffer
  set(true, "initWDB")
  return sdk
}

export const createTempAddressWithII = async ({
  conf,
  set,
  val: { contractTxId },
}) => {
  const iiUrl = `http://localhost:8000/?canisterId=rwlgt-iiaaa-aaaaa-aaaaa-cai`
  console.log(iiUrl)
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
  await lf.setItem("temp_address:current", addr)
  set(addr, "temp_current")
  await lf.setItem("temp_address:current", addr)
  await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
  set(addr, "temp_current")
}

export const createTempAddressWithAR = async ({
  conf,
  set,
  val: { contractTxId },
}) => {
  const wallet = window.arweaveWallet
  await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
  let addr = await wallet.getActiveAddress()
  const ex_identity = await lf.getItem(`temp_address:${contractTxId}:${addr}`)
  let identity = ex_identity
  let tx
  if (isNil(identity)) {
    ;({ tx, identity } = await sdk.createTempAddressWithAR(wallet))
  } else {
    await lf.setItem("temp_address:current", addr)
    set(addr, "temp_current")
    return
  }
  if (!isNil(tx) && isNil(tx.err)) {
    identity.tx = tx
    identity.linked_address = addr
    await lf.setItem("temp_address:current", addr)
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    set(addr, "temp_current")
  }
}

export const createTempAddress = async ({
  conf,
  set,
  val: { contractTxId },
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
  } else {
    await lf.setItem("temp_address:current", addr)
    set(addr, "temp_current")
    return
  }
  if (!isNil(tx) && isNil(tx.err)) {
    identity.tx = tx
    identity.linked_address = addr
    await lf.setItem("temp_address:current", addr)
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    set(addr, "temp_current")
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
      : {
          privateKey: weavedb.ethereum.privateKey,
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
