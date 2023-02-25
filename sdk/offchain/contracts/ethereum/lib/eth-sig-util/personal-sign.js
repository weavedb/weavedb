const { isNullish, recoverPublicKey, legacyToBuffer } = require("./utils")
const {
  publicToAddress,
  bufferToHex,
  hashPersonalMessage,
} = require("../ethereumjs/util")
function getPublicKeyFor(message, signature) {
  const messageHash = hashPersonalMessage(legacyToBuffer(message))
  return recoverPublicKey(messageHash, signature)
}

function recoverPersonalSignature({ data, signature }) {
  if (isNullish(data)) {
    throw new Error("Missing data parameter")
  } else if (isNullish(signature)) {
    throw new Error("Missing signature parameter")
  }

  const publicKey = getPublicKeyFor(data, signature)
  const sender = publicToAddress(publicKey)
  const senderHex = bufferToHex(sender)
  return senderHex
}

module.exports = { recoverPersonalSignature }
