exports.default = () => {
  let config = require("../weavedb.config.js")
  const accounts = config.accounts
  for (const v of readdirSync(dir_evm)) {
    const acc = JSON.parse(readFileSync(resolve(dir_evm, v), "utf8"))
    const name = v.split(".")[0]
    accounts.evm[name] = acc
  }
  for (const v of readdirSync(dir_ar)) {
    const acc = JSON.parse(readFileSync(resolve(dir_ar, v), "utf8"))
    const name = v.split(".")[0]
    accounts.ar[name] = acc
  }
  return accounts
}
