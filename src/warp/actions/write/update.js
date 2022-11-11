import { isNil, clone, init, last } from "ramda"
import { err, parse, mergeData, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { updateData, getIndex } from "../../lib/index"

export const update = async (state, action, signer, contractErr = true) => {
  signer ||= await validate(state, action, "update")
  let {
    data,
    query,
    new_data,
    path,
    _data,
    schema,
    col,
    next_data,
  } = await parse(state, action, "update", signer, 0, contractErr)
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let prev = clone(_data.__data)
  validateSchema(schema, next_data, contractErr)
  let ind = getIndex(state, init(path))
  updateData(last(path), next_data, prev, ind, col.__docs)
  _data.__data = next_data
  return { state }
}
