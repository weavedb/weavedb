export default (_methods, fn, sync, methods = {}) => {
  return wkv => {
    const kv = wkv(_methods.io, fn, sync, methods)
    for (let k in kv) _methods[k] = kv[k]
    return _methods
  }
}
