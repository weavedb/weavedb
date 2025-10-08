import { createData } from "@dha-team/arbundles"
import { ArweaveSigner } from "@ar.io/sdk"
import { readFileSync } from "fs"
import { resolve } from "path"
import yargs from "yargs"

const { ver, wallet, hash } = yargs(process.argv.slice(2)).argv

if (!ver) {
  console.log("version is missing")
  process.exit()
}

if (!wallet) {
  console.log("wallet is missing")
  process.exit()
}

if (!hash) {
  console.log("hash is missing")
  process.exit()
}

const publish = async () => {
  const jwk = JSON.parse(readFileSync(resolve(process.cwd(), wallet), "utf8"))
  const signer = new ArweaveSigner(jwk)
  const bin = readFileSync(resolve(import.meta.dirname, "../wdb.min.js.br"))
  console.log(bin)
  const di = createData(bin, signer, {
    tags: [
      { name: "Data-Protocol", value: "ao" },
      { name: "Variant", value: "ao.TN.1" },
      { name: "Type", value: "Module" },
      { name: "Module-Format", value: `wdb-core-${ver}` },
      { name: "Memory-Limit", value: "4-gb" },
      { name: "Input-Encoding", value: "JSON-1" },
      { name: "Output-Encoding", value: "JSON-1" },
      { name: "Compute-Limit", value: "9000000000000" },
      { name: "Content-Type", value: "application/javascript" },
      { name: "Content-Encoding", value: "br" },
      {
        name: "Repository",
        value: "git+https://github.com/weavedb/weavedb.git",
      },
      { name: "Commit-Hash", value: hash },
    ],
  })
  await di.sign(signer)
  console.log(`Module ID:`, di.id)
  const res = await fetch("https://up.arweave.net:443/tx", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: di.binary,
  })
  console.log(res)
}
publish()
