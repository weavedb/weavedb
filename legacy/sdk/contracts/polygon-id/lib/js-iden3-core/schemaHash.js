const { Constants } = require("./constants")
const { BytesHelper } = require("./elemBytes")

class Hex {
  static HEX_TABLE = "0123456789abcdef"
  static textEncoder = new TextEncoder()

  static encodeLength(n) {
    return n * 2
  }

  static encode(src) {
    const dst = new Uint8Array(Hex.encodeLength(src.length))
    let j = 0
    for (let i = 0; i < src.length; i++) {
      dst[j] = Hex.HEX_TABLE[src[i] >> 4].charCodeAt(0)
      dst[j + 1] = Hex.HEX_TABLE[src[i] & 0x0f].charCodeAt(0)
      j += 2
    }
    return dst
  }

  static decodeString(s) {
    return Hex.decode(s)
  }
  static fromHexChar(c) {
    if ("0".charCodeAt(0) <= c && c <= "9".charCodeAt(0)) {
      return c - "0".charCodeAt(0)
    } else if ("a".charCodeAt(0) <= c && c <= "f".charCodeAt(0)) {
      return c - "a".charCodeAt(0) + 10
    }
    if ("A".charCodeAt(0) <= c && c <= "F".charCodeAt(0)) {
      return c - "A".charCodeAt(0) + 10
    }

    throw new Error(`Invalid byte char ${c}`)
  }

  static decode(src) {
    let i = 0
    let j = 1
    const dst = []
    for (; j < src.length; j += 2) {
      const a = Hex.fromHexChar(src[j - 1].charCodeAt(0))
      const b = Hex.fromHexChar(src[j].charCodeAt(0))
      dst[i] = (a << 4) | b
      i++
    }
    if (src.length % 2 == 1) {
      throw new Error("Invalid hex string")
    }
    return Uint8Array.from(dst)
  }

  static encodeString(b) {
    return new TextDecoder().decode(Hex.encode(b))
  }
}

class SchemaHash {
  constructor(bytes) {
    this._bytes = new Uint8Array(Constants.SCHEMA.HASH_LENGTH)
    if (bytes) {
      this._bytes = bytes
    }
    if (this.bytes.length !== Constants.SCHEMA.HASH_LENGTH) {
      throw new Error(
        `Schema hash must be ${Constants.SCHEMA.HASH_LENGTH} bytes long`
      )
    }
  }
  get bytes() {
    return this._bytes
  }
  static newSchemaHashFromInt(i) {
    const bytes = BytesHelper.intToNBytes(i, Constants.SCHEMA.HASH_LENGTH)
    const start = Constants.SCHEMA.HASH_LENGTH - bytes.length
    return new SchemaHash(
      BytesHelper.intToBytes(i).slice(start, Constants.SCHEMA.HASH_LENGTH)
    )
  }
  marshalText() {
    return Hex.encodeString(this.bytes)
  }
}

module.exports = SchemaHash
