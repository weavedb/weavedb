const Buffer = require("../buffer").Buffer

function removeLeading0x(str) {
  if (str.startsWith("0x")) return str.substring(2)
  else return str
}

function addLeading0x(str) {
  if (!str.startsWith("0x")) return "0x" + str
  else return str
}

function uint8ArrayToHex(arr) {
  return Buffer.from(arr).toString("hex")
}

function hexToUnit8Array(str) {
  return new Uint8Array(Buffer.from(str, "hex"))
}

module.exports = {
  removeLeading0x,
  addLeading0x,
  uint8ArrayToHex,
  hexToUnit8Array,
}
