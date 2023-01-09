import { isNil, is, intersection } from "ramda"
import { parse } from "../../lib/utils"
import { err, clone } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { validate as validator } from "../../lib/jsonschema"

export const addRelayerJob = async (state, action, signer) => {
  signer ||= await validate(state, action, "addRelayerJob")
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "addRelayerJob",
    signer
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
      validator(undefined, clone(job.schema))
    } catch (e) {
      err("schema error")
    }
  }
  if (isNil(state.relayers)) state.relayers = {}
  state.relayers[jobID] = job
  return { state }
}
