const {
  reverse,
  sortBy,
  prop,
  init,
  path,
  last,
  append,
  includes,
  o,
  concat,
  intersection,
  keys,
  uniq,
  is,
  clone,
  compose,
  join,
  flatten,
  isNil,
  without,
  map,
  difference,
  tail,
  splitEvery,
  equals,
} = require("ramda")
const { err } = require("./base")
const BPT = require("./BPT")
const md5 = require("./md5")

const idsorter = ["__id__", "asc"]
const order = 100

const _KV = (kvs, SW) => ({
  get: async key =>
    typeof kvs[key] !== "undefined" ? kvs[key] : await SW.kv.get(key),
  put: async (key, val) => (kvs[key] = val),
})

class KV {
  constructor(prefix = "default", kvs) {
    this.kvs = kvs
    this.prefix = prefix
    this.store = {}
  }
  async get(key, _prefix = "") {
    const data =
      (await this.kvs.get(`${this.prefix}/${_prefix}/${key}`)) ?? null
    if (!isNil(data)) this.store[key] = data
    return data
  }
  async put(key, val, _prefix = "", nosave = false) {
    if (!nosave) await this.kvs.put(`${this.prefix}/${_prefix}/${key}`, val)
    this.store[key] = val
  }
  async del(key, _prefix = "", nosave = false) {
    if (!nosave) await this.kvs.put(`${this.prefix}/${_prefix}/${key}`, null)
    delete this.store[key]
  }
}

const getIndexes = async (path, kvs, SW) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const _sort_fields = [idsorter]
  const prefix = `${compose(join("/"), flatten)(_sort_fields)}`
  const idtree = new BPT(order, _sort_fields, kv, prefix)
  return (await kv.get("indexes")) || {}
}

const validateSortFields = sort_fields => {
  let i = 0
  for (let v of sort_fields) {
    if (v[1] === "array") {
      if (i !== 0) return false
    } else if (!includes(v[1], ["asc", "desc"])) {
      return false
    }
    i++
  }
  if (
    sort_fields.length === 0 ||
    (sort_fields.length === 1 && sort_fields[0][0].split(".").length < 2)
  ) {
    return false
  }
  return true
}

const addFields = (val, fields, path, top = false) => {
  for (let k in val) {
    if (!top) fields.push(append(k, path).join("."))
    if (is(Object, val[k]) && !is(Array, val[k])) {
      addFields(val[k], fields, append(k, path))
    }
  }
}

const addIndex = async (sort_fields, path, kvs, SW) => {
  sort_fields = map(v => (v.length > 1 ? v : append("asc", v)))(sort_fields)
  if (!validateSortFields(sort_fields)) return
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const idtree = new BPT(order, [idsorter], kv, prefix)
  let __indexes = (await kv.get("indexes")) || {}
  const newIndex = map(join("/"))(sort_fields).join("/")
  if (!isNil(__indexes[newIndex])) return
  let docs = await idtree.range()
  const i_fields = compose(
    without(["__id__"]),
    map(v => v[0]),
  )(sort_fields)
  if (sort_fields[0][1] === "array") {
    let array_indexes = {}
    let kvs = {}
    for (let _data of docs) {
      const fields = keys(_data.val)
      const diff = difference(i_fields, fields)
      if (
        i_fields.length > 0 &&
        diff.length === 0 &&
        is(Array, _data.val[i_fields[0]])
      ) {
        for (const v of _data.val[i_fields[0]]) {
          const prefix = `${compose(join("/"), flatten)(tail(sort_fields))}`
          const _md5 = md5(JSON.stringify(v))
          const _prefix = `${sort_fields[0][0]}/array:${_md5}`
          const key = `${_prefix}/${prefix}`
          let _tree = null
          const akey = `${sort_fields[0][0]}/array:${_md5}/${map(v =>
            v.join("/"),
          )(tail(sort_fields)).join("/")}`
          if (isNil(kvs[_md5])) {
            array_indexes[_md5] = { order, key: akey }
            _tree = new BPT(order, [...tail(sort_fields), idsorter], kv, key)
          } else {
            _tree = kvs[_md5]
          }
          await _tree.insert(_data.key, _data.val, true)
        }
      }
    }
    __indexes[newIndex] = {
      key: newIndex,
      items: array_indexes,
    }
  } else {
    __indexes[newIndex] = { order, key: newIndex }
    const prefix = `${compose(join("/"), flatten)(sort_fields)}`
    const tree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
    for (let _data of docs) {
      let fields = keys(_data.val)
      addFields(_data.val, fields, [], true)
      const diff = difference(i_fields, fields)
      if (i_fields.length > 0 && diff.length === 0) {
        await tree.insert(_data.key, _data.val, true)
      }
    }
  }
  await kv.put("indexes", __indexes)
}

