import { init, last, isNil, clone as _clone } from "ramda"
import { parse, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { updateData, addData, getIndex } from "../../lib/index"
const clone = obj => _clone(JSON.parse(JSON.stringify(obj)))
export const set = async (state, action, signer, contractErr = true) => {
  signer ||= await validate(state, action, "set")
  let {
    _data,
    data,
    query,
    new_data,
    path,
    schema,
    col,
    next_data,
    doc,
  } = await parse(state, action, "set", signer, 0, contractErr)
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
