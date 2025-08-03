const queue = wdb => {
  let qs = []
  let on = false
  const exec = async () => {
    if (!on) {
      on = true
      while (qs.length > 0) {
        const { resolve, args } = qs.shift()
        try {
          const result = await wdb.write(...args)
          resolve({ success: true, err: null, result })
        } catch (e) {
          resolve({
            success: false,
            err: e?.toString?.() ?? true,
            result: null,
          })
        }
      }
      on = false
    }
  }
  const read = (fn, args) => {
    try {
      return fn(...args)
    } catch (e) {
      throw e
    }
  }
  const db = {
    sql: (...args) => read(wdb.sql, args),
    get: (...args) => read(wdb.get, args),
    cget: (...args) => read(wdb.cget, args),
    read: (...args) => read(wdb.read, args),
    write: (...args) =>
      new Promise(resolve => {
        qs.push({ resolve, args })
        exec()
      }),
  }
  return db
}
export default queue
