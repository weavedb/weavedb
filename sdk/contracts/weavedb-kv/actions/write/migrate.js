const { isNil, is, of, includes, mergeLeft, last } = require("ramda")
const { wrapResult, isEvolving, err, isOwner } = require("../../lib/utils")
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
  const old_version = state.version.split(".")
  const new_version = version.split(".")
  if (
    +old_version[0] === 0 &&
    +new_version[0] === 0 &&
    +old_version[1] < 27 &&
    +new_version[1] >= 27
  ) {
    err(`v${old_version} cannot be upgraded to v${new_version}`)
  }
  state.version = version
  last(state.evolveHistory).newVersion = version
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { migrate }
