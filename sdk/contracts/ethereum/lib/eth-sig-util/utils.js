const {
  toBuffer,
  bufferToHex,
  addHexPrefix,
  bufferToBigInt,
  bufferToInt,
  fromRpcSig,
  ecrecover,
} = require("../ethereumjs/util")
const { isHexString } = require("../ethjs-util")
function recoverPublicKey(messageHash, signature) {
  const sigParams = fromRpcSig(signature)
  return ecrecover(messageHash, sigParams.v, sigParams.r, sigParams.s)
}

function normalize(input) {
  if (!input) {
    return undefined
  }

  if (typeof input === "number") {
    if (input < 0) {
      return "0x"
    }
    const buffer = toBuffer(input)
    input = bufferToHex(buffer)
  }

  if (typeof input !== "string") {
    let msg = "eth-sig-util.normalize() requires hex string or integer input."
    msg += ` received ${typeof input}: ${input}`
    throw new Error(msg)
  }

  return addHexPrefix(input.toLowerCase())
}

function isNullish(value) {
  return value === null || value === undefined
}

function numberToBuffer(num) {
  const hexVal = num.toString(16)
  const prepend = hexVal.length % 2 ? "0" : ""
  return Buffer.from(prepend + hexVal, "hex")
}

function legacyToBuffer(value) {
  return typeof value === "string" && !isHexString(value)
    ? Buffer.from(value)
    : toBuffer(value)
}

module.exports = {
  recoverPublicKey,
  normalize,
  isNullish,
  numberToBuffer,
  legacyToBuffer,
}
