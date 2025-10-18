import { includes } from "ramda"
const queue = wdb => {
  let qs = []
  let qs_read = []
  let on = false
  let on_read = false
  const exec = async () => {
    if (!on) {
      on = true
      while (qs.length > 0) {
        const { res, args, k } = qs.shift()
        try {
          res({
            success: true,
            err: null,
            res: (await wdb[k](...args)).res,
          })
        } catch (e) {
          console.log(e)
          res({ success: false, err: e?.toString?.() ?? true, res: null })
        }
      }
      on = false
    }
  }
  let db = {}
  for (const k in wdb) {
    if (
      !includes(k, ["__device__", "map", "tap", "chain", "to", "val", "monad"])
    ) {
      db[k] = (...args) =>
        new Promise(res => void (qs.push({ res, args, k }), exec()))
    }
  }
  return db
}
export default queue
