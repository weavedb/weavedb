/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const mod = require("./modular.js")
const ut = require("./utils.js")
const { ensureBytes } = require("./utils.js")
const { wNAF, validateBasic } = require("./curve.js")

function validatePointOpts(curve) {
  const opts = validateBasic(curve)
  ut.validateObject(
    opts,
    {
      a: "field",
      b: "field",
    },
    {
      allowedPrivateKeyLengths: "array",
      wrapPrivateKey: "boolean",
      isTorsionFree: "function",
      clearCofactor: "function",
      allowInfinityPoint: "boolean",
      fromBytes: "function",
      toBytes: "function",
    }
  )
  const { endo, Fp, a } = opts
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error(
        "Endomorphism can only be defined for Koblitz curves that have a=0"
      )
    }
    if (
      typeof endo !== "object" ||
      typeof endo.beta !== "bigint" ||
      typeof endo.splitScalar !== "function"
    ) {
      throw new Error(
        "Expected endomorphism with beta: bigint and splitScalar: function"
      )
    }
  }
  return Object.freeze({ ...opts })
}

const _0n = BigInt(0),
  _1n = BigInt(1),
  _2n = BigInt(2),
  _3n = BigInt(3),
  _4n = BigInt(4)

function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts)
  const { Fp } = CURVE

  const toBytes =
    CURVE.toBytes ||
    ((_c, point, _isCompressed) => {
      const a = point.toAffine()
      return ut.concatBytes(
        Uint8Array.from([0x04]),
        Fp.toBytes(a.x),
        Fp.toBytes(a.y)
      )
    })
  const fromBytes =
    CURVE.fromBytes ||
    (bytes => {
      const tail = bytes.subarray(1)
      const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES))
      const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
      return { x, y }
    })

  function weierstrassEquation(x) {
    const { a, b } = CURVE
    const x2 = Fp.sqr(x)
    const x3 = Fp.mul(x2, x)
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b)
  }
  if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx)))
    throw new Error("bad generator point: equation left != right")

  function isWithinCurveOrder(num) {
    return typeof num === "bigint" && _0n < num && num < CURVE.n
  }
  function assertGE(num) {
    if (!isWithinCurveOrder(num))
      throw new Error("Expected valid bigint: 0 < bigint < curve.n")
  }

  const pointPrecomputes = new Map()
  function assertPrjPoint(other) {
    if (!(other instanceof Point)) throw new Error("ProjectivePoint expected")
  }
  class Point {
    static BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE)
    static ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO)

    constructor(px, py, pz) {
      this.px = px
      this.py = py
      this.pz = pz
      if (px == null || !Fp.isValid(px)) throw new Error("x required")
      if (py == null || !Fp.isValid(py)) throw new Error("y required")
      if (pz == null || !Fp.isValid(pz)) throw new Error("z required")
    }

    static fromAffine(p) {
      const { x, y } = p || {}
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point")
      if (p instanceof Point) throw new Error("projective point not allowed")
      const is0 = i => Fp.eql(i, Fp.ZERO)
      if (is0(x) && is0(y)) return Point.ZERO
      return new Point(x, y, Fp.ONE)
    }

    get x() {
      return this.toAffine().x
    }
    get y() {
      return this.toAffine().y
    }

    static normalizeZ(points) {
      const toInv = Fp.invertBatch(points.map(p => p.pz))
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine)
    }

    static fromHex(hex) {
      const P = Point.fromAffine(fromBytes(ensureBytes("pointHex", hex)))
      P.assertValidity()
      return P
    }

    _setWindowSize(windowSize) {
      this._WINDOW_SIZE = windowSize
      pointPrecomputes.delete(this)
    }

    assertValidity() {
      if (this.is0()) {
        if (CURVE.allowInfinityPoint && !Fp.is0(this.py)) return
        throw new Error("bad point: ZERO")
      }
      const { x, y } = this.toAffine()
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not FE")
      const left = Fp.sqr(y)
      const right = weierstrassEquation(x)
      if (!Fp.eql(left, right))
        throw new Error("bad point: equation left != right")
      if (!this.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup")
    }
    hasEvenY() {
      const { y } = this.toAffine()
      if (Fp.isOdd) return !Fp.isOdd(y)
      throw new Error("Field doesn't support isOdd")
    }

    equals(other) {
      assertPrjPoint(other)
      const { px: X1, py: Y1, pz: Z1 } = this
      const { px: X2, py: Y2, pz: Z2 } = other
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1))
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1))
      return U1 && U2
    }

    negate() {
      return new Point(this.px, Fp.neg(this.py), this.pz)
    }

    double() {
      const { a, b } = CURVE
      const b3 = Fp.mul(b, _3n)
      const { px: X1, py: Y1, pz: Z1 } = this
      let X3 = Fp.ZERO,
        Y3 = Fp.ZERO,
        Z3 = Fp.ZERO
      let t0 = Fp.mul(X1, X1)
      let t1 = Fp.mul(Y1, Y1)
      let t2 = Fp.mul(Z1, Z1)
      let t3 = Fp.mul(X1, Y1)
      t3 = Fp.add(t3, t3)
      Z3 = Fp.mul(X1, Z1)
      Z3 = Fp.add(Z3, Z3)
      X3 = Fp.mul(a, Z3)
      Y3 = Fp.mul(b3, t2)
      Y3 = Fp.add(X3, Y3)
      X3 = Fp.sub(t1, Y3)
      Y3 = Fp.add(t1, Y3)
      Y3 = Fp.mul(X3, Y3)
      X3 = Fp.mul(t3, X3)
      Z3 = Fp.mul(b3, Z3)
      t2 = Fp.mul(a, t2)
      t3 = Fp.sub(t0, t2)
      t3 = Fp.mul(a, t3)
      t3 = Fp.add(t3, Z3)
      Z3 = Fp.add(t0, t0)
      t0 = Fp.add(Z3, t0)
      t0 = Fp.add(t0, t2)
      t0 = Fp.mul(t0, t3)
      Y3 = Fp.add(Y3, t0)
      t2 = Fp.mul(Y1, Z1)
      t2 = Fp.add(t2, t2)
      t0 = Fp.mul(t2, t3)
      X3 = Fp.sub(X3, t0)
      Z3 = Fp.mul(t2, t1)
      Z3 = Fp.add(Z3, Z3)
      Z3 = Fp.add(Z3, Z3)
      return new Point(X3, Y3, Z3)
    }

    add(other) {
      assertPrjPoint(other)
      const { px: X1, py: Y1, pz: Z1 } = this
      const { px: X2, py: Y2, pz: Z2 } = other
      let X3 = Fp.ZERO,
        Y3 = Fp.ZERO,
        Z3 = Fp.ZERO
      const a = CURVE.a
      const b3 = Fp.mul(CURVE.b, _3n)
      let t0 = Fp.mul(X1, X2)
      let t1 = Fp.mul(Y1, Y2)
      let t2 = Fp.mul(Z1, Z2)
      let t3 = Fp.add(X1, Y1)
      let t4 = Fp.add(X2, Y2)
      t3 = Fp.mul(t3, t4)
      t4 = Fp.add(t0, t1)
      t3 = Fp.sub(t3, t4)
      t4 = Fp.add(X1, Z1)
      let t5 = Fp.add(X2, Z2)
      t4 = Fp.mul(t4, t5)
      t5 = Fp.add(t0, t2)
      t4 = Fp.sub(t4, t5)
      t5 = Fp.add(Y1, Z1)
      X3 = Fp.add(Y2, Z2)
      t5 = Fp.mul(t5, X3)
      X3 = Fp.add(t1, t2)
      t5 = Fp.sub(t5, X3)
      Z3 = Fp.mul(a, t4)
      X3 = Fp.mul(b3, t2)
      Z3 = Fp.add(X3, Z3)
      X3 = Fp.sub(t1, Z3)
      Z3 = Fp.add(t1, Z3)
      Y3 = Fp.mul(X3, Z3)
      t1 = Fp.add(t0, t0)
      t1 = Fp.add(t1, t0)
      t2 = Fp.mul(a, t2)
      t4 = Fp.mul(b3, t4)
      t1 = Fp.add(t1, t2)
      t2 = Fp.sub(t0, t2)
      t2 = Fp.mul(a, t2)
      t4 = Fp.add(t4, t2)
      t0 = Fp.mul(t1, t4)
      Y3 = Fp.add(Y3, t0)
      t0 = Fp.mul(t5, t4)
      X3 = Fp.mul(t3, X3)
      X3 = Fp.sub(X3, t0)
      t0 = Fp.mul(t3, t1)
      Z3 = Fp.mul(t5, Z3)
      Z3 = Fp.add(Z3, t0)
      return new Point(X3, Y3, Z3)
    }

    subtract(other) {
      return this.add(other.negate())
    }

    is0() {
      return this.equals(Point.ZERO)
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, pointPrecomputes, n, comp => {
        const toInv = Fp.invertBatch(comp.map(p => p.pz))
        return comp.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine)
      })
    }

    multiplyUnsafe(n) {
      const I = Point.ZERO
      if (n === _0n) return I
      assertGE(n)
      if (n === _1n) return this
      const { endo } = CURVE
      if (!endo) return wnaf.unsafeLadder(this, n)

      let { k1neg, k1, k2neg, k2 } = endo.splitScalar(n)
      let k1p = I
      let k2p = I
      let d = this
      while (k1 > _0n || k2 > _0n) {
        if (k1 & _1n) k1p = k1p.add(d)
        if (k2 & _1n) k2p = k2p.add(d)
        d = d.double()
        k1 >>= _1n
        k2 >>= _1n
      }
      if (k1neg) k1p = k1p.negate()
      if (k2neg) k2p = k2p.negate()
      k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz)
      return k1p.add(k2p)
    }

    multiply(scalar) {
      assertGE(scalar)
      let n = scalar
      let point, fake
      const { endo } = CURVE
      if (endo) {
        const { k1neg, k1, k2neg, k2 } = endo.splitScalar(n)
        let { p: k1p, f: f1p } = this.wNAF(k1)
        let { p: k2p, f: f2p } = this.wNAF(k2)
        k1p = wnaf.constTimeNegate(k1neg, k1p)
        k2p = wnaf.constTimeNegate(k2neg, k2p)
        k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz)
        point = k1p.add(k2p)
        fake = f1p.add(f2p)
      } else {
        const { p, f } = this.wNAF(n)
        point = p
        fake = f
      }
      return Point.normalizeZ([point, fake])[0]
    }

    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point.BASE
      const mul = (P, a) =>
        a === _0n || a === _1n || !P.equals(G)
          ? P.multiplyUnsafe(a)
          : P.multiply(a)
      const sum = mul(this, a).add(mul(Q, b))
      return sum.is0() ? undefined : sum
    }

    toAffine(iz) {
      const { px: x, py: y, pz: z } = this
      const is0 = this.is0()
      if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(z)
      const ax = Fp.mul(x, iz)
      const ay = Fp.mul(y, iz)
      const zz = Fp.mul(z, iz)
      if (is0) return { x: Fp.ZERO, y: Fp.ZERO }
      if (!Fp.eql(zz, Fp.ONE)) throw new Error("invZ was invalid")
      return { x: ax, y: ay }
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE
      if (cofactor === _1n) return true
      if (isTorsionFree) return isTorsionFree(Point, this)
      throw new Error(
        "isTorsionFree() has not been declared for the elliptic curve"
      )
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE
      if (cofactor === _1n) return this
      if (clearCofactor) return clearCofactor(Point, this)
      return this.multiplyUnsafe(CURVE.h)
    }

    toRawBytes(isCompressed = true) {
      this.assertValidity()
      return toBytes(Point, this, isCompressed)
    }

    toHex(isCompressed = true) {
      return ut.bytesToHex(this.toRawBytes(isCompressed))
    }
  }
  const _bits = CURVE.nBitLength
  const wnaf = wNAF(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits)
  return { ProjectivePoint: Point }
}

