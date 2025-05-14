const { err, auth, kv } = require("./utils")

const getAddressLink = async (_signer, state, kvs, SmartWeave) => {
  return await kv(kvs, SmartWeave).get(`auth.${_signer}`)
}

const useNonce = async (nonce, original_signer, state, kvs, SmartWeave) => {
  let next_nonce =
    ((await kv(kvs, SmartWeave).get(`nonce.${original_signer}`)) || 0) + 1
  if (next_nonce !== nonce) {
    err(
      `The wrong nonce[${nonce}] for ${original_signer}: expected ${next_nonce}`,
    )
  }
  await kv(kvs, SmartWeave).put(`nonce.${original_signer}`, next_nonce)
}

const validate = async (
  state,
  action,
  func,
  SmartWeave,
  use_nonce = true,
  kvs,
) =>
  await auth(state, action, func, SmartWeave, use_nonce, kvs, {
    useNonce,
    getAddressLink,
  })

module.exports = { validate }
