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

  console.log("add crons to WeaveDB..." + contractTxId)
  const cron = {
    do: true,
    span: 60 * 60 * 12,
    jobs: [
      ["get", "conf", ["conf", "mirror-calc"], { ver: 0 }],
      ["get", "exists", ["mirror", ["ver"], ["ver", "!=", 0]]],
      ["let", "exists_map", ["indexBy", ["prop", "id"], { var: "exists" }]],
      ["let", "day", 60 * 60 * 24],
      ["let", "two_weeks", ["multiply", { var: "day" }, 14]],
      ["let", "now", { var: "block.timestamp" }],
      ["let", "deadline", ["subtract", { var: "now" }, { var: "two_weeks" }]],
      [
        "get",
        "bookmarks",
        ["bookmarks", ["date", "desc"], ["date", ">=", { var: "deadline" }]],
      ],
      ["let", "rank", {}],
      [
        "let",
        "batches",
        [
          [
            "upsert",
            {
              ver: ["add", 1, ["prop", "ver", { var: "conf" }]],
              date: { var: "now" },
            },
            "conf",
            "mirror-calc",
          ],
        ],
      ],
      [
        "do",
        [
          "forEach",
          [
            "pipe",
            ["let", "v"],
            ["prop", "article_id"],
            ["pair", "rank"],
            ["join", "."],
            ["let", "rank_path"],
            [
              "when",
              ["pipe", ["var", "$rank_path"], ["isNil"]],
              [
                "pipe",
                [
                  "applySpec",
                  {
                    id: ["identity"],
                    pt: ["always", 0],
                    bookmarks: ["always", 0],
                  },
                ],
                ["let", "$rank_path"],
              ],
            ],
            ["var", "$rank_path"],
            ["over", ["lensProp", "bookmarks"], ["inc"]],
            ["let", "$rank_path"],
            ["var", "v"],
            ["prop", "date"],
            ["subtract", { var: "now" }],
            ["subtract", { var: "two_weeks" }],
            ["divide", ["__"], { var: "day" }],
            ["let", "k"],
            ["var", "$rank_path"],
            [
              "over",
              ["lensProp", "pt"],
              [
                "pipe",
                ["applySpec", { pt: ["identity"], k: ["var", "k"] }],
                ["values"],
                ["sum"],
              ],
            ],
            ["let", "$rank_path"],
          ],
          { var: "bookmarks" },
        ],
      ],
      [
        "do",
        [
          "forEachObjIndexed",
          [
            "pipe",
            ["unapply", ["take", 2]],
            ["tap", ["pipe", ["head"], ["let", "v"]]],
            ["pipe", ["last"], ["let", "k"]],
            ["pair", "exists_map"],
            ["join", "."],
            ["let", "ex_path"],
            ["var", ["__"], true],
            [
              "when",
              ["pipe", ["isNil"], ["not"]],
              ["pipe", ["assoc", true, "exists"], ["let", "$ex_path"]],
            ],
            ["var", "v"],
            [
              "applySpec",
              {
                method: ["always", "upsert"],
                query: {
                  id: ["var", "k"],
                  ver: ["pipe", ["var", "conf"], ["prop", "ver"], ["inc"]],
                  pt: ["prop", "pt"],
                  bookmarks: ["prop", "bookmarks"],
                },
                collection: ["always", "mirror"],
                doc: ["var", "k"],
              },
            ],
            ["values"],
            ["applySpec", { query: ["identity"], batches: ["var", "batches"] }],
            ["values"],
            ["apply", ["append"]],
            ["let", "batches"],
          ],
          { var: "rank" },
        ],
      ],
      [
        "do",
        [
          "forEachObjIndexed",
          [
            "pipe",
            ["unapply", ["take", 2]],
            ["tap", ["pipe", ["head"], ["let", "v"]]],
            ["pipe", ["last"], ["let", "k"]],
          ],
          ["pair", "exists_map"],
          ["join", "."],
          ["var", ["__"], true],
          [
            "when",
            ["pipe", ["propEq", "exists", true], ["not"]],
            [
              "pipe",
              [
                "applySpec",
                {
                  method: ["always", "update"],
                  query: {
                    pt: ["always", sdk.del()],
                    ver: ["always", sdk.del()],
                  },
                  collection: ["always", "mirror"],
                  doc: ["var", "k"],
                },
              ],
              ["values"],
              [
                "applySpec",
                { query: ["identity"], batches: ["var", "batches"] },
              ],
              ["values"],
              ["apply", ["append"]],
              ["let", "batches"],
            ],
          ],
        ],
      ],
      ["batch", { var: "batches" }],
    ],
  }
  if (isNil(privateKey)) {
    const identity = EthCrypto.createIdentity()
    privateKey = identity.privateKey
  }
  await sdk.addCron(cron, "count", {
    privateKey,
  })
  console.log("bookmarks cron set!")

  process.exit()
}

setup()
