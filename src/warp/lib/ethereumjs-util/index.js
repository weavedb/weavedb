var BN = require("bn.js")
var _secp256k1 = require("secp256k1")
var ethjsUtil = require("../ethjs-util")
var { keccak256 } = require("../js-sha3/keccak")
exports.keccak = function (a, bits) {
  if (bits === void 0) {
    bits = 256
  }
  if (typeof a === "string" && !ethjsUtil.isHexString(a)) {
    a = Buffer.from(a, "utf8")
  } else {
    a = exports.toBuffer(a)
  }
  if (!bits) bits = 256
  switch (bits) {
    case 256: {
      return Buffer.from(keccak256.buffer(a))
    }
    default: {
      throw new Error("Invald algorithm: keccak" + bits)
    }
  }
}
exports.keccak256 = function (a) {
  return exports.keccak(a)
}

exports.isHexPrefixed = ethjsUtil.isHexPrefixed
exports.stripHexPrefix = ethjsUtil.stripHexPrefix
exports.toBuffer = function (v) {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v)
    } else if (typeof v === "string") {
      if (ethjsUtil.isHexString(v)) {
        v = Buffer.from(ethjsUtil.padToEven(ethjsUtil.stripHexPrefix(v)), "hex")
      } else {
        throw new Error(
          "Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: " +
            v
        )
      }
    } else if (typeof v === "number") {
      v = ethjsUtil.intToBuffer(v)
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0)
    } else if (BN.isBN(v)) {
      v = v.toArrayLike(Buffer)
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray())
    } else {
      throw new Error("invalid type")
    }
  }
  return v
}

exports.bufferToHex = function (buf) {
  buf = exports.toBuffer(buf)
  return "0x" + buf.toString("hex")
}

exports.zeros = function (bytes) {
  return Buffer.allocUnsafe(bytes).fill(0)
}

exports.setLengthLeft = function (msg, length, right) {
  if (right === void 0) {
    right = false
  }
  var buf = exports.zeros(length)
  msg = exports.toBuffer(msg)
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
exports.setLength = exports.setLengthLeft
exports.setLengthRight = function (msg, length) {
  return exports.setLength(msg, length, true)
}

exports.toBuffer = function (v) {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v)
    } else if (typeof v === "string") {
      if (ethjsUtil.isHexString(v)) {
        v = Buffer.from(ethjsUtil.padToEven(ethjsUtil.stripHexPrefix(v)), "hex")
      } else {
        throw new Error(
          "Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: " +
            v
        )
      }
    } else if (typeof v === "number") {
      v = ethjsUtil.intToBuffer(v)
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0)
    } else if (BN.isBN(v)) {
      v = v.toArrayLike(Buffer)
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray())
    } else {
      throw new Error("invalid type")
    }
  }
  return v
}

exports.fromRpcSig = function (sig) {
  var buf = exports.toBuffer(sig)
  // NOTE: with potential introduction of chainId this might need to be updated
  if (buf.length !== 65) {
    throw new Error("Invalid signature length")
  }
  var v = buf[64]
  // support both versions of `eth_sign` responses
  if (v < 27) {
    v += 27
  }
  return {
    v: v,
    r: buf.slice(0, 32),
    s: buf.slice(32, 64),
  }
}
function calculateSigRecovery(v, chainId) {
  return chainId ? v - (2 * chainId + 35) : v - 27
}
function isValidSigRecovery(recovery) {
  return recovery === 0 || recovery === 1
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

exports.ecrecover = function (msgHash, v, r, s, chainId) {
  var signature = Buffer.concat(
    [exports.setLength(r, 32), exports.setLength(s, 32)],
    64
  )
  var recovery = calculateSigRecovery(v, chainId)
  if (!isValidSigRecovery(recovery)) {
    throw new Error("Invalid signature v value")
  }
  var senderPubKey = secp256k1.recover(msgHash, signature, recovery)
  return secp256k1.publicKeyConvert(senderPubKey, false).slice(1)
}

exports.pubToAddress = function (pubKey, sanitize) {
  if (sanitize === void 0) {
    sanitize = false
  }
  pubKey = exports.toBuffer(pubKey)
  if (sanitize && pubKey.length !== 64) {
    pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1)
  }
  //assert(pubKey.length === 64)
  if (pubKey.length !== 64) {
    throw new Error("Invalid length")
  }
  // Only take the lower 160bits of the hash
  return exports.keccak(pubKey).slice(-20)
}
exports.publicToAddress = exports.pubToAddress

const assertIsBuffer = function (input) {
  if (!Buffer.isBuffer(input)) {
    const msg = `This method only supports Buffer but input was: ${input}`
    throw new Error(msg)
  }
}

exports.hashPersonalMessage = function (message) {
  const prefix = Buffer.from(
    `\u0019Ethereum Signed Message:\n${message.length}`,
    "utf-8"
  )
  return Buffer.from(exports.keccak(Buffer.concat([prefix, message])))
}
