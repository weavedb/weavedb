"use strict"
var __getOwnPropNames = Object.getOwnPropertyNames
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    )
  }

// node_modules/bn.js/lib/bn.js
var require_bn = __commonJS({
  "node_modules/bn.js/lib/bn.js"(exports2, module2) {
    ;(function (module3, exports3) {
      "use strict"
      function assert(val, msg) {
        if (!val) throw new Error(msg || "Assertion failed")
      }
      function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        var TempCtor = function () {}
        TempCtor.prototype = superCtor.prototype
        ctor.prototype = new TempCtor()
        ctor.prototype.constructor = ctor
      }
      function BN(number, base, endian) {
        if (BN.isBN(number)) {
          return number
        }
        this.negative = 0
        this.words = null
        this.length = 0
        this.red = null
        if (number !== null) {
          if (base === "le" || base === "be") {
            endian = base
            base = 10
          }
          this._init(number || 0, base || 10, endian || "be")
        }
      }
      if (typeof module3 === "object") {
        module3.exports = BN
      } else {
        exports3.BN = BN
      }
      BN.BN = BN
      BN.wordSize = 26
      var Buffer2
      try {
        if (
          typeof window !== "undefined" &&
          typeof window.Buffer !== "undefined"
        ) {
          Buffer2 = window.Buffer
        } else {
          Buffer2 = Buffer //require("buffer").Buffer
        }
      } catch (e) {}
      BN.isBN = function isBN(num) {
        if (num instanceof BN) {
          return true
        }
        return (
          num !== null &&
          typeof num === "object" &&
          num.constructor.wordSize === BN.wordSize &&
          Array.isArray(num.words)
        )
      }
      BN.max = function max(left, right) {
        if (left.cmp(right) > 0) return left
        return right
      }
      BN.min = function min(left, right) {
        if (left.cmp(right) < 0) return left
        return right
      }
      BN.prototype._init = function init(number, base, endian) {
        if (typeof number === "number") {
          return this._initNumber(number, base, endian)
        }
        if (typeof number === "object") {
          return this._initArray(number, base, endian)
        }
        if (base === "hex") {
          base = 16
        }
        assert(base === (base | 0) && base >= 2 && base <= 36)
        number = number.toString().replace(/\s+/g, "")
        var start = 0
        if (number[0] === "-") {
          start++
          this.negative = 1
        }
        if (start < number.length) {
          if (base === 16) {
            this._parseHex(number, start, endian)
          } else {
            this._parseBase(number, base, start)
            if (endian === "le") {
              this._initArray(this.toArray(), base, endian)
            }
          }
        }
      }
      BN.prototype._initNumber = function _initNumber(number, base, endian) {
        if (number < 0) {
          this.negative = 1
          number = -number
        }
        if (number < 67108864) {
          this.words = [number & 67108863]
          this.length = 1
        } else if (number < 4503599627370496) {
          this.words = [number & 67108863, (number / 67108864) & 67108863]
          this.length = 2
        } else {
          assert(number < 9007199254740992)
          this.words = [number & 67108863, (number / 67108864) & 67108863, 1]
          this.length = 3
        }
        if (endian !== "le") return
        this._initArray(this.toArray(), base, endian)
      }
      BN.prototype._initArray = function _initArray(number, base, endian) {
        assert(typeof number.length === "number")
        if (number.length <= 0) {
          this.words = [0]
          this.length = 1
          return this
        }
        this.length = Math.ceil(number.length / 3)
        this.words = new Array(this.length)
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0
        }
        var j, w
        var off = 0
        if (endian === "be") {
          for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
            w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16)
            this.words[j] |= (w << off) & 67108863
            this.words[j + 1] = (w >>> (26 - off)) & 67108863
            off += 24
            if (off >= 26) {
              off -= 26
              j++
            }
          }
        } else if (endian === "le") {
          for (i = 0, j = 0; i < number.length; i += 3) {
            w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16)
            this.words[j] |= (w << off) & 67108863
            this.words[j + 1] = (w >>> (26 - off)) & 67108863
            off += 24
            if (off >= 26) {
              off -= 26
              j++
            }
          }
        }
        return this.strip()
      }
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index)
        if (c >= 65 && c <= 70) {
          return c - 55
        } else if (c >= 97 && c <= 102) {
          return c - 87
        } else {
          return (c - 48) & 15
        }
      }
      function parseHexByte(string, lowerBound, index) {
        var r = parseHex4Bits(string, index)
        if (index - 1 >= lowerBound) {
          r |= parseHex4Bits(string, index - 1) << 4
        }
        return r
      }
      BN.prototype._parseHex = function _parseHex(number, start, endian) {
        this.length = Math.ceil((number.length - start) / 6)
        this.words = new Array(this.length)
        for (var i = 0; i < this.length; i++) {
          this.words[i] = 0
        }
        var off = 0
        var j = 0
        var w
        if (endian === "be") {
          for (i = number.length - 1; i >= start; i -= 2) {
            w = parseHexByte(number, start, i) << off
            this.words[j] |= w & 67108863
            if (off >= 18) {
              off -= 18
              j += 1
              this.words[j] |= w >>> 26
            } else {
              off += 8
            }
          }
        } else {
          var parseLength = number.length - start
          for (
            i = parseLength % 2 === 0 ? start + 1 : start;
            i < number.length;
            i += 2
          ) {
            w = parseHexByte(number, start, i) << off
            this.words[j] |= w & 67108863
            if (off >= 18) {
              off -= 18
              j += 1
              this.words[j] |= w >>> 26
            } else {
              off += 8
            }
          }
        }
        this.strip()
      }
      function parseBase(str, start, end, mul) {
        var r = 0
        var len = Math.min(str.length, end)
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48
          r *= mul
          if (c >= 49) {
            r += c - 49 + 10
          } else if (c >= 17) {
            r += c - 17 + 10
          } else {
            r += c
          }
        }
        return r
      }
      BN.prototype._parseBase = function _parseBase(number, base, start) {
        this.words = [0]
        this.length = 1
        for (
          var limbLen = 0, limbPow = 1;
          limbPow <= 67108863;
          limbPow *= base
        ) {
          limbLen++
        }
        limbLen--
        limbPow = (limbPow / base) | 0
        var total = number.length - start
        var mod = total % limbLen
        var end = Math.min(total, total - mod) + start
        var word = 0
        for (var i = start; i < end; i += limbLen) {
          word = parseBase(number, i, i + limbLen, base)
          this.imuln(limbPow)
          if (this.words[0] + word < 67108864) {
            this.words[0] += word
          } else {
            this._iaddn(word)
          }
        }
        if (mod !== 0) {
          var pow = 1
          word = parseBase(number, i, number.length, base)
          for (i = 0; i < mod; i++) {
            pow *= base
          }
          this.imuln(pow)
          if (this.words[0] + word < 67108864) {
            this.words[0] += word
          } else {
            this._iaddn(word)
          }
        }
        this.strip()
      }
      BN.prototype.copy = function copy(dest) {
        dest.words = new Array(this.length)
        for (var i = 0; i < this.length; i++) {
          dest.words[i] = this.words[i]
        }
        dest.length = this.length
        dest.negative = this.negative
        dest.red = this.red
      }
      BN.prototype.clone = function clone() {
        var r = new BN(null)
        this.copy(r)
        return r
      }
      BN.prototype._expand = function _expand(size) {
        while (this.length < size) {
          this.words[this.length++] = 0
        }
        return this
      }
      BN.prototype.strip = function strip() {
        while (this.length > 1 && this.words[this.length - 1] === 0) {
          this.length--
        }
        return this._normSign()
      }
      BN.prototype._normSign = function _normSign() {
        if (this.length === 1 && this.words[0] === 0) {
          this.negative = 0
        }
        return this
      }
      BN.prototype.inspect = function inspect() {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">"
      }
      var zeros = [
        "",
        "0",
        "00",
        "000",
        "0000",
        "00000",
        "000000",
        "0000000",
        "00000000",
        "000000000",
        "0000000000",
        "00000000000",
        "000000000000",
        "0000000000000",
        "00000000000000",
        "000000000000000",
        "0000000000000000",
        "00000000000000000",
        "000000000000000000",
        "0000000000000000000",
        "00000000000000000000",
        "000000000000000000000",
        "0000000000000000000000",
        "00000000000000000000000",
        "000000000000000000000000",
        "0000000000000000000000000",
      ]
      var groupSizes = [
        0,
        0,
        25,
        16,
        12,
        11,
        10,
        9,
        8,
        8,
        7,
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        6,
        6,
        6,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
      ]
      var groupBases = [
        0,
        0,
        33554432,
        43046721,
        16777216,
        48828125,
        60466176,
        40353607,
        16777216,
        43046721,
        1e7,
        19487171,
        35831808,
        62748517,
        7529536,
        11390625,
        16777216,
        24137569,
        34012224,
        47045881,
        64e6,
        4084101,
        5153632,
        6436343,
        7962624,
        9765625,
        11881376,
        14348907,
        17210368,
        20511149,
        243e5,
        28629151,
        33554432,
        39135393,
        45435424,
        52521875,
        60466176,
      ]
      BN.prototype.toString = function toString(base, padding) {
        base = base || 10
        padding = padding | 0 || 1
        var out
        if (base === 16 || base === "hex") {
          out = ""
          var off = 0
          var carry = 0
          for (var i = 0; i < this.length; i++) {
            var w = this.words[i]
            var word = (((w << off) | carry) & 16777215).toString(16)
            carry = (w >>> (24 - off)) & 16777215
            if (carry !== 0 || i !== this.length - 1) {
              out = zeros[6 - word.length] + word + out
            } else {
              out = word + out
            }
            off += 2
            if (off >= 26) {
              off -= 26
              i--
            }
          }
          if (carry !== 0) {
            out = carry.toString(16) + out
          }
          while (out.length % padding !== 0) {
            out = "0" + out
          }
          if (this.negative !== 0) {
            out = "-" + out
          }
          return out
        }
        if (base === (base | 0) && base >= 2 && base <= 36) {
          var groupSize = groupSizes[base]
          var groupBase = groupBases[base]
          out = ""
          var c = this.clone()
          c.negative = 0
          while (!c.isZero()) {
            var r = c.modn(groupBase).toString(base)
            c = c.idivn(groupBase)
            if (!c.isZero()) {
              out = zeros[groupSize - r.length] + r + out
            } else {
              out = r + out
            }
          }
          if (this.isZero()) {
            out = "0" + out
          }
          while (out.length % padding !== 0) {
            out = "0" + out
          }
          if (this.negative !== 0) {
            out = "-" + out
          }
          return out
        }
        assert(false, "Base should be between 2 and 36")
      }
      BN.prototype.toNumber = function toNumber() {
        var ret = this.words[0]
        if (this.length === 2) {
          ret += this.words[1] * 67108864
        } else if (this.length === 3 && this.words[2] === 1) {
          ret += 4503599627370496 + this.words[1] * 67108864
        } else if (this.length > 2) {
          assert(false, "Number can only safely store up to 53 bits")
        }
        return this.negative !== 0 ? -ret : ret
      }
      BN.prototype.toJSON = function toJSON() {
        return this.toString(16)
      }
      BN.prototype.toBuffer = function toBuffer(endian, length) {
        assert(typeof Buffer2 !== "undefined")
        return this.toArrayLike(Buffer2, endian, length)
      }
      BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length)
      }
      BN.prototype.toArrayLike = function toArrayLike(
        ArrayType,
        endian,
        length
      ) {
        var byteLength = this.byteLength()
        var reqLength = length || Math.max(1, byteLength)
        assert(byteLength <= reqLength, "byte array longer than desired length")
        assert(reqLength > 0, "Requested array length <= 0")
        this.strip()
        var littleEndian = endian === "le"
        var res = new ArrayType(reqLength)
        var b, i
        var q = this.clone()
        if (!littleEndian) {
          for (i = 0; i < reqLength - byteLength; i++) {
            res[i] = 0
          }
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(255)
            q.iushrn(8)
            res[reqLength - i - 1] = b
          }
        } else {
          for (i = 0; !q.isZero(); i++) {
            b = q.andln(255)
            q.iushrn(8)
            res[i] = b
          }
          for (; i < reqLength; i++) {
            res[i] = 0
          }
        }
        return res
      }
      if (Math.clz32) {
        BN.prototype._countBits = function _countBits(w) {
          return 32 - Math.clz32(w)
        }
      } else {
        BN.prototype._countBits = function _countBits(w) {
          var t = w
          var r = 0
          if (t >= 4096) {
            r += 13
            t >>>= 13
          }
          if (t >= 64) {
            r += 7
            t >>>= 7
          }
          if (t >= 8) {
            r += 4
            t >>>= 4
          }
          if (t >= 2) {
            r += 2
            t >>>= 2
          }
          return r + t
        }
      }
      BN.prototype._zeroBits = function _zeroBits(w) {
        if (w === 0) return 26
        var t = w
        var r = 0
        if ((t & 8191) === 0) {
          r += 13
          t >>>= 13
        }
        if ((t & 127) === 0) {
          r += 7
          t >>>= 7
        }
        if ((t & 15) === 0) {
          r += 4
          t >>>= 4
        }
        if ((t & 3) === 0) {
          r += 2
          t >>>= 2
        }
        if ((t & 1) === 0) {
          r++
        }
        return r
      }
      BN.prototype.bitLength = function bitLength() {
        var w = this.words[this.length - 1]
        var hi = this._countBits(w)
        return (this.length - 1) * 26 + hi
      }
      function toBitArray(num) {
        var w = new Array(num.bitLength())
        for (var bit = 0; bit < w.length; bit++) {
          var off = (bit / 26) | 0
          var wbit = bit % 26
          w[bit] = (num.words[off] & (1 << wbit)) >>> wbit
        }
        return w
      }
      BN.prototype.zeroBits = function zeroBits() {
        if (this.isZero()) return 0
        var r = 0
        for (var i = 0; i < this.length; i++) {
          var b = this._zeroBits(this.words[i])
          r += b
          if (b !== 26) break
        }
        return r
      }
      BN.prototype.byteLength = function byteLength() {
        return Math.ceil(this.bitLength() / 8)
      }
      BN.prototype.toTwos = function toTwos(width) {
        if (this.negative !== 0) {
          return this.abs().inotn(width).iaddn(1)
        }
        return this.clone()
      }
      BN.prototype.fromTwos = function fromTwos(width) {
        if (this.testn(width - 1)) {
          return this.notn(width).iaddn(1).ineg()
        }
        return this.clone()
      }
      BN.prototype.isNeg = function isNeg() {
        return this.negative !== 0
      }
      BN.prototype.neg = function neg() {
        return this.clone().ineg()
      }
      BN.prototype.ineg = function ineg() {
        if (!this.isZero()) {
          this.negative ^= 1
        }
        return this
      }
      BN.prototype.iuor = function iuor(num) {
        while (this.length < num.length) {
          this.words[this.length++] = 0
        }
        for (var i = 0; i < num.length; i++) {
          this.words[i] = this.words[i] | num.words[i]
        }
        return this.strip()
      }
      BN.prototype.ior = function ior(num) {
        assert((this.negative | num.negative) === 0)
        return this.iuor(num)
      }
      BN.prototype.or = function or(num) {
        if (this.length > num.length) return this.clone().ior(num)
        return num.clone().ior(this)
      }
      BN.prototype.uor = function uor(num) {
        if (this.length > num.length) return this.clone().iuor(num)
        return num.clone().iuor(this)
      }
      BN.prototype.iuand = function iuand(num) {
        var b
        if (this.length > num.length) {
          b = num
        } else {
          b = this
        }
        for (var i = 0; i < b.length; i++) {
          this.words[i] = this.words[i] & num.words[i]
        }
        this.length = b.length
        return this.strip()
      }
      BN.prototype.iand = function iand(num) {
        assert((this.negative | num.negative) === 0)
        return this.iuand(num)
      }
      BN.prototype.and = function and(num) {
        if (this.length > num.length) return this.clone().iand(num)
        return num.clone().iand(this)
      }
      BN.prototype.uand = function uand(num) {
        if (this.length > num.length) return this.clone().iuand(num)
        return num.clone().iuand(this)
      }
      BN.prototype.iuxor = function iuxor(num) {
        var a
        var b
        if (this.length > num.length) {
          a = this
          b = num
        } else {
          a = num
          b = this
        }
        for (var i = 0; i < b.length; i++) {
          this.words[i] = a.words[i] ^ b.words[i]
        }
        if (this !== a) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i]
          }
        }
        this.length = a.length
        return this.strip()
      }
      BN.prototype.ixor = function ixor(num) {
        assert((this.negative | num.negative) === 0)
        return this.iuxor(num)
      }
      BN.prototype.xor = function xor(num) {
        if (this.length > num.length) return this.clone().ixor(num)
        return num.clone().ixor(this)
      }
      BN.prototype.uxor = function uxor(num) {
        if (this.length > num.length) return this.clone().iuxor(num)
        return num.clone().iuxor(this)
      }
      BN.prototype.inotn = function inotn(width) {
        assert(typeof width === "number" && width >= 0)
        var bytesNeeded = Math.ceil(width / 26) | 0
        var bitsLeft = width % 26
        this._expand(bytesNeeded)
        if (bitsLeft > 0) {
          bytesNeeded--
        }
        for (var i = 0; i < bytesNeeded; i++) {
          this.words[i] = ~this.words[i] & 67108863
        }
        if (bitsLeft > 0) {
          this.words[i] = ~this.words[i] & (67108863 >> (26 - bitsLeft))
        }
        return this.strip()
      }
      BN.prototype.notn = function notn(width) {
        return this.clone().inotn(width)
      }
      BN.prototype.setn = function setn(bit, val) {
        assert(typeof bit === "number" && bit >= 0)
        var off = (bit / 26) | 0
        var wbit = bit % 26
        this._expand(off + 1)
        if (val) {
          this.words[off] = this.words[off] | (1 << wbit)
        } else {
          this.words[off] = this.words[off] & ~(1 << wbit)
        }
        return this.strip()
      }
      BN.prototype.iadd = function iadd(num) {
        var r
        if (this.negative !== 0 && num.negative === 0) {
          this.negative = 0
          r = this.isub(num)
          this.negative ^= 1
          return this._normSign()
        } else if (this.negative === 0 && num.negative !== 0) {
          num.negative = 0
          r = this.isub(num)
          num.negative = 1
          return r._normSign()
        }
        var a, b
        if (this.length > num.length) {
          a = this
          b = num
        } else {
          a = num
          b = this
        }
        var carry = 0
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) + (b.words[i] | 0) + carry
          this.words[i] = r & 67108863
          carry = r >>> 26
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry
          this.words[i] = r & 67108863
          carry = r >>> 26
        }
        this.length = a.length
        if (carry !== 0) {
          this.words[this.length] = carry
          this.length++
        } else if (a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i]
          }
        }
        return this
      }
      BN.prototype.add = function add(num) {
        var res
        if (num.negative !== 0 && this.negative === 0) {
          num.negative = 0
          res = this.sub(num)
          num.negative ^= 1
          return res
        } else if (num.negative === 0 && this.negative !== 0) {
          this.negative = 0
          res = num.sub(this)
          this.negative = 1
          return res
        }
        if (this.length > num.length) return this.clone().iadd(num)
        return num.clone().iadd(this)
      }
      BN.prototype.isub = function isub(num) {
        if (num.negative !== 0) {
          num.negative = 0
          var r = this.iadd(num)
          num.negative = 1
          return r._normSign()
        } else if (this.negative !== 0) {
          this.negative = 0
          this.iadd(num)
          this.negative = 1
          return this._normSign()
        }
        var cmp = this.cmp(num)
        if (cmp === 0) {
          this.negative = 0
          this.length = 1
          this.words[0] = 0
          return this
        }
        var a, b
        if (cmp > 0) {
          a = this
          b = num
        } else {
          a = num
          b = this
        }
        var carry = 0
        for (var i = 0; i < b.length; i++) {
          r = (a.words[i] | 0) - (b.words[i] | 0) + carry
          carry = r >> 26
          this.words[i] = r & 67108863
        }
        for (; carry !== 0 && i < a.length; i++) {
          r = (a.words[i] | 0) + carry
          carry = r >> 26
          this.words[i] = r & 67108863
        }
        if (carry === 0 && i < a.length && a !== this) {
          for (; i < a.length; i++) {
            this.words[i] = a.words[i]
          }
        }
        this.length = Math.max(this.length, i)
        if (a !== this) {
          this.negative = 1
        }
        return this.strip()
      }
      BN.prototype.sub = function sub(num) {
        return this.clone().isub(num)
      }
      function smallMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative
        var len = (self.length + num.length) | 0
        out.length = len
        len = (len - 1) | 0
        var a = self.words[0] | 0
        var b = num.words[0] | 0
        var r = a * b
        var lo = r & 67108863
        var carry = (r / 67108864) | 0
        out.words[0] = lo
        for (var k = 1; k < len; k++) {
          var ncarry = carry >>> 26
          var rword = carry & 67108863
          var maxJ = Math.min(k, num.length - 1)
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = (k - j) | 0
            a = self.words[i] | 0
            b = num.words[j] | 0
            r = a * b + rword
            ncarry += (r / 67108864) | 0
            rword = r & 67108863
          }
          out.words[k] = rword | 0
          carry = ncarry | 0
        }
        if (carry !== 0) {
          out.words[k] = carry | 0
        } else {
          out.length--
        }
        return out.strip()
      }
      var comb10MulTo = function comb10MulTo2(self, num, out) {
        var a = self.words
        var b = num.words
        var o = out.words
        var c = 0
        var lo
        var mid
        var hi
        var a0 = a[0] | 0
        var al0 = a0 & 8191
        var ah0 = a0 >>> 13
        var a1 = a[1] | 0
        var al1 = a1 & 8191
        var ah1 = a1 >>> 13
        var a2 = a[2] | 0
        var al2 = a2 & 8191
        var ah2 = a2 >>> 13
        var a3 = a[3] | 0
        var al3 = a3 & 8191
        var ah3 = a3 >>> 13
        var a4 = a[4] | 0
        var al4 = a4 & 8191
        var ah4 = a4 >>> 13
        var a5 = a[5] | 0
        var al5 = a5 & 8191
        var ah5 = a5 >>> 13
        var a6 = a[6] | 0
        var al6 = a6 & 8191
        var ah6 = a6 >>> 13
        var a7 = a[7] | 0
        var al7 = a7 & 8191
        var ah7 = a7 >>> 13
        var a8 = a[8] | 0
        var al8 = a8 & 8191
        var ah8 = a8 >>> 13
        var a9 = a[9] | 0
        var al9 = a9 & 8191
        var ah9 = a9 >>> 13
        var b0 = b[0] | 0
        var bl0 = b0 & 8191
        var bh0 = b0 >>> 13
        var b1 = b[1] | 0
        var bl1 = b1 & 8191
        var bh1 = b1 >>> 13
        var b2 = b[2] | 0
        var bl2 = b2 & 8191
        var bh2 = b2 >>> 13
        var b3 = b[3] | 0
        var bl3 = b3 & 8191
        var bh3 = b3 >>> 13
        var b4 = b[4] | 0
        var bl4 = b4 & 8191
        var bh4 = b4 >>> 13
        var b5 = b[5] | 0
        var bl5 = b5 & 8191
        var bh5 = b5 >>> 13
        var b6 = b[6] | 0
        var bl6 = b6 & 8191
        var bh6 = b6 >>> 13
        var b7 = b[7] | 0
        var bl7 = b7 & 8191
        var bh7 = b7 >>> 13
        var b8 = b[8] | 0
        var bl8 = b8 & 8191
        var bh8 = b8 >>> 13
        var b9 = b[9] | 0
        var bl9 = b9 & 8191
        var bh9 = b9 >>> 13
        out.negative = self.negative ^ num.negative
        out.length = 19
        lo = Math.imul(al0, bl0)
        mid = Math.imul(al0, bh0)
        mid = (mid + Math.imul(ah0, bl0)) | 0
        hi = Math.imul(ah0, bh0)
        var w0 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0
        w0 &= 67108863
        lo = Math.imul(al1, bl0)
        mid = Math.imul(al1, bh0)
        mid = (mid + Math.imul(ah1, bl0)) | 0
        hi = Math.imul(ah1, bh0)
        lo = (lo + Math.imul(al0, bl1)) | 0
        mid = (mid + Math.imul(al0, bh1)) | 0
        mid = (mid + Math.imul(ah0, bl1)) | 0
        hi = (hi + Math.imul(ah0, bh1)) | 0
        var w1 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0
        w1 &= 67108863
        lo = Math.imul(al2, bl0)
        mid = Math.imul(al2, bh0)
        mid = (mid + Math.imul(ah2, bl0)) | 0
        hi = Math.imul(ah2, bh0)
        lo = (lo + Math.imul(al1, bl1)) | 0
        mid = (mid + Math.imul(al1, bh1)) | 0
        mid = (mid + Math.imul(ah1, bl1)) | 0
        hi = (hi + Math.imul(ah1, bh1)) | 0
        lo = (lo + Math.imul(al0, bl2)) | 0
        mid = (mid + Math.imul(al0, bh2)) | 0
        mid = (mid + Math.imul(ah0, bl2)) | 0
        hi = (hi + Math.imul(ah0, bh2)) | 0
        var w2 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0
        w2 &= 67108863
        lo = Math.imul(al3, bl0)
        mid = Math.imul(al3, bh0)
        mid = (mid + Math.imul(ah3, bl0)) | 0
        hi = Math.imul(ah3, bh0)
        lo = (lo + Math.imul(al2, bl1)) | 0
        mid = (mid + Math.imul(al2, bh1)) | 0
        mid = (mid + Math.imul(ah2, bl1)) | 0
        hi = (hi + Math.imul(ah2, bh1)) | 0
        lo = (lo + Math.imul(al1, bl2)) | 0
        mid = (mid + Math.imul(al1, bh2)) | 0
        mid = (mid + Math.imul(ah1, bl2)) | 0
        hi = (hi + Math.imul(ah1, bh2)) | 0
        lo = (lo + Math.imul(al0, bl3)) | 0
        mid = (mid + Math.imul(al0, bh3)) | 0
        mid = (mid + Math.imul(ah0, bl3)) | 0
        hi = (hi + Math.imul(ah0, bh3)) | 0
        var w3 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0
        w3 &= 67108863
        lo = Math.imul(al4, bl0)
        mid = Math.imul(al4, bh0)
        mid = (mid + Math.imul(ah4, bl0)) | 0
        hi = Math.imul(ah4, bh0)
        lo = (lo + Math.imul(al3, bl1)) | 0
        mid = (mid + Math.imul(al3, bh1)) | 0
        mid = (mid + Math.imul(ah3, bl1)) | 0
        hi = (hi + Math.imul(ah3, bh1)) | 0
        lo = (lo + Math.imul(al2, bl2)) | 0
        mid = (mid + Math.imul(al2, bh2)) | 0
        mid = (mid + Math.imul(ah2, bl2)) | 0
        hi = (hi + Math.imul(ah2, bh2)) | 0
        lo = (lo + Math.imul(al1, bl3)) | 0
        mid = (mid + Math.imul(al1, bh3)) | 0
        mid = (mid + Math.imul(ah1, bl3)) | 0
        hi = (hi + Math.imul(ah1, bh3)) | 0
        lo = (lo + Math.imul(al0, bl4)) | 0
        mid = (mid + Math.imul(al0, bh4)) | 0
        mid = (mid + Math.imul(ah0, bl4)) | 0
        hi = (hi + Math.imul(ah0, bh4)) | 0
        var w4 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0
        w4 &= 67108863
        lo = Math.imul(al5, bl0)
        mid = Math.imul(al5, bh0)
        mid = (mid + Math.imul(ah5, bl0)) | 0
        hi = Math.imul(ah5, bh0)
        lo = (lo + Math.imul(al4, bl1)) | 0
        mid = (mid + Math.imul(al4, bh1)) | 0
        mid = (mid + Math.imul(ah4, bl1)) | 0
        hi = (hi + Math.imul(ah4, bh1)) | 0
        lo = (lo + Math.imul(al3, bl2)) | 0
        mid = (mid + Math.imul(al3, bh2)) | 0
        mid = (mid + Math.imul(ah3, bl2)) | 0
        hi = (hi + Math.imul(ah3, bh2)) | 0
        lo = (lo + Math.imul(al2, bl3)) | 0
        mid = (mid + Math.imul(al2, bh3)) | 0
        mid = (mid + Math.imul(ah2, bl3)) | 0
        hi = (hi + Math.imul(ah2, bh3)) | 0
        lo = (lo + Math.imul(al1, bl4)) | 0
        mid = (mid + Math.imul(al1, bh4)) | 0
        mid = (mid + Math.imul(ah1, bl4)) | 0
        hi = (hi + Math.imul(ah1, bh4)) | 0
        lo = (lo + Math.imul(al0, bl5)) | 0
        mid = (mid + Math.imul(al0, bh5)) | 0
        mid = (mid + Math.imul(ah0, bl5)) | 0
        hi = (hi + Math.imul(ah0, bh5)) | 0
        var w5 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0
        w5 &= 67108863
        lo = Math.imul(al6, bl0)
        mid = Math.imul(al6, bh0)
        mid = (mid + Math.imul(ah6, bl0)) | 0
        hi = Math.imul(ah6, bh0)
        lo = (lo + Math.imul(al5, bl1)) | 0
        mid = (mid + Math.imul(al5, bh1)) | 0
        mid = (mid + Math.imul(ah5, bl1)) | 0
        hi = (hi + Math.imul(ah5, bh1)) | 0
        lo = (lo + Math.imul(al4, bl2)) | 0
        mid = (mid + Math.imul(al4, bh2)) | 0
        mid = (mid + Math.imul(ah4, bl2)) | 0
        hi = (hi + Math.imul(ah4, bh2)) | 0
        lo = (lo + Math.imul(al3, bl3)) | 0
        mid = (mid + Math.imul(al3, bh3)) | 0
        mid = (mid + Math.imul(ah3, bl3)) | 0
        hi = (hi + Math.imul(ah3, bh3)) | 0
        lo = (lo + Math.imul(al2, bl4)) | 0
        mid = (mid + Math.imul(al2, bh4)) | 0
        mid = (mid + Math.imul(ah2, bl4)) | 0
        hi = (hi + Math.imul(ah2, bh4)) | 0
        lo = (lo + Math.imul(al1, bl5)) | 0
        mid = (mid + Math.imul(al1, bh5)) | 0
        mid = (mid + Math.imul(ah1, bl5)) | 0
        hi = (hi + Math.imul(ah1, bh5)) | 0
        lo = (lo + Math.imul(al0, bl6)) | 0
        mid = (mid + Math.imul(al0, bh6)) | 0
        mid = (mid + Math.imul(ah0, bl6)) | 0
        hi = (hi + Math.imul(ah0, bh6)) | 0
        var w6 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0
        w6 &= 67108863
        lo = Math.imul(al7, bl0)
        mid = Math.imul(al7, bh0)
        mid = (mid + Math.imul(ah7, bl0)) | 0
        hi = Math.imul(ah7, bh0)
        lo = (lo + Math.imul(al6, bl1)) | 0
        mid = (mid + Math.imul(al6, bh1)) | 0
        mid = (mid + Math.imul(ah6, bl1)) | 0
        hi = (hi + Math.imul(ah6, bh1)) | 0
        lo = (lo + Math.imul(al5, bl2)) | 0
        mid = (mid + Math.imul(al5, bh2)) | 0
        mid = (mid + Math.imul(ah5, bl2)) | 0
        hi = (hi + Math.imul(ah5, bh2)) | 0
        lo = (lo + Math.imul(al4, bl3)) | 0
        mid = (mid + Math.imul(al4, bh3)) | 0
        mid = (mid + Math.imul(ah4, bl3)) | 0
        hi = (hi + Math.imul(ah4, bh3)) | 0
        lo = (lo + Math.imul(al3, bl4)) | 0
        mid = (mid + Math.imul(al3, bh4)) | 0
        mid = (mid + Math.imul(ah3, bl4)) | 0
        hi = (hi + Math.imul(ah3, bh4)) | 0
        lo = (lo + Math.imul(al2, bl5)) | 0
        mid = (mid + Math.imul(al2, bh5)) | 0
        mid = (mid + Math.imul(ah2, bl5)) | 0
        hi = (hi + Math.imul(ah2, bh5)) | 0
        lo = (lo + Math.imul(al1, bl6)) | 0
        mid = (mid + Math.imul(al1, bh6)) | 0
        mid = (mid + Math.imul(ah1, bl6)) | 0
        hi = (hi + Math.imul(ah1, bh6)) | 0
        lo = (lo + Math.imul(al0, bl7)) | 0
        mid = (mid + Math.imul(al0, bh7)) | 0
        mid = (mid + Math.imul(ah0, bl7)) | 0
        hi = (hi + Math.imul(ah0, bh7)) | 0
        var w7 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0
        w7 &= 67108863
        lo = Math.imul(al8, bl0)
        mid = Math.imul(al8, bh0)
        mid = (mid + Math.imul(ah8, bl0)) | 0
        hi = Math.imul(ah8, bh0)
        lo = (lo + Math.imul(al7, bl1)) | 0
        mid = (mid + Math.imul(al7, bh1)) | 0
        mid = (mid + Math.imul(ah7, bl1)) | 0
        hi = (hi + Math.imul(ah7, bh1)) | 0
        lo = (lo + Math.imul(al6, bl2)) | 0
        mid = (mid + Math.imul(al6, bh2)) | 0
        mid = (mid + Math.imul(ah6, bl2)) | 0
        hi = (hi + Math.imul(ah6, bh2)) | 0
        lo = (lo + Math.imul(al5, bl3)) | 0
        mid = (mid + Math.imul(al5, bh3)) | 0
        mid = (mid + Math.imul(ah5, bl3)) | 0
        hi = (hi + Math.imul(ah5, bh3)) | 0
        lo = (lo + Math.imul(al4, bl4)) | 0
        mid = (mid + Math.imul(al4, bh4)) | 0
        mid = (mid + Math.imul(ah4, bl4)) | 0
        hi = (hi + Math.imul(ah4, bh4)) | 0
        lo = (lo + Math.imul(al3, bl5)) | 0
        mid = (mid + Math.imul(al3, bh5)) | 0
        mid = (mid + Math.imul(ah3, bl5)) | 0
        hi = (hi + Math.imul(ah3, bh5)) | 0
        lo = (lo + Math.imul(al2, bl6)) | 0
        mid = (mid + Math.imul(al2, bh6)) | 0
        mid = (mid + Math.imul(ah2, bl6)) | 0
        hi = (hi + Math.imul(ah2, bh6)) | 0
        lo = (lo + Math.imul(al1, bl7)) | 0
        mid = (mid + Math.imul(al1, bh7)) | 0
        mid = (mid + Math.imul(ah1, bl7)) | 0
        hi = (hi + Math.imul(ah1, bh7)) | 0
        lo = (lo + Math.imul(al0, bl8)) | 0
        mid = (mid + Math.imul(al0, bh8)) | 0
        mid = (mid + Math.imul(ah0, bl8)) | 0
        hi = (hi + Math.imul(ah0, bh8)) | 0
        var w8 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0
        w8 &= 67108863
        lo = Math.imul(al9, bl0)
        mid = Math.imul(al9, bh0)
        mid = (mid + Math.imul(ah9, bl0)) | 0
        hi = Math.imul(ah9, bh0)
        lo = (lo + Math.imul(al8, bl1)) | 0
        mid = (mid + Math.imul(al8, bh1)) | 0
        mid = (mid + Math.imul(ah8, bl1)) | 0
        hi = (hi + Math.imul(ah8, bh1)) | 0
        lo = (lo + Math.imul(al7, bl2)) | 0
        mid = (mid + Math.imul(al7, bh2)) | 0
        mid = (mid + Math.imul(ah7, bl2)) | 0
        hi = (hi + Math.imul(ah7, bh2)) | 0
        lo = (lo + Math.imul(al6, bl3)) | 0
        mid = (mid + Math.imul(al6, bh3)) | 0
        mid = (mid + Math.imul(ah6, bl3)) | 0
        hi = (hi + Math.imul(ah6, bh3)) | 0
        lo = (lo + Math.imul(al5, bl4)) | 0
        mid = (mid + Math.imul(al5, bh4)) | 0
        mid = (mid + Math.imul(ah5, bl4)) | 0
        hi = (hi + Math.imul(ah5, bh4)) | 0
        lo = (lo + Math.imul(al4, bl5)) | 0
        mid = (mid + Math.imul(al4, bh5)) | 0
        mid = (mid + Math.imul(ah4, bl5)) | 0
        hi = (hi + Math.imul(ah4, bh5)) | 0
        lo = (lo + Math.imul(al3, bl6)) | 0
        mid = (mid + Math.imul(al3, bh6)) | 0
        mid = (mid + Math.imul(ah3, bl6)) | 0
        hi = (hi + Math.imul(ah3, bh6)) | 0
        lo = (lo + Math.imul(al2, bl7)) | 0
        mid = (mid + Math.imul(al2, bh7)) | 0
        mid = (mid + Math.imul(ah2, bl7)) | 0
        hi = (hi + Math.imul(ah2, bh7)) | 0
        lo = (lo + Math.imul(al1, bl8)) | 0
        mid = (mid + Math.imul(al1, bh8)) | 0
        mid = (mid + Math.imul(ah1, bl8)) | 0
        hi = (hi + Math.imul(ah1, bh8)) | 0
        lo = (lo + Math.imul(al0, bl9)) | 0
        mid = (mid + Math.imul(al0, bh9)) | 0
        mid = (mid + Math.imul(ah0, bl9)) | 0
        hi = (hi + Math.imul(ah0, bh9)) | 0
        var w9 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0
        w9 &= 67108863
        lo = Math.imul(al9, bl1)
        mid = Math.imul(al9, bh1)
        mid = (mid + Math.imul(ah9, bl1)) | 0
        hi = Math.imul(ah9, bh1)
        lo = (lo + Math.imul(al8, bl2)) | 0
        mid = (mid + Math.imul(al8, bh2)) | 0
        mid = (mid + Math.imul(ah8, bl2)) | 0
        hi = (hi + Math.imul(ah8, bh2)) | 0
        lo = (lo + Math.imul(al7, bl3)) | 0
        mid = (mid + Math.imul(al7, bh3)) | 0
        mid = (mid + Math.imul(ah7, bl3)) | 0
        hi = (hi + Math.imul(ah7, bh3)) | 0
        lo = (lo + Math.imul(al6, bl4)) | 0
        mid = (mid + Math.imul(al6, bh4)) | 0
        mid = (mid + Math.imul(ah6, bl4)) | 0
        hi = (hi + Math.imul(ah6, bh4)) | 0
        lo = (lo + Math.imul(al5, bl5)) | 0
        mid = (mid + Math.imul(al5, bh5)) | 0
        mid = (mid + Math.imul(ah5, bl5)) | 0
        hi = (hi + Math.imul(ah5, bh5)) | 0
        lo = (lo + Math.imul(al4, bl6)) | 0
        mid = (mid + Math.imul(al4, bh6)) | 0
        mid = (mid + Math.imul(ah4, bl6)) | 0
        hi = (hi + Math.imul(ah4, bh6)) | 0
        lo = (lo + Math.imul(al3, bl7)) | 0
        mid = (mid + Math.imul(al3, bh7)) | 0
        mid = (mid + Math.imul(ah3, bl7)) | 0
        hi = (hi + Math.imul(ah3, bh7)) | 0
        lo = (lo + Math.imul(al2, bl8)) | 0
        mid = (mid + Math.imul(al2, bh8)) | 0
        mid = (mid + Math.imul(ah2, bl8)) | 0
        hi = (hi + Math.imul(ah2, bh8)) | 0
        lo = (lo + Math.imul(al1, bl9)) | 0
        mid = (mid + Math.imul(al1, bh9)) | 0
        mid = (mid + Math.imul(ah1, bl9)) | 0
        hi = (hi + Math.imul(ah1, bh9)) | 0
        var w10 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0
        w10 &= 67108863
        lo = Math.imul(al9, bl2)
        mid = Math.imul(al9, bh2)
        mid = (mid + Math.imul(ah9, bl2)) | 0
        hi = Math.imul(ah9, bh2)
        lo = (lo + Math.imul(al8, bl3)) | 0
        mid = (mid + Math.imul(al8, bh3)) | 0
        mid = (mid + Math.imul(ah8, bl3)) | 0
        hi = (hi + Math.imul(ah8, bh3)) | 0
        lo = (lo + Math.imul(al7, bl4)) | 0
        mid = (mid + Math.imul(al7, bh4)) | 0
        mid = (mid + Math.imul(ah7, bl4)) | 0
        hi = (hi + Math.imul(ah7, bh4)) | 0
        lo = (lo + Math.imul(al6, bl5)) | 0
        mid = (mid + Math.imul(al6, bh5)) | 0
        mid = (mid + Math.imul(ah6, bl5)) | 0
        hi = (hi + Math.imul(ah6, bh5)) | 0
        lo = (lo + Math.imul(al5, bl6)) | 0
        mid = (mid + Math.imul(al5, bh6)) | 0
        mid = (mid + Math.imul(ah5, bl6)) | 0
        hi = (hi + Math.imul(ah5, bh6)) | 0
        lo = (lo + Math.imul(al4, bl7)) | 0
        mid = (mid + Math.imul(al4, bh7)) | 0
        mid = (mid + Math.imul(ah4, bl7)) | 0
        hi = (hi + Math.imul(ah4, bh7)) | 0
        lo = (lo + Math.imul(al3, bl8)) | 0
        mid = (mid + Math.imul(al3, bh8)) | 0
        mid = (mid + Math.imul(ah3, bl8)) | 0
        hi = (hi + Math.imul(ah3, bh8)) | 0
        lo = (lo + Math.imul(al2, bl9)) | 0
        mid = (mid + Math.imul(al2, bh9)) | 0
        mid = (mid + Math.imul(ah2, bl9)) | 0
        hi = (hi + Math.imul(ah2, bh9)) | 0
        var w11 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0
        w11 &= 67108863
        lo = Math.imul(al9, bl3)
        mid = Math.imul(al9, bh3)
        mid = (mid + Math.imul(ah9, bl3)) | 0
        hi = Math.imul(ah9, bh3)
        lo = (lo + Math.imul(al8, bl4)) | 0
        mid = (mid + Math.imul(al8, bh4)) | 0
        mid = (mid + Math.imul(ah8, bl4)) | 0
        hi = (hi + Math.imul(ah8, bh4)) | 0
        lo = (lo + Math.imul(al7, bl5)) | 0
        mid = (mid + Math.imul(al7, bh5)) | 0
        mid = (mid + Math.imul(ah7, bl5)) | 0
        hi = (hi + Math.imul(ah7, bh5)) | 0
        lo = (lo + Math.imul(al6, bl6)) | 0
        mid = (mid + Math.imul(al6, bh6)) | 0
        mid = (mid + Math.imul(ah6, bl6)) | 0
        hi = (hi + Math.imul(ah6, bh6)) | 0
        lo = (lo + Math.imul(al5, bl7)) | 0
        mid = (mid + Math.imul(al5, bh7)) | 0
        mid = (mid + Math.imul(ah5, bl7)) | 0
        hi = (hi + Math.imul(ah5, bh7)) | 0
        lo = (lo + Math.imul(al4, bl8)) | 0
        mid = (mid + Math.imul(al4, bh8)) | 0
        mid = (mid + Math.imul(ah4, bl8)) | 0
        hi = (hi + Math.imul(ah4, bh8)) | 0
        lo = (lo + Math.imul(al3, bl9)) | 0
        mid = (mid + Math.imul(al3, bh9)) | 0
        mid = (mid + Math.imul(ah3, bl9)) | 0
        hi = (hi + Math.imul(ah3, bh9)) | 0
        var w12 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0
        w12 &= 67108863
        lo = Math.imul(al9, bl4)
        mid = Math.imul(al9, bh4)
        mid = (mid + Math.imul(ah9, bl4)) | 0
        hi = Math.imul(ah9, bh4)
        lo = (lo + Math.imul(al8, bl5)) | 0
        mid = (mid + Math.imul(al8, bh5)) | 0
        mid = (mid + Math.imul(ah8, bl5)) | 0
        hi = (hi + Math.imul(ah8, bh5)) | 0
        lo = (lo + Math.imul(al7, bl6)) | 0
        mid = (mid + Math.imul(al7, bh6)) | 0
        mid = (mid + Math.imul(ah7, bl6)) | 0
        hi = (hi + Math.imul(ah7, bh6)) | 0
        lo = (lo + Math.imul(al6, bl7)) | 0
        mid = (mid + Math.imul(al6, bh7)) | 0
        mid = (mid + Math.imul(ah6, bl7)) | 0
        hi = (hi + Math.imul(ah6, bh7)) | 0
        lo = (lo + Math.imul(al5, bl8)) | 0
        mid = (mid + Math.imul(al5, bh8)) | 0
        mid = (mid + Math.imul(ah5, bl8)) | 0
        hi = (hi + Math.imul(ah5, bh8)) | 0
        lo = (lo + Math.imul(al4, bl9)) | 0
        mid = (mid + Math.imul(al4, bh9)) | 0
        mid = (mid + Math.imul(ah4, bl9)) | 0
        hi = (hi + Math.imul(ah4, bh9)) | 0
        var w13 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0
        w13 &= 67108863
        lo = Math.imul(al9, bl5)
        mid = Math.imul(al9, bh5)
        mid = (mid + Math.imul(ah9, bl5)) | 0
        hi = Math.imul(ah9, bh5)
        lo = (lo + Math.imul(al8, bl6)) | 0
        mid = (mid + Math.imul(al8, bh6)) | 0
        mid = (mid + Math.imul(ah8, bl6)) | 0
        hi = (hi + Math.imul(ah8, bh6)) | 0
        lo = (lo + Math.imul(al7, bl7)) | 0
        mid = (mid + Math.imul(al7, bh7)) | 0
        mid = (mid + Math.imul(ah7, bl7)) | 0
        hi = (hi + Math.imul(ah7, bh7)) | 0
        lo = (lo + Math.imul(al6, bl8)) | 0
        mid = (mid + Math.imul(al6, bh8)) | 0
        mid = (mid + Math.imul(ah6, bl8)) | 0
        hi = (hi + Math.imul(ah6, bh8)) | 0
        lo = (lo + Math.imul(al5, bl9)) | 0
        mid = (mid + Math.imul(al5, bh9)) | 0
        mid = (mid + Math.imul(ah5, bl9)) | 0
        hi = (hi + Math.imul(ah5, bh9)) | 0
        var w14 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0
        w14 &= 67108863
        lo = Math.imul(al9, bl6)
        mid = Math.imul(al9, bh6)
        mid = (mid + Math.imul(ah9, bl6)) | 0
        hi = Math.imul(ah9, bh6)
        lo = (lo + Math.imul(al8, bl7)) | 0
        mid = (mid + Math.imul(al8, bh7)) | 0
        mid = (mid + Math.imul(ah8, bl7)) | 0
        hi = (hi + Math.imul(ah8, bh7)) | 0
        lo = (lo + Math.imul(al7, bl8)) | 0
        mid = (mid + Math.imul(al7, bh8)) | 0
        mid = (mid + Math.imul(ah7, bl8)) | 0
        hi = (hi + Math.imul(ah7, bh8)) | 0
        lo = (lo + Math.imul(al6, bl9)) | 0
        mid = (mid + Math.imul(al6, bh9)) | 0
        mid = (mid + Math.imul(ah6, bl9)) | 0
        hi = (hi + Math.imul(ah6, bh9)) | 0
        var w15 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0
        w15 &= 67108863
        lo = Math.imul(al9, bl7)
        mid = Math.imul(al9, bh7)
        mid = (mid + Math.imul(ah9, bl7)) | 0
        hi = Math.imul(ah9, bh7)
        lo = (lo + Math.imul(al8, bl8)) | 0
        mid = (mid + Math.imul(al8, bh8)) | 0
        mid = (mid + Math.imul(ah8, bl8)) | 0
        hi = (hi + Math.imul(ah8, bh8)) | 0
        lo = (lo + Math.imul(al7, bl9)) | 0
        mid = (mid + Math.imul(al7, bh9)) | 0
        mid = (mid + Math.imul(ah7, bl9)) | 0
        hi = (hi + Math.imul(ah7, bh9)) | 0
        var w16 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0
        w16 &= 67108863
        lo = Math.imul(al9, bl8)
        mid = Math.imul(al9, bh8)
        mid = (mid + Math.imul(ah9, bl8)) | 0
        hi = Math.imul(ah9, bh8)
        lo = (lo + Math.imul(al8, bl9)) | 0
        mid = (mid + Math.imul(al8, bh9)) | 0
        mid = (mid + Math.imul(ah8, bl9)) | 0
        hi = (hi + Math.imul(ah8, bh9)) | 0
        var w17 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0
        w17 &= 67108863
        lo = Math.imul(al9, bl9)
        mid = Math.imul(al9, bh9)
        mid = (mid + Math.imul(ah9, bl9)) | 0
        hi = Math.imul(ah9, bh9)
        var w18 = (((c + lo) | 0) + ((mid & 8191) << 13)) | 0
        c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0
        w18 &= 67108863
        o[0] = w0
        o[1] = w1
        o[2] = w2
        o[3] = w3
        o[4] = w4
        o[5] = w5
        o[6] = w6
        o[7] = w7
        o[8] = w8
        o[9] = w9
        o[10] = w10
        o[11] = w11
        o[12] = w12
        o[13] = w13
        o[14] = w14
        o[15] = w15
        o[16] = w16
        o[17] = w17
        o[18] = w18
        if (c !== 0) {
          o[19] = c
          out.length++
        }
        return out
      }
      if (!Math.imul) {
        comb10MulTo = smallMulTo
      }
      function bigMulTo(self, num, out) {
        out.negative = num.negative ^ self.negative
        out.length = self.length + num.length
        var carry = 0
        var hncarry = 0
        for (var k = 0; k < out.length - 1; k++) {
          var ncarry = hncarry
          hncarry = 0
          var rword = carry & 67108863
          var maxJ = Math.min(k, num.length - 1)
          for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
            var i = k - j
            var a = self.words[i] | 0
            var b = num.words[j] | 0
            var r = a * b
            var lo = r & 67108863
            ncarry = (ncarry + ((r / 67108864) | 0)) | 0
            lo = (lo + rword) | 0
            rword = lo & 67108863
            ncarry = (ncarry + (lo >>> 26)) | 0
            hncarry += ncarry >>> 26
            ncarry &= 67108863
          }
          out.words[k] = rword
          carry = ncarry
          ncarry = hncarry
        }
        if (carry !== 0) {
          out.words[k] = carry
        } else {
          out.length--
        }
        return out.strip()
      }
      function jumboMulTo(self, num, out) {
        var fftm = new FFTM()
        return fftm.mulp(self, num, out)
      }
      BN.prototype.mulTo = function mulTo(num, out) {
        var res
        var len = this.length + num.length
        if (this.length === 10 && num.length === 10) {
          res = comb10MulTo(this, num, out)
        } else if (len < 63) {
          res = smallMulTo(this, num, out)
        } else if (len < 1024) {
          res = bigMulTo(this, num, out)
        } else {
          res = jumboMulTo(this, num, out)
        }
        return res
      }
      function FFTM(x, y) {
        this.x = x
        this.y = y
      }
      FFTM.prototype.makeRBT = function makeRBT(N) {
        var t = new Array(N)
        var l = BN.prototype._countBits(N) - 1
        for (var i = 0; i < N; i++) {
          t[i] = this.revBin(i, l, N)
        }
        return t
      }
      FFTM.prototype.revBin = function revBin(x, l, N) {
        if (x === 0 || x === N - 1) return x
        var rb = 0
        for (var i = 0; i < l; i++) {
          rb |= (x & 1) << (l - i - 1)
          x >>= 1
        }
        return rb
      }
      FFTM.prototype.permute = function permute(rbt, rws, iws, rtws, itws, N) {
        for (var i = 0; i < N; i++) {
          rtws[i] = rws[rbt[i]]
          itws[i] = iws[rbt[i]]
        }
      }
      FFTM.prototype.transform = function transform(
        rws,
        iws,
        rtws,
        itws,
        N,
        rbt
      ) {
        this.permute(rbt, rws, iws, rtws, itws, N)
        for (var s = 1; s < N; s <<= 1) {
          var l = s << 1
          var rtwdf = Math.cos((2 * Math.PI) / l)
          var itwdf = Math.sin((2 * Math.PI) / l)
          for (var p = 0; p < N; p += l) {
            var rtwdf_ = rtwdf
            var itwdf_ = itwdf
            for (var j = 0; j < s; j++) {
              var re = rtws[p + j]
              var ie = itws[p + j]
              var ro = rtws[p + j + s]
              var io = itws[p + j + s]
              var rx = rtwdf_ * ro - itwdf_ * io
              io = rtwdf_ * io + itwdf_ * ro
              ro = rx
              rtws[p + j] = re + ro
              itws[p + j] = ie + io
              rtws[p + j + s] = re - ro
              itws[p + j + s] = ie - io
              if (j !== l) {
                rx = rtwdf * rtwdf_ - itwdf * itwdf_
                itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_
                rtwdf_ = rx
              }
            }
          }
        }
      }
      FFTM.prototype.guessLen13b = function guessLen13b(n, m) {
        var N = Math.max(m, n) | 1
        var odd = N & 1
        var i = 0
        for (N = (N / 2) | 0; N; N = N >>> 1) {
          i++
        }
        return 1 << (i + 1 + odd)
      }
      FFTM.prototype.conjugate = function conjugate(rws, iws, N) {
        if (N <= 1) return
        for (var i = 0; i < N / 2; i++) {
          var t = rws[i]
          rws[i] = rws[N - i - 1]
          rws[N - i - 1] = t
          t = iws[i]
          iws[i] = -iws[N - i - 1]
          iws[N - i - 1] = -t
        }
      }
      FFTM.prototype.normalize13b = function normalize13b(ws, N) {
        var carry = 0
        for (var i = 0; i < N / 2; i++) {
          var w =
            Math.round(ws[2 * i + 1] / N) * 8192 +
            Math.round(ws[2 * i] / N) +
            carry
          ws[i] = w & 67108863
          if (w < 67108864) {
            carry = 0
          } else {
            carry = (w / 67108864) | 0
          }
        }
        return ws
      }
      FFTM.prototype.convert13b = function convert13b(ws, len, rws, N) {
        var carry = 0
        for (var i = 0; i < len; i++) {
          carry = carry + (ws[i] | 0)
          rws[2 * i] = carry & 8191
          carry = carry >>> 13
          rws[2 * i + 1] = carry & 8191
          carry = carry >>> 13
        }
        for (i = 2 * len; i < N; ++i) {
          rws[i] = 0
        }
        assert(carry === 0)
        assert((carry & ~8191) === 0)
      }
      FFTM.prototype.stub = function stub(N) {
        var ph = new Array(N)
        for (var i = 0; i < N; i++) {
          ph[i] = 0
        }
        return ph
      }
      FFTM.prototype.mulp = function mulp(x, y, out) {
        var N = 2 * this.guessLen13b(x.length, y.length)
        var rbt = this.makeRBT(N)
        var _ = this.stub(N)
        var rws = new Array(N)
        var rwst = new Array(N)
        var iwst = new Array(N)
        var nrws = new Array(N)
        var nrwst = new Array(N)
        var niwst = new Array(N)
        var rmws = out.words
        rmws.length = N
        this.convert13b(x.words, x.length, rws, N)
        this.convert13b(y.words, y.length, nrws, N)
        this.transform(rws, _, rwst, iwst, N, rbt)
        this.transform(nrws, _, nrwst, niwst, N, rbt)
        for (var i = 0; i < N; i++) {
          var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i]
          iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i]
          rwst[i] = rx
        }
        this.conjugate(rwst, iwst, N)
        this.transform(rwst, iwst, rmws, _, N, rbt)
        this.conjugate(rmws, _, N)
        this.normalize13b(rmws, N)
        out.negative = x.negative ^ y.negative
        out.length = x.length + y.length
        return out.strip()
      }
      BN.prototype.mul = function mul(num) {
        var out = new BN(null)
        out.words = new Array(this.length + num.length)
        return this.mulTo(num, out)
      }
      BN.prototype.mulf = function mulf(num) {
        var out = new BN(null)
        out.words = new Array(this.length + num.length)
        return jumboMulTo(this, num, out)
      }
      BN.prototype.imul = function imul(num) {
        return this.clone().mulTo(num, this)
      }
      BN.prototype.imuln = function imuln(num) {
        assert(typeof num === "number")
        assert(num < 67108864)
        var carry = 0
        for (var i = 0; i < this.length; i++) {
          var w = (this.words[i] | 0) * num
          var lo = (w & 67108863) + (carry & 67108863)
          carry >>= 26
          carry += (w / 67108864) | 0
          carry += lo >>> 26
          this.words[i] = lo & 67108863
        }
        if (carry !== 0) {
          this.words[i] = carry
          this.length++
        }
        return this
      }
      BN.prototype.muln = function muln(num) {
        return this.clone().imuln(num)
      }
      BN.prototype.sqr = function sqr() {
        return this.mul(this)
      }
      BN.prototype.isqr = function isqr() {
        return this.imul(this.clone())
      }
      BN.prototype.pow = function pow(num) {
        var w = toBitArray(num)
        if (w.length === 0) return new BN(1)
        var res = this
        for (var i = 0; i < w.length; i++, res = res.sqr()) {
          if (w[i] !== 0) break
        }
        if (++i < w.length) {
          for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
            if (w[i] === 0) continue
            res = res.mul(q)
          }
        }
        return res
      }
      BN.prototype.iushln = function iushln(bits) {
        assert(typeof bits === "number" && bits >= 0)
        var r = bits % 26
        var s = (bits - r) / 26
        var carryMask = (67108863 >>> (26 - r)) << (26 - r)
        var i
        if (r !== 0) {
          var carry = 0
          for (i = 0; i < this.length; i++) {
            var newCarry = this.words[i] & carryMask
            var c = ((this.words[i] | 0) - newCarry) << r
            this.words[i] = c | carry
            carry = newCarry >>> (26 - r)
          }
          if (carry) {
            this.words[i] = carry
            this.length++
          }
        }
        if (s !== 0) {
          for (i = this.length - 1; i >= 0; i--) {
            this.words[i + s] = this.words[i]
          }
          for (i = 0; i < s; i++) {
            this.words[i] = 0
          }
          this.length += s
        }
        return this.strip()
      }
      BN.prototype.ishln = function ishln(bits) {
        assert(this.negative === 0)
        return this.iushln(bits)
      }
      BN.prototype.iushrn = function iushrn(bits, hint, extended) {
        assert(typeof bits === "number" && bits >= 0)
        var h
        if (hint) {
          h = (hint - (hint % 26)) / 26
        } else {
          h = 0
        }
        var r = bits % 26
        var s = Math.min((bits - r) / 26, this.length)
        var mask = 67108863 ^ ((67108863 >>> r) << r)
        var maskedWords = extended
        h -= s
        h = Math.max(0, h)
        if (maskedWords) {
          for (var i = 0; i < s; i++) {
            maskedWords.words[i] = this.words[i]
          }
          maskedWords.length = s
        }
        if (s === 0) {
        } else if (this.length > s) {
          this.length -= s
          for (i = 0; i < this.length; i++) {
            this.words[i] = this.words[i + s]
          }
        } else {
          this.words[0] = 0
          this.length = 1
        }
        var carry = 0
        for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
          var word = this.words[i] | 0
          this.words[i] = (carry << (26 - r)) | (word >>> r)
          carry = word & mask
        }
        if (maskedWords && carry !== 0) {
          maskedWords.words[maskedWords.length++] = carry
        }
        if (this.length === 0) {
          this.words[0] = 0
          this.length = 1
        }
        return this.strip()
      }
      BN.prototype.ishrn = function ishrn(bits, hint, extended) {
        assert(this.negative === 0)
        return this.iushrn(bits, hint, extended)
      }
      BN.prototype.shln = function shln(bits) {
        return this.clone().ishln(bits)
      }
      BN.prototype.ushln = function ushln(bits) {
        return this.clone().iushln(bits)
      }
      BN.prototype.shrn = function shrn(bits) {
        return this.clone().ishrn(bits)
      }
      BN.prototype.ushrn = function ushrn(bits) {
        return this.clone().iushrn(bits)
      }
      BN.prototype.testn = function testn(bit) {
        assert(typeof bit === "number" && bit >= 0)
        var r = bit % 26
        var s = (bit - r) / 26
        var q = 1 << r
        if (this.length <= s) return false
        var w = this.words[s]
        return !!(w & q)
      }
      BN.prototype.imaskn = function imaskn(bits) {
        assert(typeof bits === "number" && bits >= 0)
        var r = bits % 26
        var s = (bits - r) / 26
        assert(this.negative === 0, "imaskn works only with positive numbers")
        if (this.length <= s) {
          return this
        }
        if (r !== 0) {
          s++
        }
        this.length = Math.min(s, this.length)
        if (r !== 0) {
          var mask = 67108863 ^ ((67108863 >>> r) << r)
          this.words[this.length - 1] &= mask
        }
        return this.strip()
      }
      BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits)
      }
      BN.prototype.iaddn = function iaddn(num) {
        assert(typeof num === "number")
        assert(num < 67108864)
        if (num < 0) return this.isubn(-num)
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) < num) {
            this.words[0] = num - (this.words[0] | 0)
            this.negative = 0
            return this
          }
          this.negative = 0
          this.isubn(num)
          this.negative = 1
          return this
        }
        return this._iaddn(num)
      }
      BN.prototype._iaddn = function _iaddn(num) {
        this.words[0] += num
        for (var i = 0; i < this.length && this.words[i] >= 67108864; i++) {
          this.words[i] -= 67108864
          if (i === this.length - 1) {
            this.words[i + 1] = 1
          } else {
            this.words[i + 1]++
          }
        }
        this.length = Math.max(this.length, i + 1)
        return this
      }
      BN.prototype.isubn = function isubn(num) {
        assert(typeof num === "number")
        assert(num < 67108864)
        if (num < 0) return this.iaddn(-num)
        if (this.negative !== 0) {
          this.negative = 0
          this.iaddn(num)
          this.negative = 1
          return this
        }
        this.words[0] -= num
        if (this.length === 1 && this.words[0] < 0) {
          this.words[0] = -this.words[0]
          this.negative = 1
        } else {
          for (var i = 0; i < this.length && this.words[i] < 0; i++) {
            this.words[i] += 67108864
            this.words[i + 1] -= 1
          }
        }
        return this.strip()
      }
      BN.prototype.addn = function addn(num) {
        return this.clone().iaddn(num)
      }
      BN.prototype.subn = function subn(num) {
        return this.clone().isubn(num)
      }
      BN.prototype.iabs = function iabs() {
        this.negative = 0
        return this
      }
      BN.prototype.abs = function abs() {
        return this.clone().iabs()
      }
      BN.prototype._ishlnsubmul = function _ishlnsubmul(num, mul, shift) {
        var len = num.length + shift
        var i
        this._expand(len)
        var w
        var carry = 0
        for (i = 0; i < num.length; i++) {
          w = (this.words[i + shift] | 0) + carry
          var right = (num.words[i] | 0) * mul
          w -= right & 67108863
          carry = (w >> 26) - ((right / 67108864) | 0)
          this.words[i + shift] = w & 67108863
        }
        for (; i < this.length - shift; i++) {
          w = (this.words[i + shift] | 0) + carry
          carry = w >> 26
          this.words[i + shift] = w & 67108863
        }
        if (carry === 0) return this.strip()
        assert(carry === -1)
        carry = 0
        for (i = 0; i < this.length; i++) {
          w = -(this.words[i] | 0) + carry
          carry = w >> 26
          this.words[i] = w & 67108863
        }
        this.negative = 1
        return this.strip()
      }
      BN.prototype._wordDiv = function _wordDiv(num, mode) {
        var shift = this.length - num.length
        var a = this.clone()
        var b = num
        var bhi = b.words[b.length - 1] | 0
        var bhiBits = this._countBits(bhi)
        shift = 26 - bhiBits
        if (shift !== 0) {
          b = b.ushln(shift)
          a.iushln(shift)
          bhi = b.words[b.length - 1] | 0
        }
        var m = a.length - b.length
        var q
        if (mode !== "mod") {
          q = new BN(null)
          q.length = m + 1
          q.words = new Array(q.length)
          for (var i = 0; i < q.length; i++) {
            q.words[i] = 0
          }
        }
        var diff = a.clone()._ishlnsubmul(b, 1, m)
        if (diff.negative === 0) {
          a = diff
          if (q) {
            q.words[m] = 1
          }
        }
        for (var j = m - 1; j >= 0; j--) {
          var qj =
            (a.words[b.length + j] | 0) * 67108864 +
            (a.words[b.length + j - 1] | 0)
          qj = Math.min((qj / bhi) | 0, 67108863)
          a._ishlnsubmul(b, qj, j)
          while (a.negative !== 0) {
            qj--
            a.negative = 0
            a._ishlnsubmul(b, 1, j)
            if (!a.isZero()) {
              a.negative ^= 1
            }
          }
          if (q) {
            q.words[j] = qj
          }
        }
        if (q) {
          q.strip()
        }
        a.strip()
        if (mode !== "div" && shift !== 0) {
          a.iushrn(shift)
        }
        return {
          div: q || null,
          mod: a,
        }
      }
      BN.prototype.divmod = function divmod(num, mode, positive) {
        assert(!num.isZero())
        if (this.isZero()) {
          return {
            div: new BN(0),
            mod: new BN(0),
          }
        }
        var div, mod, res
        if (this.negative !== 0 && num.negative === 0) {
          res = this.neg().divmod(num, mode)
          if (mode !== "mod") {
            div = res.div.neg()
          }
          if (mode !== "div") {
            mod = res.mod.neg()
            if (positive && mod.negative !== 0) {
              mod.iadd(num)
            }
          }
          return {
            div,
            mod,
          }
        }
        if (this.negative === 0 && num.negative !== 0) {
          res = this.divmod(num.neg(), mode)
          if (mode !== "mod") {
            div = res.div.neg()
          }
          return {
            div,
            mod: res.mod,
          }
        }
        if ((this.negative & num.negative) !== 0) {
          res = this.neg().divmod(num.neg(), mode)
          if (mode !== "div") {
            mod = res.mod.neg()
            if (positive && mod.negative !== 0) {
              mod.isub(num)
            }
          }
          return {
            div: res.div,
            mod,
          }
        }
        if (num.length > this.length || this.cmp(num) < 0) {
          return {
            div: new BN(0),
            mod: this,
          }
        }
        if (num.length === 1) {
          if (mode === "div") {
            return {
              div: this.divn(num.words[0]),
              mod: null,
            }
          }
          if (mode === "mod") {
            return {
              div: null,
              mod: new BN(this.modn(num.words[0])),
            }
          }
          return {
            div: this.divn(num.words[0]),
            mod: new BN(this.modn(num.words[0])),
          }
        }
        return this._wordDiv(num, mode)
      }
      BN.prototype.div = function div(num) {
        return this.divmod(num, "div", false).div
      }
      BN.prototype.mod = function mod(num) {
        return this.divmod(num, "mod", false).mod
      }
      BN.prototype.umod = function umod(num) {
        return this.divmod(num, "mod", true).mod
      }
      BN.prototype.divRound = function divRound(num) {
        var dm = this.divmod(num)
        if (dm.mod.isZero()) return dm.div
        var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod
        var half = num.ushrn(1)
        var r2 = num.andln(1)
        var cmp = mod.cmp(half)
        if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div
        return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1)
      }
      BN.prototype.modn = function modn(num) {
        assert(num <= 67108863)
        var p = (1 << 26) % num
        var acc = 0
        for (var i = this.length - 1; i >= 0; i--) {
          acc = (p * acc + (this.words[i] | 0)) % num
        }
        return acc
      }
      BN.prototype.idivn = function idivn(num) {
        assert(num <= 67108863)
        var carry = 0
        for (var i = this.length - 1; i >= 0; i--) {
          var w = (this.words[i] | 0) + carry * 67108864
          this.words[i] = (w / num) | 0
          carry = w % num
        }
        return this.strip()
      }
      BN.prototype.divn = function divn(num) {
        return this.clone().idivn(num)
      }
      BN.prototype.egcd = function egcd(p) {
        assert(p.negative === 0)
        assert(!p.isZero())
        var x = this
        var y = p.clone()
        if (x.negative !== 0) {
          x = x.umod(p)
        } else {
          x = x.clone()
        }
        var A = new BN(1)
        var B = new BN(0)
        var C = new BN(0)
        var D = new BN(1)
        var g = 0
        while (x.isEven() && y.isEven()) {
          x.iushrn(1)
          y.iushrn(1)
          ++g
        }
        var yp = y.clone()
        var xp = x.clone()
        while (!x.isZero()) {
          for (
            var i = 0, im = 1;
            (x.words[0] & im) === 0 && i < 26;
            ++i, im <<= 1
          );
          if (i > 0) {
            x.iushrn(i)
            while (i-- > 0) {
              if (A.isOdd() || B.isOdd()) {
                A.iadd(yp)
                B.isub(xp)
              }
              A.iushrn(1)
              B.iushrn(1)
            }
          }
          for (
            var j = 0, jm = 1;
            (y.words[0] & jm) === 0 && j < 26;
            ++j, jm <<= 1
          );
          if (j > 0) {
            y.iushrn(j)
            while (j-- > 0) {
              if (C.isOdd() || D.isOdd()) {
                C.iadd(yp)
                D.isub(xp)
              }
              C.iushrn(1)
              D.iushrn(1)
            }
          }
          if (x.cmp(y) >= 0) {
            x.isub(y)
            A.isub(C)
            B.isub(D)
          } else {
            y.isub(x)
            C.isub(A)
            D.isub(B)
          }
        }
        return {
          a: C,
          b: D,
          gcd: y.iushln(g),
        }
      }
      BN.prototype._invmp = function _invmp(p) {
        assert(p.negative === 0)
        assert(!p.isZero())
        var a = this
        var b = p.clone()
        if (a.negative !== 0) {
          a = a.umod(p)
        } else {
          a = a.clone()
        }
        var x1 = new BN(1)
        var x2 = new BN(0)
        var delta = b.clone()
        while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
          for (
            var i = 0, im = 1;
            (a.words[0] & im) === 0 && i < 26;
            ++i, im <<= 1
          );
          if (i > 0) {
            a.iushrn(i)
            while (i-- > 0) {
              if (x1.isOdd()) {
                x1.iadd(delta)
              }
              x1.iushrn(1)
            }
          }
          for (
            var j = 0, jm = 1;
            (b.words[0] & jm) === 0 && j < 26;
            ++j, jm <<= 1
          );
          if (j > 0) {
            b.iushrn(j)
            while (j-- > 0) {
              if (x2.isOdd()) {
                x2.iadd(delta)
              }
              x2.iushrn(1)
            }
          }
          if (a.cmp(b) >= 0) {
            a.isub(b)
            x1.isub(x2)
          } else {
            b.isub(a)
            x2.isub(x1)
          }
        }
        var res
        if (a.cmpn(1) === 0) {
          res = x1
        } else {
          res = x2
        }
        if (res.cmpn(0) < 0) {
          res.iadd(p)
        }
        return res
      }
      BN.prototype.gcd = function gcd(num) {
        if (this.isZero()) return num.abs()
        if (num.isZero()) return this.abs()
        var a = this.clone()
        var b = num.clone()
        a.negative = 0
        b.negative = 0
        for (var shift = 0; a.isEven() && b.isEven(); shift++) {
          a.iushrn(1)
          b.iushrn(1)
        }
        do {
          while (a.isEven()) {
            a.iushrn(1)
          }
          while (b.isEven()) {
            b.iushrn(1)
          }
          var r = a.cmp(b)
          if (r < 0) {
            var t = a
            a = b
            b = t
          } else if (r === 0 || b.cmpn(1) === 0) {
            break
          }
          a.isub(b)
        } while (true)
        return b.iushln(shift)
      }
      BN.prototype.invm = function invm(num) {
        return this.egcd(num).a.umod(num)
      }
      BN.prototype.isEven = function isEven() {
        return (this.words[0] & 1) === 0
      }
      BN.prototype.isOdd = function isOdd() {
        return (this.words[0] & 1) === 1
      }
      BN.prototype.andln = function andln(num) {
        return this.words[0] & num
      }
      BN.prototype.bincn = function bincn(bit) {
        assert(typeof bit === "number")
        var r = bit % 26
        var s = (bit - r) / 26
        var q = 1 << r
        if (this.length <= s) {
          this._expand(s + 1)
          this.words[s] |= q
          return this
        }
        var carry = q
        for (var i = s; carry !== 0 && i < this.length; i++) {
          var w = this.words[i] | 0
          w += carry
          carry = w >>> 26
          w &= 67108863
          this.words[i] = w
        }
        if (carry !== 0) {
          this.words[i] = carry
          this.length++
        }
        return this
      }
      BN.prototype.isZero = function isZero() {
        return this.length === 1 && this.words[0] === 0
      }
      BN.prototype.cmpn = function cmpn(num) {
        var negative = num < 0
        if (this.negative !== 0 && !negative) return -1
        if (this.negative === 0 && negative) return 1
        this.strip()
        var res
        if (this.length > 1) {
          res = 1
        } else {
          if (negative) {
            num = -num
          }
          assert(num <= 67108863, "Number is too big")
          var w = this.words[0] | 0
          res = w === num ? 0 : w < num ? -1 : 1
        }
        if (this.negative !== 0) return -res | 0
        return res
      }
      BN.prototype.cmp = function cmp(num) {
        if (this.negative !== 0 && num.negative === 0) return -1
        if (this.negative === 0 && num.negative !== 0) return 1
        var res = this.ucmp(num)
        if (this.negative !== 0) return -res | 0
        return res
      }
      BN.prototype.ucmp = function ucmp(num) {
        if (this.length > num.length) return 1
        if (this.length < num.length) return -1
        var res = 0
        for (var i = this.length - 1; i >= 0; i--) {
          var a = this.words[i] | 0
          var b = num.words[i] | 0
          if (a === b) continue
          if (a < b) {
            res = -1
          } else if (a > b) {
            res = 1
          }
          break
        }
        return res
      }
      BN.prototype.gtn = function gtn(num) {
        return this.cmpn(num) === 1
      }
      BN.prototype.gt = function gt(num) {
        return this.cmp(num) === 1
      }
      BN.prototype.gten = function gten(num) {
        return this.cmpn(num) >= 0
      }
      BN.prototype.gte = function gte(num) {
        return this.cmp(num) >= 0
      }
      BN.prototype.ltn = function ltn(num) {
        return this.cmpn(num) === -1
      }
      BN.prototype.lt = function lt(num) {
        return this.cmp(num) === -1
      }
      BN.prototype.lten = function lten(num) {
        return this.cmpn(num) <= 0
      }
      BN.prototype.lte = function lte(num) {
        return this.cmp(num) <= 0
      }
      BN.prototype.eqn = function eqn(num) {
        return this.cmpn(num) === 0
      }
      BN.prototype.eq = function eq(num) {
        return this.cmp(num) === 0
      }
      BN.red = function red(num) {
        return new Red(num)
      }
      BN.prototype.toRed = function toRed(ctx) {
        assert(!this.red, "Already a number in reduction context")
        assert(this.negative === 0, "red works only with positives")
        return ctx.convertTo(this)._forceRed(ctx)
      }
      BN.prototype.fromRed = function fromRed() {
        assert(this.red, "fromRed works only with numbers in reduction context")
        return this.red.convertFrom(this)
      }
      BN.prototype._forceRed = function _forceRed(ctx) {
        this.red = ctx
        return this
      }
      BN.prototype.forceRed = function forceRed(ctx) {
        assert(!this.red, "Already a number in reduction context")
        return this._forceRed(ctx)
      }
      BN.prototype.redAdd = function redAdd(num) {
        assert(this.red, "redAdd works only with red numbers")
        return this.red.add(this, num)
      }
      BN.prototype.redIAdd = function redIAdd(num) {
        assert(this.red, "redIAdd works only with red numbers")
        return this.red.iadd(this, num)
      }
      BN.prototype.redSub = function redSub(num) {
        assert(this.red, "redSub works only with red numbers")
        return this.red.sub(this, num)
      }
      BN.prototype.redISub = function redISub(num) {
        assert(this.red, "redISub works only with red numbers")
        return this.red.isub(this, num)
      }
      BN.prototype.redShl = function redShl(num) {
        assert(this.red, "redShl works only with red numbers")
        return this.red.shl(this, num)
      }
      BN.prototype.redMul = function redMul(num) {
        assert(this.red, "redMul works only with red numbers")
        this.red._verify2(this, num)
        return this.red.mul(this, num)
      }
      BN.prototype.redIMul = function redIMul(num) {
        assert(this.red, "redMul works only with red numbers")
        this.red._verify2(this, num)
        return this.red.imul(this, num)
      }
      BN.prototype.redSqr = function redSqr() {
        assert(this.red, "redSqr works only with red numbers")
        this.red._verify1(this)
        return this.red.sqr(this)
      }
      BN.prototype.redISqr = function redISqr() {
        assert(this.red, "redISqr works only with red numbers")
        this.red._verify1(this)
        return this.red.isqr(this)
      }
      BN.prototype.redSqrt = function redSqrt() {
        assert(this.red, "redSqrt works only with red numbers")
        this.red._verify1(this)
        return this.red.sqrt(this)
      }
      BN.prototype.redInvm = function redInvm() {
        assert(this.red, "redInvm works only with red numbers")
        this.red._verify1(this)
        return this.red.invm(this)
      }
      BN.prototype.redNeg = function redNeg() {
        assert(this.red, "redNeg works only with red numbers")
        this.red._verify1(this)
        return this.red.neg(this)
      }
      BN.prototype.redPow = function redPow(num) {
        assert(this.red && !num.red, "redPow(normalNum)")
        this.red._verify1(this)
        return this.red.pow(this, num)
      }
      var primes = {
        k256: null,
        p224: null,
        p192: null,
        p25519: null,
      }
      function MPrime(name, p) {
        this.name = name
        this.p = new BN(p, 16)
        this.n = this.p.bitLength()
        this.k = new BN(1).iushln(this.n).isub(this.p)
        this.tmp = this._tmp()
      }
      MPrime.prototype._tmp = function _tmp() {
        var tmp = new BN(null)
        tmp.words = new Array(Math.ceil(this.n / 13))
        return tmp
      }
      MPrime.prototype.ireduce = function ireduce(num) {
        var r = num
        var rlen
        do {
          this.split(r, this.tmp)
          r = this.imulK(r)
          r = r.iadd(this.tmp)
          rlen = r.bitLength()
        } while (rlen > this.n)
        var cmp = rlen < this.n ? -1 : r.ucmp(this.p)
        if (cmp === 0) {
          r.words[0] = 0
          r.length = 1
        } else if (cmp > 0) {
          r.isub(this.p)
        } else {
          if (r.strip !== void 0) {
            r.strip()
          } else {
            r._strip()
          }
        }
        return r
      }
      MPrime.prototype.split = function split(input, out) {
        input.iushrn(this.n, 0, out)
      }
      MPrime.prototype.imulK = function imulK(num) {
        return num.imul(this.k)
      }
      function K256() {
        MPrime.call(
          this,
          "k256",
          "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f"
        )
      }
      inherits(K256, MPrime)
      K256.prototype.split = function split(input, output) {
        var mask = 4194303
        var outLen = Math.min(input.length, 9)
        for (var i = 0; i < outLen; i++) {
          output.words[i] = input.words[i]
        }
        output.length = outLen
        if (input.length <= 9) {
          input.words[0] = 0
          input.length = 1
          return
        }
        var prev = input.words[9]
        output.words[output.length++] = prev & mask
        for (i = 10; i < input.length; i++) {
          var next = input.words[i] | 0
          input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22)
          prev = next
        }
        prev >>>= 22
        input.words[i - 10] = prev
        if (prev === 0 && input.length > 10) {
          input.length -= 10
        } else {
          input.length -= 9
        }
      }
      K256.prototype.imulK = function imulK(num) {
        num.words[num.length] = 0
        num.words[num.length + 1] = 0
        num.length += 2
        var lo = 0
        for (var i = 0; i < num.length; i++) {
          var w = num.words[i] | 0
          lo += w * 977
          num.words[i] = lo & 67108863
          lo = w * 64 + ((lo / 67108864) | 0)
        }
        if (num.words[num.length - 1] === 0) {
          num.length--
          if (num.words[num.length - 1] === 0) {
            num.length--
          }
        }
        return num
      }
      function P224() {
        MPrime.call(
          this,
          "p224",
          "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001"
        )
      }
      inherits(P224, MPrime)
      function P192() {
        MPrime.call(
          this,
          "p192",
          "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff"
        )
      }
      inherits(P192, MPrime)
      function P25519() {
        MPrime.call(
          this,
          "25519",
          "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed"
        )
      }
      inherits(P25519, MPrime)
      P25519.prototype.imulK = function imulK(num) {
        var carry = 0
        for (var i = 0; i < num.length; i++) {
          var hi = (num.words[i] | 0) * 19 + carry
          var lo = hi & 67108863
          hi >>>= 26
          num.words[i] = lo
          carry = hi
        }
        if (carry !== 0) {
          num.words[num.length++] = carry
        }
        return num
      }
      BN._prime = function prime(name) {
        if (primes[name]) return primes[name]
        var prime2
        if (name === "k256") {
          prime2 = new K256()
        } else if (name === "p224") {
          prime2 = new P224()
        } else if (name === "p192") {
          prime2 = new P192()
        } else if (name === "p25519") {
          prime2 = new P25519()
        } else {
          throw new Error("Unknown prime " + name)
        }
        primes[name] = prime2
        return prime2
      }
      function Red(m) {
        if (typeof m === "string") {
          var prime = BN._prime(m)
          this.m = prime.p
          this.prime = prime
        } else {
          assert(m.gtn(1), "modulus must be greater than 1")
          this.m = m
          this.prime = null
        }
      }
      Red.prototype._verify1 = function _verify1(a) {
        assert(a.negative === 0, "red works only with positives")
        assert(a.red, "red works only with red numbers")
      }
      Red.prototype._verify2 = function _verify2(a, b) {
        assert((a.negative | b.negative) === 0, "red works only with positives")
        assert(a.red && a.red === b.red, "red works only with red numbers")
      }
      Red.prototype.imod = function imod(a) {
        if (this.prime) return this.prime.ireduce(a)._forceRed(this)
        return a.umod(this.m)._forceRed(this)
      }
      Red.prototype.neg = function neg(a) {
        if (a.isZero()) {
          return a.clone()
        }
        return this.m.sub(a)._forceRed(this)
      }
      Red.prototype.add = function add(a, b) {
        this._verify2(a, b)
        var res = a.add(b)
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m)
        }
        return res._forceRed(this)
      }
      Red.prototype.iadd = function iadd(a, b) {
        this._verify2(a, b)
        var res = a.iadd(b)
        if (res.cmp(this.m) >= 0) {
          res.isub(this.m)
        }
        return res
      }
      Red.prototype.sub = function sub(a, b) {
        this._verify2(a, b)
        var res = a.sub(b)
        if (res.cmpn(0) < 0) {
          res.iadd(this.m)
        }
        return res._forceRed(this)
      }
      Red.prototype.isub = function isub(a, b) {
        this._verify2(a, b)
        var res = a.isub(b)
        if (res.cmpn(0) < 0) {
          res.iadd(this.m)
        }
        return res
      }
      Red.prototype.shl = function shl(a, num) {
        this._verify1(a)
        return this.imod(a.ushln(num))
      }
      Red.prototype.imul = function imul(a, b) {
        this._verify2(a, b)
        return this.imod(a.imul(b))
      }
      Red.prototype.mul = function mul(a, b) {
        this._verify2(a, b)
        return this.imod(a.mul(b))
      }
      Red.prototype.isqr = function isqr(a) {
        return this.imul(a, a.clone())
      }
      Red.prototype.sqr = function sqr(a) {
        return this.mul(a, a)
      }
      Red.prototype.sqrt = function sqrt(a) {
        if (a.isZero()) return a.clone()
        var mod3 = this.m.andln(3)
        assert(mod3 % 2 === 1)
        if (mod3 === 3) {
          var pow = this.m.add(new BN(1)).iushrn(2)
          return this.pow(a, pow)
        }
        var q = this.m.subn(1)
        var s = 0
        while (!q.isZero() && q.andln(1) === 0) {
          s++
          q.iushrn(1)
        }
        assert(!q.isZero())
        var one = new BN(1).toRed(this)
        var nOne = one.redNeg()
        var lpow = this.m.subn(1).iushrn(1)
        var z = this.m.bitLength()
        z = new BN(2 * z * z).toRed(this)
        while (this.pow(z, lpow).cmp(nOne) !== 0) {
          z.redIAdd(nOne)
        }
        var c = this.pow(z, q)
        var r = this.pow(a, q.addn(1).iushrn(1))
        var t = this.pow(a, q)
        var m = s
        while (t.cmp(one) !== 0) {
          var tmp = t
          for (var i = 0; tmp.cmp(one) !== 0; i++) {
            tmp = tmp.redSqr()
          }
          assert(i < m)
          var b = this.pow(c, new BN(1).iushln(m - i - 1))
          r = r.redMul(b)
          c = b.redSqr()
          t = t.redMul(c)
          m = i
        }
        return r
      }
      Red.prototype.invm = function invm(a) {
        var inv = a._invmp(this.m)
        if (inv.negative !== 0) {
          inv.negative = 0
          return this.imod(inv).redNeg()
        } else {
          return this.imod(inv)
        }
      }
      Red.prototype.pow = function pow(a, num) {
        if (num.isZero()) return new BN(1).toRed(this)
        if (num.cmpn(1) === 0) return a.clone()
        var windowSize = 4
        var wnd = new Array(1 << windowSize)
        wnd[0] = new BN(1).toRed(this)
        wnd[1] = a
        for (var i = 2; i < wnd.length; i++) {
          wnd[i] = this.mul(wnd[i - 1], a)
        }
        var res = wnd[0]
        var current = 0
        var currentLen = 0
        var start = num.bitLength() % 26
        if (start === 0) {
          start = 26
        }
        for (i = num.length - 1; i >= 0; i--) {
          var word = num.words[i]
          for (var j = start - 1; j >= 0; j--) {
            var bit = (word >> j) & 1
            if (res !== wnd[0]) {
              res = this.sqr(res)
            }
            if (bit === 0 && current === 0) {
              currentLen = 0
              continue
            }
            current <<= 1
            current |= bit
            currentLen++
            if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue
            res = this.mul(res, wnd[current])
            currentLen = 0
            current = 0
          }
          start = 26
        }
        return res
      }
      Red.prototype.convertTo = function convertTo(num) {
        var r = num.umod(this.m)
        return r === num ? r.clone() : r
      }
      Red.prototype.convertFrom = function convertFrom(num) {
        var res = num.clone()
        res.red = null
        return res
      }
      BN.mont = function mont(num) {
        return new Mont(num)
      }
      function Mont(m) {
        Red.call(this, m)
        this.shift = this.m.bitLength()
        if (this.shift % 26 !== 0) {
          this.shift += 26 - (this.shift % 26)
        }
        this.r = new BN(1).iushln(this.shift)
        this.r2 = this.imod(this.r.sqr())
        this.rinv = this.r._invmp(this.m)
        this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)
        this.minv = this.minv.umod(this.r)
        this.minv = this.r.sub(this.minv)
      }
      inherits(Mont, Red)
      Mont.prototype.convertTo = function convertTo(num) {
        return this.imod(num.ushln(this.shift))
      }
      Mont.prototype.convertFrom = function convertFrom(num) {
        var r = this.imod(num.mul(this.rinv))
        r.red = null
        return r
      }
      Mont.prototype.imul = function imul(a, b) {
        if (a.isZero() || b.isZero()) {
          a.words[0] = 0
          a.length = 1
          return a
        }
        var t = a.imul(b)
        var c = t
          .maskn(this.shift)
          .mul(this.minv)
          .imaskn(this.shift)
          .mul(this.m)
        var u = t.isub(c).iushrn(this.shift)
        var res = u
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m)
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m)
        }
        return res._forceRed(this)
      }
      Mont.prototype.mul = function mul(a, b) {
        if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this)
        var t = a.mul(b)
        var c = t
          .maskn(this.shift)
          .mul(this.minv)
          .imaskn(this.shift)
          .mul(this.m)
        var u = t.isub(c).iushrn(this.shift)
        var res = u
        if (u.cmp(this.m) >= 0) {
          res = u.isub(this.m)
        } else if (u.cmpn(0) < 0) {
          res = u.iadd(this.m)
        }
        return res._forceRed(this)
      }
      Mont.prototype.invm = function invm(a) {
        var res = this.imod(a._invmp(this.m).mul(this.r2))
        return res._forceRed(this)
      }
    })(typeof module2 === "undefined" || module2, exports2)
  },
})

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports2, module2) {
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true,
            },
          })
        }
      }
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor
          var TempCtor = function () {}
          TempCtor.prototype = superCtor.prototype
          ctor.prototype = new TempCtor()
          ctor.prototype.constructor = ctor
        }
      }
    }
  },
})

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/inherits/inherits.js"(exports2, module2) {
    try {
      util = require("util")
      if (typeof util.inherits !== "function") throw ""
      module2.exports = util.inherits
    } catch (e) {
      module2.exports = require_inherits_browser()
    }
    var util
  },
})

