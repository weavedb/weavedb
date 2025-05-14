function bytes(b, ...lengths) {
  if (!(b instanceof Uint8Array)) throw new Error("Expected Uint8Array")
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(
      `Expected Uint8Array of length ${lengths}, not of length=${b.length}`
    )
}
function exists(instance, checkFinished = true) {
  if (instance.destroyed) throw new Error("Hash instance has been destroyed")
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called")
}
function output(out, instance) {
  bytes(out)
  const min = instance.outputLen
  if (out.length < min) {
    throw new Error(
      `digestInto() expects output buffer of length at least ${min}`
    )
  }
}

function number(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error(`Wrong positive integer: ${n}`)
}
function hash(hash) {
  if (typeof hash !== "function" || typeof hash.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor")
  number(hash.outputLen)
  number(hash.blockLen)
}
module.exports = { exists, output, hash, bytes }
