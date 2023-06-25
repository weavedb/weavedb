var __getOwnPropNames = Object.getOwnPropertyNames
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    )
  }

// base64-js/index.js
var require_base64_js = __commonJS({
  "base64-js/index.js"(exports2) {
    "use strict"
    exports2.byteLength = byteLength
    exports2.toByteArray = toByteArray
    exports2.fromByteArray = fromByteArray
    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array
    var code =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i]
      revLookup[code.charCodeAt(i)] = i
    }
    var i
    var len
    revLookup["-".charCodeAt(0)] = 62
    revLookup["_".charCodeAt(0)] = 63
    function getLens(b64) {
      var len2 = b64.length
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4")
      }
      var validLen = b64.indexOf("=")
      if (validLen === -1) validLen = len2
      var placeHoldersLen = validLen === len2 ? 0 : 4 - (validLen % 4)
      return [validLen, placeHoldersLen]
    }
    function byteLength(b64) {
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
    }
    function toByteArray(b64) {
      var tmp
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
      var curByte = 0
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen
      var i2
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 18) |
          (revLookup[b64.charCodeAt(i2 + 1)] << 12) |
          (revLookup[b64.charCodeAt(i2 + 2)] << 6) |
          revLookup[b64.charCodeAt(i2 + 3)]
        arr[curByte++] = (tmp >> 16) & 255
        arr[curByte++] = (tmp >> 8) & 255
        arr[curByte++] = tmp & 255
      }
      if (placeHoldersLen === 2) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 2) |
          (revLookup[b64.charCodeAt(i2 + 1)] >> 4)
        arr[curByte++] = tmp & 255
      }
      if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 10) |
          (revLookup[b64.charCodeAt(i2 + 1)] << 4) |
          (revLookup[b64.charCodeAt(i2 + 2)] >> 2)
        arr[curByte++] = (tmp >> 8) & 255
        arr[curByte++] = tmp & 255
      }
      return arr
    }
    function tripletToBase64(num) {
      return (
        lookup[(num >> 18) & 63] +
        lookup[(num >> 12) & 63] +
        lookup[(num >> 6) & 63] +
        lookup[num & 63]
      )
    }
    function encodeChunk(uint8, start, end) {
      var tmp
      var output = []
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp =
          ((uint8[i2] << 16) & 16711680) +
          ((uint8[i2 + 1] << 8) & 65280) +
          (uint8[i2 + 2] & 255)
        output.push(tripletToBase64(tmp))
      }
      return output.join("")
    }
    function fromByteArray(uint8) {
      var tmp
      var len2 = uint8.length
      var extraBytes = len2 % 3
      var parts = []
      var maxChunkLength = 16383
      for (
        var i2 = 0, len22 = len2 - extraBytes;
        i2 < len22;
        i2 += maxChunkLength
      ) {
        parts.push(
          encodeChunk(
            uint8,
            i2,
            i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength
          )
        )
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1]
        parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 63] + "==")
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1]
        parts.push(
          lookup[tmp >> 10] +
            lookup[(tmp >> 4) & 63] +
            lookup[(tmp << 2) & 63] +
            "="
        )
      }
      return parts.join("")
    }
  },
})

// ieee754/index.js
var require_ieee754 = __commonJS({
  "ieee754/index.js"(exports2) {
    exports2.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var nBits = -7
      var i = isLE ? nBytes - 1 : 0
      var d = isLE ? -1 : 1
      var s = buffer[offset + i]
      i += d
      e = s & ((1 << -nBits) - 1)
      s >>= -nBits
      nBits += eLen
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
      m = e & ((1 << -nBits) - 1)
      e >>= -nBits
      nBits += mLen
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity
      } else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }
    exports2.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0
      var i = isLE ? 0 : nBytes - 1
      var d = isLE ? 1 : -1
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
      value = Math.abs(value)
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++
          c /= 2
        }
        if (e + eBias >= eMax) {
          m = 0
          e = eMax
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen)
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
          e = 0
        }
      }
      for (
        ;
        mLen >= 8;
        buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8
      ) {}
      e = (e << mLen) | m
      eLen += mLen
      for (
        ;
        eLen > 0;
        buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8
      ) {}
      buffer[offset + i - d] |= s * 128
    }
  },
})

