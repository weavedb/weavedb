const { expect } = require("chai")
const BPT = require("../sdk/contracts/weavedb-bpt/lib/BPT")
const {
  range,
  sortBy,
  isNil,
  includes,
  pluck,
  compose,
  sum,
  map,
  length,
  reject,
  last,
  flatten,
} = require("ramda")

const rand = n => Math.floor(Math.random() * n)
const randO = obj => obj[Math.floor(Math.random() * obj.length)]
class KV {
  constructor() {
    this.store = {}
  }
  async get(key, _prefix = "") {
    return this.store[key]
  }
  async put(key, val, _prefix = "", nosave = false) {
    this.store[key] = val
  }
  async del(key, _prefix = "", nosave = false) {
    delete this.store[key]
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const build = store => {
  let _s = typeof store === "string" ? JSON.parse(store) : store
  let arrs = []
  let nodemap = {}
  const add = (node, depth = 0) => {
    if (isNil(node)) return
    arrs[depth] ??= []
    node.arr = []
    let i = 0
    for (const v of node.vals) {
      if (!isNil(node.children?.[i])) node.arr.push({ child: node.children[i] })
      node.arr.push({ key: v, val: node.leaf ? _s[`data/${v}`].val : v })
      i++
    }
    if (!isNil(node.children?.[i])) node.arr.push({ child: node.children[i] })
    arrs[depth].push(node)
    nodemap[node.id] = node
    for (const v of node.children || []) add(_s[v], depth + 1)
  }
  if (!isNil(_s?.["root"])) add(_s[_s["root"]])
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
  if (
    (isDel && includes(id, vals)) ||
    (!isDel && !isNil(id) && !includes(id, vals))
  ) {
    err = true
    where = { type: isDel ? "not deleted" : "not inserted", id, arr: vals }
  }
  return [err, where, arrs, len, vals]
}

const testInserts = async ({ tree, order, vals, prev = null, count = 0 }) => {
  for (const v of vals) {
    await tree.insert(v[0], v[1])
    expect(isErr(tree.kv.store, order, v[0], false, count)[0]).to.eql(false)
    count++
    prev = v[0]
  }
}

const testRanges = async ({ tree, vals }) => {
  for (const v of vals) {
    expect(pluck("val", await tree.range(v[0]))).to.eql(v[1])
  }
}

const fuzztest = async (items, type, sorter) => {
  for (let v of range(0, 100)) {
    const order = Math.floor(Math.random() * 100) + 3
    const kv = new KV()
    const tree = new BPT(order, type, kv)

    const count = Math.floor(Math.random() * (items.length - 10)) + 10
    shuffle(items)
    sorter ??= sortBy(v => v)
    const sorted = sorter(items.slice(0, count))
    let vals = map(v => [`key-${v}`, items[v]])(range(0, count))
    await testInserts({ vals, order, tree })
    const tests = map(() => {
      const startAfter = rand(count - 1)
      switch (rand(4)) {
        case 0:
          const startAt = rand(count)
          const limit = rand(count - startAt) + 1
          return [
            { limit, startAt: sorted[startAt] },
            sorted.slice(startAt, startAt + limit),
          ]
        case 1:
          const limit2 = rand(count - startAfter) + 1
          return [
            { limit: limit2, startAfter: sorted[startAfter] },
            sorted.slice(startAfter + 1, startAfter + 1 + limit2),
          ]
        case 2:
          const endAt = rand(count - startAfter - 1) + 1 + startAfter
          return [
            { startAfter: sorted[startAfter], endAt: sorted[endAt] },
            sorted.slice(startAfter + 1, endAt + 1),
          ]
        case 3:
          const endBefore = rand(count - startAfter) + 1 + startAfter
          return [
            { startAfter: sorted[startAfter], endBefore: sorted[endBefore] },
            sorted.slice(startAfter + 1, endBefore),
          ]
      }
    })(range(0, 100))
    await testRanges({ tree, vals: tests })
  }
}

module.exports = {
  isErr,
  fuzztest,
  testInserts,
  testRanges,
  rand,
  randO,
  shuffle,
}
