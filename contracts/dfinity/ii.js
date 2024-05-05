import { handle as _ } from "../../sdk/contracts/dfinity/contract"

export async function handle(state, action) {
  return await _(state, action)
}
