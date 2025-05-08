import { clone } from "ramda"
const kv = (io, fn) => {
  let s = {}
  let l = {}
  let i = 1
  let ci = 0
  let c = []
  let on = false
  const get = k => l[k] ?? s[k] ?? io.get(k) ?? null
  const put = (k, v) => (l[k] = v)
  const reset = () => (l = {})
  const commit = async () => {
    if (c.length > 0) {
      on = true
      const { i, cl } = c.shift()
      let count = 0
      for (const k in cl ?? {}) {
        if (cl[k] === null) await io.remove(k)
        else await io.put(k, cl[k])
        count++
      }
      fn?.({ block: i, data: cl, count, len: c.length })
      await commit()
    }
    on = false
  }
  return {
    reset,
    commit: async () => {
      const cl = clone(l)
      c.push({ i, cl })
      for (const k in cl ?? {}) s[k] = cl[k]
      reset()
      if (!on) commit().then(() => {})
      return { i: i++, data: cl }
    },
    put,
    del: k => put(k, null),
    get,
    dump: () => ({ l, s }),
  }
}

export default kv
