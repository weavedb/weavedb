import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { readFileSync, writeFileSync } from "fs"
import { resolve, join } from "path"

const files = {
  "0.1.0": readFileSync(resolve(import.meta.dirname, ".modules/wdb.0.1.0.br")),
  "0.1.1": readFileSync(resolve(import.meta.dirname, ".modules/wdb.0.1.1.br")),
  "sst-0.1.0": readFileSync(
    resolve(import.meta.dirname, ".modules/sst.0.1.0.br"),
  ),
  "sst-0.1.1": readFileSync(
    resolve(import.meta.dirname, ".modules/sst.0.1.1.br"),
  ),
}
const gateway = async ({ port = 5000 }) => {
  const app = express()
  app.use(cors())
  app.use(bodyParser.raw({ type: "*/*", limit: "100mb" }))
  app.get("/:txid", async (req, res) => {
    const { txid } = req.params
    console.log(files[txid])
    res.send(files[txid])
  })
  const node = app.listen(port, () => console.log(`Gateway on port ${port}`))
  return {
    stop: () => {
      console.log("shutting down server...")
      node.close()
    },
  }
}

export default gateway
