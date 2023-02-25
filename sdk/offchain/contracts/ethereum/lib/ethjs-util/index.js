const { isHexPrefixed } = require("../ethereumjs/util")

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

module.exports = { stripHexPrefix, isHexString }