const removeIndex = async (sort_fields, path, kvs, SW) => {
  sort_fields = map(v => (v.length > 1 ? v : append("asc", v)))(sort_fields)
  if (!validateSortFields(sort_fields)) return
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const idtree = new BPT(order, [idsorter], kv, prefix)
  let __indexes = (await kv.get("indexes")) || {}
  const newIndex = map(join("/"))(sort_fields).join("/")
  if (isNil(__indexes[newIndex])) return
  let docs = await idtree.range()
  const i_fields = compose(
    without(["__id__"]),
    map(v => v[0]),
  )(sort_fields)
  if (sort_fields[0][1] === "array") {
    let array_indexes = {}
    let kvs = {}
    for (let _data of docs) {
      const fields = keys(_data.val)
      const diff = difference(i_fields, fields)
      if (
        i_fields.length > 0 &&
        diff.length === 0 &&
        is(Array, _data.val[i_fields[0]])
      ) {
        for (const v of _data.val[i_fields[0]]) {
          const prefix = `${compose(join("/"), flatten)(tail(sort_fields))}`
          const _md5 = md5(JSON.stringify(v))
          const _prefix = `${sort_fields[0][0]}/array:${_md5}`
          const key = `${_prefix}/${prefix}`
          let _tree = null
          const akey = `${sort_fields[0][0]}/array:${_md5}/${map(v =>
            v.join(":"),
          )(tail(sort_fields)).join("/")}`
          if (isNil(kvs[_md5])) {
            array_indexes[_md5] = { order, key: akey }
            _tree = new BPT(order, [...tail(sort_fields), idsorter], kv, key)
          } else {
            _tree = kvs[_md5]
          }
          await _tree.delete(_data.key, true)
        }
      }
    }
  } else {
    const prefix = `${compose(join("/"), flatten)(sort_fields)}`
    const tree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
    for (let _data of docs) {
      let fields = keys(_data.val)
      addFields(_data.val, fields, [], true)
      const diff = difference(i_fields, fields)
      if (i_fields.length > 0 && diff.length === 0) {
        await tree.delete(_data.key, true)
      }
    }
  }
  delete __indexes[newIndex]
  await kv.put("indexes", __indexes)
}

const del = async (id, path, kvs, SW) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const sort_fields = [idsorter]
  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
  const idtree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
  const __data = await idtree.data(id)
  const _data = __data.val
  const indexes = (await kv.get("indexes")) || {}
  for (const k in indexes) {
    const fields = keys(_data)
    const sp = splitEvery(2, k.split("/"))
    const i_fields = compose(
      without(["__id__"]),
      map(v => v[0]),
      splitEvery(2),
    )(k.split("/"))
    const diff = difference(i_fields, fields)
    if (i_fields.length > 0 && diff.length === 0) {
      if (sp[0][1] === "array") {
        if (is(Array, _data[sp[0][0]])) {
          for (let v of _data[sp[0][0]]) {
            const _md5 = md5(JSON.stringify(v))
            const sort_fields = splitEvery(2, k.split("/"))
            let akey = `${sort_fields[0][0]}/array:${_md5}`
            if (sort_fields.length > 1) {
              akey += `/${map(v => v.join("/"))(tail(sort_fields)).join("/")}`
            }
            if (isNil(indexes[k].items[_md5])) continue
            const ar = sort_fields[0]
            let prefix = `${ar[0]}/array:${_md5}`
            const _sort_fields =
              sort_fields.length === 1 ? [idsorter] : tail(sort_fields)
            if (sort_fields.length > 1) {
              prefix += "/" + compose(join("/"), flatten)(tail(sort_fields))
            }
            const tree = new BPT(order, [..._sort_fields, idsorter], kv, prefix)
            await tree.delete(id, true)
          }
        }
      } else {
        const sort_fields = splitEvery(2, k.split("/"))
        const prefix = `${compose(join("/"), flatten)(sort_fields)}`
        const tree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
        await tree.delete(id, true)
      }
    }
  }
  await idtree.delete(id)
  return { before: __data, after: { key: id, val: null, setter: null } }
}

