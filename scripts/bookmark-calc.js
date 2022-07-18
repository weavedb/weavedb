require("dotenv").config()
const fs = require("fs")
const { expect } = require("chai")
const path = require("path")
const Arweave = require("arweave")
const wallet_name = process.argv[2]
const contractTxId = process.env.CONTRACT_TX_ID
const { isNil, indexBy, prop } = require("ramda")
const ethSigUtil = require("@metamask/eth-sig-util")

const op = {
  signer: () => ({ __op: "signer" }),
  ts: () => ({ __op: "ts" }),
  del: () => ({ __op: "del" }),
  inc: n => ({ __op: "inc", n }),
  union: (...args) => ({ __op: "arrayUnion", arr: args }),
  remove: (...args) => ({ __op: "arrayRemove", arr: args }),
}

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

const get = async function (wdb, query) {
  let result
  ;({ result } = await wdb.viewState({
    function: "get",
    query,
  }))
  return result
}

const calc = async (wdb, wallet) => {
  const conf = (await get(wdb, ["conf", "mirror-calc"])) || { ver: 0 }
  const ex = (await get(wdb, ["mirror", ["ver", "!=", 0]])) || []
  let emap = indexBy(prop("id"))(ex)
  const day = 60 * 60 * 24
  const two_weeks = day * 14
  const d = Date.now() / 1000
  const date = Date.now() / 1000 - two_weeks
  const bookmarks = await get(wdb, [
    "bookmarks",
    ["date", "desc"],
    ["date", ">=", date],
  ])
  const rank = {}
  let batches = [
    ["upsert", { ver: conf.ver + 1, date: Date.now() }, "conf", "mirror-calc"],
  ]
  for (let v of bookmarks) {
    if (isNil(rank[v.article_id])) {
      rank[v.article_id] = {
        id: v.article_id,
        pt: 0,
        bookmarks: 0,
      }
    }
    rank[v.article_id].bookmarks += 1
    const k = (two_weeks - (d - v.date)) / day
    rank[v.article_id].pt += k
  }
  for (let k in rank) {
    let v = rank[k]
    if (!isNil(emap[k])) {
      emap[k].ex = true
    }
    batches.push([
      "upsert",
      {
        id: k,
        ver: conf.ver + 1,
        pt: v.pt,
        bookmarks: v.bookmarks,
      },
      "mirror",
      k,
    ])
  }
  for (let k in emap) {
    if (emap[k].ex !== true) {
      batches.push(["update", { pt: op.del(), ver: op.del() }, "mirror", k])
    }
  }
  console.log(batches)
  await query(wdb, wallet, "batch", batches)
}

const setup = async () => {
  arweave = Arweave.init({
    host: "testnet.redstone.tools",
    port: 443,
    protocol: "https",
    timeout: 200000,
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

  console.log("calc bookmarks...")
  await calc(wdb, wallet)
  console.log("done!")
  process.exit()
}

setup()
