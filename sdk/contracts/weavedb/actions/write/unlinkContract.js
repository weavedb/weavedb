const { isNil, is } = require("ramda")
const { validate } = require("../../lib/validate")
const { wrapResult, err, parse } = require("../../lib/utils")

const unlinkContract = async (
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
      "unlinkContract",
      SmartWeave
    ))
  }
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "unlinkContract",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  const [key] = action.input.query
  if (isNil(key)) {
    throw new ContractError(`Key not specified`)
  }
  if (isNil(state.contracts)) state.contracts = {}
  delete state.contracts[key]
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { unlinkContract }
