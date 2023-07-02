const { isNil, is } = require("ramda")
const { validate } = require("../../lib/validate")
const { parse } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")

const linkContract = async (
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
      "linkContract",
      SmartWeave
    ))
  }

  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "linkContract",
    signer,
    null,
    contractErr,
    SmartWeave
  )
  const [key, address] = action.input.query
  if (isNil(key) || isNil(address)) {
    err(`Key or Address not specified`)
  }
  if (isNil(state.contracts)) state.contracts = {}
  state.contracts[key] = address
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { linkContract }
