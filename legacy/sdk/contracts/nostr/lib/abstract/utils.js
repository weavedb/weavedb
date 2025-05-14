const _0n = BigInt(0)
const _1n = BigInt(1)
const _2n = BigInt(2)
const bitMask = n => (_2n << BigInt(n - 1)) - _1n
const u8a = a => a instanceof Uint8Array

const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0")
)

function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex)
  return BigInt(hex === "" ? "0" : `0x${hex}`)
}

const asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 }
function asciiToBase16(char) {
  if (char >= asciis._0 && char <= asciis._9) return char - asciis._0
  if (char >= asciis._A && char <= asciis._F) return char - (asciis._A - 10)
  if (char >= asciis._a && char <= asciis._f) return char - (asciis._a - 10)
  return
}

function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex)
  const hl = hex.length
  const al = hl / 2
  if (hl % 2)
    throw new Error(
      "padded hex string expected, got unpadded hex of length " + hl
    )
  const array = new Uint8Array(al)
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi))
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1))
    if (n1 === undefined || n2 === undefined) {
      const char = hex[hi] + hex[hi + 1]
      throw new Error(
        'hex string expected, got non-hex character "' +
          char +
          '" at index ' +
          hi
      )
    }
    array[ai] = n1 * 16 + n2
  }
  return array
}
function bytesToHex(bytes) {
  if (!u8a(bytes)) throw new Error("Uint8Array expected")
  let hex = ""
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]]
  }
  return hex
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes))
}
function bytesToNumberLE(bytes) {
  if (!u8a(bytes)) throw new Error("Uint8Array expected")
  return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()))
}

function numberToBytesBE(n, len) {
  return hexToBytes(n.toString(16).padStart(len * 2, "0"))
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse()
}

function concatBytes(...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0))
  let pad = 0 // walk through each item, ensure they have proper type
  arrays.forEach(a => {
    if (!u8a(a)) throw new Error("Uint8Array expected")
    r.set(a, pad)
    pad += a.length
  })
  return r
}

function ensureBytes(title, hex, expectedLength) {
  let res
  if (typeof hex === "string") {
    try {
      res = hexToBytes(hex)
    } catch (e) {
      throw new Error(
        `${title} must be valid hex string, got "${hex}". Cause: ${e}`
      )
    }
  } else if (u8a(hex)) {
    // Uint8Array.from() instead of hash.slice() because node.js Buffer
    // is instance of Uint8Array, and its slice() creates **mutable** copy
    res = Uint8Array.from(hex)
  } else {
    throw new Error(`${title} must be hex string or Uint8Array`)
  }
  const len = res.length
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`)
  return res
}

const validatorFns = {
  bigint: val => typeof val === "bigint",
  function: val => typeof val === "function",
  boolean: val => typeof val === "boolean",
  string: val => typeof val === "string",
  stringOrUint8Array: val =>
    typeof val === "string" || val instanceof Uint8Array,
  isSafeInteger: val => Number.isSafeInteger(val),
  array: val => Array.isArray(val),
  field: (val, object) => object.Fp.isValid(val),
  hash: val => typeof val === "function" && Number.isSafeInteger(val.outputLen),
}

function validateObject(object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type]
    if (typeof checkVal !== "function")
      throw new Error(`Invalid validator "${type}", expected function`)

    const val = object[fieldName]
    if (isOptional && val === undefined) return
    if (!checkVal(val, object)) {
      throw new Error(
        `Invalid param ${String(
          fieldName
        )}=${val} (${typeof val}), expected ${type}`
      )
    }
  }
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false)
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true)
  return object
}
function bytesToHex(bytes) {
  if (!u8a(bytes)) throw new Error("Uint8Array expected")
  // pre-caching improves the speed 6x
  let hex = ""
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]]
  }
  return hex
}

function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex)
  const hl = hex.length
  const al = hl / 2
  if (hl % 2)
    throw new Error(
      "padded hex string expected, got unpadded hex of length " + hl
    )
  const array = new Uint8Array(al)
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi))
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1))
    if (n1 === undefined || n2 === undefined) {
      const char = hex[hi] + hex[hi + 1]
      throw new Error(
        'hex string expected, got non-hex character "' +
          char +
          '" at index ' +
          hi
      )
    }
    array[ai] = n1 * 16 + n2
  }
  return array
}

function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number")
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number")
  if (typeof hmacFn !== "function") throw new Error("hmacFn must be a function")
  // Step B, Step C: set hashLen to 8*ceil(hlen/8)
  let v = u8n(hashLen) // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
  let k = u8n(hashLen) // Steps B and C of RFC6979 3.2: set hashLen, in our case always same
  let i = 0 // Iterations counter, will throw when over 1000
  const reset = () => {
    v.fill(1)
    k.fill(0)
    i = 0
  }
  const h = (...b) => hmacFn(k, v, ...b) // hmac(k)(v, ...values)
  const reseed = (seed = u8n()) => {
    // HMAC-DRBG reseed() function. Steps D-G
    k = h(u8fr([0x00]), seed) // k = hmac(k || v || 0x00 || seed)
    v = h() // v = hmac(k || v)
    if (seed.length === 0) return
    k = h(u8fr([0x01]), seed) // k = hmac(k || v || 0x01 || seed)
    v = h() // v = hmac(k || v)
  }
  const gen = () => {
    // HMAC-DRBG generate() function
    if (i++ >= 1000) throw new Error("drbg: tried 1000 values")
    let len = 0
    const out = []
    while (len < qByteLen) {
      v = h()
      const sl = v.slice()
      out.push(sl)
      len += v.length
    }
    return concatBytes(...out)
  }
  const genUntil = (seed, pred) => {
    reset()
    reseed(seed) // Steps D-G
    let res = undefined // Step H: grind until k is in [1..n-1]
    while (!(res = pred(gen()))) reseed()
    reset()
    return res
  }
  return genUntil
}

module.exports = {
  bitMask,
  numberToBytesBE,
  numberToBytesLE,
  bytesToNumberBE,
  bytesToNumberLE,
  concatBytes,
  ensureBytes,
  validateObject,
  bytesToHex,
  hexToBytes,
  createHmacDrbg,
}
