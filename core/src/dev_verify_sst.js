import { includes } from "ramda"

function verify({ state, msg, env: { kv } }) {
  if (!includes(state.opcode, ["commit", "init"])) return arguments[0]
  const acc = kv.get("__accounts__", state.signer)
  const nonce = acc?.nonce ?? 0
  if (+state.nonce !== nonce + 1)
    throw Error(`the wrong nonce: ${state.nonce} (correct: ${nonce + 1})`)
  kv.put("__accounts__", state.signer, { ...acc, nonce: nonce + 1 })
  return arguments[0]
}

export default verify
