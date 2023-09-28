const { verifySignature, validateEvent } = require("../../lib/nostr-tools")

const verify = async (state, action) => {
  const { event } = action.input
  return { result: { isValid: validateEvent(event) && verifySignature(event) } }
}

module.exports = verify
