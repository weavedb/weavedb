const { isNil, is } = require("ramda")
const { validate } = require("../../lib/validate")
const { err, wrapResult, parse } = require("../../lib/utils")

const linkContract = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "linkContract",
      SmartWeave,
      true,
      kvs,
    ))
  }

  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "linkContract",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs,
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
