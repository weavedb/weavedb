import lf from "localforage"
import SDK from "weavedb-sdk"
import EthCrypto from "eth-crypto"
const ethSigUtil = require("@metamask/eth-sig-util")
import { ethers } from "ethers"
import {
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

export const setupWeaveDB = async ({ conf, set }) => {
  sdk = new SDK({
    web3: web3,
    wallet: weavedb.arweave,
    name: weavedb.weavedb.name,
    version: weavedb.weavedb.version,
    contractTxId: weavedb.weavedb.contractTxId,
    arweave: {
      host: "localhost",
      port: 1820,
      protocol: "http",
      timeout: 200000,
    },
  })
  window.Buffer = Buffer
  set(true, "initWDB")
  return sdk
}

export const createTempAddress = async ({ conf, set }) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
  await provider.send("eth_requestAccounts", [])
  const signer = provider.getSigner()
  const addr = await signer.getAddress()
  const ex_identity = await lf.getItem(
    `temp_address:${weavedb.weavedb.contractTxId}:${addr}`
  )
  let identity = ex_identity
  if (isNil(identity)) {
    identity = EthCrypto.createIdentity()
  } else {
    await lf.setItem("temp_address:current", addr)
    set(addr, "temp_current")
    return
  }

  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]
  let nonce = await sdk.getNonce(addr.toLowerCase())
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
    domain: sdk.domain,
    primaryType: "Query",
    message,
  }
  const signature = ethSigUtil.signTypedData({
    privateKey: Buffer.from(identity.privateKey.replace(/^0x/, ""), "hex"),
    data,
    version: "V4",
  })
  const query2 = { signature, address: identity.address.toLowerCase() }
  let tx = await sdk.addAddressLink(query2, {
    nonce,
    wallet: addr.toLowerCase(),
  })
  if (!isNil(tx) && isNil(tx.err)) {
    identity.tx = tx
    identity.linked_address = addr
    await lf.setItem("temp_address:current", addr)
    await lf.setItem(
      `temp_address:${weavedb.weavedb.contractTxId}:${addr}`,
      identity
    )
    set(addr, "temp_current")
  }
}

export const checkTempAddress = async function ({ conf, set }) {
  const current = await lf.getItem(`temp_address:current`)
  if (!isNil(current)) {
    const identity = await lf.getItem(
      `temp_address:${weavedb.weavedb.contractTxId}:${current}`
    )
    if (!isNil(identity)) set(current, "temp_current")
  }
}

export const logoutTemp = async ({ conf, set }) => {
  await lf.removeItem("temp_address:current")
  set(null, "temp_current")
  set(null, "temp_image")
}

export const queryDB = async ({
  val: { query, method },
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
      : await lf.getItem(
          `temp_address:${weavedb.weavedb.contractTxId}:${current}`
        )
    const opt =
      !isNil(identity) && !isNil(identity.tx)
        ? {
            wallet: current.toLowerCase(),
            addr: identity.address.toLowerCase(),
            privateKey: Buffer.from(
              identity.privateKey.replace(/^0x/, ""),
              "hex"
            ),
          }
        : {
            addr: weavedb.ethereum.address,
            privateKey: Buffer.from(
              weavedb.ethereum.privateKey.replace(/^0x/, ""),
              "hex"
            ),
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
