import { includes } from "ramda"
import version from "./dev_version.js"
import { of } from "monade"

function verify({ state, msg, env: { kv, info } }) {
  of(arguments[0]).map(version)
  if (info.id && info.id !== state.id) throw Error("the wrong id")
  if (!includes(state.opcode, ["commit", "init"])) return arguments[0]
  const acc = kv.get("__accounts__", state.signer)
  const nonce = acc?.nonce ?? 0
  if (+state.nonce !== nonce + 1)
    throw Error(`the wrong nonce: ${state.nonce} (correct: ${nonce + 1})`)
  kv.put("__accounts__", state.signer, { ...acc, nonce: nonce + 1 })
  return arguments[0]
}

export default verify
