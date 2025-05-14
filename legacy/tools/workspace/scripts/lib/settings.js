const { mapObjIndexed } = require("ramda")
module.exports = mapObjIndexed((v, k) => {
  let obj = require(`../../db/${k}`)
  return obj
})({
  schemas: {},
  indexes: {},
  rules: {},
  relayers: {},
  triggers: {},
  crons: {},
})
