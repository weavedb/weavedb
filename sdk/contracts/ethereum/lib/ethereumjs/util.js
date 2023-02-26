//import { Buffer } from "buffer"
const _secp256k1 = require("secp256k1")
const { keccak256 } = require("../ethereum-cryptography/keccak")

const assertIsBuffer = function (input) {
  if (!Buffer.isBuffer(input)) {
    const msg = `This method only supports Buffer but input was: ${input}`
    throw new Error(msg)
  }
}

const setLength = function (msg, length, right) {
  const buf = zeros(length)
  if (right) {
    if (msg.length < length) {
      msg.copy(buf)
      return buf
    }
    return msg.slice(0, length)
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length)
      return buf
    }
    return msg.slice(-length)
  }
}

const setLengthLeft = function (msg, length) {
  assertIsBuffer(msg)
  return setLength(msg, length, false)
}

const setLengthRight = function (msg, length) {
  assertIsBuffer(msg)
  return setLength(msg, length, true)
}

const intToHex = function (i) {
  if (!Number.isSafeInteger(i) || i < 0) {
    throw new Error(`Received an invalid integer type: ${i}`)
  }
  return `0x${i.toString(16)}`
}

const intToBuffer = function (i) {
  const hex = intToHex(i)
  return Buffer.from(padToEven(hex.slice(2)), "hex")
}

function padToEven(value) {
  let a = value

  if (typeof a !== "string") {
    throw new Error(
      `[padToEven] value must be type 'string', received ${typeof a}`
    )
  }

  if (a.length % 2) a = `0${a}`

  return a
}

function stripHexPrefix(str) {
  if (typeof str !== "string") {
    return str
  }

  return isHexPrefixed(str) ? str.slice(2) : str
}

function isHexString(value, length) {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false
  }

  if (length && value.length !== 2 + 2 * length) {
    return false
  }

  return true
}

const toBuffer = function (v) {
  if (v === null || v === undefined) {
    return Buffer.allocUnsafe(0)
  }

  if (Buffer.isBuffer(v)) {
    return Buffer.from(v)
  }

  if (Array.isArray(v) || v instanceof Uint8Array) {
    return Buffer.from(v)
  }

  if (typeof v === "string") {
    if (!isHexString(v)) {
      throw new Error(
        `Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: ${v}`
      )
    }
    return Buffer.from(padToEven(stripHexPrefix(v)), "hex")
  }

  if (typeof v === "number") {
    return intToBuffer(v)
  }

  if (typeof v === "bigint") {
    if (v < BigInt(0)) {
      throw new Error(`Cannot convert negative bigint to buffer. Given: ${v}`)
    }
    let n = v.toString(16)
    if (n.length % 2) n = "0" + n
    return Buffer.from(n, "hex")
  }

  if (v.toArray) {
    // converts a BN to a Buffer
    return Buffer.from(v.toArray())
  }

  if (v.toBuffer) {
    return Buffer.from(v.toBuffer())
  }

  throw new Error("invalid type")
}

const zeros = function (bytes) {
  return Buffer.allocUnsafe(bytes).fill(0)
}

function isHexPrefixed(str) {
  if (typeof str !== "string") {
    throw new Error(
      "[is-hex-prefixed] value must be type 'string', is currently type " +
        typeof str +
        ", while checking isHexPrefixed."
    )
  }

  return str.slice(0, 2) === "0x"
}

const addHexPrefix = function (str) {
  if (typeof str !== "string") {
    return str
  }

  return isHexPrefixed(str) ? str : "0x" + str
}

function arrToBufArr(arr) {
  if (!Array.isArray(arr)) {
    return Buffer.from(arr)
  }
  return arr.map(a => arrToBufArr(a))
}

const bufferToHex = function (buf) {
  buf = toBuffer(buf)
  return "0x" + buf.toString("hex")
}

function bufferToBigInt(buf) {
  const hex = bufferToHex(buf)
  if (hex === "0x") {
    return BigInt(0)
  }
  return BigInt(hex)
}

const bufferToInt = function (buf) {
  const res = Number(bufferToBigInt(buf))
  if (!Number.isSafeInteger(res)) throw new Error("Number exceeds 53 bits")
  return res
}

let secp256k1 = {}
secp256k1.recover = function (message, signature, recid, compressed) {
  return Buffer.from(
    _secp256k1.ecdsaRecover(
      Uint8Array.from(signature),
      recid,
      Uint8Array.from(message),
      compressed
    )
  )
}

secp256k1.publicKeyConvert = function (publicKey, compressed) {
  return Buffer.from(
    _secp256k1.publicKeyConvert(Uint8Array.from(publicKey), compressed)
  )
}

function isValidSigRecovery(recovery) {
  return recovery === BigInt(0) || recovery === BigInt(1)
}

function calculateSigRecovery(v, chainId) {
  if (v === BigInt(0) || v === BigInt(1)) return v

  if (chainId === undefined) {
    return v - BigInt(27)
  }
  return v - (chainId * BigInt(2) + BigInt(35))
}

const ecrecover = function (msgHash, v, r, s, chainId) {
  var signature = Buffer.concat([setLength(r, 32), setLength(s, 32)], 64)
  var recovery = calculateSigRecovery(v, chainId)
  if (!isValidSigRecovery(recovery)) {
    throw new Error("Invalid signature v value")
  }
  var senderPubKey = secp256k1.recover(msgHash, signature, Number(recovery))
  return secp256k1.publicKeyConvert(senderPubKey, false).slice(1)
}

const pubToAddress = function (pubKey, sanitize) {
  if (sanitize === void 0) {
    sanitize = false
  }
  pubKey = toBuffer(pubKey)
  if (sanitize && pubKey.length !== 64) {
    pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1)
  }
  //assert(pubKey.length === 64)
  if (pubKey.length !== 64) {
    throw new Error("Invalid length")
  }
  // Only take the lower 160bits of the hash
  return keccak256(pubKey).slice(-20)
}
const publicToAddress = pubToAddress

const fromRpcSig = function (sig) {
  const buf = toBuffer(sig)

  let r
  let s
  let v
  if (buf.length >= 65) {
    r = buf.slice(0, 32)
    s = buf.slice(32, 64)
    v = bufferToBigInt(buf.slice(64))
  } else if (buf.length === 64) {
    // Compact Signature Representation (https://eips.ethereum.org/EIPS/eip-2098)
    r = buf.slice(0, 32)
    s = buf.slice(32, 64)
    v = BigInt(bufferToInt(buf.slice(32, 33)) >> 7)
    s[0] &= 0x7f
  } else {
    throw new Error("Invalid signature length")
  }

  // support both versions of `eth_sign` responses
  if (v < 27) {
    v = v + BigInt(27)
  }

  return {
    v,
    r,
    s,
  }
}

const hashPersonalMessage = function (message) {
  assertIsBuffer(message)
  const prefix = Buffer.from(
    `\u0019Ethereum Signed Message:\n${message.length}`,
    "utf-8"
  )
  return Buffer.from(keccak256(Buffer.concat([prefix, message])))
}
module.exports = {
  setLengthLeft,
  setLengthRight,
  toBuffer,
  zeros,
  isHexPrefixed,
  addHexPrefix,
  arrToBufArr,
  bufferToBigInt,
  bufferToInt,
  ecrecover,
  publicToAddress,
  fromRpcSig,
  hashPersonalMessage,
  bufferToHex,
}