// node_modules/safer-buffer/safer.js
var require_safer = __commonJS({
  "node_modules/safer-buffer/safer.js"(exports2, module2) {
    "use strict"
    var buffer = Buffer //require("buffer")
    var Buffer2 = buffer
    var safer = {}
    var key
    for (key in buffer) {
      if (!buffer.hasOwnProperty(key)) continue
      if (key === "SlowBuffer" || key === "Buffer") continue
      safer[key] = buffer[key]
    }
    var Safer = (safer.Buffer = {})
    for (key in Buffer2) {
      if (!Buffer2.hasOwnProperty(key)) continue
      if (key === "allocUnsafe" || key === "allocUnsafeSlow") continue
      Safer[key] = Buffer2[key]
    }
    safer.Buffer.prototype = Buffer2.prototype
    if (!Safer.from || Safer.from === Uint8Array.from) {
      Safer.from = function (value, encodingOrOffset, length) {
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type ' +
              typeof value
          )
        }
        if (value && typeof value.length === "undefined") {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
              typeof value
          )
        }
        return Buffer2(value, encodingOrOffset, length)
      }
    }
    if (!Safer.alloc) {
      Safer.alloc = function (size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError(
            'The "size" argument must be of type number. Received type ' +
              typeof size
          )
        }
        if (size < 0 || size >= 2 * (1 << 30)) {
          throw new RangeError(
            'The value "' + size + '" is invalid for option "size"'
          )
        }
        var buf = Buffer2(size)
        if (!fill || fill.length === 0) {
          buf.fill(0)
        } else if (typeof encoding === "string") {
          buf.fill(fill, encoding)
        } else {
          buf.fill(fill)
        }
        return buf
      }
    }
    if (!safer.kStringMaxLength) {
      try {
        safer.kStringMaxLength = process.binding("buffer").kStringMaxLength
      } catch (e) {}
    }
    if (!safer.constants) {
      safer.constants = {
        MAX_LENGTH: safer.kMaxLength,
      }
      if (safer.kStringMaxLength) {
        safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength
      }
    }
    module2.exports = safer
  },
})

