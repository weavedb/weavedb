import { isNil } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const update = async (state, action, signer) => {
  signer ||= validate(state, action, "update")
  let { data, query, new_data, path, _data } = await parse(
    state,
    action,
    "update",
    signer
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  _data = mergeData(_data, new_data)
  return { state }
}
