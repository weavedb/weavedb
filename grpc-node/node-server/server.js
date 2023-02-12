const { port = 9090, config = "./weavedb.config.js" } = require("yargs")(
  process.argv.slice(2)
).argv

new (require("./lib/node").Node)({ conf: require(config), port }).init()
