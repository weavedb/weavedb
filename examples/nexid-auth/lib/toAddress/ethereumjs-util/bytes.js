const BN = require("../bn.js")
const Buffer = require("../buffer").Buffer

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

function isHexPrefixed(str) {
  if (typeof str !== "string") {
    throw new Error(
      `[isHexPrefixed] input must be type 'string', received type ${typeof str}`
    )
  }

  return str[0] === "0" && str[1] === "x"
}

const stripHexPrefix = str => {
  if (typeof str !== "string")
    throw new Error(
      `[stripHexPrefix] input must be type 'string', received ${typeof str}`
    )

  return isHexPrefixed(str) ? str.slice(2) : str
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

function isHexString(value, length) {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/))
    return false

  if (length && value.length !== 2 + 2 * length) return false

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

  if (BN.isBN(v)) {
    if (v.isNeg()) {
      throw new Error(`Cannot convert negative BN to buffer. Given: ${v}`)
    }
    return v.toArrayLike(Buffer)
  }

  if (v.toArray) {
    return Buffer.from(v.toArray())
  }

  if (v.toBuffer) {
    return Buffer.from(v.toBuffer())
  }

  throw new Error("invalid type")
}

module.exports = {
  toBuffer,
}