// buffer/index.js
var require_buffer = __commonJS({
  "buffer/index.js"(exports2) {
    "use strict"
    var base64 = require_base64_js()
    var ieee754 = require_ieee754()
    var customInspectSymbol =
      typeof Symbol === "function" && typeof Symbol["for"] === "function"
        ? Symbol["for"]("nodejs.util.inspect.custom")
        : null
    exports2.Buffer = Buffer3
    exports2.SlowBuffer = SlowBuffer
    exports2.INSPECT_MAX_BYTES = 50
    var K_MAX_LENGTH = 2147483647
    exports2.kMaxLength = K_MAX_LENGTH
    Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport()
    if (
      !Buffer3.TYPED_ARRAY_SUPPORT &&
      typeof console !== "undefined" &&
      typeof console.error === "function"
    ) {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      )
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1)
        const proto = {
          foo: function () {
            return 42
          },
        }
        Object.setPrototypeOf(proto, Uint8Array.prototype)
        Object.setPrototypeOf(arr, proto)
        return arr.foo() === 42
      } catch (e) {
        return false
      }
    }
    Object.defineProperty(Buffer3.prototype, "parent", {
      enumerable: true,
      get: function () {
        if (!Buffer3.isBuffer(this)) return void 0
        return this.buffer
      },
    })
    Object.defineProperty(Buffer3.prototype, "offset", {
      enumerable: true,
      get: function () {
        if (!Buffer3.isBuffer(this)) return void 0
        return this.byteOffset
      },
    })
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError(
          'The value "' + length + '" is invalid for option "size"'
        )
      }
      const buf = new Uint8Array(length)
      Object.setPrototypeOf(buf, Buffer3.prototype)
      return buf
    }
    function Buffer3(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          )
        }
        return allocUnsafe(arg)
      }
      return from(arg, encodingOrOffset, length)
    }
    Buffer3.poolSize = 8192
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset)
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value)
      }
      if (value == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
            typeof value
        )
      }
      if (
        isInstance(value, ArrayBuffer) ||
        (value && isInstance(value.buffer, ArrayBuffer))
      ) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }
      if (
        typeof SharedArrayBuffer !== "undefined" &&
        (isInstance(value, SharedArrayBuffer) ||
          (value && isInstance(value.buffer, SharedArrayBuffer)))
      ) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }
      if (typeof value === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        )
      }
      const valueOf = value.valueOf && value.valueOf()
      if (valueOf != null && valueOf !== value) {
        return Buffer3.from(valueOf, encodingOrOffset, length)
      }
      const b = fromObject(value)
      if (b) return b
      if (
        typeof Symbol !== "undefined" &&
        Symbol.toPrimitive != null &&
        typeof value[Symbol.toPrimitive] === "function"
      ) {
        return Buffer3.from(
          value[Symbol.toPrimitive]("string"),
          encodingOrOffset,
          length
        )
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " +
          typeof value
      )
    }
    Buffer3.from = function (value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length)
    }
    Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype)
    Object.setPrototypeOf(Buffer3, Uint8Array)
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number')
      } else if (size < 0) {
        throw new RangeError(
          'The value "' + size + '" is invalid for option "size"'
        )
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size)
      if (size <= 0) {
        return createBuffer(size)
      }
      if (fill !== void 0) {
        return typeof encoding === "string"
          ? createBuffer(size).fill(fill, encoding)
          : createBuffer(size).fill(fill)
      }
      return createBuffer(size)
    }
    Buffer3.alloc = function (size, fill, encoding) {
      return alloc(size, fill, encoding)
    }
    function allocUnsafe(size) {
      assertSize(size)
      return createBuffer(size < 0 ? 0 : checked(size) | 0)
    }
    Buffer3.allocUnsafe = function (size) {
      return allocUnsafe(size)
    }
    Buffer3.allocUnsafeSlow = function (size) {
      return allocUnsafe(size)
    }
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8"
      }
      if (!Buffer3.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding)
      }
      const length = byteLength(string, encoding) | 0
      let buf = createBuffer(length)
      const actual = buf.write(string, encoding)
      if (actual !== length) {
        buf = buf.slice(0, actual)
      }
      return buf
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0
      const buf = createBuffer(length)
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255
      }
      return buf
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView)
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
      }
      return fromArrayLike(arrayView)
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds')
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds')
      }
      let buf
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array)
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset)
      } else {
        buf = new Uint8Array(array, byteOffset, length)
      }
      Object.setPrototypeOf(buf, Buffer3.prototype)
      return buf
    }
    function fromObject(obj) {
      if (Buffer3.isBuffer(obj)) {
        const len = checked(obj.length) | 0
        const buf = createBuffer(len)
        if (buf.length === 0) {
          return buf
        }
        obj.copy(buf, 0, 0, len)
        return buf
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0)
        }
        return fromArrayLike(obj)
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data)
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError(
          "Attempt to allocate Buffer larger than maximum size: 0x" +
            K_MAX_LENGTH.toString(16) +
            " bytes"
        )
      }
      return length | 0
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0
      }
      return Buffer3.alloc(+length)
    }
    Buffer3.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer3.prototype
    }
    Buffer3.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength)
      if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength)
      if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        )
      }
      if (a === b) return 0
      let x = a.length
      let y = b.length
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i]
          y = b[i]
          break
        }
      }
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    Buffer3.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true
        default:
          return false
      }
    }
    Buffer3.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      if (list.length === 0) {
        return Buffer3.alloc(0)
      }
      let i
      if (length === void 0) {
        length = 0
        for (i = 0; i < list.length; ++i) {
          length += list[i].length
        }
      }
      const buffer = Buffer3.allocUnsafe(length)
      let pos = 0
      for (i = 0; i < list.length; ++i) {
        let buf = list[i]
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf)
            buf.copy(buffer, pos)
          } else {
            Uint8Array.prototype.set.call(buffer, buf, pos)
          }
        } else if (!Buffer3.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        } else {
          buf.copy(buffer, pos)
        }
        pos += buf.length
      }
      return buffer
    }
    function byteLength(string, encoding) {
      if (Buffer3.isBuffer(string)) {
        return string.length
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
            typeof string
        )
      }
      const len = string.length
      const mustMatch = arguments.length > 2 && arguments[2] === true
      if (!mustMatch && len === 0) return 0
      let loweredCase = false
      for (;;) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2
          case "hex":
            return len >>> 1
          case "base64":
            return base64ToBytes(string).length
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length
            }
            encoding = ("" + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer3.byteLength = byteLength
    function slowToString(encoding, start, end) {
      let loweredCase = false
      if (start === void 0 || start < 0) {
        start = 0
      }
      if (start > this.length) {
        return ""
      }
      if (end === void 0 || end > this.length) {
        end = this.length
      }
      if (end <= 0) {
        return ""
      }
      end >>>= 0
      start >>>= 0
      if (end <= start) {
        return ""
      }
      if (!encoding) encoding = "utf8"
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end)
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end)
          case "ascii":
            return asciiSlice(this, start, end)
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end)
          case "base64":
            return base64Slice(this, start, end)
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end)
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding)
            encoding = (encoding + "").toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer3.prototype._isBuffer = true
    function swap(b, n, m) {
      const i = b[n]
      b[n] = b[m]
      b[m] = i
    }
    Buffer3.prototype.swap16 = function swap16() {
      const len = this.length
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits")
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1)
      }
      return this
    }
    Buffer3.prototype.swap32 = function swap32() {
      const len = this.length
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits")
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3)
        swap(this, i + 1, i + 2)
      }
      return this
    }
    Buffer3.prototype.swap64 = function swap64() {
      const len = this.length
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits")
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7)
        swap(this, i + 1, i + 6)
        swap(this, i + 2, i + 5)
        swap(this, i + 3, i + 4)
      }
      return this
    }
    Buffer3.prototype.toString = function toString() {
      const length = this.length
      if (length === 0) return ""
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    }
    Buffer3.prototype.toLocaleString = Buffer3.prototype.toString
    Buffer3.prototype.equals = function equals(b) {
      if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer")
      if (this === b) return true
      return Buffer3.compare(this, b) === 0
    }
    Buffer3.prototype.inspect = function inspect() {
      let str = ""
      const max = exports2.INSPECT_MAX_BYTES
      str = this.toString("hex", 0, max)
        .replace(/(.{2})/g, "$1 ")
        .trim()
      if (this.length > max) str += " ... "
      return "<Buffer " + str + ">"
    }
    if (customInspectSymbol) {
      Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect
    }
    Buffer3.prototype.compare = function compare(
      target,
      start,
      end,
      thisStart,
      thisEnd
    ) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer3.from(target, target.offset, target.byteLength)
      }
      if (!Buffer3.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' +
            typeof target
        )
      }
      if (start === void 0) {
        start = 0
      }
      if (end === void 0) {
        end = target ? target.length : 0
      }
      if (thisStart === void 0) {
        thisStart = 0
      }
      if (thisEnd === void 0) {
        thisEnd = this.length
      }
      if (
        start < 0 ||
        end > target.length ||
        thisStart < 0 ||
        thisEnd > this.length
      ) {
        throw new RangeError("out of range index")
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }
      start >>>= 0
      end >>>= 0
      thisStart >>>= 0
      thisEnd >>>= 0
      if (this === target) return 0
      let x = thisEnd - thisStart
      let y = end - start
      const len = Math.min(x, y)
      const thisCopy = this.slice(thisStart, thisEnd)
      const targetCopy = target.slice(start, end)
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i]
          y = targetCopy[i]
          break
        }
      }
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1
      if (typeof byteOffset === "string") {
        encoding = byteOffset
        byteOffset = 0
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648
      }
      byteOffset = +byteOffset
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0
        else return -1
      }
      if (typeof val === "string") {
        val = Buffer3.from(val, encoding)
      }
      if (Buffer3.isBuffer(val)) {
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === "number") {
        val = val & 255
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(
              buffer,
              val,
              byteOffset
            )
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
      }
      throw new TypeError("val must be string, number or Buffer")
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1
      let arrLength = arr.length
      let valLength = val.length
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase()
        if (
          encoding === "ucs2" ||
          encoding === "ucs-2" ||
          encoding === "utf16le" ||
          encoding === "utf-16le"
        ) {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2
          arrLength /= 2
          valLength /= 2
          byteOffset /= 2
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2]
        } else {
          return buf.readUInt16BE(i2 * indexSize)
        }
      }
      let i
      if (dir) {
        let foundIndex = -1
        for (i = byteOffset; i < arrLength; i++) {
          if (
            read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)
          ) {
            if (foundIndex === -1) foundIndex = i
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex
            foundIndex = -1
          }
        }
      } else {
        if (byteOffset + valLength > arrLength)
          byteOffset = arrLength - valLength
        for (i = byteOffset; i >= 0; i--) {
          let found = true
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false
              break
            }
          }
          if (found) return i
        }
      }
      return -1
    }
    Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    }
    Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    }
    Buffer3.prototype.lastIndexOf = function lastIndexOf(
      val,
      byteOffset,
      encoding
    ) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    }
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0
      const remaining = buf.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }
      const strLen = string.length
      if (length > strLen / 2) {
        length = strLen / 2
      }
      let i
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16)
        if (numberIsNaN(parsed)) return i
        buf[offset + i] = parsed
      }
      return i
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(
        utf8ToBytes(string, buf.length - offset),
        buf,
        offset,
        length
      )
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(
        utf16leToBytes(string, buf.length - offset),
        buf,
        offset,
        length
      )
    }
    Buffer3.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8"
        length = this.length
        offset = 0
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset
        length = this.length
        offset = 0
      } else if (isFinite(offset)) {
        offset = offset >>> 0
        if (isFinite(length)) {
          length = length >>> 0
          if (encoding === void 0) encoding = "utf8"
        } else {
          encoding = length
          length = void 0
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        )
      }
      const remaining = this.length - offset
      if (length === void 0 || length > remaining) length = remaining
      if (
        (string.length > 0 && (length < 0 || offset < 0)) ||
        offset > this.length
      ) {
        throw new RangeError("Attempt to write outside buffer bounds")
      }
      if (!encoding) encoding = "utf8"
      let loweredCase = false
      for (;;) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length)
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length)
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length)
          case "base64":
            return base64Write(this, string, offset, length)
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length)
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding)
            encoding = ("" + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer3.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0),
      }
    }
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf)
      } else {
        return base64.fromByteArray(buf.slice(start, end))
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end)
      const res = []
      let i = start
      while (i < end) {
        const firstByte = buf[i]
        let codePoint = null
        let bytesPerSequence =
          firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte
              }
              break
            case 2:
              secondByte = buf[i + 1]
              if ((secondByte & 192) === 128) {
                tempCodePoint = ((firstByte & 31) << 6) | (secondByte & 63)
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 3:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint =
                  ((firstByte & 15) << 12) |
                  ((secondByte & 63) << 6) |
                  (thirdByte & 63)
                if (
                  tempCodePoint > 2047 &&
                  (tempCodePoint < 55296 || tempCodePoint > 57343)
                ) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 4:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              fourthByte = buf[i + 3]
              if (
                (secondByte & 192) === 128 &&
                (thirdByte & 192) === 128 &&
                (fourthByte & 192) === 128
              ) {
                tempCodePoint =
                  ((firstByte & 15) << 18) |
                  ((secondByte & 63) << 12) |
                  ((thirdByte & 63) << 6) |
                  (fourthByte & 63)
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533
          bytesPerSequence = 1
        } else if (codePoint > 65535) {
          codePoint -= 65536
          res.push(((codePoint >>> 10) & 1023) | 55296)
          codePoint = 56320 | (codePoint & 1023)
        }
        res.push(codePoint)
        i += bytesPerSequence
      }
      return decodeCodePointsArray(res)
    }
    var MAX_ARGUMENTS_LENGTH = 4096
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints)
      }
      let res = ""
      let i = 0
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
        )
      }
      return res
    }
    function asciiSlice(buf, start, end) {
      let ret = ""
      end = Math.min(buf.length, end)
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127)
      }
      return ret
    }
    function latin1Slice(buf, start, end) {
      let ret = ""
      end = Math.min(buf.length, end)
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i])
      }
      return ret
    }
    function hexSlice(buf, start, end) {
      const len = buf.length
      if (!start || start < 0) start = 0
      if (!end || end < 0 || end > len) end = len
      let out = ""
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]]
      }
      return out
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end)
      let res = ""
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
      }
      return res
    }
    Buffer3.prototype.slice = function slice(start, end) {
      const len = this.length
      start = ~~start
      end = end === void 0 ? len : ~~end
      if (start < 0) {
        start += len
        if (start < 0) start = 0
      } else if (start > len) {
        start = len
      }
      if (end < 0) {
        end += len
        if (end < 0) end = 0
      } else if (end > len) {
        end = len
      }
      if (end < start) end = start
      const newBuf = this.subarray(start, end)
      Object.setPrototypeOf(newBuf, Buffer3.prototype)
      return newBuf
    }
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0)
        throw new RangeError("offset is not uint")
      if (offset + ext > length)
        throw new RangeError("Trying to access beyond buffer length")
    }
    Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE =
      function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0
        byteLength2 = byteLength2 >>> 0
        if (!noAssert) checkOffset(offset, byteLength2, this.length)
        let val = this[offset]
        let mul = 1
        let i = 0
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul
        }
        return val
      }
    Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE =
      function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0
        byteLength2 = byteLength2 >>> 0
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length)
        }
        let val = this[offset + --byteLength2]
        let mul = 1
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul
        }
        return val
      }
    Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 =
      function readUInt8(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 1, this.length)
        return this[offset]
      }
    Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE =
      function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        return this[offset] | (this[offset + 1] << 8)
      }
    Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE =
      function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        return (this[offset] << 8) | this[offset + 1]
      }
    Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE =
      function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)
        return (
          (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16)) +
          this[offset + 3] * 16777216
        )
      }
    Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE =
      function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)
        return (
          this[offset] * 16777216 +
          ((this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3])
        )
      }
    Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(
      function readBigUInt64LE(offset) {
        offset = offset >>> 0
        validateNumber(offset, "offset")
        const first = this[offset]
        const last = this[offset + 7]
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8)
        }
        const lo =
          first +
          this[++offset] * 2 ** 8 +
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 24
        const hi =
          this[++offset] +
          this[++offset] * 2 ** 8 +
          this[++offset] * 2 ** 16 +
          last * 2 ** 24
        return BigInt(lo) + (BigInt(hi) << BigInt(32))
      }
    )
    Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(
      function readBigUInt64BE(offset) {
        offset = offset >>> 0
        validateNumber(offset, "offset")
        const first = this[offset]
        const last = this[offset + 7]
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8)
        }
        const hi =
          first * 2 ** 24 +
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 8 +
          this[++offset]
        const lo =
          this[++offset] * 2 ** 24 +
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 8 +
          last
        return (BigInt(hi) << BigInt(32)) + BigInt(lo)
      }
    )
    Buffer3.prototype.readIntLE = function readIntLE(
      offset,
      byteLength2,
      noAssert
    ) {
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) checkOffset(offset, byteLength2, this.length)
      let val = this[offset]
      let mul = 1
      let i = 0
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul
      }
      mul *= 128
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2)
      return val
    }
    Buffer3.prototype.readIntBE = function readIntBE(
      offset,
      byteLength2,
      noAssert
    ) {
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) checkOffset(offset, byteLength2, this.length)
      let i = byteLength2
      let mul = 1
      let val = this[offset + --i]
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul
      }
      mul *= 128
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2)
      return val
    }
    Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 1, this.length)
      if (!(this[offset] & 128)) return this[offset]
      return (255 - this[offset] + 1) * -1
    }
    Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      const val = this[offset] | (this[offset + 1] << 8)
      return val & 32768 ? val | 4294901760 : val
    }
    Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      const val = this[offset + 1] | (this[offset] << 8)
      return val & 32768 ? val | 4294901760 : val
    }
    Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return (
        this[offset] |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
      )
    }
    Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return (
        (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3]
      )
    }
    Buffer3.prototype.readBigInt64LE = defineBigIntMethod(
      function readBigInt64LE(offset) {
        offset = offset >>> 0
        validateNumber(offset, "offset")
        const first = this[offset]
        const last = this[offset + 7]
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8)
        }
        const val =
          this[offset + 4] +
          this[offset + 5] * 2 ** 8 +
          this[offset + 6] * 2 ** 16 +
          (last << 24)
        return (
          (BigInt(val) << BigInt(32)) +
          BigInt(
            first +
              this[++offset] * 2 ** 8 +
              this[++offset] * 2 ** 16 +
              this[++offset] * 2 ** 24
          )
        )
      }
    )
    Buffer3.prototype.readBigInt64BE = defineBigIntMethod(
      function readBigInt64BE(offset) {
        offset = offset >>> 0
        validateNumber(offset, "offset")
        const first = this[offset]
        const last = this[offset + 7]
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8)
        }
        const val =
          (first << 24) + // Overflow
          this[++offset] * 2 ** 16 +
          this[++offset] * 2 ** 8 +
          this[++offset]
        return (
          (BigInt(val) << BigInt(32)) +
          BigInt(
            this[++offset] * 2 ** 24 +
              this[++offset] * 2 ** 16 +
              this[++offset] * 2 ** 8 +
              last
          )
        )
      }
    )
    Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, true, 23, 4)
    }
    Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, false, 23, 4)
    }
    Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, true, 52, 8)
    }
    Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, false, 52, 8)
    }
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer3.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min)
        throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError("Index out of range")
    }
    Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE =
      function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value
        offset = offset >>> 0
        byteLength2 = byteLength2 >>> 0
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1
          checkInt(this, value, offset, byteLength2, maxBytes, 0)
        }
        let mul = 1
        let i = 0
        this[offset] = value & 255
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = (value / mul) & 255
        }
        return offset + byteLength2
      }
    Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE =
      function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value
        offset = offset >>> 0
        byteLength2 = byteLength2 >>> 0
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1
          checkInt(this, value, offset, byteLength2, maxBytes, 0)
        }
        let i = byteLength2 - 1
        let mul = 1
        this[offset + i] = value & 255
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = (value / mul) & 255
        }
        return offset + byteLength2
      }
    Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 =
      function writeUInt8(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0)
        this[offset] = value & 255
        return offset + 1
      }
    Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE =
      function writeUInt16LE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0)
        this[offset] = value & 255
        this[offset + 1] = value >>> 8
        return offset + 2
      }
    Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE =
      function writeUInt16BE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0)
        this[offset] = value >>> 8
        this[offset + 1] = value & 255
        return offset + 2
      }
    Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE =
      function writeUInt32LE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0)
        this[offset + 3] = value >>> 24
        this[offset + 2] = value >>> 16
        this[offset + 1] = value >>> 8
        this[offset] = value & 255
        return offset + 4
      }
    Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE =
      function writeUInt32BE(value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0)
        this[offset] = value >>> 24
        this[offset + 1] = value >>> 16
        this[offset + 2] = value >>> 8
        this[offset + 3] = value & 255
        return offset + 4
      }
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7)
      let lo = Number(value & BigInt(4294967295))
      buf[offset++] = lo
      lo = lo >> 8
      buf[offset++] = lo
      lo = lo >> 8
      buf[offset++] = lo
      lo = lo >> 8
      buf[offset++] = lo
      let hi = Number((value >> BigInt(32)) & BigInt(4294967295))
      buf[offset++] = hi
      hi = hi >> 8
      buf[offset++] = hi
      hi = hi >> 8
      buf[offset++] = hi
      hi = hi >> 8
      buf[offset++] = hi
      return offset
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7)
      let lo = Number(value & BigInt(4294967295))
      buf[offset + 7] = lo
      lo = lo >> 8
      buf[offset + 6] = lo
      lo = lo >> 8
      buf[offset + 5] = lo
      lo = lo >> 8
      buf[offset + 4] = lo
      let hi = Number((value >> BigInt(32)) & BigInt(4294967295))
      buf[offset + 3] = hi
      hi = hi >> 8
      buf[offset + 2] = hi
      hi = hi >> 8
      buf[offset + 1] = hi
      hi = hi >> 8
      buf[offset] = hi
      return offset + 8
    }
    Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(
      function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(
          this,
          value,
          offset,
          BigInt(0),
          BigInt("0xffffffffffffffff")
        )
      }
    )
    Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(
      function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(
          this,
          value,
          offset,
          BigInt(0),
          BigInt("0xffffffffffffffff")
        )
      }
    )
    Buffer3.prototype.writeIntLE = function writeIntLE(
      value,
      offset,
      byteLength2,
      noAssert
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1)
        checkInt(this, value, offset, byteLength2, limit - 1, -limit)
      }
      let i = 0
      let mul = 1
      let sub = 0
      this[offset] = value & 255
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1
        }
        this[offset + i] = (((value / mul) >> 0) - sub) & 255
      }
      return offset + byteLength2
    }
    Buffer3.prototype.writeIntBE = function writeIntBE(
      value,
      offset,
      byteLength2,
      noAssert
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1)
        checkInt(this, value, offset, byteLength2, limit - 1, -limit)
      }
      let i = byteLength2 - 1
      let mul = 1
      let sub = 0
      this[offset + i] = value & 255
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1
        }
        this[offset + i] = (((value / mul) >> 0) - sub) & 255
      }
      return offset + byteLength2
    }
    Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128)
      if (value < 0) value = 255 + value + 1
      this[offset] = value & 255
      return offset + 1
    }
    Buffer3.prototype.writeInt16LE = function writeInt16LE(
      value,
      offset,
      noAssert
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768)
      this[offset] = value & 255
      this[offset + 1] = value >>> 8
      return offset + 2
    }
    Buffer3.prototype.writeInt16BE = function writeInt16BE(
      value,
      offset,
      noAssert
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768)
      this[offset] = value >>> 8
      this[offset + 1] = value & 255
      return offset + 2
    }
    Buffer3.prototype.writeInt32LE = function writeInt32LE(
      value,
      offset,
      noAssert
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648)
      this[offset] = value & 255
      this[offset + 1] = value >>> 8
      this[offset + 2] = value >>> 16
      this[offset + 3] = value >>> 24
      return offset + 4
    }
    Buffer3.prototype.writeInt32BE = function writeInt32BE(
      value,
      offset,
      noAssert
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648)
      if (value < 0) value = 4294967295 + value + 1
      this[offset] = value >>> 24
      this[offset + 1] = value >>> 16
      this[offset + 2] = value >>> 8
      this[offset + 3] = value & 255
      return offset + 4
    }
    Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(
      function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(
          this,
          value,
          offset,
          -BigInt("0x8000000000000000"),
          BigInt("0x7fffffffffffffff")
        )
      }
    )
    Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(
      function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(
          this,
          value,
          offset,
          -BigInt("0x8000000000000000"),
          BigInt("0x7fffffffffffffff")
        )
      }
    )
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range")
      if (offset < 0) throw new RangeError("Index out of range")
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(
          buf,
          value,
          offset,
          4,
          34028234663852886e22,
          -34028234663852886e22
        )
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4)
      return offset + 4
    }
    Buffer3.prototype.writeFloatLE = function writeFloatLE(
      value,
      offset,
      noAssert
    ) {
      return writeFloat(this, value, offset, true, noAssert)
    }
    Buffer3.prototype.writeFloatBE = function writeFloatBE(
      value,
      offset,
      noAssert
    ) {
      return writeFloat(this, value, offset, false, noAssert)
    }
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(
          buf,
          value,
          offset,
          8,
          17976931348623157e292,
          -17976931348623157e292
        )
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8)
      return offset + 8
    }
    Buffer3.prototype.writeDoubleLE = function writeDoubleLE(
      value,
      offset,
      noAssert
    ) {
      return writeDouble(this, value, offset, true, noAssert)
    }
    Buffer3.prototype.writeDoubleBE = function writeDoubleBE(
      value,
      offset,
      noAssert
    ) {
      return writeDouble(this, value, offset, false, noAssert)
    }
    Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer3.isBuffer(target))
        throw new TypeError("argument should be a Buffer")
      if (!start) start = 0
      if (!end && end !== 0) end = this.length
      if (targetStart >= target.length) targetStart = target.length
      if (!targetStart) targetStart = 0
      if (end > 0 && end < start) end = start
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds")
      }
      if (start < 0 || start >= this.length)
        throw new RangeError("Index out of range")
      if (end < 0) throw new RangeError("sourceEnd out of bounds")
      if (end > this.length) end = this.length
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start
      }
      const len = end - start
      if (
        this === target &&
        typeof Uint8Array.prototype.copyWithin === "function"
      ) {
        this.copyWithin(targetStart, start, end)
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        )
      }
      return len
    }
    Buffer3.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start
          start = 0
          end = this.length
        } else if (typeof end === "string") {
          encoding = end
          end = this.length
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string")
        }
        if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding)
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0)
          if ((encoding === "utf8" && code < 128) || encoding === "latin1") {
            val = code
          }
        }
      } else if (typeof val === "number") {
        val = val & 255
      } else if (typeof val === "boolean") {
        val = Number(val)
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index")
      }
      if (end <= start) {
        return this
      }
      start = start >>> 0
      end = end === void 0 ? this.length : end >>> 0
      if (!val) val = 0
      let i
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val
        }
      } else {
        const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding)
        const len = bytes.length
        if (len === 0) {
          throw new TypeError(
            'The value "' + val + '" is invalid for argument "value"'
          )
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len]
        }
      }
      return this
    }
    var errors = {}
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super()
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true,
          })
          this.name = `${this.name} [${sym}]`
          this.stack
          delete this.name
        }
        get code() {
          return sym
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
          })
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`
        }
      }
    }
    E(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function (name) {
        if (name) {
          return `${name} is outside of buffer bounds`
        }
        return "Attempt to access memory outside buffer bounds"
      },
      RangeError
    )
    E(
      "ERR_INVALID_ARG_TYPE",
      function (name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`
      },
      TypeError
    )
    E(
      "ERR_OUT_OF_RANGE",
      function (str, range, input) {
        let msg = `The value of "${str}" is out of range.`
        let received = input
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input))
        } else if (typeof input === "bigint") {
          received = String(input)
          if (
            input > BigInt(2) ** BigInt(32) ||
            input < -(BigInt(2) ** BigInt(32))
          ) {
            received = addNumericalSeparator(received)
          }
          received += "n"
        }
        msg += ` It must be ${range}. Received ${received}`
        return msg
      },
      RangeError
    )
    function addNumericalSeparator(val) {
      let res = ""
      let i = val.length
      const start = val[0] === "-" ? 1 : 0
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`
      }
      return `${val.slice(0, i)}${res}`
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset")
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1))
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : ""
        let range
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`
          } else {
            range = `>= -(2${n} ** ${
              (byteLength2 + 1) * 8 - 1
            }${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`
          }
        } else {
          range = `>= ${min}${n} and <= ${max}${n}`
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value)
      }
      checkBounds(buf, offset, byteLength2)
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value)
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type)
        throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value)
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
      }
      throw new errors.ERR_OUT_OF_RANGE(
        type || "offset",
        `>= ${type ? 1 : 0} and <= ${length}`,
        value
      )
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
    function base64clean(str) {
      str = str.split("=")[0]
      str = str.trim().replace(INVALID_BASE64_RE, "")
      if (str.length < 2) return ""
      while (str.length % 4 !== 0) {
        str = str + "="
      }
      return str
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity
      let codePoint
      const length = string.length
      let leadSurrogate = null
      const bytes = []
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i)
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189)
              continue
            } else if (i + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189)
              continue
            }
            leadSurrogate = codePoint
            continue
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189)
            leadSurrogate = codePoint
            continue
          }
          codePoint =
            (((leadSurrogate - 55296) << 10) | (codePoint - 56320)) + 65536
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189)
        }
        leadSurrogate = null
        if (codePoint < 128) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint)
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break
          bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128)
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break
          bytes.push(
            (codePoint >> 12) | 224,
            ((codePoint >> 6) & 63) | 128,
            (codePoint & 63) | 128
          )
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break
          bytes.push(
            (codePoint >> 18) | 240,
            ((codePoint >> 12) & 63) | 128,
            ((codePoint >> 6) & 63) | 128,
            (codePoint & 63) | 128
          )
        } else {
          throw new Error("Invalid code point")
        }
      }
      return bytes
    }
    function asciiToBytes(str) {
      const byteArray = []
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255)
      }
      return byteArray
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo
      const byteArray = []
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break
        c = str.charCodeAt(i)
        hi = c >> 8
        lo = c % 256
        byteArray.push(lo)
        byteArray.push(hi)
      }
      return byteArray
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str))
    }
    function blitBuffer(src, dst, offset, length) {
      let i
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break
        dst[i + offset] = src[i]
      }
      return i
    }
    function isInstance(obj, type) {
      return (
        obj instanceof type ||
        (obj != null &&
          obj.constructor != null &&
          obj.constructor.name != null &&
          obj.constructor.name === type.name)
      )
    }
    function numberIsNaN(obj) {
      return obj !== obj
    }
    var hexSliceLookupTable = (function () {
      const alphabet = "0123456789abcdef"
      const table = new Array(256)
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j]
        }
      }
      return table
    })()
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported")
    }
  },
})

