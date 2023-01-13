const Bundlr = require("@bundlr-network/client")
const { Contract, providers } = require("ethers")
const provider = new providers.JsonRpcProvider(process.env.EVM_RPC)
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const aclContractAddr = process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDR
const privateKey = process.env.BUNDLR_PRIVATEKEY
const { isNil } = require("ramda")
const SDK = require("weavedb-node-client")
const abi = require("../../lib/ACL.json")

export default async (req, res) => {
  const { body, params } = JSON.parse(req.body)
  const bundlr = new Bundlr.default(
    "http://node1.bundlr.network",
    "matic",
    privateKey
  )
  const article = {
    title: params.query[0].title,
    body,
    author: params.caller,
    date: Date.now(),
  }
  const tags = [
    { name: "Content-Type", value: "application/json" },
    { name: "appName", value: "weavedb-test" },
  ]
  let error = null
  let success = false
  let tx = null
  try {
    const tx2 = await bundlr.upload(JSON.stringify(article), { tags })
    if (!isNil(tx2.id)) {
      const sdk = new SDK({
        contractTxId,
        rpc: process.env.WEAVEDB_RPC_NODE,
      })
      tx = await sdk.relay(
        params.jobID,
        params,
        { id: tx2.id, author: article.author, date: article.date },
        {
          jobID: params.jobID,
          privateKey: process.env.RELAYER_PRIVATEKEY,
          wallet: process.env.RELAYER_ADDRESS,
        }
      )
      if (tx.success) {
        success = true
      } else {
        error = tx.error
      }
    } else {
      error = tx
    }
  } catch (e) {
    console.log(e)
    error = e
  }
  res.status(200).json({ success, error, tx })
}
