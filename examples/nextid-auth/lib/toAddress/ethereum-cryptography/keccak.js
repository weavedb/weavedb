function encode(str) {
  var out = [],
    p = 0
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i)
    if (c < 128) {
      out[p++] = c
    } else if (c < 2048) {
      out[p++] = (c >> 6) | 192
      out[p++] = (c & 63) | 128
    } else if (
      (c & 0xfc00) == 0xd800 &&
      i + 1 < str.length &&
      (str.charCodeAt(i + 1) & 0xfc00) == 0xdc00
    ) {
      c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff)
      out[p++] = (c >> 18) | 240
      out[p++] = ((c >> 12) & 63) | 128
      out[p++] = ((c >> 6) & 63) | 128
      out[p++] = (c & 63) | 128
    } else {
      out[p++] = (c >> 12) | 224
      out[p++] = ((c >> 6) & 63) | 128
      out[p++] = (c & 63) | 128
    }
  }
  return new Uint8Array(out)
}

function number(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`Wrong positive integer: ${n}`)
}

function bool(b) {
  if (typeof b !== "boolean") throw new Error(`Expected boolean, not ${b}`)
}

function bytes(b, ...lengths) {
  if (!(b instanceof Uint8Array)) throw new TypeError("Expected Uint8Array")
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new TypeError(
      `Expected Uint8Array of length ${lengths}, not of length=${b.length}`
    )
}