// secp256k1/index.js
var require_secp256k1 = __commonJS({
  "secp256k1/index.js"(exports2, module2) {
    var errors = {
      PUBKEY_PARSE: "Public Key could not be parsed",
      PUBKEY_SERIALIZE: "Public Key serialization error",
    }
    function assert(cond, msg) {
      if (!cond) throw new Error(msg)
    }
    function isUint8Array(name, value, length) {
      assert(
        value instanceof Uint8Array,
        `Expected ${name} to be an Uint8Array`
      )
      if (length !== void 0) {
        if (Array.isArray(length)) {
          const numbers = length.join(", ")
          const msg = `Expected ${name} to be an Uint8Array with length [${numbers}]`
          assert(length.includes(value.length), msg)
        } else {
          const msg = `Expected ${name} to be an Uint8Array with length ${length}`
          assert(value.length === length, msg)
        }
      }
    }
    function isCompressed(value) {
      assert(
        toTypeString(value) === "Boolean",
        "Expected compressed to be a Boolean"
      )
    }
    function getAssertedOutput(output = len => new Uint8Array(len), length) {
      if (typeof output === "function") output = output(length)
      isUint8Array("output", output, length)
      return output
    }
    function toTypeString(value) {
      return Object.prototype.toString.call(value).slice(8, -1)
    }
    module2.exports = secp256k1 => {
      return {
        publicKeyConvert(pubkey, compressed = true, output) {
          isUint8Array("public key", pubkey, [33, 65])
          isCompressed(compressed)
          output = getAssertedOutput(output, compressed ? 33 : 65)
          switch (secp256k1.publicKeyConvert(output, pubkey)) {
            case 0:
              return output
            case 1:
              throw new Error(errors.PUBKEY_PARSE)
            case 2:
              throw new Error(errors.PUBKEY_SERIALIZE)
          }
        },
      }
    }
  },
})

