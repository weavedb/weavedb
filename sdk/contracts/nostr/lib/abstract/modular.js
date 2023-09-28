const {
  bitMask,
  numberToBytesBE,
  numberToBytesLE,
  bytesToNumberBE,
  bytesToNumberLE,
  validateObject,
} = require("./utils.js")

const _0n = BigInt(0),
  _1n = BigInt(1),
  _2n = BigInt(2),
  _3n = BigInt(3)
const _4n = BigInt(4),
  _5n = BigInt(5),
  _8n = BigInt(8)
const _9n = BigInt(9),
  _16n = BigInt(16)

function pow(num, power, modulo) {
  if (modulo <= _0n || power < _0n) throw new Error("Expected power/modulo > 0")
  if (modulo === _1n) return _0n
  let res = _1n
  while (power > _0n) {
    if (power & _1n) res = (res * num) % modulo
    num = (num * num) % modulo
    power >>= _1n
  }
  return res
}

function tonelliShanks(P) {
  const legendreC = (P - _1n) / _2n

  let Q, S, Z

  for (Q = P - _1n, S = 0; Q % _2n === _0n; Q /= _2n, S++);

  for (Z = _2n; Z < P && pow(Z, legendreC, P) !== P - _1n; Z++);

  if (S === 1) {
    const p1div4 = (P + _1n) / _4n
    return function tonelliFast(Fp, n) {
      const root = Fp.pow(n, p1div4)
      if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root")
      return root
    }
  }

  const Q1div2 = (Q + _1n) / _2n
  return function tonelliSlow(Fp, n) {
    if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE))
      throw new Error("Cannot find square root")
    let r = S
    let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q)
    let x = Fp.pow(n, Q1div2)
    let b = Fp.pow(n, Q)

    while (!Fp.eql(b, Fp.ONE)) {
      if (Fp.eql(b, Fp.ZERO)) return Fp.ZERO
      let m = 1
      for (let t2 = Fp.sqr(b); m < r; m++) {
        if (Fp.eql(t2, Fp.ONE)) break
        t2 = Fp.sqr(t2)
      }
      const ge = Fp.pow(g, _1n << BigInt(r - m - 1))
      g = Fp.sqr(ge)
      x = Fp.mul(x, ge)
      b = Fp.mul(b, g)
      r = m
    }
    return x
  }
}

function FpPow(f, num, power) {
  if (power < _0n) throw new Error("Expected power > 0")
  if (power === _0n) return f.ONE
  if (power === _1n) return num
  let p = f.ONE
  let d = num
  while (power > _0n) {
    if (power & _1n) p = f.mul(p, d)
    d = f.sqr(d)
    power >>= _1n
  }
  return p
}

function FpSqrt(P) {
  if (P % _4n === _3n) {
    const p1div4 = (P + _1n) / _4n
    return function sqrt3mod4(Fp, n) {
      const root = Fp.pow(n, p1div4)
      if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root")
      return root
    }
  }
  if (P % _8n === _5n) {
    const c1 = (P - _5n) / _8n
    return function sqrt5mod8(Fp, n) {
      const n2 = Fp.mul(n, _2n)
      const v = Fp.pow(n2, c1)
      const nv = Fp.mul(n, v)
      const i = Fp.mul(Fp.mul(nv, _2n), v)
      const root = Fp.mul(nv, Fp.sub(i, Fp.ONE))
      if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root")
      return root
    }
  }

  if (P % _16n === _9n) {
  }

  return tonelliShanks(P)
}
function mod(a, b) {
  const result = a % b
  return result >= _0n ? result : b + result
}
function pow2(x, power, modulo) {
  let res = x
  while (power-- > _0n) {
    res *= res
    res %= modulo
  }
  return res
}

function FpSqrtOdd(Fp, elm) {
  if (!Fp.isOdd) throw new Error(`Field doesn't have isOdd`)
  const root = Fp.sqrt(elm)
  return Fp.isOdd(root) ? root : Fp.neg(root)
}
function nLength(n, nBitLength) {
  const _nBitLength =
    nBitLength !== undefined ? nBitLength : n.toString(2).length
  const nByteLength = Math.ceil(_nBitLength / 8)
  return { nBitLength: _nBitLength, nByteLength }
}

