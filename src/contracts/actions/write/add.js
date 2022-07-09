import { isNil, over, lensPath, append } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"

export const add = async (state, action) => {
  let { _data, data, query, _signer, new_data, path } = await parse(
    state,
    action,
    "add"
  )
  if (!isNil(_data.__data)) err("doc already exists")
  _data = mergeData(_data, new_data, true)
  return { state }
}
