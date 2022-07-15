import { isNil, clone, init, last } from "ramda"
import { err, parse, mergeData, validateSchema } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { updateData, addData, getIndex } from "../../lib/index"

export const upsert = async (state, action, signer) => {
  signer ||= validate(state, action, "upsert")
  let {
    data,
    query,
    _signer,
    new_data,
    path,
    schema,
    _data,
    col,
  } = await parse(state, action, "upsert", signer)
  let prev = clone(_data.__data)
  const next_data = mergeData(_data, new_data)
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
