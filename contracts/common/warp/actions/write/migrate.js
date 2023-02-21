import { isNil, is, of, includes, mergeLeft, last } from "ramda"
import { isEvolving, err, isOwner } from "../../../lib/utils"
import { validate } from "../../../lib/validate"
import version from "../../../../warp/lib/version"

export const migrate = async (state, action, signer) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(state, action, "migrate"))
  }
  const owner = isOwner(signer, state)
  if (version !== action.input.query.version) {
    err(`version doesn't match (${version} : ${action.input.query.version})`)
  }
  if (!isEvolving(state)) err(`contract is not ready to migrate`)
  state.evolveHistory[state.evolveHistory.length - 1].newVersion = version
  return { state, result: { original_signer } }
}