// lib/asn1/base/reporter.js
var require_reporter = __commonJS({
  "lib/asn1/base/reporter.js"(exports2) {
    "use strict"
    var inherits = require_inherits()
    function Reporter(options) {
      this._reporterState = {
        obj: null,
        path: [],
        options: options || {},
        errors: [],
      }
    }
    exports2.Reporter = Reporter
    Reporter.prototype.isError = function isError(obj) {
      return obj instanceof ReporterError
    }
    Reporter.prototype.save = function save() {
      const state = this._reporterState
      return { obj: state.obj, pathLen: state.path.length }
    }
    Reporter.prototype.restore = function restore(data) {
      const state = this._reporterState
      state.obj = data.obj
      state.path = state.path.slice(0, data.pathLen)
    }
    Reporter.prototype.enterKey = function enterKey(key) {
      return this._reporterState.path.push(key)
    }
    Reporter.prototype.exitKey = function exitKey(index) {
      const state = this._reporterState
      state.path = state.path.slice(0, index - 1)
    }
    Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
      const state = this._reporterState
      this.exitKey(index)
      if (state.obj !== null) state.obj[key] = value
    }
    Reporter.prototype.path = function path() {
      return this._reporterState.path.join("/")
    }
    Reporter.prototype.enterObject = function enterObject() {
      const state = this._reporterState
      const prev = state.obj
      state.obj = {}
      return prev
    }
    Reporter.prototype.leaveObject = function leaveObject(prev) {
      const state = this._reporterState
      const now = state.obj
      state.obj = prev
      return now
    }
    Reporter.prototype.error = function error(msg) {
      let err
      const state = this._reporterState
      const inherited = msg instanceof ReporterError
      if (inherited) {
        err = msg
      } else {
        err = new ReporterError(
          state.path
            .map(function (elem) {
              return "[" + JSON.stringify(elem) + "]"
            })
            .join(""),
          msg.message || msg,
          msg.stack
        )
      }
      if (!state.options.partial) throw err
      if (!inherited) state.errors.push(err)
      return err
    }
    Reporter.prototype.wrapResult = function wrapResult(result) {
      const state = this._reporterState
      if (!state.options.partial) return result
      return {
        result: this.isError(result) ? null : result,
        errors: state.errors,
      }
    }
    function ReporterError(path, msg) {
      this.path = path
      this.rethrow(msg)
    }
    inherits(ReporterError, Error)
    ReporterError.prototype.rethrow = function rethrow(msg) {
      this.message = msg + " at: " + (this.path || "(shallow)")
      if (Error.captureStackTrace) Error.captureStackTrace(this, ReporterError)
      if (!this.stack) {
        try {
          throw new Error(this.message)
        } catch (e) {
          this.stack = e.stack
        }
      }
      return this
    }
  },
})

