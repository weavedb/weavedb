const errors = {
  PUBKEY_PARSE: "Public Key could not be parsed",
  PUBKEY_SERIALIZE: "Public Key serialization error",
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function isUint8Array(name, value, length) {
  assert(value instanceof Uint8Array, `Expected ${name} to be an Uint8Array`)
  if (length !== undefined) {
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

module.exports = secp256k1 => {
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
