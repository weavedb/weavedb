"use strict"

var utils = require("../utils")
var curves = require("../curves")
var assert = utils.assert

var KeyPair = require("./key")

function EC(options) {
  if (!(this instanceof EC)) return new EC(options)

  // Shortcut `elliptic.ec(curve-name)`
  if (typeof options === "string") {
    assert(
      Object.prototype.hasOwnProperty.call(curves, options),
      "Unknown curve " + options
    )

    options = curves[options]
  }

  // Shortcut for `elliptic.ec(elliptic.curves.curveName)`
  if (options instanceof curves.PresetCurve) options = { curve: options }

  this.curve = options.curve.curve
  this.n = this.curve.n
  this.nh = this.n.ushrn(1)
  this.g = this.curve.g

  // Point on curve
  this.g = options.curve.g
  this.g.precompute(options.curve.n.bitLength() + 1)

  // Hash for function for DRBG
  this.hash = options.hash || options.curve.hash
}
module.exports = EC

EC.prototype.keyPair = function keyPair(options) {
  return new KeyPair(this, options)
}
