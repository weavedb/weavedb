import {
  reverse,
  init,
  last,
  concat,
  clone,
  compose,
  join,
  flatten,
  isNil,
  map,
  tail,
  splitEvery,
  equals,
} from "ramda"
import { getIndexes } from "./indexer.js"
import BPT from "./bpt.js"

const idsorter = ["__id__", "asc"]
const order = 100

const pranges = (_ranges, limit, kv, sortByTail = false, cur = {}) => {
  let curs = []
  let res = []
  for (let v of _ranges) {
    if (
      !isArrayIndex(v.prefix) &&
      isNil(v.prefix) &&
      v.sort.length === 1 &&
      v.sort[0][1] === "desc"
    ) {
      v.sort[0][1] = "asc"
      v.opt ??= {}
      v.opt.reverse = true
    }
    delete v.opt.limit
    let prefix = v.prefix ?? ""
    let suffix = `${compose(
      join("/"),
      flatten,
    )(v.sort.length === 0 && prefix === "" ? [idsorter] : v.sort)}`
    if (prefix !== "" && suffix !== "") suffix = `/${suffix}`
    prefix += suffix
    checkIndex(prefix, v.path, kv)
    const tree = new BPT(order, [...v.sort, idsorter], kv, prefix)
    modOpt(v.opt, cur, tree)
    const _cur = { val: null, tree, cur: tree.range(v.opt, true) }
    curs.push(_cur)
  }
  const comp = curs[0].tree.comp.bind(curs[0].tree)
  let sorter = curs[0].tree.sort_fields
  if (!equals(last(sorter), idsorter)) sorter.push(idsorter)
  if (sortByTail) sorter = tail(sorter)

  while (curs.length > 0) {
    const val = curs[0].cur()
    curs[0].val = val
    const cur = curs.shift()
    if (!isNil(val)) {
      let pushed2 = false
      for (let i = res.length - 1; i >= 0; i--) {
        const _comp = comp(val, res[i], false, sorter)
        if (_comp === 0) {
          pushed2 = true
          break
        } else if (_comp < 0) {
          res.splice(i + 1, 0, val)
          pushed2 = true
          break
        }
      }
      if (!pushed2) res.unshift(val)
      const border = isNil(limit) ? null : res[limit - 1] || null
      if (isNil(border) || comp(border, val) < 0) {
        let i = 0
        let pushed = false
        for (const v of curs) {
          if (!isNil(v.val)) {
            if (comp(val, v.val, false, sorter) >= 0) {
              curs.splice(i, 0, cur)
              pushed = true
              break
            }
          }
          i++
        }
        if (!pushed) curs.push(cur)
      }
    }
  }
  return isNil(limit) ? res : res.slice(0, limit)
}

const ranges = (_ranges, limit, path, kv, cur = {}) => {
  let res = []
  let count = 0
  let __ranges = _ranges
  if (_ranges[0].sort.length === 1 && _ranges[0].sort[0][1] === "desc") {
    if (cur.sortRange) {
      __ranges = reverse(__ranges)
      for (let v of __ranges) {
        let new_range = {}
        if (!isNil(v.startAt)) {
          new_range["endAt"] = v.startAt
          delete v.startAt
        }
        if (!isNil(v.endAt)) {
          new_range["startAt"] = v.endAt
          delete v.endAt
        }
        if (!isNil(v.startAfter)) {
          new_range["endBefore"] = v.startAfter
          delete v.startAfter
        }
        if (!isNil(v.endBefore)) {
          new_range["startAfter"] = v.endBefore
          delete v.endBefore
        }
        for (let k in new_range) {
          v[k] = new_range[k]
        }
      }
    }
  }
  for (let v of __ranges) {
    if (!isNil(limit)) {
      v.opt ??= {}
      v.opt.limit = limit - count
    }
    res = concat(res, range(v.sort, v.opt, path, kv, false, "", cur))
    count += res.length
    if (!isNil(limit) && count >= limit) break
  }
  return res
}

