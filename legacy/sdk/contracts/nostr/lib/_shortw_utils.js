/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const { hmac } = require("./hmac")
const { concatBytes } = require("./utils")
const { weierstrass } = require("./abstract/weierstrass.js")

// connects noble-curves to noble-hashes
function getHash(hash) {
  return {
    hash,
    hmac: (key, ...msgs) => hmac(hash, key, concatBytes(...msgs)),
  }
}
// Same API as @noble/hashes, with ability to create curve with custom hash
function createCurve(curveDef, defHash) {
  const create = hash => {
    return weierstrass({ ...curveDef, ...getHash(hash) })
  }
  return Object.freeze({ ...create(defHash), create })
}

module.exports = { createCurve }
