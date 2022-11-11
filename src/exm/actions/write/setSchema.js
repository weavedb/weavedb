import { isNil, mergeLeft } from "ramda"
import { err, parse, mergeData } from "../../lib/utils"
import { validate } from "../../lib/validate"
import { validator } from "@exodus/schemasafe"
export const setSchema = async (state, action, signer) => {
  signer ||= await validate(state, action, "setSchema")
  state.lastsss = signer
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setSchema",
    signer
  )
  _data.schema = new_data
  validator(JSON.parse(JSON.stringify(_data.schema)))
  return { state }
}
