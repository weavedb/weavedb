import { isNil } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"

export const upsert = async (state, action) => {
  let { data, query, _signer, new_data, path, _data } = await parse(
    state,
    action,
    "upsert"
  )
  _data = mergeData(_data, new_data)
  return { state }
}