function hash(hash) {
  if (typeof hash !== "function" || typeof hash.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor")
  number(hash.outputLen)
  number(hash.blockLen)
}

function exists(instance, checkFinished = true) {
  if (instance.destroyed) throw new Error("Hash instance has been destroyed")
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called")
}
function output(out, instance) {
  bytes(out)
  const min = instance.outputLen
  if (out.length < min) {
    throw new Error(
      `digestInto() expects output buffer of length at least ${min}`
    )
  }
}

const assert = {
  number,
  bool,
  bytes,
  hash,
  exists,
  output,
}

function utf8ToBytes(str) {
  if (typeof str !== "string") {
    throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`)
  }
  return encode(str)
}

function toBytes(data) {
  if (typeof data === "string") data = utf8ToBytes(data)
  if (!(data instanceof Uint8Array))
    throw new TypeError(
      `Expected input type is Uint8Array (got ${typeof data})`
    )
  return data
}
function wrapConstructor(hashConstructor) {
  const hashC = message => {
    return hashConstructor().update(toBytes(message)).digest()
  }
  const tmp = hashConstructor()
  hashC.outputLen = tmp.outputLen
  hashC.blockLen = tmp.blockLen
  hashC.create = () => hashConstructor()
  return hashC
}

const U32_MASK64 = BigInt(2 ** 32 - 1)
const _32n = BigInt(32)
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number((n >> _32n) & U32_MASK64) }
  return {
    h: Number((n >> _32n) & U32_MASK64) | 0,
    l: Number(n & U32_MASK64) | 0,
  }
}
function split(lst, le = false) {
  let Ah = new Uint32Array(lst.length)
  let Al = new Uint32Array(lst.length)
  for (let i = 0; i < lst.length; i++) {
    const { h, l } = fromBig(lst[i], le)
    ;[Ah[i], Al[i]] = [h, l]
  }
  return [Ah, Al]
}
const toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0)
// for Shift in [0, 32)
const shrSH = (h, l, s) => h >>> s
const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s)
// Right rotate for Shift in [1, 32)
const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s))
const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s)
// Right rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32))
const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s))
// Right rotate for shift===32 (just swaps l&h)
const rotr32H = (h, l) => l
const rotr32L = (h, l) => h
// Left rotate for Shift in [1, 32)
const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s))
const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s))
// Left rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s))
const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s))
// JS uses 32-bit signed integers for bitwise operations which means we cannot
// simple take carry out of low bit sum by shift, we need to use division.
// Removing "export" has 5% perf penalty -_-
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0)
  return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 }
}
// Addition with more than 2 elements
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0)
const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0
const add4L = (Al, Bl, Cl, Dl) =>
  (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0)
const add4H = (low, Ah, Bh, Ch, Dh) =>
  (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0
const add5L = (Al, Bl, Cl, Dl, El) =>
  (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0)
const add5H = (low, Ah, Bh, Ch, Dh, Eh) =>
  (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0
const u64 = {
  fromBig,
  split,
  toBig,
  shrSH,
  shrSL,
  rotrSH,
  rotrSL,
  rotrBH,
  rotrBL,
  rotr32H,
  rotr32L,
  rotlSH,
  rotlSL,
  rotlBH,
  rotlBL,
  add,
  add3L,
  add3H,
  add4L,
  add4H,
  add5H,
  add5L,
}
const [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []]
const _0n = BigInt(0)
const _1n = BigInt(1)
const _2n = BigInt(2)
const _7n = BigInt(7)
const _256n = BigInt(256)
const _0x71n = BigInt(0x71)
for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
  // Pi
  ;[x, y] = [y, (2 * x + 3 * y) % 5]
  SHA3_PI.push(2 * (5 * y + x))
  // Rotational
  SHA3_ROTL.push((((round + 1) * (round + 2)) / 2) % 64)
  // Iota
  let t = _0n
  for (let j = 0; j < 7; j++) {
    R = ((R << _1n) ^ ((R >> _7n) * _0x71n)) % _256n
    if (R & _2n) t ^= _1n << ((_1n << BigInt(j)) - _1n)
  }
  _SHA3_IOTA.push(t)
}
const [SHA3_IOTA_H, SHA3_IOTA_L] = u64.split(_SHA3_IOTA, true)
const rotlH = (h, l, s) => (s > 32 ? u64.rotlBH(h, l, s) : u64.rotlSH(h, l, s))
const rotlL = (h, l, s) => (s > 32 ? u64.rotlBL(h, l, s) : u64.rotlSL(h, l, s))
const u32 = arr =>
  new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4))

function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2)
  // NOTE: all indices are x2 since we store state as u32 instead of u64 (bigints to slow in js)
  for (let round = 24 - rounds; round < 24; round++) {
    // Theta θ
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40]
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10
      const idx0 = (x + 2) % 10
      const B0 = B[idx0]
      const B1 = B[idx0 + 1]
      const Th = rotlH(B0, B1, 1) ^ B[idx1]
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1]
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th
        s[x + y + 1] ^= Tl
      }
    }
    // Rho (ρ) and Pi (π)
    let curH = s[2]
    let curL = s[3]
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t]
      const Th = rotlH(curH, curL, shift)
      const Tl = rotlL(curH, curL, shift)
      const PI = SHA3_PI[t]
      curH = s[PI]
      curL = s[PI + 1]
      s[PI] = Th
      s[PI + 1] = Tl
    }
    // Chi (χ)
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++) B[x] = s[y + x]
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10]
    }
    // Iota (ι)
    s[0] ^= SHA3_IOTA_H[round]
    s[1] ^= SHA3_IOTA_L[round]
  }
  B.fill(0)
}

class Hash {
  // Safe version that clones internal state
  clone() {
    return this._cloneInto()
  }
}
class Keccak extends Hash {
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
    super()
    this.blockLen = blockLen
    this.suffix = suffix
    this.outputLen = outputLen
    this.enableXOF = enableXOF
    this.rounds = rounds
    this.pos = 0
    this.posOut = 0
    this.finished = false
    this.destroyed = false
    // Can be passed from user as dkLen
    assert.number(outputLen)
    // 1600 = 5x5 matrix of 64bit.  1600 bits === 200 bytes
    if (0 >= this.blockLen || this.blockLen >= 200)
      throw new Error("Sha3 supports only keccak-f1600 function")
    this.state = new Uint8Array(200)
    this.state32 = u32(this.state)
  }
  keccak() {
    keccakP(this.state32, this.rounds)
    this.posOut = 0
    this.pos = 0
  }
  update(data) {
    assert.exists(this)
    const { blockLen, state } = this
    data = toBytes(data)
    const len = data.length
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos)
      for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++]
      if (this.pos === blockLen) this.keccak()
    }
    return this
  }
  finish() {
    if (this.finished) return
    this.finished = true
    const { state, suffix, pos, blockLen } = this
    // Do the padding
    state[pos] ^= suffix
    if ((suffix & 0x80) !== 0 && pos === blockLen - 1) this.keccak()
    state[blockLen - 1] ^= 0x80
    this.keccak()
  }
  writeInto(out) {
    assert.exists(this, false)
    assert.bytes(out)
    this.finish()
    const bufferOut = this.state
    const { blockLen } = this
    for (let pos = 0, len = out.length; pos < len; ) {
      if (this.posOut >= blockLen) this.keccak()
      const take = Math.min(blockLen - this.posOut, len - pos)
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos)
      this.posOut += take
      pos += take
    }
    return out
  }
  xofInto(out) {
    // Sha3/Keccak usage with XOF is probably mistake, only SHAKE instances can do XOF
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance")
    return this.writeInto(out)
  }
  xof(bytes) {
    assert.number(bytes)
    return this.xofInto(new Uint8Array(bytes))
  }
  digestInto(out) {
    assert.output(out, this)
    if (this.finished) throw new Error("digest() was already called")
    this.writeInto(out)
    this.destroy()
    return out
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen))
  }
  destroy() {
    this.destroyed = true
    this.state.fill(0)
  }
  _cloneInto(to) {
    const { blockLen, suffix, outputLen, rounds, enableXOF } = this
    to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds))
    to.state32.set(this.state32)
    to.pos = this.pos
    to.posOut = this.posOut
    to.finished = this.finished
    to.rounds = rounds
    // Suffix can change in cSHAKE
    to.suffix = suffix
    to.outputLen = outputLen
    to.enableXOF = enableXOF
    to.destroyed = this.destroyed
    return to
  }
}

const gen = (suffix, blockLen, outputLen) =>
  wrapConstructor(() => new Keccak(blockLen, suffix, outputLen))

const keccak_256 = gen(0x01, 136, 256 / 8)

function wrapHash(hash) {
  return msg => {
    assert.bytes(msg)
    return hash(msg)
  }
}

const __ = () => {
  const k = wrapHash(keccak_256)
  k.create = keccak_256.create
  return k
}

const keccak256 = __()

module.exports = { keccak256 }