// bn.js/index.js
var require_bn = __commonJS({
  "bn.js/index.js"(exports2, module2) {
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
      var Buffer3 = require_buffer().Buffer
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
        return this._strip()
      }
      function parseHex4Bits(string, index) {
        var c = string.charCodeAt(index)
        if (c >= 48 && c <= 57) {
          return c - 48
        } else if (c >= 65 && c <= 70) {
          return c - 55
        } else if (c >= 97 && c <= 102) {
          return c - 87
        } else {
          assert(false, "Invalid character in " + string)
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
        this._strip()
      }
      function parseBase(str, start, end, mul) {
        var r = 0
        var b = 0
        var len = Math.min(str.length, end)
        for (var i = start; i < len; i++) {
          var c = str.charCodeAt(i) - 48
          r *= mul
          if (c >= 49) {
            b = c - 49 + 10
          } else if (c >= 17) {
            b = c - 17 + 10
          } else {
            b = c
          }
          assert(c >= 0 && b < mul, "Invalid character")
          r += b
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
        this._strip()
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
      function move(dest, src) {
        dest.words = src.words
        dest.length = src.length
        dest.negative = src.negative
        dest.red = src.red
      }
      BN.prototype._move = function _move(dest) {
        move(dest, this)
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
      BN.prototype._strip = function strip() {
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
      if (typeof Symbol !== "undefined" && typeof Symbol.for === "function") {
        try {
          BN.prototype[Symbol.for("nodejs.util.inspect.custom")] = inspect
        } catch (e) {
          BN.prototype.inspect = inspect
        }
      } else {
        BN.prototype.inspect = inspect
      }
      function inspect() {
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
        0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
      ]
      var groupBases = [
        0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607,
        16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536,
        11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101,
        5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
        20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875,
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
            off += 2
            if (off >= 26) {
              off -= 26
              i--
            }
            if (carry !== 0 || i !== this.length - 1) {
              out = zeros[6 - word.length] + word + out
            } else {
              out = word + out
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
            var r = c.modrn(groupBase).toString(base)
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
        return this.toString(16, 2)
      }
      if (Buffer3) {
        BN.prototype.toBuffer = function toBuffer2(endian, length) {
          return this.toArrayLike(Buffer3, endian, length)
        }
      }
      BN.prototype.toArray = function toArray(endian, length) {
        return this.toArrayLike(Array, endian, length)
      }
      var allocate = function allocate2(ArrayType, size) {
        if (ArrayType.allocUnsafe) {
          return ArrayType.allocUnsafe(size)
        }
        return new ArrayType(size)
      }
      BN.prototype.toArrayLike = function toArrayLike(
        ArrayType,
        endian,
        length
      ) {
        this._strip()
        var byteLength = this.byteLength()
        var reqLength = length || Math.max(1, byteLength)
        assert(byteLength <= reqLength, "byte array longer than desired length")
        assert(reqLength > 0, "Requested array length <= 0")
        var res = allocate(ArrayType, reqLength)
        var postfix = endian === "le" ? "LE" : "BE"
        this["_toArrayLike" + postfix](res, byteLength)
        return res
      }
      BN.prototype._toArrayLikeLE = function _toArrayLikeLE(res, byteLength) {
        var position = 0
        var carry = 0
        for (var i = 0, shift = 0; i < this.length; i++) {
          var word = (this.words[i] << shift) | carry
          res[position++] = word & 255
          if (position < res.length) {
            res[position++] = (word >> 8) & 255
          }
          if (position < res.length) {
            res[position++] = (word >> 16) & 255
          }
          if (shift === 6) {
            if (position < res.length) {
              res[position++] = (word >> 24) & 255
            }
            carry = 0
            shift = 0
          } else {
            carry = word >>> 24
            shift += 2
          }
        }
        if (position < res.length) {
          res[position++] = carry
          while (position < res.length) {
            res[position++] = 0
          }
        }
      }
      BN.prototype._toArrayLikeBE = function _toArrayLikeBE(res, byteLength) {
        var position = res.length - 1
        var carry = 0
        for (var i = 0, shift = 0; i < this.length; i++) {
          var word = (this.words[i] << shift) | carry
          res[position--] = word & 255
          if (position >= 0) {
            res[position--] = (word >> 8) & 255
          }
          if (position >= 0) {
            res[position--] = (word >> 16) & 255
          }
          if (shift === 6) {
            if (position >= 0) {
              res[position--] = (word >> 24) & 255
            }
            carry = 0
            shift = 0
          } else {
            carry = word >>> 24
            shift += 2
          }
        }
        if (position >= 0) {
          res[position--] = carry
          while (position >= 0) {
            res[position--] = 0
          }
        }
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
          w[bit] = (num.words[off] >>> wbit) & 1
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
        return this._strip()
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
        return this._strip()
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
        return this._strip()
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
        return this._strip()
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
        return this._strip()
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
        return this._strip()
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
        return out._strip()
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
        return out._strip()
      }
      function jumboMulTo(self, num, out) {
        return bigMulTo(self, num, out)
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
        return out._strip()
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
        var isNegNum = num < 0
        if (isNegNum) num = -num
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
        return isNegNum ? this.ineg() : this
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
        return this._strip()
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
        return this._strip()
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
        return this._strip()
      }
      BN.prototype.maskn = function maskn(bits) {
        return this.clone().imaskn(bits)
      }
      BN.prototype.iaddn = function iaddn(num) {
        assert(typeof num === "number")
        assert(num < 67108864)
        if (num < 0) return this.isubn(-num)
        if (this.negative !== 0) {
          if (this.length === 1 && (this.words[0] | 0) <= num) {
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
        return this._strip()
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
        if (carry === 0) return this._strip()
        assert(carry === -1)
        carry = 0
        for (i = 0; i < this.length; i++) {
          w = -(this.words[i] | 0) + carry
          carry = w >> 26
          this.words[i] = w & 67108863
        }
        this.negative = 1
        return this._strip()
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
          q._strip()
        }
        a._strip()
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
              mod: new BN(this.modrn(num.words[0])),
            }
          }
          return {
            div: this.divn(num.words[0]),
            mod: new BN(this.modrn(num.words[0])),
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
      BN.prototype.modrn = function modrn(num) {
        var isNegNum = num < 0
        if (isNegNum) num = -num
        assert(num <= 67108863)
        var p = (1 << 26) % num
        var acc = 0
        for (var i = this.length - 1; i >= 0; i--) {
          acc = (p * acc + (this.words[i] | 0)) % num
        }
        return isNegNum ? -acc : acc
      }
      BN.prototype.modn = function modn(num) {
        return this.modrn(num)
      }
      BN.prototype.idivn = function idivn(num) {
        var isNegNum = num < 0
        if (isNegNum) num = -num
        assert(num <= 67108863)
        var carry = 0
        for (var i = this.length - 1; i >= 0; i--) {
          var w = (this.words[i] | 0) + carry * 67108864
          this.words[i] = (w / num) | 0
          carry = w % num
        }
        this._strip()
        return isNegNum ? this.ineg() : this
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
        this._strip()
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
        move(a, a.umod(this.m)._forceRed(this))
        return a
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

// minimalistic-assert/index.js
var require_minimalistic_assert = __commonJS({
  "minimalistic-assert/index.js"(exports2, module2) {
    module2.exports = assert
    function assert(val, msg) {
      if (!val) throw new Error(msg || "Assertion failed")
    }
    assert.equal = function assertEqual(l, r, msg) {
      if (l != r) throw new Error(msg || "Assertion failed: " + l + " != " + r)
    }
  },
})

// minimalistic-crypto-utils/index.js
var require_minimalistic_crypto_utils = __commonJS({
  "minimalistic-crypto-utils/index.js"(exports2) {
    "use strict"
    var utils = exports2
    function toArray(msg, enc) {
      if (Array.isArray(msg)) return msg.slice()
      if (!msg) return []
      var res = []
      if (typeof msg !== "string") {
        for (var i = 0; i < msg.length; i++) res[i] = msg[i] | 0
        return res
      }
      if (enc === "hex") {
        msg = msg.replace(/[^a-z0-9]+/gi, "")
        if (msg.length % 2 !== 0) msg = "0" + msg
        for (var i = 0; i < msg.length; i += 2)
          res.push(parseInt(msg[i] + msg[i + 1], 16))
      } else {
        for (var i = 0; i < msg.length; i++) {
          var c = msg.charCodeAt(i)
          var hi = c >> 8
          var lo = c & 255
          if (hi) res.push(hi, lo)
          else res.push(lo)
        }
      }
      return res
    }
    utils.toArray = toArray
    function zero2(word) {
      if (word.length === 1) return "0" + word
      else return word
    }
    utils.zero2 = zero2
    function toHex(msg) {
      var res = ""
      for (var i = 0; i < msg.length; i++) res += zero2(msg[i].toString(16))
      return res
    }
    utils.toHex = toHex
    utils.encode = function encode(arr, enc) {
      if (enc === "hex") return toHex(arr)
      else return arr
    }
  },
})

// elliptic/utils.js
var require_utils = __commonJS({
  "elliptic/utils.js"(exports2) {
    "use strict"
    var utils = exports2
    var BN = require_bn()
    var minAssert = require_minimalistic_assert()
    var minUtils = require_minimalistic_crypto_utils()
    utils.assert = minAssert
    utils.encode = minUtils.encode
    function getNAF(num, w, bits) {
      var naf = new Array(Math.max(num.bitLength(), bits) + 1)
      naf.fill(0)
      var ws = 1 << (w + 1)
      var k = num.clone()
      for (var i = 0; i < naf.length; i++) {
        var z
        var mod = k.andln(ws - 1)
        if (k.isOdd()) {
          if (mod > (ws >> 1) - 1) z = (ws >> 1) - mod
          else z = mod
          k.isubn(z)
        } else {
          z = 0
        }
        naf[i] = z
        k.iushrn(1)
      }
      return naf
    }
    utils.getNAF = getNAF
    function getJSF(k1, k2) {
      var jsf = [[], []]
      k1 = k1.clone()
      k2 = k2.clone()
      var d1 = 0
      var d2 = 0
      var m8
      while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {
        var m14 = (k1.andln(3) + d1) & 3
        var m24 = (k2.andln(3) + d2) & 3
        if (m14 === 3) m14 = -1
        if (m24 === 3) m24 = -1
        var u1
        if ((m14 & 1) === 0) {
          u1 = 0
        } else {
          m8 = (k1.andln(7) + d1) & 7
          if ((m8 === 3 || m8 === 5) && m24 === 2) u1 = -m14
          else u1 = m14
        }
        jsf[0].push(u1)
        var u2
        if ((m24 & 1) === 0) {
          u2 = 0
        } else {
          m8 = (k2.andln(7) + d2) & 7
          if ((m8 === 3 || m8 === 5) && m14 === 2) u2 = -m24
          else u2 = m24
        }
        jsf[1].push(u2)
        if (2 * d1 === u1 + 1) d1 = 1 - d1
        if (2 * d2 === u2 + 1) d2 = 1 - d2
        k1.iushrn(1)
        k2.iushrn(1)
      }
      return jsf
    }
    utils.getJSF = getJSF
    function cachedProperty(obj, name, computer) {
      var key = "_" + name
      obj.prototype[name] = function cachedProperty2() {
        return this[key] !== void 0
          ? this[key]
          : (this[key] = computer.call(this))
      }
    }
    utils.cachedProperty = cachedProperty
    function parseBytes(bytes) {
      return typeof bytes === "string" ? utils.toArray(bytes, "hex") : bytes
    }
    utils.parseBytes = parseBytes
    function intFromLE(bytes) {
      return new BN(bytes, "hex", "le")
    }
    utils.intFromLE = intFromLE
  },
})

// inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "inherits/inherits_browser.js"(exports2, module2) {
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

// inherits/index.js
var require_inherits = __commonJS({
  "inherits/index.js"(exports2, module2) {
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

// elliptic/curve/base.js
var require_base = __commonJS({
  "elliptic/curve/base.js"(exports2, module2) {
    "use strict"
    var BN = require_bn()
    var utils = require_utils()
    var getNAF = utils.getNAF
    var getJSF = utils.getJSF
    var assert = utils.assert
    function BaseCurve(type, conf) {
      this.type = type
      this.p = new BN(conf.p, 16)
      this.red = conf.prime ? BN.red(conf.prime) : BN.mont(this.p)
      this.zero = new BN(0).toRed(this.red)
      this.one = new BN(1).toRed(this.red)
      this.two = new BN(2).toRed(this.red)
      this.n = conf.n && new BN(conf.n, 16)
      this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed)
      this._wnafT1 = new Array(4)
      this._wnafT2 = new Array(4)
      this._wnafT3 = new Array(4)
      this._wnafT4 = new Array(4)
      this._bitLength = this.n ? this.n.bitLength() : 0
      var adjustCount = this.n && this.p.div(this.n)
      if (!adjustCount || adjustCount.cmpn(100) > 0) {
        this.redN = null
      } else {
        this._maxwellTrick = true
        this.redN = this.n.toRed(this.red)
      }
    }
    module2.exports = BaseCurve
    BaseCurve.prototype.point = function point() {
      throw new Error("Not implemented")
    }
    BaseCurve.prototype.validate = function validate() {
      throw new Error("Not implemented")
    }
    BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
      assert(p.precomputed)
      var doubles = p._getDoubles()
      var naf = getNAF(k, 1, this._bitLength)
      var I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1)
      I /= 3
      var repr = []
      var j
      var nafW
      for (j = 0; j < naf.length; j += doubles.step) {
        nafW = 0
        for (var l = j + doubles.step - 1; l >= j; l--)
          nafW = (nafW << 1) + naf[l]
        repr.push(nafW)
      }
      var a = this.jpoint(null, null, null)
      var b = this.jpoint(null, null, null)
      for (var i = I; i > 0; i--) {
        for (j = 0; j < repr.length; j++) {
          nafW = repr[j]
          if (nafW === i) b = b.mixedAdd(doubles.points[j])
          else if (nafW === -i) b = b.mixedAdd(doubles.points[j].neg())
        }
        a = a.add(b)
      }
      return a.toP()
    }
    BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
      var w = 4
      var nafPoints = p._getNAFPoints(w)
      w = nafPoints.wnd
      var wnd = nafPoints.points
      var naf = getNAF(k, w, this._bitLength)
      var acc = this.jpoint(null, null, null)
      for (var i = naf.length - 1; i >= 0; i--) {
        for (var l = 0; i >= 0 && naf[i] === 0; i--) l++
        if (i >= 0) l++
        acc = acc.dblp(l)
        if (i < 0) break
        var z = naf[i]
        assert(z !== 0)
        if (p.type === "affine") {
          if (z > 0) acc = acc.mixedAdd(wnd[(z - 1) >> 1])
          else acc = acc.mixedAdd(wnd[(-z - 1) >> 1].neg())
        } else {
          if (z > 0) acc = acc.add(wnd[(z - 1) >> 1])
          else acc = acc.add(wnd[(-z - 1) >> 1].neg())
        }
      }
      return p.type === "affine" ? acc.toP() : acc
    }
    BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(
      defW,
      points,
      coeffs,
      len,
      jacobianResult
    ) {
      var wndWidth = this._wnafT1
      var wnd = this._wnafT2
      var naf = this._wnafT3
      var max = 0
      var i
      var j
      var p
      for (i = 0; i < len; i++) {
        p = points[i]
        var nafPoints = p._getNAFPoints(defW)
        wndWidth[i] = nafPoints.wnd
        wnd[i] = nafPoints.points
      }
      for (i = len - 1; i >= 1; i -= 2) {
        var a = i - 1
        var b = i
        if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
          naf[a] = getNAF(coeffs[a], wndWidth[a], this._bitLength)
          naf[b] = getNAF(coeffs[b], wndWidth[b], this._bitLength)
          max = Math.max(naf[a].length, max)
          max = Math.max(naf[b].length, max)
          continue
        }
        var comb = [points[a], null, null, points[b]]
        if (points[a].y.cmp(points[b].y) === 0) {
          comb[1] = points[a].add(points[b])
          comb[2] = points[a].toJ().mixedAdd(points[b].neg())
        } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
          comb[1] = points[a].toJ().mixedAdd(points[b])
          comb[2] = points[a].add(points[b].neg())
        } else {
          comb[1] = points[a].toJ().mixedAdd(points[b])
          comb[2] = points[a].toJ().mixedAdd(points[b].neg())
        }
        var index = [-3, -1, -5, -7, 0, 7, 5, 1, 3]
        var jsf = getJSF(coeffs[a], coeffs[b])
        max = Math.max(jsf[0].length, max)
        naf[a] = new Array(max)
        naf[b] = new Array(max)
        for (j = 0; j < max; j++) {
          var ja = jsf[0][j] | 0
          var jb = jsf[1][j] | 0
          naf[a][j] = index[(ja + 1) * 3 + (jb + 1)]
          naf[b][j] = 0
          wnd[a] = comb
        }
      }
      var acc = this.jpoint(null, null, null)
      var tmp = this._wnafT4
      for (i = max; i >= 0; i--) {
        var k = 0
        while (i >= 0) {
          var zero = true
          for (j = 0; j < len; j++) {
            tmp[j] = naf[j][i] | 0
            if (tmp[j] !== 0) zero = false
          }
          if (!zero) break
          k++
          i--
        }
        if (i >= 0) k++
        acc = acc.dblp(k)
        if (i < 0) break
        for (j = 0; j < len; j++) {
          var z = tmp[j]
          p
          if (z === 0) continue
          else if (z > 0) p = wnd[j][(z - 1) >> 1]
          else if (z < 0) p = wnd[j][(-z - 1) >> 1].neg()
          if (p.type === "affine") acc = acc.mixedAdd(p)
          else acc = acc.add(p)
        }
      }
      for (i = 0; i < len; i++) wnd[i] = null
      if (jacobianResult) return acc
      else return acc.toP()
    }
    function BasePoint(curve, type) {
      this.curve = curve
      this.type = type
      this.precomputed = null
    }
    BaseCurve.BasePoint = BasePoint
    BasePoint.prototype.eq = function eq() {
      throw new Error("Not implemented")
    }
    BasePoint.prototype.validate = function validate() {
      return this.curve.validate(this)
    }
    BaseCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
      bytes = utils.toArray(bytes, enc)
      var len = this.p.byteLength()
      if (
        (bytes[0] === 4 || bytes[0] === 6 || bytes[0] === 7) &&
        bytes.length - 1 === 2 * len
      ) {
        if (bytes[0] === 6) assert(bytes[bytes.length - 1] % 2 === 0)
        else if (bytes[0] === 7) assert(bytes[bytes.length - 1] % 2 === 1)
        var res = this.point(
          bytes.slice(1, 1 + len),
          bytes.slice(1 + len, 1 + 2 * len)
        )
        return res
      } else if (
        (bytes[0] === 2 || bytes[0] === 3) &&
        bytes.length - 1 === len
      ) {
        return this.pointFromX(bytes.slice(1, 1 + len), bytes[0] === 3)
      }
      throw new Error("Unknown point format")
    }
    BasePoint.prototype.encodeCompressed = function encodeCompressed(enc) {
      return this.encode(enc, true)
    }
    BasePoint.prototype._encode = function _encode(compact) {
      var len = this.curve.p.byteLength()
      var x = this.getX().toArray("be", len)
      if (compact) return [this.getY().isEven() ? 2 : 3].concat(x)
      return [4].concat(x, this.getY().toArray("be", len))
    }
    BasePoint.prototype.encode = function encode(enc, compact) {
      return utils.encode(this._encode(compact), enc)
    }
    BasePoint.prototype.precompute = function precompute(power) {
      if (this.precomputed) return this
      var precomputed = {
        doubles: null,
        naf: null,
        beta: null,
      }
      precomputed.naf = this._getNAFPoints(8)
      precomputed.doubles = this._getDoubles(4, power)
      precomputed.beta = this._getBeta()
      this.precomputed = precomputed
      return this
    }
    BasePoint.prototype._hasDoubles = function _hasDoubles(k) {
      if (!this.precomputed) return false
      var doubles = this.precomputed.doubles
      if (!doubles) return false
      return (
        doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step)
      )
    }
    BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
      if (this.precomputed && this.precomputed.doubles)
        return this.precomputed.doubles
      var doubles = [this]
      var acc = this
      for (var i = 0; i < power; i += step) {
        for (var j = 0; j < step; j++) acc = acc.dbl()
        doubles.push(acc)
      }
      return {
        step,
        points: doubles,
      }
    }
    BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
      if (this.precomputed && this.precomputed.naf) return this.precomputed.naf
      var res = [this]
      var max = (1 << wnd) - 1
      var dbl = max === 1 ? null : this.dbl()
      for (var i = 1; i < max; i++) res[i] = res[i - 1].add(dbl)
      return {
        wnd,
        points: res,
      }
    }
    BasePoint.prototype._getBeta = function _getBeta() {
      return null
    }
    BasePoint.prototype.dblp = function dblp(k) {
      var r = this
      for (var i = 0; i < k; i++) r = r.dbl()
      return r
    }
  },
})

// elliptic/curve/short.js
var require_short = __commonJS({
  "elliptic/curve/short.js"(exports2, module2) {
    "use strict"
    var utils = require_utils()
    var BN = require_bn()
    var inherits = require_inherits()
    var Base = require_base()
    var assert = utils.assert
    function ShortCurve(conf) {
      Base.call(this, "short", conf)
      this.a = new BN(conf.a, 16).toRed(this.red)
      this.b = new BN(conf.b, 16).toRed(this.red)
      this.tinv = this.two.redInvm()
      this.zeroA = this.a.fromRed().cmpn(0) === 0
      this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0
      this.endo = this._getEndomorphism(conf)
      this._endoWnafT1 = new Array(4)
      this._endoWnafT2 = new Array(4)
    }
    inherits(ShortCurve, Base)
    module2.exports = ShortCurve
    ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
      if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1) return
      var beta
      var lambda
      if (conf.beta) {
        beta = new BN(conf.beta, 16).toRed(this.red)
      } else {
        var betas = this._getEndoRoots(this.p)
        beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1]
        beta = beta.toRed(this.red)
      }
      if (conf.lambda) {
        lambda = new BN(conf.lambda, 16)
      } else {
        var lambdas = this._getEndoRoots(this.n)
        if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
          lambda = lambdas[0]
        } else {
          lambda = lambdas[1]
          assert(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0)
        }
      }
      var basis
      if (conf.basis) {
        basis = conf.basis.map(function (vec) {
          return {
            a: new BN(vec.a, 16),
            b: new BN(vec.b, 16),
          }
        })
      } else {
        basis = this._getEndoBasis(lambda)
      }
      return {
        beta,
        lambda,
        basis,
      }
    }
    ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
      var red = num === this.p ? this.red : BN.mont(num)
      var tinv = new BN(2).toRed(red).redInvm()
      var ntinv = tinv.redNeg()
      var s = new BN(3).toRed(red).redNeg().redSqrt().redMul(tinv)
      var l1 = ntinv.redAdd(s).fromRed()
      var l2 = ntinv.redSub(s).fromRed()
      return [l1, l2]
    }
    ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
      var aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2))
      var u = lambda
      var v = this.n.clone()
      var x1 = new BN(1)
      var y1 = new BN(0)
      var x2 = new BN(0)
      var y2 = new BN(1)
      var a0
      var b0
      var a1
      var b1
      var a2
      var b2
      var prevR
      var i = 0
      var r
      var x
      while (u.cmpn(0) !== 0) {
        var q = v.div(u)
        r = v.sub(q.mul(u))
        x = x2.sub(q.mul(x1))
        var y = y2.sub(q.mul(y1))
        if (!a1 && r.cmp(aprxSqrt) < 0) {
          a0 = prevR.neg()
          b0 = x1
          a1 = r.neg()
          b1 = x
        } else if (a1 && ++i === 2) {
          break
        }
        prevR = r
        v = u
        u = r
        x2 = x1
        x1 = x
        y2 = y1
        y1 = y
      }
      a2 = r.neg()
      b2 = x
      var len1 = a1.sqr().add(b1.sqr())
      var len2 = a2.sqr().add(b2.sqr())
      if (len2.cmp(len1) >= 0) {
        a2 = a0
        b2 = b0
      }
      if (a1.negative) {
        a1 = a1.neg()
        b1 = b1.neg()
      }
      if (a2.negative) {
        a2 = a2.neg()
        b2 = b2.neg()
      }
      return [
        { a: a1, b: b1 },
        { a: a2, b: b2 },
      ]
    }
    ShortCurve.prototype._endoSplit = function _endoSplit(k) {
      var basis = this.endo.basis
      var v1 = basis[0]
      var v2 = basis[1]
      var c1 = v2.b.mul(k).divRound(this.n)
      var c2 = v1.b.neg().mul(k).divRound(this.n)
      var p1 = c1.mul(v1.a)
      var p2 = c2.mul(v2.a)
      var q1 = c1.mul(v1.b)
      var q2 = c2.mul(v2.b)
      var k1 = k.sub(p1).sub(p2)
      var k2 = q1.add(q2).neg()
      return { k1, k2 }
    }
    ShortCurve.prototype.pointFromX = function pointFromX(x, odd) {
      x = new BN(x, 16)
      if (!x.red) x = x.toRed(this.red)
      var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b)
      var y = y2.redSqrt()
      if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
        throw new Error("invalid point")
      var isOdd = y.fromRed().isOdd()
      if ((odd && !isOdd) || (!odd && isOdd)) y = y.redNeg()
      return this.point(x, y)
    }
    ShortCurve.prototype.validate = function validate(point) {
      if (point.inf) return true
      var x = point.x
      var y = point.y
      var ax = this.a.redMul(x)
      var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b)
      return y.redSqr().redISub(rhs).cmpn(0) === 0
    }
    ShortCurve.prototype._endoWnafMulAdd = function _endoWnafMulAdd(
      points,
      coeffs,
      jacobianResult
    ) {
      var npoints = this._endoWnafT1
      var ncoeffs = this._endoWnafT2
      for (var i = 0; i < points.length; i++) {
        var split = this._endoSplit(coeffs[i])
        var p = points[i]
        var beta = p._getBeta()
        if (split.k1.negative) {
          split.k1.ineg()
          p = p.neg(true)
        }
        if (split.k2.negative) {
          split.k2.ineg()
          beta = beta.neg(true)
        }
        npoints[i * 2] = p
        npoints[i * 2 + 1] = beta
        ncoeffs[i * 2] = split.k1
        ncoeffs[i * 2 + 1] = split.k2
      }
      var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult)
      for (var j = 0; j < i * 2; j++) {
        npoints[j] = null
        ncoeffs[j] = null
      }
      return res
    }
    function Point(curve, x, y, isRed) {
      Base.BasePoint.call(this, curve, "affine")
      if (x === null && y === null) {
        this.x = null
        this.y = null
        this.inf = true
      } else {
        this.x = new BN(x, 16)
        this.y = new BN(y, 16)
        if (isRed) {
          this.x.forceRed(this.curve.red)
          this.y.forceRed(this.curve.red)
        }
        if (!this.x.red) this.x = this.x.toRed(this.curve.red)
        if (!this.y.red) this.y = this.y.toRed(this.curve.red)
        this.inf = false
      }
    }
    inherits(Point, Base.BasePoint)
    ShortCurve.prototype.point = function point(x, y, isRed) {
      return new Point(this, x, y, isRed)
    }
    ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
      return Point.fromJSON(this, obj, red)
    }
    Point.prototype._getBeta = function _getBeta() {
      if (!this.curve.endo) return
      var pre = this.precomputed
      if (pre && pre.beta) return pre.beta
      var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y)
      if (pre) {
        var curve = this.curve
        var endoMul = function (p) {
          return curve.point(p.x.redMul(curve.endo.beta), p.y)
        }
        pre.beta = beta
        beta.precomputed = {
          beta: null,
          naf: pre.naf && {
            wnd: pre.naf.wnd,
            points: pre.naf.points.map(endoMul),
          },
          doubles: pre.doubles && {
            step: pre.doubles.step,
            points: pre.doubles.points.map(endoMul),
          },
        }
      }
      return beta
    }
    Point.prototype.toJSON = function toJSON() {
      if (!this.precomputed) return [this.x, this.y]
      return [
        this.x,
        this.y,
        this.precomputed && {
          doubles: this.precomputed.doubles && {
            step: this.precomputed.doubles.step,
            points: this.precomputed.doubles.points.slice(1),
          },
          naf: this.precomputed.naf && {
            wnd: this.precomputed.naf.wnd,
            points: this.precomputed.naf.points.slice(1),
          },
        },
      ]
    }
    Point.fromJSON = function fromJSON(curve, obj, red) {
      if (typeof obj === "string") obj = JSON.parse(obj)
      var res = curve.point(obj[0], obj[1], red)
      if (!obj[2]) return res
      function obj2point(obj2) {
        return curve.point(obj2[0], obj2[1], red)
      }
      var pre = obj[2]
      res.precomputed = {
        beta: null,
        doubles: pre.doubles && {
          step: pre.doubles.step,
          points: [res].concat(pre.doubles.points.map(obj2point)),
        },
        naf: pre.naf && {
          wnd: pre.naf.wnd,
          points: [res].concat(pre.naf.points.map(obj2point)),
        },
      }
      return res
    }
    Point.prototype.inspect = function inspect() {
      if (this.isInfinity()) return "<EC Point Infinity>"
      return (
        "<EC Point x: " +
        this.x.fromRed().toString(16, 2) +
        " y: " +
        this.y.fromRed().toString(16, 2) +
        ">"
      )
    }
    Point.prototype.isInfinity = function isInfinity() {
      return this.inf
    }
    Point.prototype.add = function add(p) {
      if (this.inf) return p
      if (p.inf) return this
      if (this.eq(p)) return this.dbl()
      if (this.neg().eq(p)) return this.curve.point(null, null)
      if (this.x.cmp(p.x) === 0) return this.curve.point(null, null)
      var c = this.y.redSub(p.y)
      if (c.cmpn(0) !== 0) c = c.redMul(this.x.redSub(p.x).redInvm())
      var nx = c.redSqr().redISub(this.x).redISub(p.x)
      var ny = c.redMul(this.x.redSub(nx)).redISub(this.y)
      return this.curve.point(nx, ny)
    }
    Point.prototype.dbl = function dbl() {
      if (this.inf) return this
      var ys1 = this.y.redAdd(this.y)
      if (ys1.cmpn(0) === 0) return this.curve.point(null, null)
      var a = this.curve.a
      var x2 = this.x.redSqr()
      var dyinv = ys1.redInvm()
      var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv)
      var nx = c.redSqr().redISub(this.x.redAdd(this.x))
      var ny = c.redMul(this.x.redSub(nx)).redISub(this.y)
      return this.curve.point(nx, ny)
    }
    Point.prototype.getX = function getX() {
      return this.x.fromRed()
    }
    Point.prototype.getY = function getY() {
      return this.y.fromRed()
    }
    Point.prototype.mul = function mul(k) {
      k = new BN(k, 16)
      if (this.isInfinity()) return this
      else if (this._hasDoubles(k)) return this.curve._fixedNafMul(this, k)
      else if (this.curve.endo) return this.curve._endoWnafMulAdd([this], [k])
      else return this.curve._wnafMul(this, k)
    }
    Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
      var points = [this, p2]
      var coeffs = [k1, k2]
      if (this.curve.endo) return this.curve._endoWnafMulAdd(points, coeffs)
      else return this.curve._wnafMulAdd(1, points, coeffs, 2)
    }
    Point.prototype.jmulAdd = function jmulAdd(k1, p2, k2) {
      var points = [this, p2]
      var coeffs = [k1, k2]
      if (this.curve.endo)
        return this.curve._endoWnafMulAdd(points, coeffs, true)
      else return this.curve._wnafMulAdd(1, points, coeffs, 2, true)
    }
    Point.prototype.eq = function eq(p) {
      return (
        this === p ||
        (this.inf === p.inf &&
          (this.inf || (this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0)))
      )
    }
    Point.prototype.neg = function neg(_precompute) {
      if (this.inf) return this
      var res = this.curve.point(this.x, this.y.redNeg())
      if (_precompute && this.precomputed) {
        var pre = this.precomputed
        var negate = function (p) {
          return p.neg()
        }
        res.precomputed = {
          naf: pre.naf && {
            wnd: pre.naf.wnd,
            points: pre.naf.points.map(negate),
          },
          doubles: pre.doubles && {
            step: pre.doubles.step,
            points: pre.doubles.points.map(negate),
          },
        }
      }
      return res
    }
    Point.prototype.toJ = function toJ() {
      if (this.inf) return this.curve.jpoint(null, null, null)
      var res = this.curve.jpoint(this.x, this.y, this.curve.one)
      return res
    }
    function JPoint(curve, x, y, z) {
      Base.BasePoint.call(this, curve, "jacobian")
      if (x === null && y === null && z === null) {
        this.x = this.curve.one
        this.y = this.curve.one
        this.z = new BN(0)
      } else {
        this.x = new BN(x, 16)
        this.y = new BN(y, 16)
        this.z = new BN(z, 16)
      }
      if (!this.x.red) this.x = this.x.toRed(this.curve.red)
      if (!this.y.red) this.y = this.y.toRed(this.curve.red)
      if (!this.z.red) this.z = this.z.toRed(this.curve.red)
      this.zOne = this.z === this.curve.one
    }
    inherits(JPoint, Base.BasePoint)
    ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
      return new JPoint(this, x, y, z)
    }
    JPoint.prototype.toP = function toP() {
      if (this.isInfinity()) return this.curve.point(null, null)
      var zinv = this.z.redInvm()
      var zinv2 = zinv.redSqr()
      var ax = this.x.redMul(zinv2)
      var ay = this.y.redMul(zinv2).redMul(zinv)
      return this.curve.point(ax, ay)
    }
    JPoint.prototype.neg = function neg() {
      return this.curve.jpoint(this.x, this.y.redNeg(), this.z)
    }
    JPoint.prototype.add = function add(p) {
      if (this.isInfinity()) return p
      if (p.isInfinity()) return this
      var pz2 = p.z.redSqr()
      var z2 = this.z.redSqr()
      var u1 = this.x.redMul(pz2)
      var u2 = p.x.redMul(z2)
      var s1 = this.y.redMul(pz2.redMul(p.z))
      var s2 = p.y.redMul(z2.redMul(this.z))
      var h = u1.redSub(u2)
      var r = s1.redSub(s2)
      if (h.cmpn(0) === 0) {
        if (r.cmpn(0) !== 0) return this.curve.jpoint(null, null, null)
        else return this.dbl()
      }
      var h2 = h.redSqr()
      var h3 = h2.redMul(h)
      var v = u1.redMul(h2)
      var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v)
      var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3))
      var nz = this.z.redMul(p.z).redMul(h)
      return this.curve.jpoint(nx, ny, nz)
    }
    JPoint.prototype.mixedAdd = function mixedAdd(p) {
      if (this.isInfinity()) return p.toJ()
      if (p.isInfinity()) return this
      var z2 = this.z.redSqr()
      var u1 = this.x
      var u2 = p.x.redMul(z2)
      var s1 = this.y
      var s2 = p.y.redMul(z2).redMul(this.z)
      var h = u1.redSub(u2)
      var r = s1.redSub(s2)
      if (h.cmpn(0) === 0) {
        if (r.cmpn(0) !== 0) return this.curve.jpoint(null, null, null)
        else return this.dbl()
      }
      var h2 = h.redSqr()
      var h3 = h2.redMul(h)
      var v = u1.redMul(h2)
      var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v)
      var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3))
      var nz = this.z.redMul(h)
      return this.curve.jpoint(nx, ny, nz)
    }
    JPoint.prototype.dblp = function dblp(pow) {
      if (pow === 0) return this
      if (this.isInfinity()) return this
      if (!pow) return this.dbl()
      var i
      if (this.curve.zeroA || this.curve.threeA) {
        var r = this
        for (i = 0; i < pow; i++) r = r.dbl()
        return r
      }
      var a = this.curve.a
      var tinv = this.curve.tinv
      var jx = this.x
      var jy = this.y
      var jz = this.z
      var jz4 = jz.redSqr().redSqr()
      var jyd = jy.redAdd(jy)
      for (i = 0; i < pow; i++) {
        var jx2 = jx.redSqr()
        var jyd2 = jyd.redSqr()
        var jyd4 = jyd2.redSqr()
        var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4))
        var t1 = jx.redMul(jyd2)
        var nx = c.redSqr().redISub(t1.redAdd(t1))
        var t2 = t1.redISub(nx)
        var dny = c.redMul(t2)
        dny = dny.redIAdd(dny).redISub(jyd4)
        var nz = jyd.redMul(jz)
        if (i + 1 < pow) jz4 = jz4.redMul(jyd4)
        jx = nx
        jz = nz
        jyd = dny
      }
      return this.curve.jpoint(jx, jyd.redMul(tinv), jz)
    }
    JPoint.prototype.dbl = function dbl() {
      if (this.isInfinity()) return this
      if (this.curve.zeroA) return this._zeroDbl()
      else if (this.curve.threeA) return this._threeDbl()
      else return this._dbl()
    }
    JPoint.prototype._zeroDbl = function _zeroDbl() {
      var nx
      var ny
      var nz
      if (this.zOne) {
        var xx = this.x.redSqr()
        var yy = this.y.redSqr()
        var yyyy = yy.redSqr()
        var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy)
        s = s.redIAdd(s)
        var m = xx.redAdd(xx).redIAdd(xx)
        var t = m.redSqr().redISub(s).redISub(s)
        var yyyy8 = yyyy.redIAdd(yyyy)
        yyyy8 = yyyy8.redIAdd(yyyy8)
        yyyy8 = yyyy8.redIAdd(yyyy8)
        nx = t
        ny = m.redMul(s.redISub(t)).redISub(yyyy8)
        nz = this.y.redAdd(this.y)
      } else {
        var a = this.x.redSqr()
        var b = this.y.redSqr()
        var c = b.redSqr()
        var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c)
        d = d.redIAdd(d)
        var e = a.redAdd(a).redIAdd(a)
        var f = e.redSqr()
        var c8 = c.redIAdd(c)
        c8 = c8.redIAdd(c8)
        c8 = c8.redIAdd(c8)
        nx = f.redISub(d).redISub(d)
        ny = e.redMul(d.redISub(nx)).redISub(c8)
        nz = this.y.redMul(this.z)
        nz = nz.redIAdd(nz)
      }
      return this.curve.jpoint(nx, ny, nz)
    }
    JPoint.prototype._threeDbl = function _threeDbl() {
      var nx
      var ny
      var nz
      if (this.zOne) {
        var xx = this.x.redSqr()
        var yy = this.y.redSqr()
        var yyyy = yy.redSqr()
        var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy)
        s = s.redIAdd(s)
        var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a)
        var t = m.redSqr().redISub(s).redISub(s)
        nx = t
        var yyyy8 = yyyy.redIAdd(yyyy)
        yyyy8 = yyyy8.redIAdd(yyyy8)
        yyyy8 = yyyy8.redIAdd(yyyy8)
        ny = m.redMul(s.redISub(t)).redISub(yyyy8)
        nz = this.y.redAdd(this.y)
      } else {
        var delta = this.z.redSqr()
        var gamma = this.y.redSqr()
        var beta = this.x.redMul(gamma)
        var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta))
        alpha = alpha.redAdd(alpha).redIAdd(alpha)
        var beta4 = beta.redIAdd(beta)
        beta4 = beta4.redIAdd(beta4)
        var beta8 = beta4.redAdd(beta4)
        nx = alpha.redSqr().redISub(beta8)
        nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta)
        var ggamma8 = gamma.redSqr()
        ggamma8 = ggamma8.redIAdd(ggamma8)
        ggamma8 = ggamma8.redIAdd(ggamma8)
        ggamma8 = ggamma8.redIAdd(ggamma8)
        ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8)
      }
      return this.curve.jpoint(nx, ny, nz)
    }
    JPoint.prototype._dbl = function _dbl() {
      var a = this.curve.a
      var jx = this.x
      var jy = this.y
      var jz = this.z
      var jz4 = jz.redSqr().redSqr()
      var jx2 = jx.redSqr()
      var jy2 = jy.redSqr()
      var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4))
      var jxd4 = jx.redAdd(jx)
      jxd4 = jxd4.redIAdd(jxd4)
      var t1 = jxd4.redMul(jy2)
      var nx = c.redSqr().redISub(t1.redAdd(t1))
      var t2 = t1.redISub(nx)
      var jyd8 = jy2.redSqr()
      jyd8 = jyd8.redIAdd(jyd8)
      jyd8 = jyd8.redIAdd(jyd8)
      jyd8 = jyd8.redIAdd(jyd8)
      var ny = c.redMul(t2).redISub(jyd8)
      var nz = jy.redAdd(jy).redMul(jz)
      return this.curve.jpoint(nx, ny, nz)
    }
    JPoint.prototype.trpl = function trpl() {
      if (!this.curve.zeroA) return this.dbl().add(this)
      var xx = this.x.redSqr()
      var yy = this.y.redSqr()
      var zz = this.z.redSqr()
      var yyyy = yy.redSqr()
      var m = xx.redAdd(xx).redIAdd(xx)
      var mm = m.redSqr()
      var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy)
      e = e.redIAdd(e)
      e = e.redAdd(e).redIAdd(e)
      e = e.redISub(mm)
      var ee = e.redSqr()
      var t = yyyy.redIAdd(yyyy)
      t = t.redIAdd(t)
      t = t.redIAdd(t)
      t = t.redIAdd(t)
      var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t)
      var yyu4 = yy.redMul(u)
      yyu4 = yyu4.redIAdd(yyu4)
      yyu4 = yyu4.redIAdd(yyu4)
      var nx = this.x.redMul(ee).redISub(yyu4)
      nx = nx.redIAdd(nx)
      nx = nx.redIAdd(nx)
      var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)))
      ny = ny.redIAdd(ny)
      ny = ny.redIAdd(ny)
      ny = ny.redIAdd(ny)
      var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee)
      return this.curve.jpoint(nx, ny, nz)
    }
    JPoint.prototype.mul = function mul(k, kbase) {
      k = new BN(k, kbase)
      return this.curve._wnafMul(this, k)
    }
    JPoint.prototype.eq = function eq(p) {
      if (p.type === "affine") return this.eq(p.toJ())
      if (this === p) return true
      var z2 = this.z.redSqr()
      var pz2 = p.z.redSqr()
      if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0) return false
      var z3 = z2.redMul(this.z)
      var pz3 = pz2.redMul(p.z)
      return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0
    }
    JPoint.prototype.eqXToP = function eqXToP(x) {
      var zs = this.z.redSqr()
      var rx = x.toRed(this.curve.red).redMul(zs)
      if (this.x.cmp(rx) === 0) return true
      var xc = x.clone()
      var t = this.curve.redN.redMul(zs)
      for (;;) {
        xc.iadd(this.curve.n)
        if (xc.cmp(this.curve.p) >= 0) return false
        rx.redIAdd(t)
        if (this.x.cmp(rx) === 0) return true
      }
    }
    JPoint.prototype.inspect = function inspect() {
      if (this.isInfinity()) return "<EC JPoint Infinity>"
      return (
        "<EC JPoint x: " +
        this.x.toString(16, 2) +
        " y: " +
        this.y.toString(16, 2) +
        " z: " +
        this.z.toString(16, 2) +
        ">"
      )
    }
    JPoint.prototype.isInfinity = function isInfinity() {
      return this.z.cmpn(0) === 0
    }
  },
})

