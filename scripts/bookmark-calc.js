const EthCrypto = require("eth-crypto")
const { privateToAddress } = require("ethereumjs-util")
require("dotenv").config()
const fs = require("fs")
const path = require("path")
const wallet_name = process.argv[2]
const contractTxId = process.argv[3] || process.env.CONTRACT_TX_ID
const name = process.env.NAME || "weavedb"
const version = process.env.VERSION || "1"
let privateKey = process.env.PRIVATE_KEY
const { isNil } = require("ramda")
const SDK = require("../sdk")

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

if (isNil(contractTxId)) {
  console.log("contract not specified")
  process.exit()
}

if (isNil(wallet_name)) {
  console.log("no wallet name given")
  process.exit()
}

if (isNil(contractTxId)) {
  console.log("contract not specified")
  process.exit()
}

const calc = async sdk => {
  const conf = (await sdk.get("conf", "mirror-calc")) || { ver: 0 }
  const ex = (await sdk.get("mirror", ["ver"], ["ver", "!=", 0])) || []
  let emap = indexBy(prop("id"))(ex)
  const day = 60 * 60 * 24
  const two_weeks = day * 14
  const d = Date.now() / 1000
  const date = Date.now() / 1000 - two_weeks
  const bookmarks = await sdk.get(
    "bookmarks",
    ["date", "desc"],
    ["date", ">=", date]
  )
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
      batches.push(["update", { pt: sdk.del(), ver: sdk.del() }, "mirror", k])
    }
  }
  const identity = EthCrypto.createIdentity()
  await sdk.batch(batches, {
    privateKey,
  })
}

const setup = async () => {
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
  const sdk = new SDK({
    wallet,
    name,
    version,
    contractTxId,
    arweave: {
      host:
        wallet_name === "mainnet" ? "arweave.net" : "testnet.redstone.tools",
      port: 443,
      protocol: "https",
      timeout: 200000,
    },
  })

  console.log("calc bookmarks...")
  await calc(sdk)
  console.log("done!")
  process.exit()
}

setup()
