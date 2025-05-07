import {
  path,
  append,
  includes,
  o,
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
} from "ramda"
import BPT from "./bpt.js"
import md5 from "./md5.js"

const idsorter = ["__id__", "asc"]
const order = 100

const getIndexes = (path, kv) => {
  const sort_fields = [idsorter]
  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
  const idtree = new BPT({ order, sort_fields, kv, prefix })
  return kv.get("indexes") || {}
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

const addIndex = (sort_fields, path, kv) => {
  sort_fields = map(v => (v.length > 1 ? v : append("asc", v)))(sort_fields)
  if (!validateSortFields(sort_fields)) return
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const idtree = new BPT({ order, sort_fields: [idsorter], kv, prefix })
  let __indexes = kv.get("indexes") || {}
  const newIndex = map(join("/"))(sort_fields).join("/")
  if (!isNil(__indexes[newIndex])) return
  let docs = idtree.range()
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
            _tree = new BPT({
              order,
              sort_fields: [...tail(sort_fields), idsorter],
              kv,
              prefix: key,
            })
          } else {
            _tree = kvs[_md5]
          }
          _tree.insert(_data.key, _data.val, true)
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
    const tree = new BPT({
      order,
      sort_fields: [...sort_fields, idsorter],
      kv,
      prefix,
    })
    for (let _data of docs) {
      let fields = keys(_data.val)
      addFields(_data.val, fields, [], true)
      const diff = difference(i_fields, fields)
      if (i_fields.length > 0 && diff.length === 0) {
        tree.insert(_data.key, _data.val, true)
      }
    }
  }
  kv.put("indexes", __indexes)
}

const removeIndex = (sort_fields, path, kv) => {
  sort_fields = map(v => (v.length > 1 ? v : append("asc", v)))(sort_fields)
  if (!validateSortFields(sort_fields)) return
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const idtree = new BPT({ order, sort_fields: [idsorter], kv, prefix })
  let __indexes = kv.get("indexes") || {}
  const newIndex = map(join("/"))(sort_fields).join("/")
  if (isNil(__indexes[newIndex])) return
  let docs = idtree.range()
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
            _tree = new BPT({
              order,
              sort_fields: [...tail(sort_fields), idsorter],
              kv,
              prefix: key,
            })
          } else {
            _tree = kvs[_md5]
          }
          _tree.delete(_data.key, true)
        }
      }
    }
  } else {
    const prefix = `${compose(join("/"), flatten)(sort_fields)}`
    const tree = new BPT({
      order,
      sort_fields: [...sort_fields, idsorter],
      kv,
      prefix,
    })
    for (let _data of docs) {
      let fields = keys(_data.val)
      addFields(_data.val, fields, [], true)
      const diff = difference(i_fields, fields)
      if (i_fields.length > 0 && diff.length === 0) {
        tree.delete(_data.key, true)
      }
    }
  }
  delete __indexes[newIndex]
  kv.put("indexes", __indexes)
}

const del = (id, path, kv) => {
  const sort_fields = [idsorter]
  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
  const idtree = new BPT({
    order,
    sort_fields: [...sort_fields, idsorter],
    kv,
    prefix,
  })
  const __data = idtree.data(id)
  const _data = __data.val
  const indexes = kv.get("indexes") || {}
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
            const tree = new BPT({
              order,
              sort_fields: [..._sort_fields, idsorter],
              kv,
              prefix,
            })
            tree.delete(id, true)
          }
        }
      } else {
        const sort_fields = splitEvery(2, k.split("/"))
        const prefix = `${compose(join("/"), flatten)(sort_fields)}`
        const tree = new BPT({
          order,
          sort_fields: [...sort_fields, idsorter],
          kv,
          prefix,
        })
        tree.delete(id, true)
      }
    }
  }
  idtree.delete(id)
  kv.delData(id)
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