// lib/asn1/base/buffer.js
var require_buffer = __commonJS({
  "lib/asn1/base/buffer.js"(exports2) {
    "use strict"
    var inherits = require_inherits()
    var Reporter = require_reporter().Reporter
    var Buffer2 = require_safer().Buffer
    function DecoderBuffer(base, options) {
      Reporter.call(this, options)
      if (!Buffer2.isBuffer(base)) {
        this.error("Input not Buffer")
        return
      }
      this.base = base
      this.offset = 0
      this.length = base.length
    }
    inherits(DecoderBuffer, Reporter)
    exports2.DecoderBuffer = DecoderBuffer
    DecoderBuffer.isDecoderBuffer = function isDecoderBuffer(data) {
      if (data instanceof DecoderBuffer) {
        return true
      }
      const isCompatible =
        typeof data === "object" &&
        Buffer2.isBuffer(data.base) &&
        data.constructor.name === "DecoderBuffer" &&
        typeof data.offset === "number" &&
        typeof data.length === "number" &&
        typeof data.save === "function" &&
        typeof data.restore === "function" &&
        typeof data.isEmpty === "function" &&
        typeof data.readUInt8 === "function" &&
        typeof data.skip === "function" &&
        typeof data.raw === "function"
      return isCompatible
    }
    DecoderBuffer.prototype.save = function save() {
      return {
        offset: this.offset,
        reporter: Reporter.prototype.save.call(this),
      }
    }
    DecoderBuffer.prototype.restore = function restore(save) {
      const res = new DecoderBuffer(this.base)
      res.offset = save.offset
      res.length = this.offset
      this.offset = save.offset
      Reporter.prototype.restore.call(this, save.reporter)
      return res
    }
    DecoderBuffer.prototype.isEmpty = function isEmpty() {
      return this.offset === this.length
    }
    DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
      if (this.offset + 1 <= this.length)
        return this.base.readUInt8(this.offset++, true)
      else return this.error(fail || "DecoderBuffer overrun")
    }
    DecoderBuffer.prototype.skip = function skip(bytes, fail) {
      if (!(this.offset + bytes <= this.length))
        return this.error(fail || "DecoderBuffer overrun")
      const res = new DecoderBuffer(this.base)
      res._reporterState = this._reporterState
      res.offset = this.offset
      res.length = this.offset + bytes
      this.offset += bytes
      return res
    }
    DecoderBuffer.prototype.raw = function raw(save) {
      return this.base.slice(save ? save.offset : this.offset, this.length)
    }
    function EncoderBuffer(value, reporter) {
      if (Array.isArray(value)) {
        this.length = 0
        this.value = value.map(function (item) {
          if (!EncoderBuffer.isEncoderBuffer(item))
            item = new EncoderBuffer(item, reporter)
          this.length += item.length
          return item
        }, this)
      } else if (typeof value === "number") {
        if (!(0 <= value && value <= 255))
          return reporter.error("non-byte EncoderBuffer value")
        this.value = value
        this.length = 1
      } else if (typeof value === "string") {
        this.value = value
        this.length = Buffer2.byteLength(value)
      } else if (Buffer2.isBuffer(value)) {
        this.value = value
        this.length = value.length
      } else {
        return reporter.error("Unsupported type: " + typeof value)
      }
    }
    exports2.EncoderBuffer = EncoderBuffer
    EncoderBuffer.isEncoderBuffer = function isEncoderBuffer(data) {
      if (data instanceof EncoderBuffer) {
        return true
      }
      const isCompatible =
        typeof data === "object" &&
        data.constructor.name === "EncoderBuffer" &&
        typeof data.length === "number" &&
        typeof data.join === "function"
      return isCompatible
    }
    EncoderBuffer.prototype.join = function join(out, offset) {
      if (!out) out = Buffer2.alloc(this.length)
      if (!offset) offset = 0
      if (this.length === 0) return out
      if (Array.isArray(this.value)) {
        this.value.forEach(function (item) {
          item.join(out, offset)
          offset += item.length
        })
      } else {
        if (typeof this.value === "number") out[offset] = this.value
        else if (typeof this.value === "string") out.write(this.value, offset)
        else if (Buffer2.isBuffer(this.value)) this.value.copy(out, offset)
        offset += this.length
      }
      return out
    }
  },
})

