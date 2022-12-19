import {
  toBuffer,
  bufferToHex,
  addHexPrefix,
  bufferToBigInt,
  bufferToInt,
  fromRpcSig,
  ecrecover,
} from "../ethereumjs/util"
import { isHexString } from "../ethjs-util"
export function recoverPublicKey(messageHash, signature) {
  const sigParams = fromRpcSig(signature)
  return ecrecover(messageHash, sigParams.v, sigParams.r, sigParams.s)
}

export function normalize(input) {
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

export function isNullish(value) {
  return value === null || value === undefined
}

export function numberToBuffer(num) {
  const hexVal = num.toString(16)
  const prepend = hexVal.length % 2 ? "0" : ""
  return Buffer.from(prepend + hexVal, "hex")
}
export function legacyToBuffer(value) {
  return typeof value === "string" && !isHexString(value)
    ? Buffer.from(value)
    : toBuffer(value)
}
