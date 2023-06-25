"use strict"

var curves = exports

var curve = require("./curve")
var utils = require("./utils")

var assert = utils.assert

function PresetCurve(options) {
  if (options.type === "short") this.curve = new curve.short(options)
  else if (options.type === "edwards") this.curve = new curve.edwards(options)
  else this.curve = new curve.mont(options)
  this.g = this.curve.g
  this.n = this.curve.n
  this.hash = options.hash

  assert(this.g.validate(), "Invalid curve")
  assert(this.g.mul(this.n).isInfinity(), "Invalid curve, G*N != O")
}
curves.PresetCurve = PresetCurve

function defineCurve(name, options) {
  Object.defineProperty(curves, name, {
    configurable: true,
    enumerable: true,
    get: function () {
      var curve = new PresetCurve(options)
      Object.defineProperty(curves, name, {
        configurable: true,
        enumerable: true,
        value: curve,
      })
      return curve
    },
  })
}

var pre
try {
  pre = require("./precomputed/secp256k1")
} catch (e) {
  pre = undefined
}

defineCurve("secp256k1", {
  type: "short",
  prime: "k256",
  p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
  a: "0",
  b: "7",
  n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
  h: "1",

  // Precomputed endomorphism
  beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
  lambda: "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
  basis: [
    {
      a: "3086d221a7d46bcde86c90e49284eb15",
      b: "-e4437ed6010e88286f547fa90abfe4c3",
    },
    {
      a: "114ca50f7a8e2f3f657c1108d9d44cfd8",
      b: "3086d221a7d46bcde86c90e49284eb15",
    },
  ],

  gRed: false,
  g: [
    "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
    "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
    pre,
  ],
})
