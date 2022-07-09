import { isNil } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"

export const update = async (state, action) => {
  let { data, query, _signer, new_data, path, _data } = await parse(
    state,
    action,
    "update"
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  _data = mergeData(_data, new_data)
  return { state }
}