const _update = (data, id, old_data, idtree, kv) => {
  let { dels, changes, news } = mod(old_data.val, data)
  const indexes = kv.get("indexes") || {}
  let _indexes = clone(indexes)
  let newkeys = {}
  for (const k of dels) {
    const sp = k.split("/")
    const isArray = sp[1]?.split(":")[0] === "array"
    const key = isArray ? k : `${k}/asc`
    const prefix = isArray ? `${sp[0]}/${sp[1]}` : `${k}/asc`
    newkeys[key] = true
    const sort_fields = isArray ? [idsorter] : [[k, "asc"], idsorter]
    const _tree = new BPT({ order, sort_fields, kv, prefix })
    _tree.delete(id, true)
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
      const _tree = new BPT({ order, sort_fields, kv, prefix })
      _tree.insert(id, data, true)
    } else {
      if (isNil(_indexes[key])) _indexes[key] = { order, key }
      const sort_fields = [[k, "asc"], idsorter]
      const _tree = new BPT({ order, sort_fields, kv, prefix })
      _tree.insert(id, data, true)
    }
  }

  kv.put("indexes", _indexes)
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
            const ins = tree => {
              return tree.insert(id, data, true)
            }
            const del = tree => tree.delete(id, true)
            const getTree = v =>
              new BPT({
                order,
                sort_fields: [...tail(sort_fields), idsorter],
                kv,
                prefix: getPrefix(v),
              })
            for (let v of _add) {
              const akey = getKey(v)
              ins(getTree(v))
              if (isNil(_indexes[k].items[v])) {
                _indexes[k].items[v] = { key: akey, order }
              }
            }
            for (let v of _del) del(getTree(v))
            for (let v of _change) {
              const _tree = getTree(v)
              del(_tree)
              ins(_tree)
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
            const tree = new BPT({
              order,
              sort_fields: [...sort_fields, idsorter],
              kv,
              prefix,
            })
            tree.delete(id, true)
          }
          if (isAdd) {
            const sort_fields = splitEvery(2, k.split("/"))
            const prefix = `${compose(join("/"), flatten)(sort_fields)}`
            const tree = new BPT({
              order,
              sort_fields: [...sort_fields, idsorter],
              kv,
              prefix,
            })
            tree.insert(id, data, true)
          }
        }
      }
    }
  }
  kv.putData(id, data)
  return { before: old_data, after: { key: id, val: data } }
}

const put = (_data, id, path, kv, create = false) => {
  const prefix = `${compose(join("/"), flatten)([idsorter])}`
  const idtree = new BPT({ order, sort_fields: [idsorter], kv, prefix })
  let old_data = idtree.data(id)
  if (!isNil(old_data?.val)) {
    if (create) {
      // craete means set (not update)
      del(id, path, kv)
    } else {
      return _update(_data, id, old_data, idtree, kv)
    }
  }
  kv.putData(id, _data)
  idtree.insert(id, _data, false)
  const indexes = kv.get("indexes") || {}
  let _indexes = clone(indexes)
  let idkey = "__id__/asc"
  if (isNil(_indexes[idkey])) {
    _indexes[idkey] = { order, key: idkey }
  }
  for (const k in _data) {
    const key = `${k}/asc`
    if (isNil(indexes[key])) _indexes[key] = { order, key }
    const _tree = new BPT({
      order,
      sort_fields: [[k, "asc"], idsorter],
      kv,
      prefix: key,
    })
    _tree.insert(id, _data, true)
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
        const _tree = new BPT({
          order,
          sort_fields: [idsorter],
          kv,
          prefix: `${k}/array:${md5(JSON.stringify(v))}`,
          onCommit: function (stats) {},
        })
        _tree.insert(id, _data, true)
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
          const _tree = new BPT({
            order,
            sort_fields: [...tail(sort_fields), idsorter],
            kv,
            prefix: key,
          })
          if (isNil(_indexes[k].items[_md5])) {
            _indexes[k].items[_md5] = { order, key: akey }
          }
          _tree.insert(id, _data, true)
        }
      } else {
        const prefix = `${compose(join("/"), flatten)(sort_fields)}`
        const tree = new BPT({
          order,
          sort_fields: [...sort_fields, idsorter],
          kv,
          prefix,
        })
        tree.insert(id, _data, true)
      }
    }
  }
  kv.put("indexes", _indexes)
  return { before: old_data, after: { key: id, val: _data } }
}

export { put, mod, del, addIndex, getIndexes, removeIndex }
