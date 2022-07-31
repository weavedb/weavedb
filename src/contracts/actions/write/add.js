import { isNil, over, lensPath, append, init, last, clone } from "ramda"
import { err, parse, mergeData, getCol, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { addData, getIndex } from "../../lib/index"
export const add = async (state, action, signer, salt = 0) => {
  signer ||= validate(state, action, "add")
  let {
    _data,
    data,
    query,
    new_data,
    path,
    schema,
    col,
    next_data,
  } = await parse(state, action, "add", signer, salt)
  if (!isNil(_data.__data)) err("doc already exists")
  validateSchema(schema, next_data)
  let ind = getIndex(state, init(path))
  addData(last(path), next_data, ind, col.__docs)
  _data.__data = next_data
  return { state }
}