const mod = (prev, next) => {
  let dels = []
  let changes = []
  let news = []
  prev ??= {}
  next ??= {}
  const _keys = compose(uniq, flatten, map(keys))([prev, next])
  for (const k of _keys) {
    if (!equals(prev[k], next[k])) {
      if (isNil(prev[k])) {
        news.push(k)
        if (is(Array, next[k])) {
          for (let v of next[k]) {
            news.push(`${k}/array:${md5(JSON.stringify(v))}`)
          }
        }
      } else if (isNil(next[k])) {
        dels.push(k)
        if (is(Array, prev[k])) {
          for (let v of prev[k]) {
            dels.push(`${k}/array:${md5(JSON.stringify(v))}`)
          }
        }
      } else {
        changes.push(k)
        if (is(Array, prev[k]) && is(Array, next[k])) {
          const _news = o(uniq, difference(next[k]))(prev[k])
          const _dels = o(uniq, difference(prev[k]))(next[k])
          for (let v of _news) {
            news.push(`${k}/array:${md5(JSON.stringify(v))}`)
          }
          for (let v of _dels) {
            dels.push(`${k}/array:${md5(JSON.stringify(v))}`)
          }
        } else if (is(Array, prev[k])) {
          for (let v of uniq(prev[k])) {
            dels.push(`${k}/array:${md5(JSON.stringify(v))}`)
          }
        } else if (is(Array, next[k])) {
          for (let v of uniq(next[k])) {
            news.push(`${k}/array:${md5(JSON.stringify(v))}`)
          }
        }
      }
    }
  }
  return { dels, changes, news }
}

