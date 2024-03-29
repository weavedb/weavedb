const ChaCha = require("./chacha.js")
//const crypto = require("crypto")

function getRandomBytes(n) {
  let array = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    array[i] = (Math.random() * 4294967296) >>> 0
  }
  /*
  if (process.browser) {
    // Browser
    if (typeof globalThis.crypto !== "undefined") {
      // Supported
      globalThis.crypto.getRandomValues(array)
    } else {
      // fallback
      for (let i = 0; i < n; i++) {
        array[i] = (Math.random() * 4294967296) >>> 0
      }
    }
  } else {
    // NodeJS
    crypto.randomFillSync(array)
  }*/
  return array
}

function getRandomSeed() {
  const arr = getRandomBytes(32)
  const arrV = new Uint32Array(arr.buffer)
  const seed = []
  for (let i = 0; i < 8; i++) {
    seed.push(arrV[i])
  }
  return seed
}

let threadRng = null

function getThreadRng() {
  if (threadRng) return threadRng
  threadRng = new ChaCha(getRandomSeed())
  return threadRng
}
module.exports = {
  getRandomBytes,
  getRandomSeed,
  getThreadRng,
}
