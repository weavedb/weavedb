import { isNil } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const set = async (state, action, signer) => {
  signer ||= validate(state, action, "set")
  let { _data, data, query, new_data, path, schema } = await parse(
    state,
    action,
    "set",
    signer
  )
  _data = mergeData(_data, new_data, true)
  return { state }
}