function validateOpts(curve) {
  const opts = validateBasic(curve)
  ut.validateObject(
    opts,
    {
      hash: "hash",
      hmac: "function",
      //randomBytes: "function",
    },
    {
      bits2int: "function",
      bits2int_modN: "function",
      lowS: "boolean",
    }
  )
  return Object.freeze({ lowS: true, ...opts })
}

function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef)
  const { Fp, n: CURVE_ORDER } = CURVE
  const compressedLen = Fp.BYTES + 1
  const uncompressedLen = 2 * Fp.BYTES + 1

  function isValidFieldElement(num) {
    return _0n < num && num < Fp.ORDER
  }
  function modN(a) {
    return mod.mod(a, CURVE_ORDER)
  }
  function invN(a) {
    return mod.invert(a, CURVE_ORDER)
  }

  const {
    ProjectivePoint: Point,
    weierstrassEquation,
    isWithinCurveOrder,
  } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine()
      const x = Fp.toBytes(a.x)
      const cat = ut.concatBytes
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 0x02 : 0x03]), x)
      } else {
        return cat(Uint8Array.from([0x04]), x, Fp.toBytes(a.y))
      }
    },
    fromBytes(bytes) {
      const len = bytes.length
      const head = bytes[0]
      const tail = bytes.subarray(1)
      if (len === compressedLen && (head === 0x02 || head === 0x03)) {
        const x = ut.bytesToNumberBE(tail)
        if (!isValidFieldElement(x)) throw new Error("Point is not on curve")
        const y2 = weierstrassEquation(x)
        let y = Fp.sqrt(y2)
        const isYOdd = (y & _1n) === _1n
        const isHeadOdd = (head & 1) === 1
        if (isHeadOdd !== isYOdd) y = Fp.neg(y)
        return { x, y }
      } else if (len === uncompressedLen && head === 0x04) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES))
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES))
        return { x, y }
      } else {
        throw new Error(
          `Point of length ${len} was invalid. Expected ${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes`
        )
      }
    },
  })
  const numToNByteStr = num =>
    ut.bytesToHex(ut.numberToBytesBE(num, CURVE.nByteLength))

  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n
    return number > HALF
  }

  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN(-s) : s
  }

  const slcNum = (b, from, to) => ut.bytesToNumberBE(b.slice(from, to))

  const bits2int =
    CURVE.bits2int ||
    function (bytes) {
      const num = ut.bytesToNumberBE(bytes)
      const delta = bytes.length * 8 - CURVE.nBitLength
      return delta > 0 ? num >> BigInt(delta) : num
    }
  const bits2int_modN =
    CURVE.bits2int_modN ||
    function (bytes) {
      return modN(bits2int(bytes))
    }
  const ORDER_MASK = ut.bitMask(CURVE.nBitLength)

  function int2octets(num) {
    if (typeof num !== "bigint") throw new Error("bigint expected")
    if (!(_0n <= num && num < ORDER_MASK))
      throw new Error(`bigint expected < 2^${CURVE.nBitLength}`)
    return ut.numberToBytesBE(num, CURVE.nByteLength)
  }

  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false }
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false }

  Point.BASE._setWindowSize(8)

  return {
    CURVE,
    ProjectivePoint: Point,
  }
}

module.exports = { weierstrass }
