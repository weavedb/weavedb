const { Constants } = require("./constants")
const { BytesHelper } = require("./elemBytes")
const base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
const base58FromBytes = input => {
  const d = [] //the array for storing the stream of base58 digits
  let s = "" //the result string variable that will be returned
  let j = 0 //the iterator variable for the base58 digit array (d)
  let c = 0 //the carry amount variable that is used to overflow from the current base58 digit to the next base58 digit
  let n //a temporary placeholder variable for the current base58 digit
  for (let i = 0; i < input.length; i++) {
    //loop through each byte in the input stream
    j = 0 //reset the base58 digit iterator
    c = input[i] //set the initial carry amount equal to the current byte amount
    s += c || s.length ^ i ? "" : "1" //prepend the result string with a "1" (0 in base58) if the byte stream is zero and non-zero bytes haven't been seen yet (to ensure correct decode length)
    while (j in d || c) {
      //start looping through the digits until there are no more digits and no carry amount
      n = d[j] //set the placeholder for the current base58 digit
      n = n ? n * 256 + c : c //shift the current base58 one byte and add the carry amount (or just add the carry amount if this is a new digit)
      c = (n / 58) | 0 //find the new carry amount (floored integer of current digit divided by 58)
      d[j] = n % 58 //reset the current base58 digit to the remainder (the carry amount will pass on the overflow)
      j++ //iterate to the next base58 digit
    }
  }
  while (j--)
    //since the base58 digits are backwards, loop through them in reverse order
    s += base58[d[j]] //lookup the character associated with each base58 digit
  return s //return the final base58 string
}
class Id {
  constructor(typ, genesis) {
    this._checksum = BytesHelper.calculateChecksum(typ, genesis)
    this._bytes = Uint8Array.from([...typ, ...genesis, ...this._checksum])
  }
  static getFromBytes(bytes) {
    const { typ, genesis } = BytesHelper.decomposeBytes(bytes)
    return new Id(typ, genesis)
  }
  get bytes() {
    return this._bytes
  }

  set bytes(b) {
    this._bytes = b
  }
  string() {
    return base58FromBytes(this._bytes)
  }
  static fromBytes(b) {
    const bytes = b ?? Uint8Array.from([])
    if (bytes.length !== Constants.ID.ID_LENGTH) {
      throw new Error("fromBytes error: byte array incorrect length")
    }

    if (bytes.every(i => i === 0)) {
      throw new Error("fromBytes error: byte array empty")
    }

    const id = Id.getFromBytes(bytes)

    if (!BytesHelper.checkChecksum(bytes)) {
      throw new Error("fromBytes error: checksum error")
    }

    return id
  }
  static fromBigInt(bigInt) {
    const b = BytesHelper.intToNBytes(bigInt, Constants.ID.ID_LENGTH)
    return Id.fromBytes(b)
  }
}

module.exports = Id
