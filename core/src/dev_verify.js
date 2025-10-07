function verify({ state, msg, env: { kv } }) {
  const acc = kv.get("_accounts", state.signer)
  const nonce = acc?.nonce ?? 0
  if (+state.nonce !== nonce + 1) throw Error(`the wrong nonce: ${state.nonce}`)
  kv.put("_accounts", state.signer, { ...acc, nonce: nonce + 1 })
  return arguments[0]
}

export default verify
