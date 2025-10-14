const queue = wdb => {
  let qs = []
  let qs_read = []
  let on = false
  let on_read = false
  const exec = async () => {
    if (!on) {
      on = true
      while (qs.length > 0) {
        const { resolve, args, async } = qs.shift()
        try {
          let func = async ? wdb.pwrite : wdb.write
          const result = await func(...args).val()
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
  const exec_read = async () => {
    if (!on_read) {
      on_read = true
      while (qs_read.length > 0) {
        const { resolve, args, async } = qs_read.shift()
        try {
          let func = async ? wdb.pread : wdb.read
          const result = await func(...args).val()
          resolve({ success: true, err: null, result })
        } catch (e) {
          console.log(e)
          resolve({
            success: false,
            err: e?.toString?.() ?? true,
            result: null,
          })
        }
      }
      on_read = false
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
    pwrite: (...args) =>
      new Promise(resolve => {
        console.log("it will execute in async")
        qs.push({ resolve, args, async: true })
        exec()
      }),
    pread: (...args) =>
      new Promise(resolve => {
        qs_read.push({ resolve, args, async: true })
        exec_read()
      }),
  }
  return db
}
export default queue
