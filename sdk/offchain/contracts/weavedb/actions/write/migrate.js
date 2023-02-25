const { isNil, is, of, includes, mergeLeft, last } = require("ramda")
const { isEvolving, err, isOwner } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const version = require("../../lib/version")

const migrate = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "migrate",
      SmartWeave
    ))
  }
  const owner = isOwner(signer, state)
  if (version !== action.input.query.version) {
    err(`version doesn't match (${version} : ${action.input.query.version})`)
  }
  if (!isEvolving(state)) err(`contract is not ready to migrate`)
  state.version = version
  state.evolveHistory[state.evolveHistory.length - 1].newVersion = version
  return {
    state,
    result: {
      original_signer,
      transaction: SmartWeave.transaction,
      block: SmartWeave.block,
    },
  }
}

module.exports = { migrate }
