const { pick } = require("ramda")
const { isEvolving } = require("../../../common/lib/utils")
const { kv } = require("../../lib/utils")

const getInfo = async (state, action, SmartWeave, kvs) => {
  let info = pick(
    [
      "auth",
      "canEvolve",
      "contracts",
      "evolve",
      "secure",
      "owner",
      "contracts",
      "bundlers",
      "hash",
      "rollup",
    ],
    state
  )
  info.version = state.version || null
  info.evolveHistory = state.evolveHistory || []
  info.isEvolving = isEvolving(state)
  info.rollup ??= { height: 0, hash: SmartWeave.contract.id }
  info.bundlers ??= []
  return { result: info }
}

module.exports = { getInfo }
