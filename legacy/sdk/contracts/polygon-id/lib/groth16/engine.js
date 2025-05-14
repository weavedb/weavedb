const WasmField1 = require("./wasm_field1.js")
const WasmField2 = require("./wasm_field2.js")
const WasmField3 = require("./wasm_field3.js")
const { WasmCurve } = require("./wasm_curve.js")
const buildThreadManager = require("./threadman.js")
const Scalar = require("./scalar.js")
const buildBatchApplyKey = require("./engine_applykey.js")
const buildPairing = require("./engine_pairing.js")
const buildMultiExp = require("./engine_multiexp.js")
const buildFFT = require("./engine_fft.js")

async function buildEngine(params) {
  const tm = await buildThreadManager(params.wasm, params.singleThread)

  const curve = {}

  curve.q = Scalar.e(params.wasm.q.toString())
  curve.r = Scalar.e(params.wasm.r.toString())
  curve.name = params.name
  curve.tm = tm
  curve.prePSize = params.wasm.prePSize
  curve.preQSize = params.wasm.preQSize
  curve.Fr = new WasmField1(tm, "frm", params.n8r, params.r)
  curve.F1 = new WasmField1(tm, "f1m", params.n8q, params.q)
  curve.F2 = new WasmField2(tm, "f2m", curve.F1)
  curve.G1 = new WasmCurve(
    tm,
    "g1m",
    curve.F1,
    params.wasm.pG1gen,
    params.wasm.pG1b,
    params.cofactorG1
  )
  curve.G2 = new WasmCurve(
    tm,
    "g2m",
    curve.F2,
    params.wasm.pG2gen,
    params.wasm.pG2b,
    params.cofactorG2
  )
  curve.F6 = new WasmField3(tm, "f6m", curve.F2)
  curve.F12 = new WasmField2(tm, "ftm", curve.F6)

  curve.Gt = curve.F12

  buildBatchApplyKey(curve, "G1")
  buildBatchApplyKey(curve, "G2")
  buildBatchApplyKey(curve, "Fr")

  buildMultiExp(curve, "G1")
  buildMultiExp(curve, "G2")

  buildFFT(curve, "G1")
  buildFFT(curve, "G2")
  buildFFT(curve, "Fr")

  buildPairing(curve)

  curve.array2buffer = function (arr, sG) {
    const buff = new Uint8Array(sG * arr.length)

    for (let i = 0; i < arr.length; i++) {
      buff.set(arr[i], i * sG)
    }

    return buff
  }

  curve.buffer2array = function (buff, sG) {
    const n = buff.byteLength / sG
    const arr = new Array(n)
    for (let i = 0; i < n; i++) {
      arr[i] = buff.slice(i * sG, i * sG + sG)
    }
    return arr
  }

  return curve
}

module.exports = buildEngine
