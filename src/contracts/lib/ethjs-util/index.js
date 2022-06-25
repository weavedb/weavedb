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

function padToEven(value) {
  var a = value // eslint-disable-line

  if (typeof a !== "string") {
    throw new Error(
      "[ethjs-util] while padding to even, value must be string, is currently " +
        typeof a +
        ", while padToEven."
    )
  }

  if (a.length % 2) {
    a = "0" + a
  }

  return a
}

function intToHex(i) {
  var hex = i.toString(16) // eslint-disable-line

  return "0x" + hex
}

function intToBuffer(i) {
  var hex = intToHex(i)

  return new Buffer(padToEven(hex.slice(2)), "hex")
}

module.exports = { intToBuffer, padToEven, isHexString, stripHexPrefix }
