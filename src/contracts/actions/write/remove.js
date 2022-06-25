import { isNil } from "ramda"
import { err, parse } from "../../lib/utils"

export const remove = (state, action) => {
  const { data, query, _signer, new_data, path, _data } = parse(
    state,
    action,
    "delete"
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  _data.__data = null
  return { state }
}
