import { isNil } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"

export const set = (state, action) => {
  let { _data, data, query, _signer, new_data, path } = parse(
    state,
    action,
    "set"
  )
  if (!isNil(_data.__data)) err(`Data already exists`)
  _data = mergeData(_data, new_data)
  return { state }
}
