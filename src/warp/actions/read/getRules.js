import { isNil, mergeLeft } from "ramda"
import { parse, mergeData } from "../../lib/utils"
import { err } from "../../../common/warp/lib/utils"
export const getRules = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getRules"
  )
  return { result: _data.rules || null }
}
