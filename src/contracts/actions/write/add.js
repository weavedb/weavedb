import { isNil, over, lensPath, append, init, last } from "ramda"
import { err, parse, mergeData, getCol, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { addData, getIndex } from "../../lib/index"
export const add = async (state, action, signer, salt = 0) => {
  signer ||= validate(state, action, "add")
  let { _data, data, query, new_data, path, schema, col } = await parse(
    state,
    action,
    "add",
    signer,
    salt
  )
  if (!isNil(_data.__data)) err("doc already exists")
  const next_data = mergeData(_data, new_data, true, signer)
  validateSchema(schema, next_data.__data)
  let ind = getIndex(state, init(path))
  addData(last(path), next_data.__data, ind, col.__docs)
  _data = next_data
  return { state }
}