// elliptic/curve/index.js
var require_curve = __commonJS({
  "elliptic/curve/index.js"(exports2) {
    "use strict"
    var curve = exports2
    curve.short = require_short()
  },
})

// elliptic/precomputed/secp256k1.js
var require_secp256k12 = __commonJS({
  "elliptic/precomputed/secp256k1.js"(exports2, module2) {
    module2.exports = {
      doubles: {
        step: 4,
        points: [
          [
            "e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a",
            "f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821",
          ],
          [
            "8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508",
            "11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf",
          ],
          [
            "175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739",
            "d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695",
          ],
          [
            "363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640",
            "4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9",
          ],
          [
            "8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c",
            "4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36",
          ],
          [
            "723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda",
            "96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f",
          ],
          [
            "eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa",
            "5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999",
          ],
          [
            "100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0",
            "cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09",
          ],
          [
            "e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d",
            "9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d",
          ],
          [
            "feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d",
            "e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088",
          ],
          [
            "da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1",
            "9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d",
          ],
          [
            "53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0",
            "5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8",
          ],
          [
            "8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047",
            "10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a",
          ],
          [
            "385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862",
            "283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453",
          ],
          [
            "6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7",
            "7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160",
          ],
          [
            "3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd",
            "56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0",
          ],
          [
            "85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83",
            "7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6",
          ],
          [
            "948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a",
            "53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589",
          ],
          [
            "6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8",
            "bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17",
          ],
          [
            "e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d",
            "4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda",
          ],
          [
            "e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725",
            "7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd",
          ],
          [
            "213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754",
            "4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2",
          ],
          [
            "4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c",
            "17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6",
          ],
          [
            "fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6",
            "6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f",
          ],
          [
            "76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39",
            "c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01",
          ],
          [
            "c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891",
            "893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3",
          ],
          [
            "d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b",
            "febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f",
          ],
          [
            "b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03",
            "2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7",
          ],
          [
            "e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d",
            "eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78",
          ],
          [
            "a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070",
            "7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1",
          ],
          [
            "90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4",
            "e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150",
          ],
          [
            "8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da",
            "662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82",
          ],
          [
            "e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11",
            "1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc",
          ],
          [
            "8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e",
            "efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b",
          ],
          [
            "e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41",
            "2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51",
          ],
          [
            "b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef",
            "67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45",
          ],
          [
            "d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8",
            "db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120",
          ],
          [
            "324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d",
            "648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84",
          ],
          [
            "4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96",
            "35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d",
          ],
          [
            "9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd",
            "ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d",
          ],
          [
            "6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5",
            "9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8",
          ],
          [
            "a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266",
            "40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8",
          ],
          [
            "7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71",
            "34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac",
          ],
          [
            "928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac",
            "c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f",
          ],
          [
            "85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751",
            "1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962",
          ],
          [
            "ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e",
            "493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907",
          ],
          [
            "827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241",
            "c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec",
          ],
          [
            "eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3",
            "be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d",
          ],
          [
            "e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f",
            "4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414",
          ],
          [
            "1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19",
            "aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd",
          ],
          [
            "146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be",
            "b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0",
          ],
          [
            "fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9",
            "6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811",
          ],
          [
            "da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2",
            "8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1",
          ],
          [
            "a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13",
            "7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c",
          ],
          [
            "174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c",
            "ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73",
          ],
          [
            "959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba",
            "2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd",
          ],
          [
            "d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151",
            "e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405",
          ],
          [
            "64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073",
            "d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589",
          ],
          [
            "8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458",
            "38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e",
          ],
          [
            "13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b",
            "69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27",
          ],
          [
            "bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366",
            "d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1",
          ],
          [
            "8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa",
            "40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482",
          ],
          [
            "8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0",
            "620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945",
          ],
          [
            "dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787",
            "7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573",
          ],
          [
            "f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e",
            "ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82",
          ],
        ],
      },
      naf: {
        wnd: 7,
        points: [
          [
            "f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
            "388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672",
          ],
          [
            "2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4",
            "d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6",
          ],
          [
            "5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc",
            "6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da",
          ],
          [
            "acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe",
            "cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37",
          ],
          [
            "774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb",
            "d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b",
          ],
          [
            "f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8",
            "ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81",
          ],
          [
            "d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e",
            "581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58",
          ],
          [
            "defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34",
            "4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77",
          ],
          [
            "2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c",
            "85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a",
          ],
          [
            "352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5",
            "321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c",
          ],
          [
            "2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f",
            "2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67",
          ],
          [
            "9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714",
            "73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402",
          ],
          [
            "daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729",
            "a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55",
          ],
          [
            "c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db",
            "2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482",
          ],
          [
            "6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4",
            "e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82",
          ],
          [
            "1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5",
            "b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396",
          ],
          [
            "605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479",
            "2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49",
          ],
          [
            "62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d",
            "80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf",
          ],
          [
            "80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f",
            "1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a",
          ],
          [
            "7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb",
            "d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7",
          ],
          [
            "d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9",
            "eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933",
          ],
          [
            "49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963",
            "758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a",
          ],
          [
            "77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74",
            "958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6",
          ],
          [
            "f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530",
            "e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37",
          ],
          [
            "463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b",
            "5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e",
          ],
          [
            "f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247",
            "cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6",
          ],
          [
            "caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1",
            "cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476",
          ],
          [
            "2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120",
            "4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40",
          ],
          [
            "7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435",
            "91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61",
          ],
          [
            "754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18",
            "673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683",
          ],
          [
            "e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8",
            "59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5",
          ],
          [
            "186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb",
            "3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b",
          ],
          [
            "df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f",
            "55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417",
          ],
          [
            "5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143",
            "efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868",
          ],
          [
            "290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba",
            "e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a",
          ],
          [
            "af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45",
            "f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6",
          ],
          [
            "766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a",
            "744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996",
          ],
          [
            "59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e",
            "c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e",
          ],
          [
            "f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8",
            "e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d",
          ],
          [
            "7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c",
            "30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2",
          ],
          [
            "948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519",
            "e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e",
          ],
          [
            "7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab",
            "100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437",
          ],
          [
            "3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca",
            "ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311",
          ],
          [
            "d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf",
            "8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4",
          ],
          [
            "1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610",
            "68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575",
          ],
          [
            "733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4",
            "f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d",
          ],
          [
            "15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c",
            "d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d",
          ],
          [
            "a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940",
            "edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629",
          ],
          [
            "e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980",
            "a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06",
          ],
          [
            "311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3",
            "66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374",
          ],
          [
            "34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf",
            "9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee",
          ],
          [
            "f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63",
            "4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1",
          ],
          [
            "d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448",
            "fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b",
          ],
          [
            "32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf",
            "5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661",
          ],
          [
            "7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5",
            "8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6",
          ],
          [
            "ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6",
            "8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e",
          ],
          [
            "16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5",
            "5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d",
          ],
          [
            "eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99",
            "f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc",
          ],
          [
            "78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51",
            "f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4",
          ],
          [
            "494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5",
            "42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c",
          ],
          [
            "a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5",
            "204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b",
          ],
          [
            "c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997",
            "4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913",
          ],
          [
            "841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881",
            "73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154",
          ],
          [
            "5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5",
            "39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865",
          ],
          [
            "36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66",
            "d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc",
          ],
          [
            "336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726",
            "ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224",
          ],
          [
            "8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede",
            "6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e",
          ],
          [
            "1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94",
            "60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6",
          ],
          [
            "85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31",
            "3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511",
          ],
          [
            "29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51",
            "b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b",
          ],
          [
            "a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252",
            "ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2",
          ],
          [
            "4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5",
            "cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c",
          ],
          [
            "d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b",
            "6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3",
          ],
          [
            "ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4",
            "322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d",
          ],
          [
            "af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f",
            "6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700",
          ],
          [
            "e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889",
            "2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4",
          ],
          [
            "591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246",
            "b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196",
          ],
          [
            "11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984",
            "998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4",
          ],
          [
            "3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a",
            "b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257",
          ],
          [
            "cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030",
            "bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13",
          ],
          [
            "c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197",
            "6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096",
          ],
          [
            "c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593",
            "c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38",
          ],
          [
            "a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef",
            "21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f",
          ],
          [
            "347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38",
            "60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448",
          ],
          [
            "da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a",
            "49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a",
          ],
          [
            "c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111",
            "5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4",
          ],
          [
            "4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502",
            "7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437",
          ],
          [
            "3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea",
            "be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7",
          ],
          [
            "cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26",
            "8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d",
          ],
          [
            "b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986",
            "39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a",
          ],
          [
            "d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e",
            "62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54",
          ],
          [
            "48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4",
            "25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77",
          ],
          [
            "dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda",
            "ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517",
          ],
          [
            "6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859",
            "cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10",
          ],
          [
            "e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f",
            "f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125",
          ],
          [
            "eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c",
            "6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e",
          ],
          [
            "13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942",
            "fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1",
          ],
          [
            "ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a",
            "1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2",
          ],
          [
            "b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80",
            "5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423",
          ],
          [
            "ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d",
            "438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8",
          ],
          [
            "8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1",
            "cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758",
          ],
          [
            "52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63",
            "c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375",
          ],
          [
            "e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352",
            "6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d",
          ],
          [
            "7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193",
            "ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec",
          ],
          [
            "5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00",
            "9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0",
          ],
          [
            "32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58",
            "ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c",
          ],
          [
            "e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7",
            "d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4",
          ],
          [
            "8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8",
            "c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f",
          ],
          [
            "4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e",
            "67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649",
          ],
          [
            "3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d",
            "cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826",
          ],
          [
            "674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b",
            "299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5",
          ],
          [
            "d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f",
            "f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87",
          ],
          [
            "30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6",
            "462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b",
          ],
          [
            "be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297",
            "62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc",
          ],
          [
            "93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a",
            "7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c",
          ],
          [
            "b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c",
            "ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f",
          ],
          [
            "d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52",
            "4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a",
          ],
          [
            "d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb",
            "bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46",
          ],
          [
            "463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065",
            "bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f",
          ],
          [
            "7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917",
            "603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03",
          ],
          [
            "74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9",
            "cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08",
          ],
          [
            "30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3",
            "553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8",
          ],
          [
            "9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57",
            "712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373",
          ],
          [
            "176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66",
            "ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3",
          ],
          [
            "75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8",
            "9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8",
          ],
          [
            "809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721",
            "9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1",
          ],
          [
            "1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180",
            "4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9",
          ],
        ],
      },
    }
  },
})

