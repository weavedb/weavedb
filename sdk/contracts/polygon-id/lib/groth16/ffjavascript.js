const buildBn128 = require("./bn128.js")

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o)
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o)
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts)
  } else if (typeof o == "object") {
    if (o === null) return null
    const res = {}
    const keys = Object.keys(o)
    keys.forEach(k => {
      res[k] = unstringifyBigInts(o[k])
    })
    return res
  } else {
    return o
  }
}

async function getCurveFromName(name, singleThread, plugins) {
  let curve
  const normName = normalizeName(name)
  if (["BN128", "BN254", "ALTBN128"].indexOf(normName) >= 0) {
    curve = await buildBn128(singleThread, plugins)
  } else if (["BLS12381"].indexOf(normName) >= 0) {
    curve = await buildBls12381(singleThread, plugins)
  } else {
    throw new Error(`Curve not supported: ${name}`)
  }
  return curve

  function normalizeName(n) {
    return n
      .toUpperCase()
      .match(/[A-Za-z0-9]+/g)
      .join("")
  }
}
module.exports = { unstringifyBigInts, getCurveFromName }
