import { isNil, clone as _clone, init, last } from "ramda"
import { err, parse, mergeData, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { updateData, addData, getIndex } from "../../lib/index"
const clone = obj => _clone(JSON.parse(JSON.stringify(obj)))

export const upsert = async (state, action, signer, contractErr = true) => {
  signer ||= await validate(state, action, "upsert")
  let {
    data,
    query,
    _signer,
    new_data,
    path,
    schema,
    _data,
    col,
    next_data,
  } = await parse(state, action, "upsert", signer, 0, contractErr)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  if (isNil(prev)) {
    addData(last(path), next_data, ind, col.__docs)
  } else {
    updateData(last(path), next_data, prev, ind, col.__docs)
  }
  _data.__data = next_data
  return { state }
}
