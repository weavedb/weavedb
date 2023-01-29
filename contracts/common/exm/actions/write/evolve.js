import { isNil, is, of, includes, mergeLeft } from "ramda"
import { clone, err } from "../../../lib/utils"
import { validate } from "../../../lib/validate"

export const evolve = async (state, action, signer) => {
  signer ||= await validate(state, action, "evolve")
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (!includes(signer)(owner)) err("Signer is not the owner.")
  if (state.canEvolve) {
    const prev_state = (
      await EXM.deterministicFetch(
        `https://${action.input.query.value}.exm.run`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ function: "copy" }),
        }
      )
    ).asJSON().data.execution.result
    if (isNil(prev_state) || prev_state.success !== true) {
      err("The previous contract doesn't allow evolve.")
    }
    let _state = mergeLeft(prev_state.result, state)
    _state.evolve = action.input.query.value
    return { state: _state }
  } else {
    err(`This contract cannot evolve.`)
  }
  return { state }
}
