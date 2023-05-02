const {
  last,
  flatten,
  length,
  compose,
  reject,
  sum,
  map,
  includes,
  pluck,
  isNil,
  range,
} = require("ramda")
const alpha = "abcdefghijklmnopqrstuvwxyz".toUpperCase()
const getChars = (n = 3) =>
  map(() => alpha[Math.floor(Math.random() * alpha.length)])(range(0, n)).join(
    ""
  )
const getNum = (n = 100) => Math.floor(Math.random() * n)
const getBool = () => (Math.random() > 0.5 ? true : false)

const gen = type => {
  if (type === "boolean") {
    return getBool()
  } else if (type === "string") {
    return getChars(3)
  } else if (type === "object") {
    return { name: getChars(), age: getNum(), married: getBool() }
  } else {
    return getNum()
  }
}

const build = store => {
  let _s = typeof store === "string" ? JSON.parse(store) : store
  let arrs = []
  let nodemap = {}
  const add = (node, depth = 0) => {
    arrs[depth] ??= []
    node.arr = []
    let i = 0
    for (const v of node.vals) {
      if (!isNil(node.children?.[i])) node.arr.push({ child: node.children[i] })
      node.arr.push({ key: v, val: node.leaf ? _s[`data/${v}`] : v })
      i++
    }
    if (!isNil(node.children?.[i])) node.arr.push({ child: node.children[i] })
    arrs[depth].push(node)
    nodemap[node.id] = node
    for (const v of node.children || []) add(_s[v], depth + 1)
  }
  if (!isNil(_s["root"])) add(_s[_s["root"]])
  return { arrs, nodemap }
}

const isErr = (store, order = 4, id, isDel, prev_count) => {
  let err = false
  let where = null
  let { nodemap, arrs } = build(
    typeof store === "object" ? JSON.stringify(store) : store
  )
  let i = 0
  for (const v of arrs) {
    let num = null
    let i2 = 0
    for (const v2 of v) {
      // check connections
      // top
      if (i !== 0) {
        if (isNil(v2.parent) || !includes(v2.id, nodemap[v2.parent].children)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-top" }
          break
        }
      } else {
        if (!isNil(v2.parent)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-top" }
          break
        }
      }
      // left
      if (i2 > 0) {
        if (
          isNil(v2.prev) ||
          isNil(nodemap[v2.prev]) ||
          nodemap[v2.prev].next !== v2.id
        ) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-left" }
          break
        }
      } else {
        if (!isNil(v2.prev)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "link-left" }
          break
        }
      }
      // right
      if (i2 < v.length - 1) {
        if (
          isNil(v2.next) ||
          isNil(nodemap[v2.next]) ||
          nodemap[v2.next].prev !== v2.id
        ) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "right-left" }
          break
        }
      } else {
        if (!isNil(v2.next)) {
          err = true
          where = { arr: pluck("val", v2.arr), id: v2.id, type: "right-left" }
          break
        }
      }
      for (const v3 of v2.arr) {
        if (isNil(v3.child)) {
          if (num === null || num <= v3.val) {
            num = v3.val
          } else {
            err = true
            where = { arr: pluck("val", v2.arr), id: v2.id, type: "sort" }
            break
          }
        }
      }
      i2++
      if (err) break
    }
    i++
  }
  const min_vals = Math.ceil(order / 2) - 1
  if (!err) {
    let mins = {}
    if (arrs.length > 1) {
      for (let i = arrs.length - 1; i >= 0; i--) {
        if (i !== arrs.length - 1) {
          if (
            compose(sum, map(length), pluck("children"))(arrs[i]) !==
            arrs[i + 1].length
          ) {
            err = true
            where = {
              arr: [],
              id: `arr:${i}`,
              type: `diff children`,
            }
            break
          }
        }
        for (let node of arrs[i]) {
          if (i !== 0 && node.vals.length < min_vals) {
            err = true
            where = {
              arr: node.vals,
              id: node.id,
              type: `min keys`,
            }
            break
          }
          mins[node.id] = compose(reject(isNil), pluck("val"))(node.arr)[0]
          if (!node.leaf) {
            mins[node.id] = mins[node.children[0]]
            let i2 = 0
            for (let v of node.vals) {
              if (v > mins[node.children[i2 + 1]]) {
                err = true
                where = {
                  arr: node.vals,
                  id: node.id,
                  type: `min index (${i2})`,
                }
                break
              }
              i2++
            }
            if (err) break
          }
        }
        if (err) break
      }
    }
  }
  const len =
    isNil(arrs) || arrs.length === 0
      ? 0
      : compose(sum, map(length), pluck("vals"), last)(arrs)
  const vals =
    isNil(arrs) || arrs.length === 0
      ? []
      : compose(flatten, pluck("vals"), last)(arrs)
  if ((isDel && prev_count - 1 !== len) || (!isDel && prev_count + 1 !== len)) {
    err = true
    where = { type: "not updated", id, arr: [prev_count, len] }
  }
  if ((isDel && includes(id, vals)) || (!isDel && !includes(id, vals))) {
    err = true
    where = { type: isDel ? "not deleted" : "not inserted", id, arr: vals }
  }
  return [err, where, arrs, len, vals]
}

module.exports = { build, isErr, gen }