function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint")
  const bitLength = fieldOrder.toString(2).length
  return Math.ceil(bitLength / 8)
}

function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder)
  return length + Math.ceil(length / 2)
}

function mapHashToField(key, fieldOrder, isLE = false) {
  const len = key.length
  const fieldLen = getFieldBytesLength(fieldOrder)
  const minLen = getMinHashLength(fieldOrder)
  // No small numbers: need to understand bias story. No huge numbers: easier to detect JS timings.
  if (len < 16 || len < minLen || len > 1024)
    throw new Error(`expected ${minLen}-1024 bytes of input, got ${len}`)
  const num = isLE ? bytesToNumberBE(key) : bytesToNumberLE(key)
  // `mod(x, 11)` can sometimes produce 0. `mod(x, 10) + 1` is the same, but no 0
  const reduced = mod(num, fieldOrder - _1n) + _1n
  return isLE
    ? numberToBytesLE(reduced, fieldLen)
    : numberToBytesBE(reduced, fieldLen)
}
function invert(number, modulo) {
  if (number === _0n || modulo <= _0n) {
    throw new Error(
      `invert: expected positive integers, got n=${number} mod=${modulo}`
    )
  }
  let a = mod(number, modulo)
  let b = modulo
  let x = _0n,
    y = _1n,
    u = _1n,
    v = _0n
  while (a !== _0n) {
    const q = b / a
    const r = b % a
    const m = x - u * q
    const n = y - v * q
    ;(b = a), (a = r), (x = u), (y = v), (u = m), (v = n)
  }
  const gcd = b
  if (gcd !== _1n) throw new Error("invert: does not exist")
  return mod(x, modulo)
}

function FpInvertBatch(f, nums) {
  const tmp = new Array(nums.length)
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (f.is0(num)) return acc
    tmp[i] = acc
    return f.mul(acc, num)
  }, f.ONE)
  const inverted = f.inv(lastMultiplied)
  nums.reduceRight((acc, num, i) => {
    if (f.is0(num)) return acc
    tmp[i] = f.mul(acc, tmp[i])
    return f.mul(acc, num)
  }, inverted)
  return tmp
}

function Field(ORDER, bitLen, isLE = false, redef = {}) {
  if (ORDER <= _0n) throw new Error(`Expected Field ORDER > 0, got ${ORDER}`)
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen)
  if (BYTES > 2048)
    throw new Error("Field lengths over 2048 bytes are not supported")
  const sqrtP = FpSqrt(ORDER)
  const f = Object.freeze({
    ORDER,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n,
    ONE: _1n,
    create: num => mod(num, ORDER),
    isValid: num => {
      if (typeof num !== "bigint")
        throw new Error(
          `Invalid field element: expected bigint, got ${typeof num}`
        )
      return _0n <= num && num < ORDER
    },
    is0: num => num === _0n,
    isOdd: num => (num & _1n) === _1n,
    neg: num => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,

    sqr: num => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),

    sqrN: num => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,

    inv: num => invert(num, ORDER),
    sqrt: redef.sqrt || (n => sqrtP(f, n)),
    invertBatch: lst => FpInvertBatch(f, lst),
    cmov: (a, b, c) => (c ? b : a),
    toBytes: num =>
      isLE ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: bytes => {
      if (bytes.length !== BYTES)
        throw new Error(`Fp.fromBytes: expected ${BYTES}, got ${bytes.length}`)
      return isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes)
    },
  })
  return Object.freeze(f)
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger",
  }
  const FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN",
  ]
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function"
    return map
  }, initial)
  return validateObject(field, opts)
}
module.exports = {
  pow2,
  mod,
  Field,
  validateField,
  invert,
  getMinHashLength,
  mapHashToField,
  nLength,
}