// elliptic/curves.js
var require_curves = __commonJS({
  "elliptic/curves.js"(exports2) {
    "use strict"
    var curves = exports2
    var curve = require_curve()
    var utils = require_utils()
    var assert = utils.assert
    function PresetCurve(options) {
      if (options.type === "short") this.curve = new curve.short(options)
      else if (options.type === "edwards")
        this.curve = new curve.edwards(options)
      else this.curve = new curve.mont(options)
      this.g = this.curve.g
      this.n = this.curve.n
      this.hash = options.hash
      assert(this.g.validate(), "Invalid curve")
      assert(this.g.mul(this.n).isInfinity(), "Invalid curve, G*N != O")
    }
    curves.PresetCurve = PresetCurve
    function defineCurve(name, options) {
      Object.defineProperty(curves, name, {
        configurable: true,
        enumerable: true,
        get: function () {
          var curve2 = new PresetCurve(options)
          Object.defineProperty(curves, name, {
            configurable: true,
            enumerable: true,
            value: curve2,
          })
          return curve2
        },
      })
    }
    var pre
    try {
      pre = require_secp256k12()
    } catch (e) {
      pre = void 0
    }
    defineCurve("secp256k1", {
      type: "short",
      prime: "k256",
      p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
      a: "0",
      b: "7",
      n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
      h: "1",
      // Precomputed endomorphism
      beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
      lambda:
        "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
      basis: [
        {
          a: "3086d221a7d46bcde86c90e49284eb15",
          b: "-e4437ed6010e88286f547fa90abfe4c3",
        },
        {
          a: "114ca50f7a8e2f3f657c1108d9d44cfd8",
          b: "3086d221a7d46bcde86c90e49284eb15",
        },
      ],
      gRed: false,
      g: [
        "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
        "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
        pre,
      ],
    })
  },
})