// node_modules/minimalistic-assert/index.js
var require_minimalistic_assert = __commonJS({
  "node_modules/minimalistic-assert/index.js"(exports2, module2) {
    module2.exports = assert
    function assert(val, msg) {
      if (!val) throw new Error(msg || "Assertion failed")
    }
    assert.equal = function assertEqual(l, r, msg) {
      if (l != r) throw new Error(msg || "Assertion failed: " + l + " != " + r)
    }
  },
})

// lib/asn1/base/node.js
var require_node = __commonJS({
  "lib/asn1/base/node.js"(exports2, module2) {
    "use strict"
    var Reporter = require_reporter().Reporter
    var EncoderBuffer = require_buffer().EncoderBuffer
    var DecoderBuffer = require_buffer().DecoderBuffer
    var assert = require_minimalistic_assert()
    var tags = [
      "seq",
      "seqof",
      "set",
      "setof",
      "objid",
      "bool",
      "gentime",
      "utctime",
      "null_",
      "enum",
      "int",
      "objDesc",
      "bitstr",
      "bmpstr",
      "charstr",
      "genstr",
      "graphstr",
      "ia5str",
      "iso646str",
      "numstr",
      "octstr",
      "printstr",
      "t61str",
      "unistr",
      "utf8str",
      "videostr",
    ]
    var methods = [
      "key",
      "obj",
      "use",
      "optional",
      "explicit",
      "implicit",
      "def",
      "choice",
      "any",
      "contains",
    ].concat(tags)
    var overrided = [
      "_peekTag",
      "_decodeTag",
      "_use",
      "_decodeStr",
      "_decodeObjid",
      "_decodeTime",
      "_decodeNull",
      "_decodeInt",
      "_decodeBool",
      "_decodeList",
      "_encodeComposite",
      "_encodeStr",
      "_encodeObjid",
      "_encodeTime",
      "_encodeNull",
      "_encodeInt",
      "_encodeBool",
    ]
    function Node(enc, parent, name) {
      const state = {}
      this._baseState = state
      state.name = name
      state.enc = enc
      state.parent = parent || null
      state.children = null
      state.tag = null
      state.args = null
      state.reverseArgs = null
      state.choice = null
      state.optional = false
      state.any = false
      state.obj = false
      state.use = null
      state.useDecoder = null
      state.key = null
      state["default"] = null
      state.explicit = null
      state.implicit = null
      state.contains = null
      if (!state.parent) {
        state.children = []
        this._wrap()
      }
    }
    module2.exports = Node
    var stateProps = [
      "enc",
      "parent",
      "children",
      "tag",
      "args",
      "reverseArgs",
      "choice",
      "optional",
      "any",
      "obj",
      "use",
      "alteredUse",
      "key",
      "default",
      "explicit",
      "implicit",
      "contains",
    ]
    Node.prototype.clone = function clone() {
      const state = this._baseState
      const cstate = {}
      stateProps.forEach(function (prop) {
        cstate[prop] = state[prop]
      })
      const res = new this.constructor(cstate.parent)
      res._baseState = cstate
      return res
    }
    Node.prototype._wrap = function wrap() {
      const state = this._baseState
      methods.forEach(function (method) {
        this[method] = function _wrappedMethod() {
          const clone = new this.constructor(this)
          state.children.push(clone)
          return clone[method].apply(clone, arguments)
        }
      }, this)
    }
    Node.prototype._init = function init(body) {
      const state = this._baseState
      assert(state.parent === null)
      body.call(this)
      state.children = state.children.filter(function (child) {
        return child._baseState.parent === this
      }, this)
      assert.equal(
        state.children.length,
        1,
        "Root node can have only one child"
      )
    }
    Node.prototype._useArgs = function useArgs(args) {
      const state = this._baseState
      const children = args.filter(function (arg) {
        return arg instanceof this.constructor
      }, this)
      args = args.filter(function (arg) {
        return !(arg instanceof this.constructor)
      }, this)
      if (children.length !== 0) {
        assert(state.children === null)
        state.children = children
        children.forEach(function (child) {
          child._baseState.parent = this
        }, this)
      }
      if (args.length !== 0) {
        assert(state.args === null)
        state.args = args
        state.reverseArgs = args.map(function (arg) {
          if (typeof arg !== "object" || arg.constructor !== Object) return arg
          const res = {}
          Object.keys(arg).forEach(function (key) {
            if (key == (key | 0)) key |= 0
            const value = arg[key]
            res[value] = key
          })
          return res
        })
      }
    }
    overrided.forEach(function (method) {
      Node.prototype[method] = function _overrided() {
        const state = this._baseState
        throw new Error(method + " not implemented for encoding: " + state.enc)
      }
    })
    tags.forEach(function (tag) {
      Node.prototype[tag] = function _tagMethod() {
        const state = this._baseState
        const args = Array.prototype.slice.call(arguments)
        assert(state.tag === null)
        state.tag = tag
        this._useArgs(args)
        return this
      }
    })
    Node.prototype.use = function use(item) {
      assert(item)
      const state = this._baseState
      assert(state.use === null)
      state.use = item
      return this
    }
    Node.prototype.optional = function optional() {
      const state = this._baseState
      state.optional = true
      return this
    }
    Node.prototype.def = function def(val) {
      const state = this._baseState
      assert(state["default"] === null)
      state["default"] = val
      state.optional = true
      return this
    }
    Node.prototype.explicit = function explicit(num) {
      const state = this._baseState
      assert(state.explicit === null && state.implicit === null)
      state.explicit = num
      return this
    }
    Node.prototype.implicit = function implicit(num) {
      const state = this._baseState
      assert(state.explicit === null && state.implicit === null)
      state.implicit = num
      return this
    }
    Node.prototype.obj = function obj() {
      const state = this._baseState
      const args = Array.prototype.slice.call(arguments)
      state.obj = true
      if (args.length !== 0) this._useArgs(args)
      return this
    }
    Node.prototype.key = function key(newKey) {
      const state = this._baseState
      assert(state.key === null)
      state.key = newKey
      return this
    }
    Node.prototype.any = function any() {
      const state = this._baseState
      state.any = true
      return this
    }
    Node.prototype.choice = function choice(obj) {
      const state = this._baseState
      assert(state.choice === null)
      state.choice = obj
      this._useArgs(
        Object.keys(obj).map(function (key) {
          return obj[key]
        })
      )
      return this
    }
    Node.prototype.contains = function contains(item) {
      const state = this._baseState
      assert(state.use === null)
      state.contains = item
      return this
    }
    Node.prototype._decode = function decode(input, options) {
      const state = this._baseState
      if (state.parent === null)
        return input.wrapResult(state.children[0]._decode(input, options))
      let result = state["default"]
      let present = true
      let prevKey = null
      if (state.key !== null) prevKey = input.enterKey(state.key)
      if (state.optional) {
        let tag = null
        if (state.explicit !== null) tag = state.explicit
        else if (state.implicit !== null) tag = state.implicit
        else if (state.tag !== null) tag = state.tag
        if (tag === null && !state.any) {
          const save = input.save()
          try {
            if (state.choice === null)
              this._decodeGeneric(state.tag, input, options)
            else this._decodeChoice(input, options)
            present = true
          } catch (e) {
            present = false
          }
          input.restore(save)
        } else {
          present = this._peekTag(input, tag, state.any)
          if (input.isError(present)) return present
        }
      }
      let prevObj
      if (state.obj && present) prevObj = input.enterObject()
      if (present) {
        if (state.explicit !== null) {
          const explicit = this._decodeTag(input, state.explicit)
          if (input.isError(explicit)) return explicit
          input = explicit
        }
        const start = input.offset
        if (state.use === null && state.choice === null) {
          let save
          if (state.any) save = input.save()
          const body = this._decodeTag(
            input,
            state.implicit !== null ? state.implicit : state.tag,
            state.any
          )
          if (input.isError(body)) return body
          if (state.any) result = input.raw(save)
          else input = body
        }
        if (options && options.track && state.tag !== null)
          options.track(input.path(), start, input.length, "tagged")
        if (options && options.track && state.tag !== null)
          options.track(input.path(), input.offset, input.length, "content")
        if (state.any) {
        } else if (state.choice === null) {
          result = this._decodeGeneric(state.tag, input, options)
        } else {
          result = this._decodeChoice(input, options)
        }
        if (input.isError(result)) return result
        if (!state.any && state.choice === null && state.children !== null) {
          state.children.forEach(function decodeChildren(child) {
            child._decode(input, options)
          })
        }
        if (
          state.contains &&
          (state.tag === "octstr" || state.tag === "bitstr")
        ) {
          const data = new DecoderBuffer(result)
          result = this._getUse(
            state.contains,
            input._reporterState.obj
          )._decode(data, options)
        }
      }
      if (state.obj && present) result = input.leaveObject(prevObj)
      if (state.key !== null && (result !== null || present === true))
        input.leaveKey(prevKey, state.key, result)
      else if (prevKey !== null) input.exitKey(prevKey)
      return result
    }
    Node.prototype._decodeGeneric = function decodeGeneric(
      tag,
      input,
      options
    ) {
      const state = this._baseState
      if (tag === "seq" || tag === "set") return null
      if (tag === "seqof" || tag === "setof")
        return this._decodeList(input, tag, state.args[0], options)
      else if (/str$/.test(tag)) return this._decodeStr(input, tag, options)
      else if (tag === "objid" && state.args)
        return this._decodeObjid(input, state.args[0], state.args[1], options)
      else if (tag === "objid")
        return this._decodeObjid(input, null, null, options)
      else if (tag === "gentime" || tag === "utctime")
        return this._decodeTime(input, tag, options)
      else if (tag === "null_") return this._decodeNull(input, options)
      else if (tag === "bool") return this._decodeBool(input, options)
      else if (tag === "objDesc") return this._decodeStr(input, tag, options)
      else if (tag === "int" || tag === "enum")
        return this._decodeInt(input, state.args && state.args[0], options)
      if (state.use !== null) {
        return this._getUse(state.use, input._reporterState.obj)._decode(
          input,
          options
        )
      } else {
        return input.error("unknown tag: " + tag)
      }
    }
    Node.prototype._getUse = function _getUse(entity, obj) {
      const state = this._baseState
      state.useDecoder = this._use(entity, obj)
      assert(state.useDecoder._baseState.parent === null)
      state.useDecoder = state.useDecoder._baseState.children[0]
      if (state.implicit !== state.useDecoder._baseState.implicit) {
        state.useDecoder = state.useDecoder.clone()
        state.useDecoder._baseState.implicit = state.implicit
      }
      return state.useDecoder
    }
    Node.prototype._decodeChoice = function decodeChoice(input, options) {
      const state = this._baseState
      let result = null
      let match = false
      Object.keys(state.choice).some(function (key) {
        const save = input.save()
        const node = state.choice[key]
        try {
          const value = node._decode(input, options)
          if (input.isError(value)) return false
          result = { type: key, value }
          match = true
        } catch (e) {
          input.restore(save)
          return false
        }
        return true
      }, this)
      if (!match) return input.error("Choice not matched")
      return result
    }
    Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
      return new EncoderBuffer(data, this.reporter)
    }
    Node.prototype._encode = function encode(data, reporter, parent) {
      const state = this._baseState
      if (state["default"] !== null && state["default"] === data) return
      const result = this._encodeValue(data, reporter, parent)
      if (result === void 0) return
      if (this._skipDefault(result, reporter, parent)) return
      return result
    }
    Node.prototype._encodeValue = function encode(data, reporter, parent) {
      const state = this._baseState
      if (state.parent === null)
        return state.children[0]._encode(data, reporter || new Reporter())
      let result = null
      this.reporter = reporter
      if (state.optional && data === void 0) {
        if (state["default"] !== null) data = state["default"]
        else return
      }
      let content = null
      let primitive = false
      if (state.any) {
        result = this._createEncoderBuffer(data)
      } else if (state.choice) {
        result = this._encodeChoice(data, reporter)
      } else if (state.contains) {
        content = this._getUse(state.contains, parent)._encode(data, reporter)
        primitive = true
      } else if (state.children) {
        content = state.children
          .map(function (child) {
            if (child._baseState.tag === "null_")
              return child._encode(null, reporter, data)
            if (child._baseState.key === null)
              return reporter.error("Child should have a key")
            const prevKey = reporter.enterKey(child._baseState.key)
            if (typeof data !== "object")
              return reporter.error("Child expected, but input is not object")
            const res = child._encode(
              data[child._baseState.key],
              reporter,
              data
            )
            reporter.leaveKey(prevKey)
            return res
          }, this)
          .filter(function (child) {
            return child
          })
        content = this._createEncoderBuffer(content)
      } else {
        if (state.tag === "seqof" || state.tag === "setof") {
          if (!(state.args && state.args.length === 1))
            return reporter.error("Too many args for : " + state.tag)
          if (!Array.isArray(data))
            return reporter.error("seqof/setof, but data is not Array")
          const child = this.clone()
          child._baseState.implicit = null
          content = this._createEncoderBuffer(
            data.map(function (item) {
              const state2 = this._baseState
              return this._getUse(state2.args[0], data)._encode(item, reporter)
            }, child)
          )
        } else if (state.use !== null) {
          result = this._getUse(state.use, parent)._encode(data, reporter)
        } else {
          content = this._encodePrimitive(state.tag, data)
          primitive = true
        }
      }
      if (!state.any && state.choice === null) {
        const tag = state.implicit !== null ? state.implicit : state.tag
        const cls = state.implicit === null ? "universal" : "context"
        if (tag === null) {
          if (state.use === null)
            reporter.error("Tag could be omitted only for .use()")
        } else {
          if (state.use === null)
            result = this._encodeComposite(tag, primitive, cls, content)
        }
      }
      if (state.explicit !== null)
        result = this._encodeComposite(state.explicit, false, "context", result)
      return result
    }
    Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
      const state = this._baseState
      const node = state.choice[data.type]
      if (!node) {
        assert(
          false,
          data.type +
            " not found in " +
            JSON.stringify(Object.keys(state.choice))
        )
      }
      return node._encode(data.value, reporter)
    }
    Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
      const state = this._baseState
      if (/str$/.test(tag)) return this._encodeStr(data, tag)
      else if (tag === "objid" && state.args)
        return this._encodeObjid(data, state.reverseArgs[0], state.args[1])
      else if (tag === "objid") return this._encodeObjid(data, null, null)
      else if (tag === "gentime" || tag === "utctime")
        return this._encodeTime(data, tag)
      else if (tag === "null_") return this._encodeNull()
      else if (tag === "int" || tag === "enum")
        return this._encodeInt(data, state.args && state.reverseArgs[0])
      else if (tag === "bool") return this._encodeBool(data)
      else if (tag === "objDesc") return this._encodeStr(data, tag)
      else throw new Error("Unsupported tag: " + tag)
    }
    Node.prototype._isNumstr = function isNumstr(str) {
      return /^[0-9 ]*$/.test(str)
    }
    Node.prototype._isPrintstr = function isPrintstr(str) {
      return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(str)
    }
  },
})

