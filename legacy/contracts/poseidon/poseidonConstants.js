import { handle as _ } from "../../sdk/contracts/poseidon/contract"

export async function handle(state, action) {
  return await _(state, action)
}
