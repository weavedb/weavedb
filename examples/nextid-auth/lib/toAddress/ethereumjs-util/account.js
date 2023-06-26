const Buffer = require("../buffer").Buffer

const assert = valid => {
  if (valid !== true) throw new Error()
}
const { publicKeyConvert } = require("../secp256k1")
const { keccak256: k256 } = require("../ethereum-cryptography/keccak")
const BN = require("../bn.js")
const { toBuffer } = require("./bytes")

const keccak = function (a, bits = 256) {
  assertIsBuffer(a)
  switch (bits) {
    case 256: {
      return k256(a)
    }
    default: {
      throw new Error(`Invald algorithm: keccak${bits}`)
    }
  }
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

function isHexString(value, length) {
  if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/))
    return false

  if (length && value.length !== 2 + 2 * length) return false

  return true
}

const assertIsHexString = function (input) {
  if (!isHexString(input)) {
    const msg = `This method only supports 0x-prefixed hex strings but input was: ${input}`
    throw new Error(msg)
  }
}

const assertIsBuffer = function (input) {
  if (!Buffer.isBuffer(input)) {
    const msg = `This method only supports Buffer but input was: ${input}`
    throw new Error(msg)
  }
}

const assertIsString = function (input) {
  if (typeof input !== "string") {
    const msg = `This method only supports strings but input was: ${input}`
    throw new Error(msg)
  }
}

const pubToAddress = function (pubKey, sanitize = false) {
  assertIsBuffer(pubKey)
  if (sanitize && pubKey.length !== 64) {
    pubKey = Buffer.from(publicKeyConvert(pubKey, false).slice(1))
  }
  assert(pubKey.length === 64)
  // Only take the lower 160bits of the hash
  return Buffer.from(keccak(pubKey)).slice(-20)
}

function toType(input, outputType) {
  if (input === null) {
    return null
  }
  if (input === undefined) {
    return undefined
  }

  if (typeof input === "string" && !isHexString(input)) {
    throw new Error(
      `A string must be provided with a 0x-prefix, given: ${input}`
    )
  } else if (typeof input === "number" && !Number.isSafeInteger(input)) {
    throw new Error(
      "The provided number is greater than MAX_SAFE_INTEGER (please use an alternative input type)"
    )
  }

  const output = toBuffer(input)

  if (outputType === Buffer) {
    return output
  } else if (outputType === BN) {
    return new BN(output)
  } else if (outputType === Number) {
    const bn = new BN(output)
    const max = new BN(Number.MAX_SAFE_INTEGER.toString())
    if (bn.gt(max)) {
      throw new Error(
        "The provided number is greater than MAX_SAFE_INTEGER (please use an alternative output type)"
      )
    }
    return bn.toNumber()
  } else {
    // outputType === TypeOutput.PrefixedHexString
    return `0x${output.toString("hex")}`
  }
}

const keccakFromString = function (a, bits = 256) {
  assertIsString(a)
  const buf = Buffer.from(a, "utf8")
  return keccak(buf, bits)
}

const toChecksumAddress = function (hexAddress, eip1191ChainId) {
  assertIsHexString(hexAddress)
  const address = stripHexPrefix(hexAddress).toLowerCase()

  let prefix = ""
  if (eip1191ChainId) {
    const chainId = toType(eip1191ChainId, BN)
    prefix = chainId.toString() + "0x"
  }

  const hash = keccakFromString(prefix + address).toString("hex")
  let ret = "0x"

  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}

module.exports = {
  pubToAddress,
  toChecksumAddress,
}