// lib/asn1/constants/der.js
var require_der = __commonJS({
  "lib/asn1/constants/der.js"(exports2) {
    "use strict"
    function reverse(map) {
      const res = {}
      Object.keys(map).forEach(function (key) {
        if ((key | 0) == key) key = key | 0
        const value = map[key]
        res[value] = key
      })
      return res
    }
    exports2.tagClass = {
      0: "universal",
      1: "application",
      2: "context",
      3: "private",
    }
    exports2.tagClassByName = reverse(exports2.tagClass)
    exports2.tag = {
      0: "end",
      1: "bool",
      2: "int",
      3: "bitstr",
      4: "octstr",
      5: "null_",
      6: "objid",
      7: "objDesc",
      8: "external",
      9: "real",
      10: "enum",
      11: "embed",
      12: "utf8str",
      13: "relativeOid",
      16: "seq",
      17: "set",
      18: "numstr",
      19: "printstr",
      20: "t61str",
      21: "videostr",
      22: "ia5str",
      23: "utctime",
      24: "gentime",
      25: "graphstr",
      26: "iso646str",
      27: "genstr",
      28: "unistr",
      29: "charstr",
      30: "bmpstr",
    }
    exports2.tagByName = reverse(exports2.tag)
  },
})

// lib/asn1/encoders/der.js
var require_der2 = __commonJS({
  "lib/asn1/encoders/der.js"(exports2, module2) {
    "use strict"
    var inherits = require_inherits()
    var Buffer2 = require_safer().Buffer
    var Node = require_node()
    var der = require_der()
    function DEREncoder(entity) {
      this.enc = "der"
      this.name = entity.name
      this.entity = entity
      this.tree = new DERNode()
      this.tree._init(entity.body)
    }
    module2.exports = DEREncoder
    DEREncoder.prototype.encode = function encode(data, reporter) {
      return this.tree._encode(data, reporter).join()
    }
    function DERNode(parent) {
      Node.call(this, "der", parent)
    }
    inherits(DERNode, Node)
    DERNode.prototype._encodeComposite = function encodeComposite(
      tag,
      primitive,
      cls,
      content
    ) {
      const encodedTag = encodeTag(tag, primitive, cls, this.reporter)
      if (content.length < 128) {
        const header2 = Buffer2.alloc(2)
        header2[0] = encodedTag
        header2[1] = content.length
        return this._createEncoderBuffer([header2, content])
      }
      let lenOctets = 1
      for (let i = content.length; i >= 256; i >>= 8) lenOctets++
      const header = Buffer2.alloc(1 + 1 + lenOctets)
      header[0] = encodedTag
      header[1] = 128 | lenOctets
      for (let i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
        header[i] = j & 255
      return this._createEncoderBuffer([header, content])
    }
    DERNode.prototype._encodeStr = function encodeStr(str, tag) {
      if (tag === "bitstr") {
        return this._createEncoderBuffer([str.unused | 0, str.data])
      } else if (tag === "bmpstr") {
        const buf = Buffer2.alloc(str.length * 2)
        for (let i = 0; i < str.length; i++) {
          buf.writeUInt16BE(str.charCodeAt(i), i * 2)
        }
        return this._createEncoderBuffer(buf)
      } else if (tag === "numstr") {
        if (!this._isNumstr(str)) {
          return this.reporter.error(
            "Encoding of string type: numstr supports only digits and space"
          )
        }
        return this._createEncoderBuffer(str)
      } else if (tag === "printstr") {
        if (!this._isPrintstr(str)) {
          return this.reporter.error(
            "Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark"
          )
        }
        return this._createEncoderBuffer(str)
      } else if (/str$/.test(tag)) {
        return this._createEncoderBuffer(str)
      } else if (tag === "objDesc") {
        return this._createEncoderBuffer(str)
      } else {
        return this.reporter.error(
          "Encoding of string type: " + tag + " unsupported"
        )
      }
    }
    DERNode.prototype._encodeObjid = function encodeObjid(
      id,
      values,
      relative
    ) {
      if (typeof id === "string") {
        if (!values)
          return this.reporter.error(
            "string objid given, but no values map found"
          )
        if (!values.hasOwnProperty(id))
          return this.reporter.error("objid not found in values map")
        id = values[id].split(/[\s.]+/g)
        for (let i = 0; i < id.length; i++) id[i] |= 0
      } else if (Array.isArray(id)) {
        id = id.slice()
        for (let i = 0; i < id.length; i++) id[i] |= 0
      }
      if (!Array.isArray(id)) {
        return this.reporter.error(
          "objid() should be either array or string, got: " + JSON.stringify(id)
        )
      }
      if (!relative) {
        if (id[1] >= 40)
          return this.reporter.error("Second objid identifier OOB")
        id.splice(0, 2, id[0] * 40 + id[1])
      }
      let size = 0
      for (let i = 0; i < id.length; i++) {
        let ident = id[i]
        for (size++; ident >= 128; ident >>= 7) size++
      }
      const objid = Buffer2.alloc(size)
      let offset = objid.length - 1
      for (let i = id.length - 1; i >= 0; i--) {
        let ident = id[i]
        objid[offset--] = ident & 127
        while ((ident >>= 7) > 0) objid[offset--] = 128 | (ident & 127)
      }
      return this._createEncoderBuffer(objid)
    }
    function two(num) {
      if (num < 10) return "0" + num
      else return num
    }
    DERNode.prototype._encodeTime = function encodeTime(time, tag) {
      let str
      const date = new Date(time)
      if (tag === "gentime") {
        str = [
          two(date.getUTCFullYear()),
          two(date.getUTCMonth() + 1),
          two(date.getUTCDate()),
          two(date.getUTCHours()),
          two(date.getUTCMinutes()),
          two(date.getUTCSeconds()),
          "Z",
        ].join("")
      } else if (tag === "utctime") {
        str = [
          two(date.getUTCFullYear() % 100),
          two(date.getUTCMonth() + 1),
          two(date.getUTCDate()),
          two(date.getUTCHours()),
          two(date.getUTCMinutes()),
          two(date.getUTCSeconds()),
          "Z",
        ].join("")
      } else {
        this.reporter.error("Encoding " + tag + " time is not supported yet")
      }
      return this._encodeStr(str, "octstr")
    }
    DERNode.prototype._encodeNull = function encodeNull() {
      return this._createEncoderBuffer("")
    }
    DERNode.prototype._encodeInt = function encodeInt(num, values) {
      if (typeof num === "string") {
        if (!values)
          return this.reporter.error(
            "String int or enum given, but no values map"
          )
        if (!values.hasOwnProperty(num)) {
          return this.reporter.error(
            "Values map doesn't contain: " + JSON.stringify(num)
          )
        }
        num = values[num]
      }
      if (typeof num !== "number" && !Buffer2.isBuffer(num)) {
        const numArray = num.toArray()
        if (!num.sign && numArray[0] & 128) {
          numArray.unshift(0)
        }
        num = Buffer2.from(numArray)
      }
      if (Buffer2.isBuffer(num)) {
        let size2 = num.length
        if (num.length === 0) size2++
        const out2 = Buffer2.alloc(size2)
        num.copy(out2)
        if (num.length === 0) out2[0] = 0
        return this._createEncoderBuffer(out2)
      }
      if (num < 128) return this._createEncoderBuffer(num)
      if (num < 256) return this._createEncoderBuffer([0, num])
      let size = 1
      for (let i = num; i >= 256; i >>= 8) size++
      const out = new Array(size)
      for (let i = out.length - 1; i >= 0; i--) {
        out[i] = num & 255
        num >>= 8
      }
      if (out[0] & 128) {
        out.unshift(0)
      }
      return this._createEncoderBuffer(Buffer2.from(out))
    }
    DERNode.prototype._encodeBool = function encodeBool(value) {
      return this._createEncoderBuffer(value ? 255 : 0)
    }
    DERNode.prototype._use = function use(entity, obj) {
      if (typeof entity === "function") entity = entity(obj)
      return entity._getEncoder("der").tree
    }
    DERNode.prototype._skipDefault = function skipDefault(
      dataBuffer,
      reporter,
      parent
    ) {
      const state = this._baseState
      let i
      if (state["default"] === null) return false
      const data = dataBuffer.join()
      if (state.defaultBuffer === void 0)
        state.defaultBuffer = this._encodeValue(
          state["default"],
          reporter,
          parent
        ).join()
      if (data.length !== state.defaultBuffer.length) return false
      for (i = 0; i < data.length; i++)
        if (data[i] !== state.defaultBuffer[i]) return false
      return true
    }
    function encodeTag(tag, primitive, cls, reporter) {
      let res
      if (tag === "seqof") tag = "seq"
      else if (tag === "setof") tag = "set"
      if (der.tagByName.hasOwnProperty(tag)) res = der.tagByName[tag]
      else if (typeof tag === "number" && (tag | 0) === tag) res = tag
      else return reporter.error("Unknown tag: " + tag)
      if (res >= 31)
        return reporter.error("Multi-octet tag encoding unsupported")
      if (!primitive) res |= 32
      res |= der.tagClassByName[cls || "universal"] << 6
      return res
    }
  },
})

// lib/asn1/encoders/pem.js
var require_pem = __commonJS({
  "lib/asn1/encoders/pem.js"(exports2, module2) {
    "use strict"
    var inherits = require_inherits()
    var DEREncoder = require_der2()
    function PEMEncoder(entity) {
      DEREncoder.call(this, entity)
      this.enc = "pem"
    }
    inherits(PEMEncoder, DEREncoder)
    module2.exports = PEMEncoder
    PEMEncoder.prototype.encode = function encode(data, options) {
      const buf = DEREncoder.prototype.encode.call(this, data)
      const p = buf.toString("base64")
      const out = ["-----BEGIN " + options.label + "-----"]
      for (let i = 0; i < p.length; i += 64) out.push(p.slice(i, i + 64))
      out.push("-----END " + options.label + "-----")
      return out.join("\n")
    }
  },
})

// lib/asn1/encoders/index.js
var require_encoders = __commonJS({
  "lib/asn1/encoders/index.js"(exports2) {
    "use strict"
    var encoders = exports2
    encoders.der = require_der2()
    encoders.pem = require_pem()
  },
})

// lib/asn1/decoders/der.js
var require_der3 = __commonJS({
  "lib/asn1/decoders/der.js"(exports2, module2) {
    "use strict"
    var inherits = require_inherits()
    var bignum = require_bn()
    var DecoderBuffer = require_buffer().DecoderBuffer
    var Node = require_node()
    var der = require_der()
    function DERDecoder(entity) {
      this.enc = "der"
      this.name = entity.name
      this.entity = entity
      this.tree = new DERNode()
      this.tree._init(entity.body)
    }
    module2.exports = DERDecoder
    DERDecoder.prototype.decode = function decode(data, options) {
      if (!DecoderBuffer.isDecoderBuffer(data)) {
        data = new DecoderBuffer(data, options)
      }
      return this.tree._decode(data, options)
    }
    function DERNode(parent) {
      Node.call(this, "der", parent)
    }
    inherits(DERNode, Node)
    DERNode.prototype._peekTag = function peekTag(buffer, tag, any) {
      if (buffer.isEmpty()) return false
      const state = buffer.save()
      const decodedTag = derDecodeTag(
        buffer,
        'Failed to peek tag: "' + tag + '"'
      )
      if (buffer.isError(decodedTag)) return decodedTag
      buffer.restore(state)
      return (
        decodedTag.tag === tag ||
        decodedTag.tagStr === tag ||
        decodedTag.tagStr + "of" === tag ||
        any
      )
    }
    DERNode.prototype._decodeTag = function decodeTag(buffer, tag, any) {
      const decodedTag = derDecodeTag(
        buffer,
        'Failed to decode tag of "' + tag + '"'
      )
      if (buffer.isError(decodedTag)) return decodedTag
      let len = derDecodeLen(
        buffer,
        decodedTag.primitive,
        'Failed to get length of "' + tag + '"'
      )
      if (buffer.isError(len)) return len
      if (
        !any &&
        decodedTag.tag !== tag &&
        decodedTag.tagStr !== tag &&
        decodedTag.tagStr + "of" !== tag
      ) {
        return buffer.error('Failed to match tag: "' + tag + '"')
      }
      if (decodedTag.primitive || len !== null)
        return buffer.skip(len, 'Failed to match body of: "' + tag + '"')
      const state = buffer.save()
      const res = this._skipUntilEnd(
        buffer,
        'Failed to skip indefinite length body: "' + this.tag + '"'
      )
      if (buffer.isError(res)) return res
      len = buffer.offset - state.offset
      buffer.restore(state)
      return buffer.skip(len, 'Failed to match body of: "' + tag + '"')
    }
    DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer, fail) {
      for (;;) {
        const tag = derDecodeTag(buffer, fail)
        if (buffer.isError(tag)) return tag
        const len = derDecodeLen(buffer, tag.primitive, fail)
        if (buffer.isError(len)) return len
        let res
        if (tag.primitive || len !== null) res = buffer.skip(len)
        else res = this._skipUntilEnd(buffer, fail)
        if (buffer.isError(res)) return res
        if (tag.tagStr === "end") break
      }
    }
    DERNode.prototype._decodeList = function decodeList(
      buffer,
      tag,
      decoder,
      options
    ) {
      const result = []
      while (!buffer.isEmpty()) {
        const possibleEnd = this._peekTag(buffer, "end")
        if (buffer.isError(possibleEnd)) return possibleEnd
        const res = decoder.decode(buffer, "der", options)
        if (buffer.isError(res) && possibleEnd) break
        result.push(res)
      }
      return result
    }
    DERNode.prototype._decodeStr = function decodeStr(buffer, tag) {
      if (tag === "bitstr") {
        const unused = buffer.readUInt8()
        if (buffer.isError(unused)) return unused
        return { unused, data: buffer.raw() }
      } else if (tag === "bmpstr") {
        const raw = buffer.raw()
        if (raw.length % 2 === 1)
          return buffer.error("Decoding of string type: bmpstr length mismatch")
        let str = ""
        for (let i = 0; i < raw.length / 2; i++) {
          str += String.fromCharCode(raw.readUInt16BE(i * 2))
        }
        return str
      } else if (tag === "numstr") {
        const numstr = buffer.raw().toString("ascii")
        if (!this._isNumstr(numstr)) {
          return buffer.error(
            "Decoding of string type: numstr unsupported characters"
          )
        }
        return numstr
      } else if (tag === "octstr") {
        return buffer.raw()
      } else if (tag === "objDesc") {
        return buffer.raw()
      } else if (tag === "printstr") {
        const printstr = buffer.raw().toString("ascii")
        if (!this._isPrintstr(printstr)) {
          return buffer.error(
            "Decoding of string type: printstr unsupported characters"
          )
        }
        return printstr
      } else if (/str$/.test(tag)) {
        return buffer.raw().toString()
      } else {
        return buffer.error("Decoding of string type: " + tag + " unsupported")
      }
    }
    DERNode.prototype._decodeObjid = function decodeObjid(
      buffer,
      values,
      relative
    ) {
      let result
      const identifiers = []
      let ident = 0
      let subident = 0
      while (!buffer.isEmpty()) {
        subident = buffer.readUInt8()
        ident <<= 7
        ident |= subident & 127
        if ((subident & 128) === 0) {
          identifiers.push(ident)
          ident = 0
        }
      }
      if (subident & 128) identifiers.push(ident)
      const first = (identifiers[0] / 40) | 0
      const second = identifiers[0] % 40
      if (relative) result = identifiers
      else result = [first, second].concat(identifiers.slice(1))
      if (values) {
        let tmp = values[result.join(" ")]
        if (tmp === void 0) tmp = values[result.join(".")]
        if (tmp !== void 0) result = tmp
      }
      return result
    }
    DERNode.prototype._decodeTime = function decodeTime(buffer, tag) {
      const str = buffer.raw().toString()
      let year
      let mon
      let day
      let hour
      let min
      let sec
      if (tag === "gentime") {
        year = str.slice(0, 4) | 0
        mon = str.slice(4, 6) | 0
        day = str.slice(6, 8) | 0
        hour = str.slice(8, 10) | 0
        min = str.slice(10, 12) | 0
        sec = str.slice(12, 14) | 0
      } else if (tag === "utctime") {
        year = str.slice(0, 2) | 0
        mon = str.slice(2, 4) | 0
        day = str.slice(4, 6) | 0
        hour = str.slice(6, 8) | 0
        min = str.slice(8, 10) | 0
        sec = str.slice(10, 12) | 0
        if (year < 70) year = 2e3 + year
        else year = 1900 + year
      } else {
        return buffer.error("Decoding " + tag + " time is not supported yet")
      }
      return Date.UTC(year, mon - 1, day, hour, min, sec, 0)
    }
    DERNode.prototype._decodeNull = function decodeNull() {
      return null
    }
    DERNode.prototype._decodeBool = function decodeBool(buffer) {
      const res = buffer.readUInt8()
      if (buffer.isError(res)) return res
      else return res !== 0
    }
    DERNode.prototype._decodeInt = function decodeInt(buffer, values) {
      const raw = buffer.raw()
      let res = new bignum(raw)
      if (values) res = values[res.toString(10)] || res
      return res
    }
    DERNode.prototype._use = function use(entity, obj) {
      if (typeof entity === "function") entity = entity(obj)
      return entity._getDecoder("der").tree
    }
    function derDecodeTag(buf, fail) {
      let tag = buf.readUInt8(fail)
      if (buf.isError(tag)) return tag
      const cls = der.tagClass[tag >> 6]
      const primitive = (tag & 32) === 0
      if ((tag & 31) === 31) {
        let oct = tag
        tag = 0
        while ((oct & 128) === 128) {
          oct = buf.readUInt8(fail)
          if (buf.isError(oct)) return oct
          tag <<= 7
          tag |= oct & 127
        }
      } else {
        tag &= 31
      }
      const tagStr = der.tag[tag]
      return {
        cls,
        primitive,
        tag,
        tagStr,
      }
    }
    function derDecodeLen(buf, primitive, fail) {
      let len = buf.readUInt8(fail)
      if (buf.isError(len)) return len
      if (!primitive && len === 128) return null
      if ((len & 128) === 0) {
        return len
      }
      const num = len & 127
      if (num > 4) return buf.error("length octect is too long")
      len = 0
      for (let i = 0; i < num; i++) {
        len <<= 8
        const j = buf.readUInt8(fail)
        if (buf.isError(j)) return j
        len |= j
      }
      return len
    }
  },
})

