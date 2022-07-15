import { isNil, over, lensPath, append, init, last } from "ramda"
import { err, parse, mergeData, getCol, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { addData, getIndex } from "../../lib/index"
export const add = async (state, action, signer) => {
  signer ||= validate(state, action, "add")
  let { _data, data, query, new_data, path, schema, col } = await parse(
    state,
    action,
    "add",
    signer
  )
  if (!isNil(_data.__data)) err("doc already exists")
  _data = mergeData(_data, new_data, true)
  validateSchema(schema, _data.__data)
  let ind = getIndex(state, init(path))
  addData(last(path), _data.__data, ind, col.__docs)
  return { state }
}