const checkIndex = (prefix, path, kv) => {
  const indexes = getIndexes(path, kv)
  const sort_fields = compose(
    map(v => {
      return [v[0], (v[1] || "asc").split(":")[0]]
    }),
    splitEvery(2),
  )(prefix.split("/"))
  const key = compose(join("/"), flatten)(sort_fields)
  if (
    (sort_fields.length > 1 || sort_fields[0][0].split(".").length > 1) &&
    isNil(indexes[key])
  ) {
    throw Error(`missing index ${JSON.stringify(sort_fields)}`)
  }
}
const modOpt = (opt, cur = {}, tree) => {
  let reversed = {}
  if (opt.reverse) {
    let new_range = {}
    if (cur.reverse.start) {
      if (!isNil(opt.startAt)) {
        new_range.endAt = opt.startAt
        delete opt.startAt
        reversed.start = true
      } else if (!isNil(opt.startAfter)) {
        new_range.endBefore = opt.startAfter
        delete opt.startAfter
        reversed.start = true
      }
    }
    if (cur.reverse.end) {
      if (!isNil(opt.endAt)) {
        new_range.startAt = opt.endAt
        delete opt.endAt
        reversed.end = true
      } else if (!isNil(opt.endBefore)) {
        new_range.startAfter = opt.endBefore
        delete opt.endBefore
        reversed.end = true
      }
    }
    for (let k in new_range) {
      opt[k] = new_range[k]
    }
  }
  if (!isNil(cur.start)) {
    if (!isNil(opt.startAt)) {
      const comp = tree.comp(
        { key: cur.start[1].id, val: cur.start[1].data },
        { val: opt.startAt },
        opt.reverse,
        init(tree.sort_fields),
      )
      if ((reversed.end && comp >= 0) || (reversed.end !== true && comp <= 0)) {
        delete opt.startAt
        opt[cur.start[0]] = cur.start[1].data
      }
    } else if (!isNil(opt.startAfter)) {
      const comp = tree.comp(
        { key: cur.start[1].id, val: cur.start[1].data },
        { val: opt.startAfter },
        opt.reverse,
        init(tree.sort_fields),
      )
      if (cur.start[0] === "startAt") {
        if ((reversed.end && comp > 0) || (reversed.end !== true && comp < 0)) {
          delete opt.startAfter
          opt[cur.start[0]] = cur.start[1].data
        }
      } else {
        if (
          (reversed.end && comp >= 0) ||
          (reversed.end !== true && comp <= 0)
        ) {
          opt.startAfter = cur.start[1].data
        }
      }
    } else {
      opt[cur.start[0]] = cur.start[1].data
    }
  }

  if (!isNil(cur.end)) {
    if (!isNil(opt.endAt)) {
      const comp = tree.comp(
        { key: cur.end[1].id, val: cur.end[1].data },
        { val: opt.endAt },
        opt.reverse,
        init(tree.sort_fields),
      )
      if (
        (reversed.start && comp <= 0) ||
        (reversed.start !== true && comp >= 0)
      ) {
        delete opt.endAt
        opt[cur.end[0]] = cur.end[1].data
      }
    } else if (!isNil(opt.endBefore)) {
      const comp = tree.comp(
        { key: cur.end[1].id, val: cur.end[1].data },
        { val: opt.endBefore },
        opt.reverse,
        init(tree.sort_fields),
      )
      if (cur.end[0] === "endAt") {
        if (
          (reversed.start && comp < 0) ||
          (reversed.start !== true && comp > 0)
        ) {
          delete opt.endBefore
          opt[cur.end[0]] = cur.end[1].data
        }
      } else {
        if (
          (reversed.start && comp <= 0) ||
          (reversed.start !== true && comp >= 0)
        ) {
          opt.endBefore = cur.end[1].data
        }
      }
    } else {
      opt[cur.end[0]] = cur.end[1].data
    }
  }
  return opt
}
const isArrayIndex = prefix => prefix?.split("/")[1]?.split(":")[0] === "array"

const range = (
  sort_fields,
  opt = {},
  path,
  kv,
  cursor = false,
  _prefix = "",
  cur = {},
) => {
  if (
    !isArrayIndex(_prefix) &&
    sort_fields.length === 1 &&
    sort_fields[0][1] === "desc"
  ) {
    sort_fields[0][1] = "asc"
    opt.reverse = true
  }
  const prefix = `${_prefix}${
    _prefix === "" || sort_fields.length === 0 ? "" : "/"
  }${compose(
    join("/"),
    flatten,
  )(sort_fields.length === 0 && _prefix === "" ? [idsorter] : sort_fields)}`
  checkIndex(prefix, path, kv)
  const tree = new BPT({
    order,
    sort_fields: [...sort_fields, idsorter],
    kv,
    prefix,
  })
  const _opt = modOpt(clone(opt), cur, tree)
  return tree.range(_opt, cursor)
}
const doc = (id, path, kv) => {
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const tree = new BPT({ order, sort_fields: [idsorter], kv, prefix })
  return tree.data(id)
}
const get = (parsed, kv) => {
  let res = null
  if (parsed.path.length % 2 === 0) {
    const path = init(parsed.path)
    const id = last(parsed.path)
    res = doc(id, path, kv)
  } else {
    const { limit, path, sort } = parsed
    if (parsed.type === "range") {
      res = range(
        clone(sort),
        parsed.queries[0].opt,
        path,
        kv,
        false,
        parsed.queries[0].prefix,
        {
          start: parsed.startCursor,
          end: parsed.endCursor,
          reverse: parsed.reverse,
        },
      )
    } else if (parsed.type === "ranges") {
      res = ranges(
        map(v => ({
          ...v,
          sort: clone(sort),
        }))(parsed.queries),
        limit,
        path,
        kv,
        {
          start: parsed.startCursor,
          end: parsed.endCursor,
          reverse: parsed.reverse,
          sortRange: parsed.sortRange,
        },
      )
    } else if (parsed.type === "pranges") {
      res = pranges(
        map(v => ({
          ...v,
          sort: clone(sort),
          path,
        }))(parsed.queries),
        limit,
        kv,
        parsed.sortByTail,
        {
          start: parsed.startCursor,
          end: parsed.endCursor,
          reverse: parsed.reverse,
        },
      )
    }
  }
  return res
}

export { range, get, ranges, pranges, doc }
