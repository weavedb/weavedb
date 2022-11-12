import { isNil, mergeLeft } from "ramda"
import { parse, mergeData } from "../../lib/utils"
import { err } from "../../../common/warp/lib/utils"

export const getSchema = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "getSchema"
  )
  return { result: _data.schema || null }
}
