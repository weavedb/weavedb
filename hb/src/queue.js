import wdb from "./db.js"

const queue = wdb => {
  let qs = []
  let on = false
  const exec = async () => {
    if (!on) {
      on = true
      while (qs.length > 0) {
        const { resolve, args } = qs.shift()
        try {
          await wdb.set(...args)
          resolve({ success: true, err: null })
        } catch (e) {
          resolve({ success: false, err: e?.toString?.() ?? true })
        }
      }
      on = false
    }
  }
  const db = {
    get: (...args) => wdb.get(...args),
    set: (...args) => {
      return new Promise(resolve => {
        qs.push({ resolve, args })
        exec()
      })
    },
  }
  return db
}
export default queue
