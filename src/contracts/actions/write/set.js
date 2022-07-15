import { init, last, isNil, clone } from "ramda"
import { err, parse, mergeData, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { updateData, addData, getIndex } from "../../lib/index"

export const set = async (state, action, signer) => {
  signer ||= validate(state, action, "set")
  let { _data, data, query, new_data, path, schema, col } = await parse(
    state,
    action,
    "set",
    signer
  )
  let prev = clone(_data.__data)
  const next_data = mergeData(_data, new_data, true)
  validateSchema(schema, next_data.__data)
  let ind = getIndex(state, init(path))
  if (isNil(prev)) {
    addData(last(path), next_data.__data, ind, col.__docs)
  } else {
    updateData(last(path), next_data.__data, prev, ind, col.__docs)
  }
  _data = next_data
  return { state }
}
