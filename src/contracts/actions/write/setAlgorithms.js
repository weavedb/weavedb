import { isNil, is, intersection } from "ramda"
import { err, parse } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const setAlgorithms = async (state, action, signer) => {
  signer ||= await validate(state, action, "setAlgorithms")
  let { _data, data, query, new_data, path } = await parse(
    state,
    action,
    "setAlgorithms",
    signer
  )
  if (
    !is(Array)(new_data) ||
    intersection(new_data)(["secp256k1", "ed25519", "rsa256", "poseidon"])
      .length !== new_data.length
  ) {
    throw new ContractError(`The wrong algorithms`)
  }
  state.auth.algorithms = new_data
  return { state }
}
