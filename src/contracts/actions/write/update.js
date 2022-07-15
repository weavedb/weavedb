import { isNil, clone, init, last } from "ramda"
import { err, parse, mergeData, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { updateData, getIndex } from "../../lib/index"

export const update = async (state, action, signer) => {
  signer ||= validate(state, action, "update")
  let { data, query, new_data, path, _data, schema, col } = await parse(
    state,
    action,
    "update",
    signer
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let prev = clone(_data.__data)
  const next_data = mergeData(_data, new_data, false, signer)
  validateSchema(schema, next_data.__data)
  let ind = getIndex(state, init(path))
  updateData(last(path), next_data.__data, prev, ind, col.__docs)
  _data = new_data
  return { state }
}
