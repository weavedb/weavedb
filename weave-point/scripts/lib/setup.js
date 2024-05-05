const { assoc } = require("ramda")

const setup = async ({ db, conf, privateKey, relayer }) => {
  const auth = typeof privateKey === "object" ? privateKey : { privateKey }
  for (let k in conf) {
    switch (k) {
      case "rules":
        for (let col in conf[k]) {
          for (let key in conf[k][col]) {
            console.log(
              "setRules",
              col,
              conf[k][col][key][0],
              (
                await db.setRules(
                  conf[k][col][key][1],
                  col,
                  conf[k][col][key][0],
                  auth
                )
              )?.success
            )
          }
        }
        break
      case "schemas":
        for (let col in conf[k]) {
          console.log(
            "setSchema",
            col,
            (await db.setSchema(conf[k][col], col, auth))?.success
          )
        }
        break
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
      case "relayers":
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
      case "crons":
        for (let name in conf[k]) {
          console.log(
            "addCron",
            name,
            (await db.addCron(conf[k][name], name, auth))?.success
          )
        }
        break
    }
  }
}

module.exports = setup
