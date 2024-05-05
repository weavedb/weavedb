const { mapObjIndexed, isNil } = require("ramda")
module.exports = plugin =>
  mapObjIndexed((v, k) => {
    let _plugin = ""
    if (!isNil(plugin)) _plugin = `plugins/${plugin}/`

    let obj = require(`../../db/${_plugin}${k}`)
    return obj
  })({
    schemas: {},
    indexes: {},
    rules: {},
    relayers: {},
    triggers: {},
    crons: {},
  })
