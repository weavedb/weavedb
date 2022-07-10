import { isNil, over, lensPath, append } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const add = async (state, action, signer) => {
  signer ||= validate(state, action, "add")
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "add",
    signer
  )
  if (!isNil(_data.__data)) err("doc already exists")
  _data = mergeData(_data, new_data, true)
  return { state }
}
