const { isNil, is, intersection } = require("ramda")
const { parse, clone } = require("../../lib/utils")
const { err, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")

const removeRelayerJob = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "removeRelayerJob",
      SmartWeave,
      true,
      kvs
    ))
  }
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "removeRelayerJob",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs
  )
  const [jobID] = query
  if (isNil(state.relayers[jobID])) err("relayer job doesn't exist")
  delete state.relayers[jobID]
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { removeRelayerJob }