// lib/asn1/decoders/pem.js
var require_pem2 = __commonJS({
  "lib/asn1/decoders/pem.js"(exports2, module2) {
    "use strict"
    var inherits = require_inherits()
    var Buffer2 = require_safer().Buffer
    var DERDecoder = require_der3()
    function PEMDecoder(entity) {
      DERDecoder.call(this, entity)
      this.enc = "pem"
    }
    inherits(PEMDecoder, DERDecoder)
    module2.exports = PEMDecoder
    PEMDecoder.prototype.decode = function decode(data, options) {
      const lines = data.toString().split(/[\r\n]+/g)
      const label = options.label.toUpperCase()
      const re = /^-----(BEGIN|END) ([^-]+)-----$/
      let start = -1
      let end = -1
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(re)
        if (match === null) continue
        if (match[2] !== label) continue
        if (start === -1) {
          if (match[1] !== "BEGIN") break
          start = i
        } else {
          if (match[1] !== "END") break
          end = i
          break
        }
      }
      if (start === -1 || end === -1)
        throw new Error("PEM section not found for: " + label)
      const base64 = lines.slice(start + 1, end).join("")
      base64.replace(/[^a-z0-9+/=]+/gi, "")
      const input = Buffer2.from(base64, "base64")
      return DERDecoder.prototype.decode.call(this, input, options)
    }
  },
})

