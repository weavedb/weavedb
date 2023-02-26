import { handle as _ } from "../../sdk/contracts/ethereum/contract"

export async function handle(state, action) {
  return await _(state, action)
}
