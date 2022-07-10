import { isNil } from "ramda"
import { err, parse } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const remove = async (state, action, signer) => {
  signer ||= validate(state, action, "delete")
  const { data, query, new_data, path, _data } = await parse(
    state,
    action,
    "delete",
    signer
  )
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  _data.__data = null
  return { state }
}
