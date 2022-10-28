exports.Buffer = Buffer
const K_MAX_LENGTH = 0x7fffffff
const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

const base64 = require("base64-js")

Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function base64clean(str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split("=")[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, "")
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ""
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + "="
  }
  return str
}

function base64ToBytes(str) {
  return base64.toByteArray(base64clean(str))
}

function utf8ToBytes(string, units) {
  units = units || Infinity
  let codePoint
  const length = string.length
  let leadSurrogate = null
  const bytes = []

  for (let i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xd7ff && codePoint < 0xe000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xdbff) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xdc00) {
        if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint =
        (((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80)
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        (codePoint >> 0xc) | 0xe0,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        (codePoint >> 0x12) | 0xf0,
        ((codePoint >> 0xc) & 0x3f) | 0x80,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      )
    } else {
      throw new Error("Invalid code point")
    }
  }

  return bytes
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

function byteLength(string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== "string") {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
        "Received type " +
        typeof string
    )
  }

  const len = string.length
  const mustMatch = arguments.length > 2 && arguments[2] === true
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
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
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ("" + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

function fromString(string, encoding) {
  if (typeof encoding !== "string" || encoding === "") {
    encoding = "utf8"
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError("Unknown encoding: " + encoding)
  }

  const length = byteLength(string, encoding) | 0
  let buf = createBuffer(length)

  const actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function from(value, encodingOrOffset, length) {
  if (typeof value === "string") {
    return fromString(value, encodingOrOffset)
  }
  /*
  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
        "or Array-like Object. Received type " +
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
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  const b = fromObject(value)
  if (b) return b

  if (
    typeof Symbol !== "undefined" &&
    Symbol.toPrimitive != null &&
    typeof value[Symbol.toPrimitive] === "function"
  ) {
    return Buffer.from(
      value[Symbol.toPrimitive]("string"),
      encodingOrOffset,
      length
    )
  }

  throw new TypeError(
    "The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
      "or Array-like Object. Received type " +
      typeof value
      )
  */
}

function checked(length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError(
      "Attempt to allocate Buffer larger than maximum " +
        "size: 0x" +
        K_MAX_LENGTH.toString(16) +
        " bytes"
    )
  }
  return length | 0
}

function createBuffer(length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError(
      'The value "' + length + '" is invalid for option "size"'
    )
  }
  // Return an augmented `Uint8Array` instance
  const buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

function assertSize(size) {
  if (typeof size !== "number") {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError(
      'The value "' + size + '" is invalid for option "size"'
    )
  }
}

function allocUnsafe(size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}

function Buffer(arg, encodingOrOffset, length) {
  // Common case.
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

Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

Buffer.isEncoding = function isEncoding(encoding) {
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

Buffer.isBuffer = function isBuffer(b) {
  return b != null && b._isBuffer === true && b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.prototype.fill = function fill(val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === "string") {
    if (typeof start === "string") {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === "string") {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== "string") {
      throw new TypeError("encoding must be a string")
    }
    if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding)
    }
    if (val.length === 1) {
      const code = val.charCodeAt(0)
      if ((encoding === "utf8" && code < 128) || encoding === "latin1") {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === "number") {
    val = val & 255
  } else if (typeof val === "boolean") {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError("Out of range index")
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  let i
  if (typeof val === "number") {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding)
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

Buffer.prototype.write = function write(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = "utf8"
    length = this.length
    offset = 0
    // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === "string") {
    encoding = offset
    length = this.length
    offset = 0
    // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = "utf8"
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      "Buffer.write(string, encoding, offset[, length]) is no longer supported"
    )
  }

  const remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

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
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding)
        encoding = ("" + encoding).toLowerCase()
        loweredCase = true
    }
  }
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

function numberIsNaN(obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

function asciiToBytes(str) {
  const byteArray = []
  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xff)
  }
  return byteArray
}

function blitBuffer(src, dst, offset, length) {
  let i
  for (i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break
    dst[i + offset] = src[i]
  }
  return i
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
