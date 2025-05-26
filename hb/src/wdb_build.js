import { pof, of, fn } from "./monade.js"

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
  env: { ...opt, kv, ...kv.get("_config", "info") },
})

const build = ({
  async = false,
  write,
  read,
  __write__ = {},
  __read__ = {},
  init = _init,
  store = _store,
}) => {
  return (kv, opt = {}) => {
    let _to = {}
    if (read) {
      let _read = fn()
      for (const dev of read) {
        _read = dev.__monad__ ? _read.chain(dev) : _read.map(dev)
      }
      _to.read = (msg, _opt) => kv => {
        try {
          return of({ kv, msg, opt: { ...opt, ..._opt } })
            .map(init)
            .chain(_read)
            .val()
        } catch (e) {
          throw e
        }
      }
    }
    for (const k in __read__) {
      const read = __read__[k]
      let _read = fn()
      for (const dev of read) {
        _read = dev.__monad__ ? _read.chain(dev) : _read.map(dev)
      }
      _to[k] =
        (...msg) =>
        kv => {
          try {
            return of({ kv, msg, opt }).map(init).chain(_read).val()
          } catch (e) {
            throw e
          }
        }
    }

    let _map = {}
    if (write) {
      let _write = fn()
      for (const dev of write) {
        _write = dev.__monad__ ? _write.chain(dev) : _write.map(dev)
      }
      _map.write = (msg, _opt) => kv => {
        try {
          of({ kv, msg, opt: { ...opt, ..._opt } })
            .map(init)
            .chain(_write)
          return kv
        } catch (e) {
          console.log(e)
          kv.reset()
          throw e
        }
      }
      if (async) {
        _map.pwrite = (msg, _opt) => kv =>
          new Promise(async (cb, rej) => {
            try {
              of({
                kv,
                msg,
                opt: {
                  ...opt,
                  ..._opt,
                  cb: () => cb(kv),
                },
              })
                .map(init)
                .chain(_write)
            } catch (e) {
              console.log(e)
              kv.reset()
              rej(e)
            }
          })
      }
    }
    for (const k in __write__) {
      const write = __write__[k]
      let _write = fn()
      for (const dev of write) {
        _write = dev.__monad__ ? _write.chain(dev) : _write.map(dev)
      }
      _map.write =
        (...msg) =>
        kv => {
          try {
            of({ kv, msg, opt }).map(init).chain(_write)
            return kv
          } catch (e) {
            console.log(e)
            kv.reset()
            throw e
          }
        }
    }
    const _of = async ? pof : of
    return _of(store(kv), { to: _to, map: _map })
  }
}

export default build
