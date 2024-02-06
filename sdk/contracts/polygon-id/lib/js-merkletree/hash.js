const HASH_BYTES_LENGTH = 32
const bytes2BinaryString = bytes => {
  return (
    "0b" + bytes.reduce((acc, i) => acc + i.toString(2).padStart(8, "0"), "")
  )
}
const swapEndianness = bytes => {
  return bytes.slice().reverse()
}
const bigIntToUINT8Array = bigNum => {
  const n256 = BigInt(256)
  const bytes = new Uint8Array(HASH_BYTES_LENGTH)
  let i = 0
  while (bigNum > BigInt(0)) {
    bytes[HASH_BYTES_LENGTH - 1 - i] = Number(bigNum % n256)
    bigNum = bigNum / n256
    i += 1
  }
  return bytes
}
const qString =
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
const FIELD_SIZE = BigInt(qString)
const checkBigIntInField = bigNum => {
  return bigNum < FIELD_SIZE
}
class Hash {
  constructor(_bytes) {
    if (_bytes?.length) {
      if (_bytes.length !== HASH_BYTES_LENGTH) {
        throw new Error(
          `Expected ${HASH_BYTES_LENGTH} bytes, found ${_bytes.length} bytes`
        )
      }
      this.bytes = _bytes
    } else {
      this.bytes = new Uint8Array(HASH_BYTES_LENGTH)
    }
  }
  bigInt() {
    const bytes = swapEndianness(this.value)
    return BigInt(bytes2BinaryString(bytes))
  }
  // returns a new copy, in little endian
  get value() {
    return this.bytes
  }

  // bytes should be in big-endian
  set value(bytes) {
    if (bytes.length !== HASH_BYTES_LENGTH) {
      throw `Expected 32 bytes, found ${bytes.length} bytes`
    }
    this.bytes = swapEndianness(bytes)
  }

  string() {
    return this.bigInt().toString(10)
  }

  static fromBigInt(i) {
    if (!checkBigIntInField(i)) {
      throw new Error(
        "NewBigIntFromHashBytes: Value not inside the Finite Field"
      )
    }

    const bytes = bigIntToUINT8Array(i)

    return new Hash(swapEndianness(bytes))
  }
  static fromString(s) {
    try {
      return Hash.fromBigInt(BigInt(s))
    } catch (e) {
      const deserializedHash = JSON.parse(s)
      const bytes = Uint8Array.from(Object.values(deserializedHash.bytes))
      return new Hash(bytes)
    }
  }
}
const newHashFromString = decimalString => {
  return Hash.fromString(decimalString)
}

module.exports = { newHashFromString }