// elliptic/elliptic/key.js
var require_key = __commonJS({
  "elliptic/elliptic/key.js"(exports2, module2) {
    "use strict"
    var BN = require_bn()
    var utils = require_utils()
    var assert = utils.assert
    function KeyPair(ec, options) {
      this.ec = ec
      this.priv = null
      this.pub = null
      if (options.priv) this._importPrivate(options.priv, options.privEnc)
      if (options.pub) this._importPublic(options.pub, options.pubEnc)
    }
    module2.exports = KeyPair
    KeyPair.fromPublic = function fromPublic(ec, pub, enc) {
      if (pub instanceof KeyPair) return pub
      return new KeyPair(ec, {
        pub,
        pubEnc: enc,
      })
    }
    KeyPair.fromPrivate = function fromPrivate(ec, priv, enc) {
      if (priv instanceof KeyPair) return priv
      return new KeyPair(ec, {
        priv,
        privEnc: enc,
      })
    }
    KeyPair.prototype.validate = function validate() {
      var pub = this.getPublic()
      if (pub.isInfinity())
        return { result: false, reason: "Invalid public key" }
      if (!pub.validate())
        return { result: false, reason: "Public key is not a point" }
      if (!pub.mul(this.ec.curve.n).isInfinity())
        return { result: false, reason: "Public key * N != O" }
      return { result: true, reason: null }
    }
    KeyPair.prototype.getPublic = function getPublic(compact, enc) {
      if (typeof compact === "string") {
        enc = compact
        compact = null
      }
      if (!this.pub) this.pub = this.ec.g.mul(this.priv)
      if (!enc) return this.pub
      return this.pub.encode(enc, compact)
    }
    KeyPair.prototype.getPrivate = function getPrivate(enc) {
      if (enc === "hex") return this.priv.toString(16, 2)
      else return this.priv
    }
    KeyPair.prototype._importPrivate = function _importPrivate(key, enc) {
      this.priv = new BN(key, enc || 16)
      this.priv = this.priv.umod(this.ec.curve.n)
    }
    KeyPair.prototype._importPublic = function _importPublic(key, enc) {
      if (key.x || key.y) {
        if (this.ec.curve.type === "mont") {
          assert(key.x, "Need x coordinate")
        } else if (
          this.ec.curve.type === "short" ||
          this.ec.curve.type === "edwards"
        ) {
          assert(key.x && key.y, "Need both x and y coordinate")
        }
        this.pub = this.ec.curve.point(key.x, key.y)
        return
      }
      this.pub = this.ec.curve.decodePoint(key, enc)
    }
    KeyPair.prototype.derive = function derive(pub) {
      if (!pub.validate()) {
        assert(pub.validate(), "public point not validated")
      }
      return pub.mul(this.priv).getX()
    }
    KeyPair.prototype.sign = function sign(msg, enc, options) {
      return this.ec.sign(msg, this, enc, options)
    }
    KeyPair.prototype.verify = function verify(msg, signature) {
      return this.ec.verify(msg, signature, this)
    }
    KeyPair.prototype.inspect = function inspect() {
      return (
        "<Key priv: " +
        (this.priv && this.priv.toString(16, 2)) +
        " pub: " +
        (this.pub && this.pub.inspect()) +
        " >"
      )
    }
  },
})

// elliptic/elliptic/ec.js
var require_ec = __commonJS({
  "elliptic/elliptic/ec.js"(exports2, module2) {
    "use strict"
    var utils = require_utils()
    var curves = require_curves()
    var assert = utils.assert
    var KeyPair = require_key()
    function EC(options) {
      if (!(this instanceof EC)) return new EC(options)
      if (typeof options === "string") {
        assert(
          Object.prototype.hasOwnProperty.call(curves, options),
          "Unknown curve " + options
        )
        options = curves[options]
      }
      if (options instanceof curves.PresetCurve) options = { curve: options }
      this.curve = options.curve.curve
      this.n = this.curve.n
      this.nh = this.n.ushrn(1)
      this.g = this.curve.g
      this.g = options.curve.g
      this.g.precompute(options.curve.n.bitLength() + 1)
      this.hash = options.hash || options.curve.hash
    }
    module2.exports = EC
    EC.prototype.keyPair = function keyPair(options) {
      return new KeyPair(this, options)
    }
  },
})

// elliptic/index.js
var require_elliptic = __commonJS({
  "elliptic/index.js"(exports2) {
    "use strict"
    var elliptic = exports2
    elliptic.ec = require_ec()
  },
})

// secp256k1/elliptic.js
var require_elliptic2 = __commonJS({
  "secp256k1/elliptic.js"(exports2, module2) {
    var EC = require_elliptic().ec
    var ec = new EC("secp256k1")
    var ecparams = ec.curve
    var BN = ecparams.n.constructor
    function loadCompressedPublicKey(first, xbuf) {
      let x = new BN(xbuf)
      if (x.cmp(ecparams.p) >= 0) return null
      x = x.toRed(ecparams.red)
      let y = x.redSqr().redIMul(x).redIAdd(ecparams.b).redSqrt()
      if ((first === 3) !== y.isOdd()) y = y.redNeg()
      return ec.keyPair({ pub: { x, y } })
    }
    function loadUncompressedPublicKey(first, xbuf, ybuf) {
      let x = new BN(xbuf)
      let y = new BN(ybuf)
      if (x.cmp(ecparams.p) >= 0 || y.cmp(ecparams.p) >= 0) return null
      x = x.toRed(ecparams.red)
      y = y.toRed(ecparams.red)
      if ((first === 6 || first === 7) && y.isOdd() !== (first === 7))
        return null
      const x3 = x.redSqr().redIMul(x)
      if (!y.redSqr().redISub(x3.redIAdd(ecparams.b)).isZero()) return null
      return ec.keyPair({ pub: { x, y } })
    }
    function loadPublicKey(pubkey) {
      const first = pubkey[0]
      switch (first) {
        case 2:
        case 3:
          if (pubkey.length !== 33) return null
          return loadCompressedPublicKey(first, pubkey.subarray(1, 33))
        case 4:
        case 6:
        case 7:
          if (pubkey.length !== 65) return null
          return loadUncompressedPublicKey(
            first,
            pubkey.subarray(1, 33),
            pubkey.subarray(33, 65)
          )
        default:
          return null
      }
    }
    function savePublicKey(output, point) {
      const pubkey = point.encode(null, output.length === 33)
      for (let i = 0; i < output.length; ++i) output[i] = pubkey[i]
    }
    module2.exports = {
      publicKeyConvert(output, pubkey) {
        const pair = loadPublicKey(pubkey)
        if (pair === null) return 1
        const point = pair.getPublic()
        savePublicKey(output, point)
        return 0
      },
    }
  },
})

