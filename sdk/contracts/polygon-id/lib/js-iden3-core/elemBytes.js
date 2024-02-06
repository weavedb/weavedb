const { Constants } = require("./constants")
function toLittleEndian(bigNumber, len = 31) {
  const n256 = BigInt(256)
  const result = new Uint8Array(len)
  let i = 0
  while (bigNumber > BigInt(0)) {
    result[i] = Number(bigNumber % n256)
    bigNumber = bigNumber / n256
    i += 1
  }
  return result
}

class BytesHelper {
  static intToBytes(int) {
    return BytesHelper.intToNBytes(int, Constants.BYTES_LENGTH)
  }
  static intToNBytes(int, n) {
    return Uint8Array.from(toLittleEndian(int, n))
  }
  static calculateChecksum(typ, genesis) {
    const toChecksum = [...typ, ...genesis]
    const s = toChecksum.reduce((acc, cur) => acc + cur, 0)
    const checksum = [s >> 8, s & 0xff]
    return Uint8Array.from(checksum.reverse())
  }
  static decomposeBytes(b) {
    const offset = 2
    const len = b.length - offset
    return {
      typ: b.slice(0, offset),
      genesis: b.slice(offset, len),
      checksum: b.slice(-offset),
    }
  }
  static checkChecksum(bytes) {
    const { typ, genesis, checksum } = BytesHelper.decomposeBytes(bytes)
    if (
      !checksum.length ||
      JSON.stringify(Uint8Array.from([0, 0])) === JSON.stringify(checksum)
    ) {
      return false
    }

    const c = BytesHelper.calculateChecksum(typ, genesis)
    return JSON.stringify(c) === JSON.stringify(checksum)
  }
}

module.exports = { BytesHelper }
