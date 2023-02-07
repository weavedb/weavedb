import { isNil } from "ramda"
import { err } from "../../lib/utils"
const _version = require("../../../warp/lib/version")

export const version = async (state, action) => {
  if (isNil(_version)) err(`No version assigned`)
  return { result: _version }
}
