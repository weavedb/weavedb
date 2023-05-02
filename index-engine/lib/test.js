const BPT = require("./BPT")
const { gen, isErr } = require("./utils")
const {
  includes,
  flatten,
  map,
  sum,
  length,
  pluck,
  compose,
  last,
  isNil,
  keys,
  range,
} = require("ramda")
const go = async () => {
  while (true) {
    for (let i of range(3, 101)) {
      console.log(`testing...order:${i}`)
      let count = 0
      const bpt = new BPT(i)
      let his = []
      let ids = {}
      const start = Date.now()
      let prev_count = 0
      for (let i2 of range(0, 500)) {
        const _keys = keys(ids)
        let isDel = false
        let id
        if (
          _keys.length > 0 &&
          Math.random() < (_keys.length > bpt.order * 10 ? 0.8 : 0.2)
        ) {
          id = _keys[Math.floor(Math.random() * _keys.length)]
          await bpt.delete(id)
          isDel = true
          delete ids[id]
          his.push(-id.split(":")[1])
        } else {
          id = `id:${(++count).toString()}`
          let num = gen()
          his.push(num)
          ids[id] = true
          await bpt.insert(id, num)
        }
        let [err, where, arrs, len, vals] = isErr(
          bpt.kv.store,
          i,
          id,
          isDel,
          prev_count
        )
        prev_count = len
        if (err) {
          console.log(`[${i}] => `, where)
          console.log(his.join(","))
          process.exit()
        }
      }
      const end = Date.now()
      console.log(`took ${end - start} ms`)
    }
  }
}

go()
