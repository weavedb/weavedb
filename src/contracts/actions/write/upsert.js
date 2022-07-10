import { isNil } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const upsert = async (state, action, signer) => {
  signer ||= validate(state, action, "upsert")
  let { data, query, _signer, new_data, path, _data } = await parse(
    state,
    action,
    "upsert",
    signer
  )
  _data = mergeData(_data, new_data)
  return { state }
}
