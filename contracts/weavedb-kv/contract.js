import { handle as _ } from "../../sdk/contracts/weavedb-kv/contract"

export async function handle(state, action) {
  return await _(state, action)
}
