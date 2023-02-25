import { handle as _ } from "../../sdk/offchain/contracts/ethereum/contract"

export async function handle(state, action) {
  return await _(state, action)
}
