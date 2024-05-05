const Buffer = require("../buffer").Buffer
const { publicKeyConvert } = require("../secp256k1")(
  require("../secp256k1/elliptic")
)
const {
  pubToAddress,
  toChecksumAddress,
  toBuffer,
} = require("../ethereumjs-util")
const { hexToUnit8Array, uint8ArrayToHex, addLeading0x } = require("./util")

function decompress(startsWith02Or03) {
  const testBuffer = Buffer.from(startsWith02Or03, "hex")
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

module.exports = { toAddress }
