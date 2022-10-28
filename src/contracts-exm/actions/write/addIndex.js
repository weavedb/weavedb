import { isNil, mergeLeft, init } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { addIndex as _addIndex, getIndex } from "../../lib/index"
export const addIndex = async (state, action, signer) => {
  signer ||= await validate(state, action, "addIndex")
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "addIndex",
    signer
  )
  let ind = getIndex(state, path)
  _addIndex(new_data, ind, col.__docs)
  return { state }
}
