import version from "./dev_version.js"
import { of } from "monade"
function verify({ state, msg, env: { kv, info } }) {
  if (info.id && info.id !== state.id)
    throw Error(`the wrong id: ${info.id}, ${msg.headers.id}`)
  of(arguments[0]).map(version)
  const acc = kv.get("_accounts", state.signer)
  const nonce = acc?.nonce ?? 0
  if (+state.nonce !== nonce + 1)
    throw Error(`the wrong nonce: ${state.nonce} (correct: ${nonce + 1})`)
  kv.put("_accounts", state.signer, { ...acc, nonce: nonce + 1 })
  return arguments[0]
}

export default verify
