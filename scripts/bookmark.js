require("dotenv").config()
const fs = require("fs")
const { expect } = require("chai")
const path = require("path")
const Arweave = require("arweave")
const wallet_name = process.argv[2]
const contractTxId = process.env.CONTRACT_TX_ID
const { isNil } = require("ramda")
const ethSigUtil = require("@metamask/eth-sig-util")

const {
  PstContract,
  PstState,
  Warp,
  WarpNodeFactory,
  WarpWebFactory,
  LoggerFactory,
  InteractionResult,
} = require("warp-contracts")

let arweave = null
let wdb = null
if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

if (isNil(contractTxId)) {
  console.log("contract not specified")
  process.exit()
}

const pkey32 = Buffer.from(process.env.PRIVATE_KEY, "hex")
const addr = process.env.ETHERIUM_ADDRESS.toLowerCase()

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "verifyingContract", type: "string" },
]

const domain = {
  name: "asteroid",
  version: "1",
  verifyingContract: contractTxId,
}

const schemas = {
  bookmarks: {
    type: "object",
    required: ["article_id", "date", "user_address"],
    properties: {
      article_id: {
        type: "string",
      },
      user_address: {
        type: "string",
      },
      date: {
        type: "number",
      },
    },
  },
}

const rules = {
  bookmarks: {
    "allow create": {
      and: [
        { "!=": [{ var: "request.auth.signer" }, null] },
        {
          "==": [
            { var: "resource.id" },
            {
              cat: [
                { var: "resource.newData.article_id" },
                ":",
                { var: "resource.newData.user_address" },
              ],
            },
          ],
        },
        {
          "==": [
            { var: "request.auth.signer" },
            { var: "resource.newData.user_address" },
          ],
        },
        {
          "==": [
            { var: "request.block.timestamp" },
            { var: "resource.newData.date" },
          ],
        },
      ],
    },
    "allow delete": {
      "!=": [
        { var: "request.auth.signer" },
        { var: "resource.newData.user_address" },
      ],
    },
  },
  conf: {
    "allow write": {
      "==": [{ var: "request.auth.signer" }, addr],
    },
  },
  mirror: {
    "allow write": {
      "==": [{ var: "request.auth.signer" }, addr],
    },
  },
}

async function mineBlock(arweave) {
  await arweave.api.get("mine")
}

const getNonce = async function (wdb, addr) {
  let result
  ;({ result } = await wdb.viewState({
    function: "nonce",
    address: addr,
  }))
  return result + 1
}

const query = async function (wdb, wallet, func, query) {
  let nonce = await getNonce(wdb, addr)
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
    domain,
    primaryType: "Query",
    message,
  }
  const signature = ethSigUtil.signTypedData({
    privateKey: pkey32,
    data,
    version: "V4",
  })
  expect(
    ethSigUtil.recoverTypedSignature({
      version: "V4",
      data,
      signature,
    })
  ).to.equal(addr)
  let tx = null
  tx = await wdb.writeInteraction({
    function: func,
    query,
    signature,
    nonce,
    caller: addr,
  })
  await mineBlock(arweave)
  return tx
}

const setup = async () => {
  arweave = Arweave.init({
    host: "testnet.redstone.tools",
    port: 443,
    protocol: "https",
    timeout: 0,
  })
  LoggerFactory.INST.logLevel("error")
  const warp = WarpWebFactory.memCachedBased(arweave)
    .useArweaveGateway()
    .build()

  const wallet_path = path.resolve(
    __dirname,
    ".wallets",
    `wallet-${wallet_name}.json`
  )
  if (!fs.existsSync(wallet_path)) {
    console.log("wallet doesn't exist")
    process.exit()
  }
  const wallet = JSON.parse(fs.readFileSync(wallet_path, "utf8"))
  const wdb = warp.pst(contractTxId).connect(wallet)

  console.log("init WeaveDB...")

  await query(wdb, wallet, "setSchema", [schemas.bookmarks, "bookmarks"])
  console.log("bookmarks schema set!")

  for (let k in rules) {
    await query(wdb, wallet, "setRules", [rules[k], k])
    console.log(`${k} rules set!`)
  }

  process.exit()
}

setup()
