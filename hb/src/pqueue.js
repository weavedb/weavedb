const pqueue = wdb => {
  let qs = []
  let on = false
  const exec = async () => {
    if (!on) {
      on = true
      while (qs.length > 0) {
        const { resolve, args } = qs.shift()
        try {
          await wdb.pwrite(...args)
          resolve({ success: true, err: null })
        } catch (e) {
          resolve({ success: false, err: e?.toString?.() ?? true })
        }
      }
      on = false
    }
  }
  const db = {
    search: async (...args) => await wdb.search(...args),
    pwrite: async (...args) =>
      new Promise(resolve => {
        qs.push({ resolve, args })
        exec()
      }),
  }
  return db
}
export default pqueue
