import { isNil, last, init } from "ramda"
import { err, parse } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { removeData, getIndex } from "../../lib/index"

export const remove = async (state, action, signer, contractErr = true) => {
  signer ||= await validate(state, action, "delete")
  const { data, query, new_data, path, _data, col } = await parse(
    state,
    action,
    "delete",
    signer,
    0,
    contractErr
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let ind = getIndex(state, init(path))
  removeData(last(path), ind, col.__docs)
  _data.__data = null
  return { state }
}
