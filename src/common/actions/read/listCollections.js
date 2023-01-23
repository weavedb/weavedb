import { keys, isNil, mergeLeft } from "ramda"
import { parse, mergeData } from "../../lib/utils"
import { err } from "../../lib/utils"

export const listCollections = async (state, action) => {
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "listCollections"
  )
  return {
    result: keys(path.length === 0 ? data : data.subs),
  }
}
