import { mergeLeft } from "ramda"
import { err } from "../../lib/utils"
import { validate } from "../../lib/validate"

export const evolve = async (state, action, signer) => {
  signer ||= await validate(state, action, "evolve")
  if (state.owner !== signer) err("Only the owner can evolve a contract.")
  if (state.canEvolve) {
    const prev_state = (
      await EXM.deterministicFetch(
        `https://${action.input.query.value}.exm.run`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ function: "read" }),
        }
      )
    ).asJSON().data.execution.state
    state = mergeLeft(prev_state, state)
    state.evolve = action.input.query.value
    return { state }
  } else {
    err(`This contract cannot evolve.`)
  }
  return { state }
}