const _update = async (data, id, old_data, idtree, kv, SW, signer) => {
  let { dels, changes, news } = mod(old_data.val, data)
  const indexes = (await kv.get("indexes")) || {}
  let _indexes = clone(indexes)
  let newkeys = {}
  for (const k of dels) {
    const sp = k.split("/")
    const isArray = sp[1]?.split(":")[0] === "array"
    const key = isArray ? k : `${k}/asc`
    const prefix = isArray ? `${sp[0]}/${sp[1]}` : `${k}/asc`
    newkeys[key] = true
    const sort_fields = isArray ? [idsorter] : [[k, "asc"], idsorter]
    const _tree = new BPT(order, sort_fields, kv, prefix)
    await _tree.delete(id, true)
  }

  for (const k of news) {
    const sp = k.split("/")
    const isArray = sp[1]?.split(":")[0] === "array"
    const key = isArray ? k : `${k}/asc`
    let prefix = isArray ? `${sp[0]}/${sp[1]}` : `${k}/asc`
    newkeys[key] = true
    if (isArray) {
      const akey = `${sp[0]}/array`
      const item = sp[1].split(":")[1] ?? null
      if (isNil(_indexes[akey])) _indexes[akey] = { key: akey, items: {} }
      if (!isNil(item) && isNil(_indexes[akey].items[item])) {
        _indexes[akey].items[item] = { key, order }
      }
      const sort_fields = splitEvery(2, k.split("/"))

      let _sort_fields =
        sort_fields.length === 1 ? [idsorter] : [...tail(sort_fields), idsorter]
      if (sort_fields.length > 1) {
        prefix += "/" + compose(join("/"), flatten)(tail(sort_fields))
      }
      const _tree = new BPT(order, sort_fields, kv, prefix)
      await _tree.insert(id, data, true)
    } else {
      if (isNil(_indexes[key])) _indexes[key] = { order, key }
      const sort_fields = [[k, "asc"], idsorter]
      const _tree = new BPT(order, sort_fields, kv, prefix)
      await _tree.insert(id, data, true)
    }
  }

  await kv.put("indexes", _indexes)
  let fields = keys(data)
  addFields(data, fields, [], true)
  let old_fields = keys(old_data.val)
  addFields(old_data.val, old_fields, [], true)
  for (const k in _indexes) {
    if (isNil(newkeys[k])) {
      const sort_fields = splitEvery(2, k.split("/"))
      const i_fields = compose(
        without(["__id__"]),
        map(v => v[0]),
        splitEvery(2),
      )(k.split("/"))
      if (i_fields.length > 0) {
        if (sort_fields[0][1] === "array") {
          const arr_name = sort_fields[0][0]
          const new_arr_vals = is(Array, data[arr_name])
            ? compose(
                uniq,
                map(v => md5(JSON.stringify(v))),
              )(data[arr_name])
            : []
          const old_arr_vals = is(Array, old_data.val[arr_name])
            ? compose(
                uniq,
                map(v => md5(JSON.stringify(v))),
              )(old_data.val[arr_name])
            : []
          const val_added = difference(new_arr_vals, old_arr_vals)
          const val_removed = difference(old_arr_vals, new_arr_vals)
          const val_unchanged = intersection(old_arr_vals, new_arr_vals)
          const _fields = without([arr_name])(fields)
          const _old_fields = without([arr_name])(old_fields)
          const _i_fields = without([arr_name])(i_fields)
          const diff = difference(_i_fields, _fields)
          const old_diff = difference(_i_fields, _old_fields)
          if (diff.length === 0 || old_diff.length === 0) {
            let isAdd = false
            let isDel = false
            if (intersection(_i_fields, news).length > 0) isAdd = true
            if (intersection(_i_fields, changes).length > 0) {
              isDel = true
              isAdd = true
            }
            if (intersection(_i_fields, dels).length > 0) {
              isDel = true
              isAdd = false
            }
            const isChange =
              isAdd && isDel ? "change" : isAdd ? "add" : isDel ? "del" : "same"
            let _add = []
            let _del = []
            let _change = []
            for (let v of val_added) _add.push(v)
            for (let v of val_removed) _del.push(v)
            for (let v of val_unchanged) {
              if (isChange === "add") {
                _add.push(v)
              } else if (isChange === "del") {
                _del.push(v)
              } else if (isChange === "change") {
                _change.push(v)
              }
            }
            const sort_tail = map(join("/"))(tail(sort_fields)).join("/")
            const getKey = v => `${arr_name}/array:${v}/${sort_tail}`
            const getPrefix = v =>
              `${arr_name}/array:${v}/${compose(
                join("/"),
                flatten,
              )(tail(sort_fields))}`
            const ins = async tree => await tree.insert(id, data, true)
            const del = async tree => await tree.delete(id, true)
            const getTree = v =>
              new BPT(order, [...tail(sort_fields), idsorter], kv, getPrefix(v))
            for (let v of _add) {
              const akey = getKey(v)
              await ins(getTree(v))
              if (isNil(_indexes[k].items[v])) {
                _indexes[k].items[v] = { key: akey, order }
              }
            }
            for (let v of _del) await del(getTree(v))
            for (let v of _change) {
              const _tree = getTree(v)
              await del(_tree)
              await ins(_tree)
            }
          }
        }
        const diff = difference(i_fields, fields)
        const old_diff = difference(i_fields, old_fields)
        if (diff.length === 0 || old_diff.length === 0) {
          let isAdd = false
          let isDel = false
          if (intersection(i_fields, news).length > 0) isAdd = true
          if (intersection(i_fields, changes).length > 0) {
            isDel = true
            isAdd = true
          }
          if (intersection(i_fields, dels).length > 0) {
            isDel = true
            isAdd = false
          }
          for (let v of i_fields) {
            const sp = v.split(".")
            if (sp.length > 1) {
              let ndata = path(sp, data)
              let odata = path(sp, old_data.val)
              if (!equals(ndata, odata)) {
                if (!isNil(odata)) isDel = true
                if (!isNil(ndata)) isAdd = true
                break
              }
            }
          }
          if (isDel) {
            const prefix = `${compose(join("/"), flatten)(sort_fields)}`
            const tree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
            await tree.delete(id, true)
          }
          if (isAdd) {
            const sort_fields = splitEvery(2, k.split("/"))
            const prefix = `${compose(join("/"), flatten)(sort_fields)}`
            const tree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
            await tree.insert(id, data, true)
          }
        }
      }
    }
  }
  await idtree.putData(id, data, undefined, signer)
  return { before: old_data, after: { key: id, val: data, setter: signer } }
}

