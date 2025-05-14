/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const { sha256 } = require("./sha256")
const { Field, mod, pow2 } = require("./abstract/modular.js")
const {
  bytesToNumberBE,
  concatBytes,
  ensureBytes,
  numberToBytesBE,
} = require("./abstract/utils.js")
const { createCurve } = require("./_shortw_utils.js")

const secp256k1P = BigInt(
  "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"
)
const secp256k1N = BigInt(
  "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
)
const _1n = BigInt(1)
const _2n = BigInt(2)
const divNearest = (a, b) => (a + b / _2n) / b

/**
 * √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
 * (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
 */
function sqrtMod(y) {
  const P = secp256k1P
  // prettier-ignore
  const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  // prettier-ignore
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = (y * y * y) % P // x^3, 11
  const b3 = (b2 * b2 * y) % P // x^7
  const b6 = (pow2(b3, _3n, P) * b3) % P
  const b9 = (pow2(b6, _3n, P) * b3) % P
  const b11 = (pow2(b9, _2n, P) * b2) % P
  const b22 = (pow2(b11, _11n, P) * b11) % P
  const b44 = (pow2(b22, _22n, P) * b22) % P
  const b88 = (pow2(b44, _44n, P) * b44) % P
  const b176 = (pow2(b88, _88n, P) * b88) % P
  const b220 = (pow2(b176, _44n, P) * b44) % P
  const b223 = (pow2(b220, _3n, P) * b3) % P
  const t1 = (pow2(b223, _23n, P) * b22) % P
  const t2 = (pow2(t1, _6n, P) * b2) % P
  const root = pow2(t2, _2n, P)
  if (!Fp.eql(Fp.sqr(root), y)) throw new Error("Cannot find square root")
  return root
}

const Fp = Field(secp256k1P, undefined, undefined, { sqrt: sqrtMod })

const secp256k1 = createCurve(
  {
    a: BigInt(0), // equation params: a, b
    b: BigInt(7), // Seem to be rigid: bitcointalk.org/index.php?topic=289795.msg3183975#msg3183975
    Fp, // Field's prime: 2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n
    n: secp256k1N, // Curve order, total count of valid points in the field
    // Base point (x, y) aka generator point
    Gx: BigInt(
      "55066263022277343669578718895168534326250603453777594175500187360389116729240"
    ),
    Gy: BigInt(
      "32670510020758816978083085130507043184471273380659243275938904335757337482424"
    ),
    h: BigInt(1), // Cofactor
    lowS: true, // Allow only low-S signatures by default in sign() and verify()
    /**
     * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
     * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
     * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
     * Explanation: https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066
     */
    endo: {
      beta: BigInt(
        "0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"
      ),
      splitScalar: k => {
        const n = secp256k1N
        const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15")
        const b1 = -_1n * BigInt("0xe4437ed6010e88286f547fa90abfe4c3")
        const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8")
        const b2 = a1
        const POW_2_128 = BigInt("0x100000000000000000000000000000000") // (2n**128n).toString(16)

        const c1 = divNearest(b2 * k, n)
        const c2 = divNearest(-b1 * k, n)
        let k1 = mod(k - c1 * a1 - c2 * a2, n)
        let k2 = mod(-c1 * b1 - c2 * b2, n)
        const k1neg = k1 > POW_2_128
        const k2neg = k2 > POW_2_128
        if (k1neg) k1 = n - k1
        if (k2neg) k2 = n - k2
        if (k1 > POW_2_128 || k2 > POW_2_128) {
          throw new Error("splitScalar: Endomorphism failed, k=" + k)
        }
        return { k1neg, k1, k2neg, k2 }
      },
    },
  },
  sha256
)

// Schnorr signatures are superior to ECDSA from above. Below is Schnorr-specific BIP0340 code.
// https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
const _0n = BigInt(0)
const fe = x => typeof x === "bigint" && _0n < x && x < secp256k1P
const ge = x => typeof x === "bigint" && _0n < x && x < secp256k1N
/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
const TAGGED_HASH_PREFIXES = {}
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag]
  if (tagP === undefined) {
    const tagH = sha256(Uint8Array.from(tag, c => c.charCodeAt(0)))
    tagP = concatBytes(tagH, tagH)
    TAGGED_HASH_PREFIXES[tag] = tagP
  }
  return sha256(concatBytes(tagP, ...messages))
}

// ECDSA compact points are 33-byte. Schnorr is 32: we strip first byte 0x02 or 0x03
const pointToBytes = point => point.toRawBytes(true).slice(1)
const numTo32b = n => numberToBytesBE(n, 32)
const modP = x => mod(x, secp256k1P)
const modN = x => mod(x, secp256k1N)
const Point = secp256k1.ProjectivePoint
const GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b)

/**
 * lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
 * @returns valid point checked for being on-curve
 */
function lift_x(x) {
  if (!fe(x)) throw new Error("bad x: need 0 < x < p") // Fail if x ≥ p.
  const xx = modP(x * x)
  const c = modP(xx * x + BigInt(7)) // Let c = x³ + 7 mod p.
  let y = sqrtMod(c) // Let y = c^(p+1)/4 mod p.
  if (y % _2n !== _0n) y = modP(-y) // Return the unique point P such that x(P) = x and
  const p = new Point(x, y, _1n) // y(P) = y if y mod 2 = 0 or y(P) = p-y otherwise.
  p.assertValidity()
  return p
}
/**
 * Create tagged hash, convert it to bigint, reduce modulo-n.
 */
function challenge(...args) {
  return modN(bytesToNumberBE(taggedHash("BIP0340/challenge", ...args)))
}

/**
 * Verifies Schnorr signature.
 * Will swallow errors & return false except for initial type validation of arguments.
 */
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64)
  const m = ensureBytes("message", message)
  const pub = ensureBytes("publicKey", publicKey, 32)
  try {
    const P = lift_x(bytesToNumberBE(pub)) // P = lift_x(int(pk)); fail if that fails
    const r = bytesToNumberBE(sig.subarray(0, 32)) // Let r = int(sig[0:32]); fail if r ≥ p.
    if (!fe(r)) return false
    const s = bytesToNumberBE(sig.subarray(32, 64)) // Let s = int(sig[32:64]); fail if s ≥ n.
    if (!ge(s)) return false
    const e = challenge(numTo32b(r), pointToBytes(P), m) // int(challenge(bytes(r)||bytes(P)||m))%n
    const R = GmulAdd(P, s, modN(-e)) // R = s⋅G - e⋅P
    if (!R || !R.hasEvenY() || R.toAffine().x !== r) return false // -eP == (n-e)P
    return true // Fail if is_infinite(R) / not has_even_y(R) / x(R) ≠ r.
  } catch (error) {
    return false
  }
}

const schnorr = (() => ({ verify: schnorrVerify }))()

module.exports = { schnorr }
