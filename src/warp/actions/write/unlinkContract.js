import { isNil, is } from "ramda"
import { validate } from "../../../common/warp/lib/validate"
import { parse } from "../../lib/utils"
import { err } from "../../../common/warp/lib/utils"

export const unlinkContract = async (state, action, signer) => {
  signer ||= await validate(state, action, "unlinkContract")
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "unlinkContract",
    signer
  )
  const [key] = action.input.query
  if (isNil(key)) {
    throw new ContractError(`Key not specified`)
  }
  if (isNil(state.contracts)) state.contracts = {}
  delete state.contracts[key]
  return { state }
}
