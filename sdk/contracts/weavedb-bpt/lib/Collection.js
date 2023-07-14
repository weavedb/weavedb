const {
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
} = require("ramda")
const BPT = require("./BPT")
const md5 = require("md5")

const _KV = (kvs, SW) => ({
  get: async key =>
    typeof kvs[key] !== "undefined" ? kvs[key] : await SW.kv.get(key),
  put: async (key, val) => {
    kvs[key] = val
  },
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

const del = async (id, path, kvs, SW) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const sort_fields = [["__name__", "asc"]]
  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
  const order = 100
  const idtree = new BPT(order, sort_fields, kv, prefix)
  const __data = await idtree.data(id)
  const _data = __data.val
  const indexes = (await kv.get("indexes")) || {}
  for (const k in indexes) {
    const fields = keys(_data)
    const sp = map(v => v.split(":"))(k.split("/"))
    const i_fields = compose(
      without(["__name__"]),
      map(v => v.split(":")[0])
    )(k.split("/"))
    const diff = difference(i_fields, fields)
    if (i_fields.length > 0 && diff.length === 0) {
      if (sp[0][1] === "array") {
        if (is(Array, _data[sp[0][0]])) {
          for (let v of _data[sp[0][0]]) {
            const _md5 = md5(JSON.stringify(v))
            const sort_fields = map(v => v.split(":"))(k.split("/"))
            let akey = `${sort_fields[0][0]}:array:${_md5}`
            if (sort_fields.length > 1) {
              akey += `/${map(v => v.join(":"))(tail(sort_fields)).join("/")}`
            }
            if (isNil(indexes[k].items[_md5])) continue
            const ar = sort_fields[0]
            let prefix = `${ar[0]}/array:${_md5}`
            const _sort_fields =
              sort_fields.length === 1
                ? [["__name__", "asc"]]
                : tail(sort_fields)
            if (sort_fields.length > 1) {
              prefix += "/" + compose(join("/"), flatten)(tail(sort_fields))
            }
            const tree = new BPT(order, _sort_fields, kv, prefix)
            await tree.delete(id, true)
          }
        }
      } else {
        const sort_fields = map(v => v.split(":"))(k.split("/"))
        const prefix = `${compose(join("/"), flatten)(sort_fields)}`
        const tree = new BPT(order, sort_fields, kv, prefix)
        await tree.delete(id, true)
      }
    }
  }
  await idtree.delete(id)
}

const _mod = (old_data, _data, SW, signer) => {
  let data = clone(old_data.val)
  let dels = []
  let changes = []
  let news = []
  for (let k in _data) {
    let val = clone(data[k])
    if (
      _data[k].__op === "arrayUnion" ||
      _data[k].__op === "arrayRemove" ||
      is(Array, _data[k])
    ) {
      let new_vals = []
      if (!is(Array, val)) val = []
      if (_data[k].__op === "arrayUnion") {
        for (let v of _data[k].arr) {
          if (!includes(v)(val)) val.push(v)
        }
        new_vals = map(v => md5(JSON.stringify(v)))(val)
      } else if (_data[k].__op === "arrayRemove") {
        val = without(val, _data[k].arr)
        new_vals = map(v => md5(JSON.stringify(v)))(val)
      } else {
        val = _data[k]
        new_vals = map(v => md5(JSON.stringify(v)))(_data[k])
      }
      if (is(Array, data[k])) {
        const old_vals = compose(
          uniq,
          map(v => md5(JSON.stringify(v)))
        )(data[k])
        const _add = difference(new_vals, old_vals)
        const _remove = difference(old_vals, new_vals)
        for (let v of _add) news.push(`${k}:array:${v}`)
        for (let v of _remove) dels.push(`${k}:array:${v}`)
      } else {
        for (let v of new_vals) news.push(`${k}:array:${v}`)
      }
      data[k] = val
    } else if (is(Array, data[k])) {
      const old_vals = compose(
        uniq,
        map(v => md5(JSON.stringify(v)))
      )(data[k])
      for (let v of old_vals) dels.push(`${k}:array:${v}`)
      data[k] = _data[k]
    } else if (_data[k].__op === "del") {
      dels.push(k)
      delete data[k]
    } else {
      if (isNil(data[k])) {
        news.push(k)
      } else if (data[k] !== _data[k]) {
        changes.push(k)
      }
      if (_data[k].__op === "signer") {
        data[k] = signer
      } else if (_data[k].__op === "ts") {
        data[k] = SW.block.timestamp
      } else if (_data[k].__op === "inc") {
        data[k] ??= 0
        data[k] += _data[k].n
      } else {
        data[k] = _data[k]
      }
    }
  }
  return { dels, changes, news, data }
}

const _update = async (_data, id, old_data, idtree, kv, SW, signer) => {
  const order = 100
  let { dels, changes, news, data } = _mod(old_data, _data, SW, signer)
  const indexes = (await kv.get("indexes")) || {}
  let _indexes = clone(indexes)
  let newkeys = {}
  for (const k of dels) {
    const sp = k.split(":")
    const key = sp[1] === "array" ? k : `${k}:asc`
    const prefix = sp[1] === "array" ? `${sp[0]}/${sp[1]}:${sp[2]}` : `${k}/asc`
    newkeys[key] = true
    const sort_fields = sp[1] === "array" ? [["__name__", "asc"]] : [[k, "asc"]]
    const _tree = new BPT(order, sort_fields, kv, prefix)
    await _tree.delete(id, true)
  }
  await idtree.putData(id, data)
  for (const k of news) {
    const sp = k.split(":")
    const key = sp[1] === "array" ? k : `${k}:asc`
    let prefix = sp[1] === "array" ? `${sp[0]}/${sp[1]}:${sp[2]}` : `${k}/asc`
    newkeys[key] = true
    if (sp[1] === "array") {
      const akey = `${sp[0]}:${sp[1]}`
      if (isNil(_indexes[akey])) _indexes[akey] = { key: akey, items: {} }
      if (isNil(_indexes[akey].items[sp[2]])) {
        _indexes[akey].items[sp[2]] = { key, order: 5 }
      }
      const sort_fields = map(v => v.split(":"))(k.split("/"))
      let _sort_fields =
        sort_fields.length === 1 ? [["__name__", "asc"]] : tail(sort_fields)
      if (sort_fields.length > 1) {
        prefix += "/" + compose(join("/"), flatten)(tail(sort_fields))
      }
      const _tree = new BPT(order, sort_fields, kv, prefix)
      await _tree.insert(id, _data, true)
    } else {
      if (isNil(_indexes[key])) _indexes[key] = { order, key }
      const sort_fields = [[k, "asc"]]
      const _tree = new BPT(order, sort_fields, kv, prefix)
      await _tree.insert(id, _data, true)
    }
  }
  await kv.put("indexes", _indexes)
  const fields = keys(data)
  const old_fields = keys(old_data.val)
  for (const k in _indexes) {
    if (isNil(newkeys[k])) {
      const sort_fields = map(v => v.split(":"))(k.split("/"))
      const i_fields = compose(
        without(["__name__"]),
        map(v => v.split(":")[0])
      )(k.split("/"))
      if (i_fields.length > 1) {
        if (sort_fields[0][1] === "array") {
          const arr_name = sort_fields[0][0]
          const new_arr_vals = is(Array, data[arr_name])
            ? compose(
                uniq,
                map(v => md5(JSON.stringify(v)))
              )(data[arr_name])
            : []
          const old_arr_vals = is(Array, old_data.val[arr_name])
            ? compose(
                uniq,
                map(v => md5(JSON.stringify(v)))
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
            const sort_tail = map(join(":"))(tail(sort_fields)).join("/")
            const getKey = v => `${arr_name}:array:${v}/${sort_tail}`
            const getPrefix = v =>
              `${arr_name}/array:${v}/${compose(
                join("/"),
                flatten
              )(tail(sort_fields))}`
            const ins = async tree => await tree.insert(id, _data, true)
            const del = async tree => await tree.delete(id, true)
            const getTree = v =>
              new BPT(order, tail(sort_fields), kv, getPrefix(v))
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
          if (isDel) {
            const prefix = `${compose(join("/"), flatten)(sort_fields)}`
            const tree = new BPT(order, sort_fields, kv, prefix)
            await tree.delete(id, true)
          }
          if (isAdd) {
            const sort_fields = map(v => v.split(":"))(k.split("/"))
            const prefix = `${compose(join("/"), flatten)(sort_fields)}`
            const tree = new BPT(order, sort_fields, kv, prefix)
            await tree.insert(id, _data, true)
          }
        }
      }
    }
  }
}

const put = async (_data, id, path, kvs, SW, signer) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const sort_fields = [["__name__", "asc"]]
  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
  const order = 100
  const idtree = new BPT(order, sort_fields, kv, prefix)
  let old_data = await idtree.data(id)
  if (!isNil(old_data?.val))
    return await _update(_data, id, old_data, idtree, kv, SW, signer)
  let { dels, changes, news, data } = _mod({ val: {} }, _data, SW, signer)
  await idtree.insert(id, data)
  const indexes = (await kv.get("indexes")) || {}
  let _indexes = clone(indexes)

  for (const k in _data) {
    const key = `${k}:asc`
    if (isNil(indexes[key])) _indexes[key] = { order, key }

    const _tree = new BPT(order, [[k, "asc"]], kv, `${k}/asc`)
    await _tree.insert(id, _data, true)

    if (is(Array, _data[k])) {
      for (let v of uniq(_data[k])) {
        const _prefix = `${k}:array`
        const _md5 = md5(JSON.stringify(v))
        const key = `${_prefix}:${_md5}`
        if (isNil(_indexes[_prefix]))
          _indexes[_prefix] = { key: _prefix, items: {} }
        if (isNil(_indexes[_prefix].items[_md5])) {
          _indexes[_prefix].items[_md5] = { order: 5, key }
        }
        const _tree = new BPT(
          order,
          [["__name__", "asc"]],
          kv,
          `${k}/array:${md5(JSON.stringify(v))}`,
          function (stats) {}
        )
        await _tree.insert(id, _data, true)
      }
    }
  }

  const fields = keys(_data)
  for (const k in indexes) {
    const i_fields = compose(
      without(["__name__"]),
      map(v => v.split(":")[0])
    )(k.split("/"))
    const diff = difference(i_fields, fields)
    if (i_fields.length > 1 && diff.length === 0) {
      const sort_fields = map(v => v.split(":"))(k.split("/"))
      if (sort_fields[0][1] === "array") {
        if (!is(Array, _data[sort_fields[0][0]])) continue
        for (let v of _data[sort_fields[0][0]]) {
          const prefix = `${compose(join("/"), flatten)(tail(sort_fields))}`
          const _md5 = md5(JSON.stringify(v))
          const _prefix = `${sort_fields[0][0]}/array:${_md5}`
          const key = `${_prefix}/${prefix}`
          const akey = `${sort_fields[0][0]}:array:${_md5}/${map(v =>
            v.join(":")
          )(tail(sort_fields)).join("/")}`
          const _tree = new BPT(order, tail(sort_fields), kv, key)
          if (isNil(_indexes[k].items[_md5])) {
            _indexes[k].items[_md5] = { order: 5, key: akey }
          }
          await _tree.insert(id, _data, true)
        }
      } else {
        const prefix = `${compose(join("/"), flatten)(sort_fields)}`
        const tree = new BPT(order, sort_fields, kv, prefix)
        await tree.insert(id, _data, true)
      }
    }
  }
  await kv.put("indexes", _indexes)
}

const range = async (sort_fields, opt = {}, path, kvs, SW) => {
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
  const order = 100
  const tree = new BPT(order, sort_fields, kv, prefix)
  return await tree.range(opt)
}

const get = async (id, path, kvs, SW) => {
  const sort_fields = [["__name__", "asc"]]
  const kv = new KV(`${path.join("/")}/`, _KV(kvs, SW))
  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
  const order = 100
  const tree = new BPT(order, sort_fields, kv, prefix)
  return await tree.data(id)
}

module.exports = { put, range, get, del }