// lib/asn1/decoders/index.js
var require_decoders = __commonJS({
  "lib/asn1/decoders/index.js"(exports2) {
    "use strict"
    var decoders = exports2
    decoders.der = require_der3()
    decoders.pem = require_pem2()
  },
})

// lib/asn1/api.js
var require_api = __commonJS({
  "lib/asn1/api.js"(exports2) {
    "use strict"
    var encoders = require_encoders()
    var decoders = require_decoders()
    var inherits = require_inherits()
    var api = exports2
    api.define = function define(name, body) {
      return new Entity(name, body)
    }
    function Entity(name, body) {
      this.name = name
      this.body = body
      this.decoders = {}
      this.encoders = {}
    }
    Entity.prototype._createNamed = function createNamed(Base) {
      const name = this.name
      function Generated(entity) {
        this._initNamed(entity, name)
      }
      inherits(Generated, Base)
      Generated.prototype._initNamed = function _initNamed(entity, name2) {
        Base.call(this, entity, name2)
      }
      return new Generated(this)
    }
    Entity.prototype._getDecoder = function _getDecoder(enc) {
      enc = enc || "der"
      if (!this.decoders.hasOwnProperty(enc))
        this.decoders[enc] = this._createNamed(decoders[enc])
      return this.decoders[enc]
    }
    Entity.prototype.decode = function decode(data, enc, options) {
      return this._getDecoder(enc).decode(data, options)
    }
    Entity.prototype._getEncoder = function _getEncoder(enc) {
      enc = enc || "der"
      if (!this.encoders.hasOwnProperty(enc))
        this.encoders[enc] = this._createNamed(encoders[enc])
      return this.encoders[enc]
    }
    Entity.prototype.encode = function encode(data, enc, reporter) {
      return this._getEncoder(enc).encode(data, reporter)
    }
  },
})

// lib/asn1/base/index.js
var require_base = __commonJS({
  "lib/asn1/base/index.js"(exports2) {
    "use strict"
    var base = exports2
    base.Reporter = require_reporter().Reporter
    base.DecoderBuffer = require_buffer().DecoderBuffer
    base.EncoderBuffer = require_buffer().EncoderBuffer
    base.Node = require_node()
  },
})

// lib/asn1/constants/index.js
var require_constants = __commonJS({
  "lib/asn1/constants/index.js"(exports2) {
    "use strict"
    var constants = exports2
    constants._reverse = function reverse(map) {
      const res = {}
      Object.keys(map).forEach(function (key) {
        if ((key | 0) == key) key = key | 0
        const value = map[key]
        res[value] = key
      })
      return res
    }
    constants.der = require_der()
  },
})

// lib/asn1.js
var asn1 = exports

asn1.bignum = require_bn()
asn1.define = require_api().define
asn1.base = require_base()
asn1.constants = require_constants()
asn1.decoders = require_decoders()
asn1.encoders = require_encoders()
