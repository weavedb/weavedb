import { handle as _ } from "../../sdk/contracts/intmax/contract"

export async function handle(state, action) {
  return await _(state, action)
}
