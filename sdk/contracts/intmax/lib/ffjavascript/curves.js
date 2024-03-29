import * as Scalar from "./scalar.js"

import { default as buildBn128 } from "./bn128.js"

export async function getCurveFromName(
  name,
  singleThread,
  plugins,
  poseidonConstants
) {
  let curve
  const normName = normalizeName(name)
  if (["BN128", "BN254", "ALTBN128"].indexOf(normName) >= 0) {
    curve = await buildBn128(singleThread, plugins, poseidonConstants)
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
