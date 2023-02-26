const {
  port = 9090,
  port_manager = 9091,
  config = "./weavedb.config.js",
} = require("yargs")(process.argv.slice(2)).argv

new (require("./lib/Gateway").Gateway)({
  conf: require(config),
  port,
  port_manager,
}).init()
