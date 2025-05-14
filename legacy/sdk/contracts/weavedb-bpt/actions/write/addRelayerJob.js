const { isNil, is, intersection } = require("ramda")

const { clone } = require("../../lib/pure")
const { err, wrapResult, parse } = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { validate: validator } = require("../../lib/jsonschema")

const addRelayerJob = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
) => {
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }

  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "addRelayerJob",
      SmartWeave,
      true,
      kvs,
    ))
  }

  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "addRelayerJob",
    signer,
    null,
    contractErr,
    SmartWeave,
    kvs,
  )
  const [jobID, job] = query
  if (!isNil(job.relayers) && !is(Array, job.relayers)) {
    err("relayers must be Array")
  }
  if (!isNil(job.signers) && !is(Array, job.signers)) {
    err("signers must be Array")
  }
  if (!isNil(job.schema)) {
    try {
      const { error } = await validator(
        undefined,
        clone(job.schema),
        state,
        SmartWeave,
      )
      if (error) err("schema error")
    } catch (e) {
      err("schema error")
    }
  }
  if (isNil(state.relayers)) state.relayers = {}
  state.relayers[jobID] = job
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { addRelayerJob }
