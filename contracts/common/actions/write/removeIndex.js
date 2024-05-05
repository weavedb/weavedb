import { isNil, mergeLeft, init } from "ramda"
import { parse, mergeData } from "../../lib/utils"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { removeIndex as _removeIndex, getIndex } from "../../lib/index"

export const removeIndex = async (state, action, signer) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "removeIndex"
    ))
  }
  let { col, _data, data, query, new_data, path } = await parse(
    state,
    action,
    "removeIndex",
    signer
  )
  let ind = getIndex(state, path)
  _removeIndex(new_data, ind, col.__docs)
  return { state, result: { original_signer } }
}
