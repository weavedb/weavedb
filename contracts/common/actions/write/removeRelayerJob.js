import { isNil, is, intersection } from "ramda"
import { parse } from "../../lib/utils"
import { err, clone } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { validate as validator } from "../../lib/jsonschema"

export const removeRelayerJob = async (state, action, signer) => {
  signer ||= await validate(state, action, "removeRelayerJob")
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "removeRelayerJob",
    signer
  )
  const [jobID] = query
  if (isNil(state.relayers[jobID])) err("relayer job doesn't exist")
  delete state.relayers[jobID]
  return { state }
}
