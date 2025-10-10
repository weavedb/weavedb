import { pof, of, ka, dev, pdev } from "monade"
import wkv from "./weavekv.js"

const _store = _kv => {
  const get = (dir, doc) => _kv.get(`${dir}/${doc}`)
  const put = (dir, doc, data) => _kv.put(`${dir}/${doc}`, data)
  const del = (dir, doc) => _kv.del(`${dir}/${doc}`)
  const commit = (...params) => _kv.commit(...params)
  const reset = (...params) => _kv.reset(...params)
  return { ..._kv, get, put, del, commit, reset }
}

const _init = ({ kv, msg, opt }) => ({
  state: {},
  msg,
  env: { ...opt, kv },
})

const build = ({
  kv: kv_db,
  async = false,
  write,
  read,
  __write__ = {},
  __read__ = {},
  init = _init,
  store = _store,
}) => {
  return (kv_custom, opt = {}) => {
    const kv = kv_custom.init(kv_db)(wkv)
    // Build all methods for the device
    const methods = {}

    // Build write method
    if (write) {
      let _write = ka()
      for (const dev of write) {
        if (dev.__ka__) {
          // If dev is a Kleisli arrow, convert to function and chain
          _write = _write.chain(dev.fn())
        } else if (dev.__monad__) {
          // If dev is a monad (function that returns a monad), chain it
          _write = _write.chain(dev)
        } else {
          // Otherwise, it's a regular function, use map
          _write = _write.map(dev)
        }
      }

      methods.write = (currentKv, msg, _opt) => {
        try {
          const { state, msg: msg2 } = of({
            kv: currentKv,
            msg,
            opt: { ...opt, ..._opt },
          })
            .map(init)
            .chain(_write.fn())
            .val()
          return state
        } catch (e) {
          console.log(e)
          currentKv.reset()
          throw e
        }
      }

      // Add pwrite for async version
      if (async) {
        methods.pwrite = (currentKv, msg, _opt) => {
          return new Promise((cb, rej) => {
            try {
              of({
                kv: currentKv,
                msg,
                opt: { ...opt, ..._opt, cb },
              })
                .map(init)
                .chain(_write.fn())
            } catch (e) {
              //console.log(e)
              currentKv.reset()
              rej(e)
            }
          })
        }
      }
    }

    // Build read method
    if (read) {
      let _read = ka()
      for (const dev of read) {
        if (dev.__ka__) {
          _read = _read.chain(dev.fn())
        } else if (dev.__monad__) {
          _read = _read.chain(dev)
        } else {
          _read = _read.map(dev)
        }
      }

      methods.read = (currentKv, msg, _opt) => {
        try {
          return of({ kv: currentKv, msg, opt: { ...opt, ..._opt } })
            .map(init)
            .chain(_read.fn())
            .val()
        } catch (e) {
          throw e
        }
      }
    }

    // Build custom read methods
    for (const k in __read__) {
      const read = __read__[k]
      let _read = ka()
      for (const dev of read) {
        if (dev.__ka__) {
          _read = _read.chain(dev.fn())
        } else if (dev.__monad__) {
          _read = _read.chain(dev)
        } else {
          _read = _read.map(dev)
        }
      }

      methods[k] = async (currentKv, ...msg) => {
        try {
          // For async operations, we might need to await
          const result = of({ kv: currentKv, msg, opt })
            .map(init)
            .chain(_read.fn())
            .val()

          // If the result is a promise (for async operations), await it
          if (result && typeof result.then === "function") {
            return await result
          }
          return result
        } catch (e) {
          throw e
        }
      }
    }

    // Build custom write methods
    for (const k in __write__) {
      const write = __write__[k]
      let _write = ka()
      for (const dev of write) {
        if (dev.__ka__) {
          _write = _write.chain(dev.fn())
        } else if (dev.__monad__) {
          _write = _write.chain(dev)
        } else {
          _write = _write.map(dev)
        }
      }

      methods[k] = (currentKv, ...msg) => {
        try {
          of({ kv: currentKv, msg, opt }).map(init).chain(_write.fn())
          return currentKv
        } catch (e) {
          //console.log(e)
          currentKv.reset()
          throw e
        }
      }
    }

    // Use dev or pdev to create the device
    const deviceCreator = async ? pdev(methods) : dev(methods)
    return deviceCreator(store(kv))
  }
}

export default build
