const { assoc } = require("ramda")

const setupDB = async ({ db, conf, privateKey, relayer }) => {
  const auth = { privateKey }
  for (let k in conf) {
    switch (k) {
      case "indexes":
        for (let col in conf[k]) {
          for (let v of conf[k][col]) {
            console.log(
              "addIndex",
              col,
              v,
              (await db.addIndex(v, col, auth))?.success
            )
          }
        }
        break
      case "relayerJobs":
        for (let name in conf[k]) {
          console.log(
            "addRelayerJob",
            name,
            (
              await db.addRelayerJob(
                name,
                assoc("relayers", [relayer], conf[k][name]),
                auth
              )
            )?.success
          )
        }
        break
      case "triggers":
        for (let col in conf[k]) {
          for (let v of conf[k][col]) {
            console.log(
              "addTrigger",
              col,
              (await db.addTrigger(v, col, auth))?.success
            )
          }
        }
        break
    }
  }
  process.exit()
}

module.exports = setupDB
