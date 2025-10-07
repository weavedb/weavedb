export default (io, ...args) => {
  let _methods = { io }
  _methods.init = kv => kv(_methods, ...args)

  return _methods
}
