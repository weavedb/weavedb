const createView = arr =>
  new DataView(arr.buffer, arr.byteOffset, arr.byteLength)
const u8a = a => a instanceof Uint8Array
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error(`utf8ToBytes expected string, got ${typeof str}`)
  return new Uint8Array(new TextEncoder().encode(str)) // https://bugzil.la/1681809
}
function toBytes(data) {
  if (typeof data === "string") data = utf8ToBytes(data)
  if (!u8a(data)) throw new Error(`expected Uint8Array, got ${typeof data}`)
  return data
}

class Hash {
  clone() {
    return this._cloneInto()
  }
}

const rotr = (word, shift) => (word << (32 - shift)) | (word >>> shift)

function wrapConstructor(hashCons) {
  const hashC = msg => hashCons().update(toBytes(msg)).digest()
  const tmp = hashCons()
  hashC.outputLen = tmp.outputLen
  hashC.blockLen = tmp.blockLen
  hashC.create = () => hashCons()
  return hashC
}

function concatBytes(...arrays) {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0))
  let pad = 0 // walk through each item, ensure they have proper type
  arrays.forEach(a => {
    if (!u8a(a)) throw new Error("Uint8Array expected")
    r.set(a, pad)
    pad += a.length
  })
  return r
}

module.exports = {
  toBytes,
  createView,
  Hash,
  rotr,
  wrapConstructor,
  concatBytes,
}
