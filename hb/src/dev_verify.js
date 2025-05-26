function verify({ state, msg, env: { kv } }) {
  const acc = kv.get("__accounts__", state.signer)
  const nonce = acc?.nonce ?? 0
  if (+state.nonce !== nonce + 1) throw Error(`the wrong nonce: ${state.nonce}`)
  kv.put("__accounts__", state.signer, { ...acc, nonce: nonce + 1 })
  return arguments[0]
}

export default verify
