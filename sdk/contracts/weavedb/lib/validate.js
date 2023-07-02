const { isNil } = require("ramda")
const { err, auth } = require("../../common/lib/utils")

const validate = async (
  state,
  action,
  func,
  SmartWeave,
  use_nonce = true,
  kvs
) =>
  await auth(state, action, func, SmartWeave, (use_nonce = true), kvs, {
    useNonce,
  })

const useNonce = async (nonce, original_signer, state) => {
  let next_nonce = (state.nonces[original_signer] || 0) + 1
  if (next_nonce !== nonce) {
    err(
      `The wrong nonce[${nonce}] for ${original_signer}: expected ${next_nonce}`
    )
  }
  if (isNil(state.nonces[original_signer])) state.nonces[original_signer] = 0
  state.nonces[original_signer] += 1
}

module.exports = { validate }