// ethereum-cryptography/keccak.js
var require_keccak = __commonJS({
  "ethereum-cryptography/keccak.js"(exports2, module2) {
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
          (c & 64512) == 55296 &&
          i + 1 < str.length &&
          (str.charCodeAt(i + 1) & 64512) == 56320
        ) {
          c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023)
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
    function hash(hash2) {
      if (typeof hash2 !== "function" || typeof hash2.create !== "function")
        throw new Error("Hash should be wrapped by utils.wrapConstructor")
      number(hash2.outputLen)
      number(hash2.blockLen)
    }
    function exists(instance, checkFinished = true) {
      if (instance.destroyed)
        throw new Error("Hash instance has been destroyed")
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
    var assert = {
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
    var U32_MASK64 = BigInt(2 ** 32 - 1)
    var _32n = BigInt(32)
    function fromBig(n, le = false) {
      if (le)
        return {
          h: Number(n & U32_MASK64),
          l: Number((n >> _32n) & U32_MASK64),
        }
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
    var toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0)
    var shrSH = (h, l, s) => h >>> s
    var shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s)
    var rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s))
    var rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s)
    var rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32))
    var rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s))
    var rotr32H = (h, l) => l
    var rotr32L = (h, l) => h
    var rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s))
    var rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s))
    var rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s))
    var rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s))
    function add(Ah, Al, Bh, Bl) {
      const l = (Al >>> 0) + (Bl >>> 0)
      return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 }
    }
    var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0)
    var add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0
    var add4L = (Al, Bl, Cl, Dl) =>
      (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0)
    var add4H = (low, Ah, Bh, Ch, Dh) =>
      (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0
    var add5L = (Al, Bl, Cl, Dl, El) =>
      (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0)
    var add5H = (low, Ah, Bh, Ch, Dh, Eh) =>
      (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0
    var u64 = {
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
    var [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []]
    var _0n = BigInt(0)
    var _1n = BigInt(1)
    var _2n = BigInt(2)
    var _7n = BigInt(7)
    var _256n = BigInt(256)
    var _0x71n = BigInt(113)
    for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
      ;[x, y] = [y, (2 * x + 3 * y) % 5]
      SHA3_PI.push(2 * (5 * y + x))
      SHA3_ROTL.push((((round + 1) * (round + 2)) / 2) % 64)
      let t = _0n
      for (let j = 0; j < 7; j++) {
        R = ((R << _1n) ^ ((R >> _7n) * _0x71n)) % _256n
        if (R & _2n) t ^= _1n << ((_1n << BigInt(j)) - _1n)
      }
      _SHA3_IOTA.push(t)
    }
    var [SHA3_IOTA_H, SHA3_IOTA_L] = u64.split(_SHA3_IOTA, true)
    var rotlH = (h, l, s) =>
      s > 32 ? u64.rotlBH(h, l, s) : u64.rotlSH(h, l, s)
    var rotlL = (h, l, s) =>
      s > 32 ? u64.rotlBL(h, l, s) : u64.rotlSL(h, l, s)
    var u32 = arr =>
      new Uint32Array(
        arr.buffer,
        arr.byteOffset,
        Math.floor(arr.byteLength / 4)
      )
    function keccakP(s, rounds = 24) {
      const B = new Uint32Array(5 * 2)
      for (let round = 24 - rounds; round < 24; round++) {
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
        for (let y = 0; y < 50; y += 10) {
          for (let x = 0; x < 10; x++) B[x] = s[y + x]
          for (let x = 0; x < 10; x++)
            s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10]
        }
        s[0] ^= SHA3_IOTA_H[round]
        s[1] ^= SHA3_IOTA_L[round]
      }
      B.fill(0)
    }
    var Hash = class {
      // Safe version that clones internal state
      clone() {
        return this._cloneInto()
      }
    }
    var Keccak = class _Keccak extends Hash {
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
        assert.number(outputLen)
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
        state[pos] ^= suffix
        if ((suffix & 128) !== 0 && pos === blockLen - 1) this.keccak()
        state[blockLen - 1] ^= 128
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
        if (!this.enableXOF)
          throw new Error("XOF is not possible for this instance")
        return this.writeInto(out)
      }
      xof(bytes2) {
        assert.number(bytes2)
        return this.xofInto(new Uint8Array(bytes2))
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
        to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds))
        to.state32.set(this.state32)
        to.pos = this.pos
        to.posOut = this.posOut
        to.finished = this.finished
        to.rounds = rounds
        to.suffix = suffix
        to.outputLen = outputLen
        to.enableXOF = enableXOF
        to.destroyed = this.destroyed
        return to
      }
    }
    var gen = (suffix, blockLen, outputLen) =>
      wrapConstructor(() => new Keccak(blockLen, suffix, outputLen))
    var keccak_256 = gen(1, 136, 256 / 8)
    function wrapHash(hash2) {
      return msg => {
        assert.bytes(msg)
        return hash2(msg)
      }
    }
    var __ = () => {
      const k = wrapHash(keccak_256)
      k.create = keccak_256.create
      return k
    }
    var keccak256 = __()
    module2.exports = { keccak256 }
  },
})

// ethereumjs-util/bytes.js
var require_bytes = __commonJS({
  "ethereumjs-util/bytes.js"(exports2, module2) {
    var BN = require_bn()
    var Buffer3 = require_buffer().Buffer
    var intToHex = function (i) {
      if (!Number.isSafeInteger(i) || i < 0) {
        throw new Error(`Received an invalid integer type: ${i}`)
      }
      return `0x${i.toString(16)}`
    }
    var intToBuffer = function (i) {
      const hex = intToHex(i)
      return Buffer3.from(padToEven(hex.slice(2)), "hex")
    }
    function isHexPrefixed(str) {
      if (typeof str !== "string") {
        throw new Error(
          `[isHexPrefixed] input must be type 'string', received type ${typeof str}`
        )
      }
      return str[0] === "0" && str[1] === "x"
    }
    var stripHexPrefix = str => {
      if (typeof str !== "string")
        throw new Error(
          `[stripHexPrefix] input must be type 'string', received ${typeof str}`
        )
      return isHexPrefixed(str) ? str.slice(2) : str
    }
    function padToEven(value) {
      let a = value
      if (typeof a !== "string") {
        throw new Error(
          `[padToEven] value must be type 'string', received ${typeof a}`
        )
      }
      if (a.length % 2) a = `0${a}`
      return a
    }
    function isHexString(value, length) {
      if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/))
        return false
      if (length && value.length !== 2 + 2 * length) return false
      return true
    }
    var toBuffer2 = function (v) {
      if (v === null || v === void 0) {
        return Buffer3.allocUnsafe(0)
      }
      if (Buffer3.isBuffer(v)) {
        return Buffer3.from(v)
      }
      if (Array.isArray(v) || v instanceof Uint8Array) {
        return Buffer3.from(v)
      }
      if (typeof v === "string") {
        if (!isHexString(v)) {
          throw new Error(
            `Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings and this string was given: ${v}`
          )
        }
        return Buffer3.from(padToEven(stripHexPrefix(v)), "hex")
      }
      if (typeof v === "number") {
        return intToBuffer(v)
      }
      if (BN.isBN(v)) {
        if (v.isNeg()) {
          throw new Error(`Cannot convert negative BN to buffer. Given: ${v}`)
        }
        return v.toArrayLike(Buffer3)
      }
      if (v.toArray) {
        return Buffer3.from(v.toArray())
      }
      if (v.toBuffer) {
        return Buffer3.from(v.toBuffer())
      }
      throw new Error("invalid type")
    }
    module2.exports = {
      toBuffer: toBuffer2,
    }
  },
})

// ethereumjs-util/account.js
var require_account = __commonJS({
  "ethereumjs-util/account.js"(exports2, module2) {
    var Buffer3 = require_buffer().Buffer
    var assert = valid => {
      if (valid !== true) throw new Error()
    }
    var { publicKeyConvert: publicKeyConvert2 } = require_secp256k1()
    var { keccak256: k256 } = require_keccak()
    var BN = require_bn()
    var { toBuffer: toBuffer2 } = require_bytes()
    var keccak = function (a, bits = 256) {
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
    var stripHexPrefix = str => {
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
    var assertIsHexString = function (input) {
      if (!isHexString(input)) {
        const msg = `This method only supports 0x-prefixed hex strings but input was: ${input}`
        throw new Error(msg)
      }
    }
    var assertIsBuffer = function (input) {
      if (!Buffer3.isBuffer(input)) {
        const msg = `This method only supports Buffer but input was: ${input}`
        throw new Error(msg)
      }
    }
    var assertIsString = function (input) {
      if (typeof input !== "string") {
        const msg = `This method only supports strings but input was: ${input}`
        throw new Error(msg)
      }
    }
    var pubToAddress2 = function (pubKey, sanitize = false) {
      assertIsBuffer(pubKey)
      if (sanitize && pubKey.length !== 64) {
        pubKey = Buffer3.from(publicKeyConvert2(pubKey, false).slice(1))
      }
      assert(pubKey.length === 64)
      return Buffer3.from(keccak(pubKey)).slice(-20)
    }
    function toType(input, outputType) {
      if (input === null) {
        return null
      }
      if (input === void 0) {
        return void 0
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
      const output = toBuffer2(input)
      if (outputType === Buffer3) {
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
        return `0x${output.toString("hex")}`
      }
    }
    var keccakFromString = function (a, bits = 256) {
      assertIsString(a)
      const buf = Buffer3.from(a, "utf8")
      return keccak(buf, bits)
    }
    var toChecksumAddress2 = function (hexAddress, eip1191ChainId) {
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
    module2.exports = {
      pubToAddress: pubToAddress2,
      toChecksumAddress: toChecksumAddress2,
    }
  },
})

// ethereumjs-util/index.js
var require_ethereumjs_util = __commonJS({
  "ethereumjs-util/index.js"(exports2, module2) {
    var { pubToAddress: pubToAddress2, toChecksumAddress: toChecksumAddress2 } =
      require_account()
    var { toBuffer: toBuffer2 } = require_bytes()
    module2.exports = {
      pubToAddress: pubToAddress2,
      toChecksumAddress: toChecksumAddress2,
      toBuffer: toBuffer2,
    }
  },
})

// eth-crypto/util.js
var require_util = __commonJS({
  "eth-crypto/util.js"(exports2, module2) {
    var Buffer3 = require_buffer().Buffer
    function removeLeading0x(str) {
      if (str.startsWith("0x")) return str.substring(2)
      else return str
    }
    function addLeading0x2(str) {
      if (!str.startsWith("0x")) return "0x" + str
      else return str
    }
    function uint8ArrayToHex2(arr) {
      return Buffer3.from(arr).toString("hex")
    }
    function hexToUnit8Array2(str) {
      return new Uint8Array(Buffer3.from(str, "hex"))
    }
    module2.exports = {
      removeLeading0x,
      addLeading0x: addLeading0x2,
      uint8ArrayToHex: uint8ArrayToHex2,
      hexToUnit8Array: hexToUnit8Array2,
    }
  },
})

// eth-crypto/public-key.js
var Buffer2 = require_buffer().Buffer
var { publicKeyConvert } = require_secp256k1()(require_elliptic2())
var { pubToAddress, toChecksumAddress, toBuffer } = require_ethereumjs_util()
var { hexToUnit8Array, uint8ArrayToHex, addLeading0x } = require_util()
function decompress(startsWith02Or03) {
  const testBuffer = Buffer2.from(startsWith02Or03, "hex")
  if (testBuffer.length === 64) startsWith02Or03 = "04" + startsWith02Or03
  let decompressed = uint8ArrayToHex(
    publicKeyConvert(hexToUnit8Array(startsWith02Or03), false)
  )
  decompressed = decompressed.substring(2)
  return decompressed
}
function toAddress(publicKey) {
  publicKey = decompress(publicKey)
  const addressBuffer = pubToAddress(toBuffer(addLeading0x(publicKey)))
  const checkSumAdress = toChecksumAddress(
    addLeading0x(addressBuffer.toString("hex"))
  )
  return checkSumAdress.toLowerCase()
}

const go = async () => {
  const proofs = await fetch(
    `https://proof-service.next.id/v1/proof?platform=${platform}&identity=${handle}`
  ).then(v => v.json())
  let isValid = false
  for (const v of proofs.ids) {
    for (const v2 of v.proofs) {
      if (
        v2.platform === platform &&
        v2.is_valid &&
        v2.identity.toLowerCase() === handle &&
        toAddress(v.persona.slice(2)) === params.caller
      ) {
        isValid = true
        break
      }
    }
    if (isValid) break
  }
  if (!isValid) return null

  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]
  const query = {
    func: "relay",
    query: [`auth:nextid:${platform}`, params, { linkTo: handle }],
  }
  const message = {
    nonce: 1,
    query: JSON.stringify(query),
  }
  const data = {
    types: {
      EIP712Domain,
      Query: [
        { name: "query", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    },
    domain: {
      name: "weavedb",
      version: "1",
      verifyingContract,
    },
    primaryType: "Query",
    message,
  }
  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
    message: JSON.stringify(data),
    publicKey,
    sigName: "sig1",
  })
}

go()
