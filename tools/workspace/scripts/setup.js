const config = require("../weavedb.config.js")
const SDK = require("weavedb-node-client")
const accounts = require("./lib/accounts")
const { isNil } = require("ramda")
const setup = require("./lib/setup")
const settings = require("./lib/settings")
let {
  _: [name],
  network,
  owner,
  relayer,
  plugin,
} = require("yargs")(process.argv.slice(2)).parserConfiguration({
  "parse-numbers": false,
}).argv

if (isNil(name)) {
  console.error(`DB name not specified`)
  process.exit()
}

if (isNil(accounts.evm[owner])) {
  console.error(`EVM owner not specified or found: ${owner} `)
  process.exit()
}

if (!isNil(relayer) && isNil(accounts.evm[relayer])) {
  console.error(`EVM relayer not found: ${relayer} `)
  process.exit()
}

network ??= config.defaultNetwork
const rpc = config.networks[network]
let privateKey = null

if (isNil(rpc)) {
  console.error(`network not found: ${network}`)
  process.exit()
} else {
  privateKey = accounts.evm[rpc.admin]?.privateKey
  if (isNil(privateKey)) {
    console.error(`Rollup admin not specified or not found: ${rpc.admin}`)
    process.exit()
  }
}

const main = async key => {
  const _db = new SDK({ rpc: rpc.url, contractTxId: name })
  const { dbs } = await _db.node({ op: "stats" })
  let instance = null
  for (const v of dbs) {
    if (v.id === name) {
      instance = v.data
    }
  }
  if (isNil(instance)) {
    console.error(`DB not found: ${name}`)
    process.exit()
  }
  let _plugin = ""
  if (!isNil(plugin)) _plugin = `#${plugin}`
  const db = new SDK({
    rpc: rpc.url,
    contractTxId: `${instance.contractTxId ?? name}${_plugin}`,
  })
  await setup({
    db,
    conf: settings(plugin),
    privateKey: accounts.evm[owner]?.privateKey,
    relayer: accounts.evm[relayer]?.address?.toLowerCase() ?? null,
  })
  process.exit()
}

main()