const put = async (_data, id, path, kvs, SW, signer, create = false) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const idtree = new BPT(order, [idsorter], kv, prefix)
  let old_data = await idtree.data(id)
  if (!isNil(old_data?.val)) {
    if (create) {
      await del(id, path, kvs, SW)
    } else {
      return await _update(_data, id, old_data, idtree, kv, SW, signer)
    }
  }
  await idtree.insert(id, _data, false, signer)
  const indexes = (await kv.get("indexes")) || {}
  let _indexes = clone(indexes)
  let idkey = "__id__/asc"
  if (isNil(_indexes[idkey])) {
    _indexes[idkey] = { order, key: idkey }
  }
  for (const k in _data) {
    const key = `${k}/asc`
    if (isNil(indexes[key])) _indexes[key] = { order, key }
    const _tree = new BPT(order, [[k, "asc"], idsorter], kv, key)
    await _tree.insert(id, _data, true)
    if (is(Array, _data[k])) {
      for (let v of uniq(_data[k])) {
        const _prefix = `${k}/array`
        const _md5 = md5(JSON.stringify(v))
        const key = `${_prefix}:${_md5}`
        if (isNil(_indexes[_prefix]))
          _indexes[_prefix] = { key: _prefix, items: {} }
        if (isNil(_indexes[_prefix].items[_md5])) {
          _indexes[_prefix].items[_md5] = { order, key }
        }
        const _tree = new BPT(
          order,
          [idsorter],
          kv,
          `${k}/array:${md5(JSON.stringify(v))}`,
          function (stats) {},
        )
        await _tree.insert(id, _data, true)
      }
    }
  }

  const fields = keys(_data)
  addFields(_data, fields, [], true)
  for (const k in indexes) {
    const i_fields = compose(
      without(["__id__"]),
      map(v => v[0]),
      splitEvery(2),
    )(k.split("/"))
    const diff = difference(i_fields, fields)
    const isValid =
      i_fields.length > 1 ||
      (i_fields.length === 1 && i_fields[0].split(".").length > 1)
    if (isValid && diff.length === 0) {
      const sort_fields = splitEvery(2, k.split("/"))
      if (sort_fields[0][1] === "array") {
        if (!is(Array, _data[sort_fields[0][0]])) continue
        for (let v of _data[sort_fields[0][0]]) {
          const prefix = `${compose(join("/"), flatten)(tail(sort_fields))}`
          const _md5 = md5(JSON.stringify(v))
          const _prefix = `${sort_fields[0][0]}/array:${_md5}`
          const key = `${_prefix}/${prefix}`
          const akey = `${sort_fields[0][0]}/array:${_md5}/${map(v =>
            v.join("/"),
          )(tail(sort_fields)).join("/")}`
          const _tree = new BPT(
            order,
            [...tail(sort_fields), idsorter],
            kv,
            key,
          )
          if (isNil(_indexes[k].items[_md5])) {
            _indexes[k].items[_md5] = { order, key: akey }
          }
          await _tree.insert(id, _data, true)
        }
      } else {
        const prefix = `${compose(join("/"), flatten)(sort_fields)}`
        const tree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
        await tree.insert(id, _data, true)
      }
    }
  }
  await kv.put("indexes", _indexes)
  return { before: old_data, after: { key: id, val: _data, setter: signer } }
}

const pranges = async (
  _ranges,
  limit,
  kvs,
  SW,
  sortByTail = false,
  cur = {},
) => {
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
    const kv = new KV(`${v.path.join("/")}/`, _KV(kvs, SW))
    let prefix = v.prefix ?? ""
    let suffix = `${compose(
      join("/"),
      flatten,
    )(v.sort.length === 0 && prefix === "" ? [idsorter] : v.sort)}`
    if (prefix !== "" && suffix !== "") suffix = `/${suffix}`
    prefix += suffix
    await checkIndex(prefix, v.path, kvs, SW)
    const tree = new BPT(order, [...v.sort, idsorter], kv, prefix)
    modOpt(v.opt, cur, tree)
    const _cur = { val: null, tree, cur: await tree.range(v.opt, true) }
    curs.push(_cur)
  }
  const comp = curs[0].tree.comp.bind(curs[0].tree)
  let sorter = curs[0].tree.sort_fields
  if (!equals(last(sorter), idsorter)) sorter.push(idsorter)
  if (sortByTail) sorter = tail(sorter)

  while (curs.length > 0) {
    const val = await curs[0].cur()
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

const ranges = async (_ranges, limit, path, kvs, SW, cur = {}) => {
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
    res = concat(res, await range(v.sort, v.opt, path, kvs, SW, false, "", cur))
    count += res.length
    if (!isNil(limit) && count >= limit) break
  }
  return res
}

const checkIndex = async (prefix, path, kvs, SW) => {
  const indexes = await getIndexes(path, kvs, SW)
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
    err(`missing index ${JSON.stringify(sort_fields)}`)
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

const range = async (
  sort_fields,
  opt = {},
  path,
  kvs,
  SW,
  cursor = false,
  _prefix = "",
  cur = {},
) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
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
  await checkIndex(prefix, path, kvs, SW)
  const tree = new BPT(order, [...sort_fields, idsorter], kv, prefix)
  const _opt = modOpt(clone(opt), cur, tree)
  return await tree.range(_opt, cursor)
}

const get = async (id, path, kvs, SW) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const tree = new BPT(order, [idsorter], kv, prefix)
  return await tree.data(id)
}

module.exports = {
  put,
  range,
  get,
  del,
  addIndex,
  getIndexes,
  removeIndex,
  mod,
  ranges,
  pranges,
}
