import { isNil, is, intersection } from "ramda"
import { parse } from "../../lib/utils"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const setAlgorithms = async (state, action, signer) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "setAlgorithms"
    ))
  }

  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setAlgorithms",
    signer
  )
  if (
    !is(Array)(new_data) ||
    intersection(new_data)(["secp256k1", "ed25519", "rsa256", "secp256k1-2"])
      .length !== new_data.length
  ) {
    throw new ContractError(`The wrong algorithms`)
  }
  state.auth.algorithms = new_data
  return { state, result: { original_signer } }
}
