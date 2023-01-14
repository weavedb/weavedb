const Bundlr = require("@bundlr-network/client")
const contractTxId = process.env.NEXT_PUBLIC_WEAVEDB_CONTRACT_TX_ID
const { isNil } = require("ramda")
const SDK = require("weavedb-node-client")

export default async (req, res) => {
  const { body, params } = JSON.parse(req.body)
  const bundlr = new Bundlr.default(
    "http://node1.bundlr.network",
    "matic",
    process.env.BUNDLR_PRIVATEKEY
  )
  const note = {
    title: params.query[0].title,
    body,
    author: params.caller,
    date: Date.now(),
  }
  const tags = [
    { name: "Content-Type", value: "application/json" },
    { name: "appName", value: "weavedb-bundlr-test" },
  ]
  let error = null
  let success = false
  let relay_tx = null
  try {
    const bundlr_tx = await bundlr.upload(JSON.stringify(note), { tags })
    if (!isNil(bundlr_tx.id)) {
      const sdk = new SDK({
        contractTxId,
        rpc: process.env.WEAVEDB_RPC_NODE,
      })
      relay_tx = await sdk.relay(
        params.jobID,
        params,
        { id: bundlr_tx.id, author: note.author, date: note.date },
        {
          jobID: params.jobID,
          privateKey: process.env.RELAYER_PRIVATEKEY,
          wallet: process.env.RELAYER_ADDRESS,
        }
      )
      if (relay_tx.success) {
        success = true
      } else {
        error = relay_tx.error
      }
    } else {
      error = relay_tx
    }
  } catch (e) {
    console.log(e)
    error = e
  }
  res.status(200).json({ success, error, tx: relay_tx })
}
