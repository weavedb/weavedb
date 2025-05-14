import { handle as _ } from "../../sdk/contracts/polygon-id/contract"

export async function handle(state, action) {
  return await _(state, action)
}
