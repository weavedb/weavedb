const isValidName = str =>
  /^[^\/]+$/.test(str) &&
  !/^__.*__+$/.test(str) &&
  !/^\.{1,2}$/.test(str) &&
  Buffer.byteLength(str, "utf8") <= 1500

const clone = state => JSON.parse(JSON.stringify(state))

function bigIntFromBytes(byteArr) {
  let hexString = ""
  for (const byte of byteArr) {
    hexString += byte.toString(16).padStart(2, "0")
  }
  return BigInt("0x" + hexString)
}

module.exports = { isValidName, clone, bigIntFromBytes }
