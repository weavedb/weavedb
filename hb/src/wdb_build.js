import { pof, of, fn } from "./monade.js"

const store = _kv => {
  const get = (dir, doc) => _kv.get(`${dir}/${doc}`)
  const put = (dir, doc, data) => _kv.put(`${dir}/${doc}`, data)
  const del = (dir, doc) => _kv.del(`${dir}/${doc}`)
  const dir = id => get("_", id)
  const commit = opt => _kv.commit(opt)
  const reset = () => _kv.reset()
  return { get, put, del, dir, commit, reset }
}

const init = ({ kv, msg, opt }) => {
  return {
    state: {},
    msg,
    env: { ...opt, kv, ...kv.get("_config", "info") },
  }
}

const build = ({
  async = false,
  write,
  read,
  __write__ = {},
  __read__ = {},
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
