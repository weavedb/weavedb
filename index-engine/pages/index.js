import lf from "localforage"
import {
  Select,
  Textarea,
  Input,
  Flex,
  Box,
  ChakraProvider,
} from "@chakra-ui/react"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import {
  concat,
  uniq,
  is,
  intersection,
  difference,
  assoc,
  prepend,
  without,
  reject,
  propEq,
  split,
  join,
  tail,
  values,
  compose,
  flatten,
  pluck,
  last,
  clone,
  append,
  includes,
  addIndex,
  range,
  isNil,
  map,
  keys,
} from "ramda"
import md5 from "md5"
const BPT = require("../lib/BPT")
const { gen, isErr, build } = require("../lib/utils")
let tree = null
let idtree = null
let init = false

let ids = {}
let stop = false

const initial_order = 5
let _his = []
for (const i of range(0, initial_order * 5)) {
  _his.push(gen("number"))
}
let _his2 = []
for (const i of range(0, initial_order * 5)) {
  _his2.push(gen("string"))
}

let _his3 = []
for (const i of range(0, initial_order * 5)) {
  _his3.push(gen("boolean"))
}
const default_schema = [
  { key: "name", type: "string" },
  { key: "age", type: "number" },
  { key: "married", type: "boolean" },
]
let _his4 = []
for (const i of range(0, initial_order * 5)) {
  _his4.push(gen("object", default_schema))
}

let len = 0
let prev_count = 0
let isDel = false
let last_id = null
let count = 0
const KV = require("lib/KV")
export default function Home() {
  const [getKey, setGetKey] = useState("")
  const [queryType, setQueryType] = useState("single")
  const [result, setResult] = useState(undefined)
  const [auto, setAuto] = useState(false)
  const [store, setStore] = useState("{}")
  const [cols, setCols] = useState([])
  const [indexes, setIndexes] = useState({})
  const [index, setIndex] = useState(null)
  const [newIndex, setNewIndex] = useState("")
  const [col, setCol] = useState(null)
  const [order, setOrder] = useState(initial_order)
  const [schema, setSchema] = useState(default_schema)
  const [currentOrder, setCurrentOrder] = useState(initial_order)
  const [currentType, setCurrentType] = useState("number")
  const [currentSchema, setCurrentSchema] = useState(schema)
  const [data_type, setDataType] = useState("number")
  const [number, setNumber] = useState("")
  const [data, setData] = useState("{}")
  const [bool, setBool] = useState("true")
  const [str, setStr] = useState("")
  const [obj, setObj] = useState("")
  const [update_type, setUpdateType] = useState("create")
  const [options, setOptions] = useState("{}")
  const [his, setHis] = useState([])
  const [limit, setLimit] = useState(5)
  const [updateId, setUpdateId] = useState("")
  const [fields, setFields] = useState("age:asc,name:desc")
  const [field, setField] = useState("")
  const [field_type, setFieldType] = useState("number")
  const [currentFields, setCurrentFields] = useState("age:asc,name:desc")
  const [display, setDisplay] = useState("Box")
  const [initValues, setInitValues] = useState(clone(_his).join(","))
  const [initValuesStr, setInitValuesStr] = useState(clone(_his2).join(","))
  const [initValuesBool, setInitValuesBool] = useState(clone(_his3).join(","))
  const [initValuesObject, setInitValuesObject] = useState(
    map(v => `${v.name},${v.age},${v.married}`)(clone(_his4)).join("\n")
  )
  const [exErr, setExErr] = useState([false, null])
  const reset = async () => {
    if (order < 3) return alert("order must be >= 3")
    setCurrentOrder(order)
    setCurrentType(data_type)
    setCurrentSchema(schema)
    count = 0
    isDel = false
    last_id = null
    prev_count = 0
    const sort_fields =
      data_type === "object" ? map(split(":"))(fields.split(",")) : null
    setCurrentFields(sort_fields)
    const kv = new KV()
    tree = new BPT(order, sort_fields ?? data_type, kv, "", function (stats) {
      if (!isNil(setStore)) setStore(JSON.stringify(this.kv.store))
    })
    const arr =
      data_type === "number"
        ? map(v => v * 1)(initValues.split(","))
        : data_type === "object"
        ? compose(
            map(v => {
              let obj = {}
              let i = 0
              for (let v2 of schema) {
                obj[v2.key] =
                  v2.type === "string"
                    ? v[i]
                    : v2.type === "number"
                    ? v[i] * 1
                    : v[i] === "true"
                i++
              }
              return obj
            }),
            map(split(",")),
            split("\n")
          )(initValuesObject)
        : data_type === "string"
        ? initValuesStr.split(",")
        : initValuesBool.split(",")
    let _err
    ;(async () => {
      for (const n of arr) {
        ;(currentType === "number" && n < 0) ||
        (currentType !== "number" && /^-/.test(n))
          ? (_err = await del(`id:${n * -1}`))
          : (_err = await insert(
              data_type === "boolean"
                ? typeof n === "string"
                  ? n === "true"
                  : n
                : n
            ))
        if (_err[0]) {
          console.log(_err)
          break
        }
      }
    })()
    setStore("{}")
    setHis([])
    _his2 = []
    ids = {}
  }

  const insert = async val => {
    const id = `id:${(++count).toString()}`
    ids[id] = true
    isDel = false
    last_id = id
    await tree.insert(id, val)
    _his2 = append({ val, op: "insert", id }, _his2)
    setHis(_his2)
    const _err = isErr(tree.kv.store, currentOrder, last_id, isDel, prev_count)
    setExErr(_err)
    const [err, where, arrs, _len, _vals] = _err
    prev_count = _len
    len = _len
    return _err
  }

  const delData = async key => {
    const _keys = keys(ids)
    key = isNil(key) ? _keys[Math.floor(Math.random() * _keys.length)] : key
    last_id = key
    const __data = await tree.data(key)
    const _data = __data.val
    const id = key
    const count = (await lf.getItem(`count-${col}`)) ?? 0
    _his2 = append({ val: _data, op: "del", id: key }, _his2)
    setHis(_his2)
    const log = { id: count + 1, op: "delete", key: id }
    await lf.setItem(`log-${col}-${count + 1}`, log)
    await lf.setItem(`count-${col}`, count + 1)
    isDel = true
    const skey = `index.${col}/`
    if (typeof _data === "object") {
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
                  akey += `/${map(v => v.join(":"))(tail(sort_fields)).join(
                    "/"
                  )}`
                }
                if (isNil(indexes[k].items[_md5])) continue
                if (akey === index) {
                  await tree.delete(id, true)
                } else {
                  const ar = sort_fields[0]
                  let prefix = `${ar[0]}/array:${_md5}`
                  const _sort_fields =
                    sort_fields.length === 1
                      ? [["__name__", "asc"]]
                      : tail(sort_fields)
                  if (sort_fields.length > 1) {
                    prefix +=
                      "/" + compose(join("/"), flatten)(tail(sort_fields))
                  }
                  const kv = new KV(skey)
                  const tree = new BPT(5, _sort_fields, kv, prefix, function (
                    stats
                  ) {})
                  await tree.delete(id, true)
                }
              }
            }
          } else {
            const sort_fields = map(v => v.split(":"))(k.split("/"))
            const prefix = `${compose(join("/"), flatten)(sort_fields)}`
            if (k === index) {
              await tree.delete(id, true)
            } else {
              const kv = new KV(skey)
              const tree = new BPT(5, sort_fields, kv, prefix, function (
                stats
              ) {})
              await tree.delete(id, true)
            }
          }
        }
      }
    }
    await idtree.delete(key)
    delete ids[key]
    const _err = isErr(
      idtree.kv.store,
      currentOrder,
      last_id,
      isDel,
      prev_count
    )
    setExErr(_err)
    const [err, where, arrs, _len, _vals] = _err
    prev_count = _len
    len = _len
    setStore(JSON.stringify(tree.kv.store))
    return _err
  }

  const del = async key => {
    if (!isNil(col)) return await delData(key)
    const _keys = keys(ids)
    key = isNil(key) ? _keys[Math.floor(Math.random() * _keys.length)] : key
    last_id = key
    _his2 = append(
      { val: (await tree.data(key)).val, op: "del", id: key },
      _his2
    )
    setHis(_his2)
    isDel = true
    await tree.delete(key)
    delete ids[key]
    const _err = isErr(tree.kv.store, currentOrder, last_id, isDel, prev_count)
    setExErr(_err)
    const [err, where, arrs, _len, _vals] = _err
    prev_count = _len
    len = _len
    return _err
  }

  const go = async () => {
    if (stop) return
    setTimeout(async () => {
      try {
        const _keys = keys(ids)
        let _err
        if (!isNil(col)) {
          _err = await addData()
        } else if (
          _keys.length > 0 &&
          Math.random() < (_keys.length > order * 10 ? 0.8 : 0.2)
        ) {
          _err = await del()
        } else {
          _err = await insert(gen(currentType, currentSchema))
        }
        const [err, where, arrs, len, vals] = _err
        !err ? go() : setAuto(true)
      } catch (e) {
        console.log(e)
      }
    }, 100)
  }

  useEffect(() => {
    if (!init) {
      init = true
      reset()
    }
    ;(async () => setCols((await lf.getItem("cols")) || []))()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!isNil(col)) {
        setExErr([false, null])
        _his2 = []
        const count = (await lf.getItem(`count-${col}`)) ?? 0
        const index_key = `indexes-${col}`
        let _indexes = (await lf.getItem(index_key)) || {}
        setIndex("__name__:asc")
        setCurrentFields([["__name__", "asc"]])
        setCurrentType("object")
        ids = {}
        setCurrentOrder(5)
        const kv = new KV(`index.${col}/`)
        tree = new BPT(5, [["__name__", "asc"]], kv, "__name__/asc", function (
          stats
        ) {
          if (!isNil(setStore) && index === "__name__:asc") {
            setStore(JSON.stringify(this.kv.store))
          }
        })
        idtree = tree
        prev_count = 0
        for (let i = 1; i <= count; i++) {
          const _log = await lf.getItem(`log-${col}-${i}`)
          if (_log.op === "update") continue
          _his2.push({
            val: _log.val,
            op: _log.op === "create" ? "insert" : "del",
            id: _log.key,
          })
        }
        if (isNil(_indexes["__name__:asc"])) {
          for (let i = 1; i <= count; i++) {
            const _log = await lf.getItem(`log-${col}-${i}`)
            if (_log.op === "craete") {
              await tree.insert(_log.key, _log.val, true)
            } else if (_log.op === "update") {
              let _data = await tree.data(_log.id)
              for (let k in _log.val) {
                if (_log.val[k].__op === "del") {
                  delete data[k]
                } else {
                  data[k] = _log.val[k]
                }
              }
              await tree.delete(_log.key, true)
              await tree.insert(_log.key, _log.data, true)
            } else {
              await tree.delete(_log.key, true)
            }
          }
          const key = "__name__:asc"
          _indexes = assoc(key, { order: 5, key }, _indexes)
          setIndexes(_indexes)
        } else {
          setIndexes(_indexes)
          let root = await tree.root()
          await tree.get("count")
          const getNode = async root => {
            let node = await tree.get(root)
            if (node.leaf) {
              for (let v of node.vals) {
                await tree.data(v)
                prev_count += 1
              }
            } else {
              for (let v of node.children) await getNode(v)
            }
          }
          if (!isNil(root)) {
            await getNode(root)
          }
        }
        await lf.setItem(index_key, _indexes)
        setStore(JSON.stringify(tree.kv.store))
        setHis(_his2)
      }
    })()
  }, [col])

  useEffect(() => {
    ;(async () => {
      if (!isNil(index)) {
        const sort_fields = map(v => v.split(":"))(index.split("/"))
        if (index === "__name__:asc") {
          tree = idtree
        } else {
          let key = `index.${col}/`
          let prefix = ""
          let _sort_fields = sort_fields
          if (sort_fields[0][1] === "array") {
            const ar = sort_fields[0]
            prefix += `${ar[0]}/array:${ar[2]}`
            _sort_fields =
              sort_fields.length === 1
                ? [["__name__", "asc"]]
                : tail(sort_fields)
            if (sort_fields.length > 1) {
              prefix += "/" + compose(join("/"), flatten)(tail(sort_fields))
            }
            _sort_fields = concat(_sort_fields, tail(sort_fields))
          } else {
            prefix += compose(join("/"), flatten)(sort_fields)
          }
          const kv = new KV(key)
          tree = new BPT(5, _sort_fields, kv, prefix, function (stats) {
            if (!isNil(setStore)) setStore(JSON.stringify(this.kv.store))
          })
          let root = await tree.root()
          await tree.get("count")
          const getNode = async root => {
            let node = await tree.get(root)
            if (isNil(node)) return null
            if (node.leaf) {
              for (let v of node.vals) {
                await tree.data(v)
              }
            } else {
              for (let v of node.children) await getNode(v)
            }
          }
          if (!isNil(root)) await getNode(root)
        }
        setStore(JSON.stringify(tree?.kv?.store))
        setCurrentFields(sort_fields)
      }
    })()
  }, [index])

  let { nodemap, arrs } = build(store)
  const updateData = async (id, _data) => {
    let old_data = await idtree.data(id)
    if (!isNil(old_data?.val)) {
      let data = clone(old_data.val)
      let dels = []
      let changes = []
      let news = []
      const count = (await lf.getItem(`count-${col}`)) ?? 0
      const log = { id: count + 1, op: "update", val: _data, key: id }
      await lf.setItem(`log-${col}-${count + 1}`, log)
      await lf.setItem(`count-${col}`, count + 1)

      if (typeof _data === "object") {
        let _indexes = clone(indexes)
        // need to check updated array
        for (let k in _data) {
          // new data is array
          if (
            _data[k].__op === "arrayUnion" ||
            _data[k].__op === "arrayRemove" ||
            is(Array, _data[k])
          ) {
            let new_vals = []
            if (_data[k].__op === "arrayUnion") {
              new_vals = map(v => md5(JSON.stringify(v)))(
                concat(data[k], _data[k].__op)
              )
            } else if (_data[k].__op === "arrayUnion") {
              new_vals = map(v => md5(JSON.stringify(v)))(
                without(_data[k].__op, data[k])
              )
            } else {
              new_vals = map(v => md5(JSON.stringify(v)))(_data[k])
            }
            new_vals = uniq(new_vals)
            if (is(Array, data[k])) {
              const old_vals = compose(
                uniq,
                map(v => md5(JSON.stringify(v)))
              )(data[k])
              // both data are arrays => remove old fields and add new fields
              const _add = difference(new_vals, old_vals)
              const _remove = difference(old_vals, new_vals)
              for (let v of _add) news.push(`${k}:array:${v}`)
              for (let v of _remove) dels.push(`${k}:array:${v}`)
            } else {
              // old data isn't array => only add new fields
              for (let v of new_vals) news.push(`${k}:array:${v}`)
            }
          } else if (is(Array, data[k])) {
            // old data is array but new data isn't
            const old_vals = compose(
              uniq,
              map(v => md5(JSON.stringify(v)))
            )(data[k])
            for (let v of old_vals) dels.push(`${k}:array:${v}`)
          }
          if (_data[k].__op === "del") {
            dels.push(k)
            delete data[k]
          } else {
            if (isNil(data[k])) {
              news.push(k)
            } else if (data[k] !== _data[k]) {
              changes.push(k)
            }
            // __op needs to be worked separately => handle this later
            data[k] = _data[k]
          }
        }
        let newkeys = {}
        for (const k of dels) {
          const sp = k.split(":")
          const key = sp[1] === "array" ? k : `${k}:asc`
          const prefix =
            sp[1] === "array" ? `${sp[0]}/${sp[1]}:${sp[2]}` : `${k}/asc`
          newkeys[key] = true
          if (index !== key) {
            const kv = new KV(`index.${col}/`)
            const sort_fields =
              sp[1] === "array" ? [["__name__", "asc"]] : [[k, "asc"]]
            const _tree = new BPT(5, sort_fields, kv, prefix, function (
              stats
            ) {})
            await _tree.delete(id, true)
          } else {
            await tree.delete(id, true)
          }
        }
        await idtree.putData(id, data)
        for (const k of news) {
          const sp = k.split(":")
          const key = sp[1] === "array" ? k : `${k}:asc`
          let prefix =
            sp[1] === "array" ? `${sp[0]}/${sp[1]}:${sp[2]}` : `${k}/asc`
          newkeys[key] = true
          const kv = new KV(`index.${col}/`)
          if (sp[1] === "array") {
            const akey = `${sp[0]}:${sp[1]}`
            if (isNil(_indexes[akey])) _indexes[akey] = { key: akey, items: {} }
            if (isNil(_indexes[akey].items[sp[2]])) {
              _indexes[akey].items[sp[2]] = { key, order: 5 }
            }
            if (index !== k) {
              const sort_fields = map(v => v.split(":"))(k.split("/"))
              let _sort_fields =
                sort_fields.length === 1
                  ? [["__name__", "asc"]]
                  : tail(sort_fields)
              if (sort_fields.length > 1) {
                prefix += "/" + compose(join("/"), flatten)(tail(sort_fields))
              }
              const _tree = new BPT(5, sort_fields, kv, prefix, function (
                stats
              ) {})
              await _tree.insert(id, _data, true)
            } else {
              await tree.insert(id, _data, true)
            }
          } else {
            if (isNil(_indexes[key])) _indexes[key] = { order: 5, key }
            if (index !== key) {
              const sort_fields = [[k, "asc"]]
              const _tree = new BPT(5, sort_fields, kv, prefix, function (
                stats
              ) {})
              await _tree.insert(id, _data, true)
            } else {
              await tree.insert(id, _data, true)
            }
          }
        }
        await lf.setItem(`indexes-${col}`, _indexes)
        setIndexes(_indexes)
        const fields = keys(data)
        const old_fields = keys(old_data.val)
        for (const k in _indexes) {
          if (isNil(newkeys[k])) {
            // not updated yet
            const sort_fields = map(v => v.split(":"))(k.split("/"))
            const i_fields = compose(
              without(["__name__"]),
              map(v => v.split(":")[0])
            )(k.split("/"))
            const kv = new KV(`index.${col}/`)
            if (i_fields.length > 1) {
              // if array we need a separate check
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
                    isAdd && isDel
                      ? "change"
                      : isAdd
                      ? "add"
                      : isDel
                      ? "del"
                      : "same"
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
                    new BPT(
                      5,
                      tail(sort_fields),
                      kv,
                      getPrefix(v),
                      function () {}
                    )
                  for (let v of _add) {
                    const akey = getKey(v)
                    await ins(akey === index ? tree : getTree(v))
                    if (isNil(_indexes[k].items[v])) {
                      _indexes[k].items[v] = { key: akey, order: 5 }
                    }
                  }
                  for (let v of _del)
                    await del(getKey(v) === index ? tree : getTree(v))
                  for (let v of _change) {
                    const _tree = getKey(v) === index ? tree : getTree(v)
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
                  if (k === index) {
                    await tree.delete(id, true)
                  } else {
                    const tree = new BPT(5, sort_fields, kv, prefix, function (
                      stats
                    ) {})
                    await tree.delete(id, true)
                  }
                }
                if (isAdd) {
                  const sort_fields = map(v => v.split(":"))(k.split("/"))
                  const prefix = `${compose(join("/"), flatten)(sort_fields)}`
                  if (k === index) {
                    await tree.insert(id, _data, true)
                  } else {
                    const tree = new BPT(5, sort_fields, kv, prefix, function (
                      stats
                    ) {})
                    await tree.insert(id, _data, true)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const addRandomData = async () => {
    let obj = {}
    for (let v of currentSchema) {
      if (Math.random() < 0.5) continue
      if (v.type === "string") {
        obj[v.key] = gen("string")
      } else if (v.type === "number") {
        obj[v.key] = gen("number")
      } else {
        obj[v.key] = gen("boolean")
      }
    }
    await addData(JSON.stringify(obj))
  }

  const addData = async data => {
    let _data = null
    isDel = false
    try {
      eval(`_data = ${data}`)
    } catch (e) {
      alert("data couldn't parse")
      return
    }
    if (typeof _data !== "object") {
      alert("data must be an object")
      return
    }
    if (update_type === "update") {
      await updateData(updateId, _data)
      return
    }
    const count = (await lf.getItem(`count-${col}`)) ?? 0
    const id = nanoid()
    last_id = id
    const log = { id: count + 1, op: "create", val: _data, key: id }
    await lf.setItem(`log-${col}-${count + 1}`, log)
    await lf.setItem(`count-${col}`, count + 1)
    await idtree.insert(id, _data)
    const _err = isErr(
      idtree.kv.store,
      currentOrder,
      last_id,
      isDel,
      prev_count
    )
    setExErr(_err)
    const [err, where, arrs, _len, _vals] = _err
    prev_count = _len
    len = _len
    setData("{}")
    _his2 = append({ val: _data, op: "insert", id }, _his2)
    setHis(_his2)
    if (typeof _data === "object") {
      let _indexes = clone(indexes)
      for (const k in _data) {
        const key = `${k}:asc`
        if (isNil(indexes[key])) _indexes[key] = { order: 5, key }
        if (key === index) {
          await tree.insert(id, _data, true)
        } else {
          const kv = new KV(`index.${col}/`)
          const _tree = new BPT(5, [[k, "asc"]], kv, `${k}/asc`, function (
            stats
          ) {})
          await _tree.insert(id, _data, true)
        }
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
            if (key === index) {
              await tree.insert(id, _data, true)
            } else {
              const kv = new KV(`index.${col}/`)
              const _tree = new BPT(
                5,
                [["__name__", "asc"]],
                kv,
                `${k}/array:${md5(JSON.stringify(v))}`,
                function (stats) {}
              )
              await _tree.insert(id, _data, true)
            }
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
          const skey = `index.${col}/`
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
              let _tree = null
              if (akey === index) {
                _tree = tree
              } else {
                const kv = new KV(`index.${col}/`)
                _tree = new BPT(5, tail(sort_fields), kv, key, function (
                  stats
                ) {})
                if (isNil(_indexes[k].items[_md5])) {
                  _indexes[k].items[_md5] = { order: 5, key: akey }
                }
              }
              await _tree.insert(id, _data, true)
            }
          } else {
            const prefix = `${compose(join("/"), flatten)(sort_fields)}`
            if (k === index) {
              await tree.insert(id, _data, true)
            } else {
              const kv = new KV(skey)
              const tree = new BPT(5, sort_fields, kv, prefix, function (
                stats
              ) {})
              await tree.insert(id, _data, true)
            }
          }
        }
      }
      await lf.setItem(`indexes-${col}`, _indexes)
      setIndexes(_indexes)
    }
    setStore(JSON.stringify(tree.kv.store))
    return _err
  }
  const addNumber = async () => {
    if (number !== "") {
      await insert(number * 1)
      setNumber("")
      setTimeout(() => {
        document.getElementById("number").focus()
      }, 100)
    }
  }
  const addBool = async () => await insert(bool)
  const addString = async () => {
    if (str !== "") {
      await insert(str)
      setStr("")
      setTimeout(() => {
        document.getElementById("number").focus()
      }, 100)
    }
  }
  const addObject = async () => {
    const sp = obj.split(",")
    let _obj = {}
    let i = 0
    for (let v2 of schema) {
      _obj[v2.key] =
        v2.type === "string"
          ? sp[i]
          : v2.type === "number"
          ? sp[i] * 1
          : sp[i] === "true"
      i++
    }
    await insert(_obj)
    setObj("")
    setTimeout(() => {
      document.getElementById("number").focus()
    }, 100)
  }
  const [err, where] = exErr
  const _indexes = []
  for (let k in indexes) _indexes.push(indexes[k])

  return (
    <ChakraProvider>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
      <Box
        height="100%"
        w="250px"
        px={3}
        py={2}
        bg="#eee"
        fontSize="12px"
        sx={{ overflowY: "auto" }}
      >
        <Flex align="center" direction="column">
          <Box>WeaveDB</Box>
          <Box>B+ Tree Index Engine</Box>
        </Flex>
        <Box as="hr" my={3} />
        <Box flex={1}>
          <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
            Collections
          </Flex>
          <Flex mx={2} mb={2}>
            <Flex
              flex={1}
              align="center"
              p={1}
              justify="center"
              bg="#666"
              color="white"
              onClick={async () => {
                const _cols = append(nanoid(), cols)
                setCols(_cols)
                await lf.setItem("cols", _cols)
              }}
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              Add Collection
            </Flex>
          </Flex>
        </Box>
        <Box px={3}>
          {map(v => (
            <Flex color={col === v ? "#6441AF" : "#666"}>
              <Box
                flex={1}
                onClick={() => setCol(v)}
                sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
              >
                {v ?? "not selected"}
              </Box>
              {v === null ? null : (
                <Box
                  onClick={async () => {
                    const _cols = without([v], cols)
                    setCols(_cols)
                    await lf.setItem("cols", _cols)
                    if (v === col) setCol(null)
                  }}
                  sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                >
                  x
                </Box>
              )}
            </Flex>
          ))(prepend(null, cols))}
        </Box>
        {isNil(col) ? null : (
          <>
            <Box as="hr" my={3} />
            <Box flex={1}>
              <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
                Indexes
              </Flex>
              <Box px={3}>
                {map(v => {
                  return !isNil(v.items) ? (
                    <>
                      <Flex color={index === v.key ? "#6441AF" : "#666"}>
                        <Box
                          flex={1}
                          color="#999"
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                        >
                          {v.key}
                        </Box>
                      </Flex>
                      {compose(
                        map(v2 => {
                          return (
                            <Flex color={index === v2.key ? "#6441AF" : "#666"}>
                              <Box
                                px={2}
                                flex={1}
                                onClick={() => setIndex(v2.key)}
                                sx={{
                                  cursor: "pointer",
                                  ":hover": { opacity: 0.75 },
                                  overflowX: "hidden",
                                }}
                              >
                                {v2.key.slice(0, 23)}...
                              </Box>
                              {v2 === null ? null : (
                                <Box
                                  onClick={async () => {
                                    console.log(v2)
                                  }}
                                  sx={{
                                    cursor: "pointer",
                                    ":hover": { opacity: 0.75 },
                                  }}
                                >
                                  x
                                </Box>
                              )}
                            </Flex>
                          )
                        }),
                        values
                      )(v.items)}
                    </>
                  ) : (
                    <Flex color={index === v.key ? "#6441AF" : "#666"}>
                      <Box
                        flex={1}
                        onClick={() => setIndex(v.key)}
                        sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                      >
                        {v.key}
                      </Box>
                      {v === null ? null : (
                        <Box
                          onClick={async () => {
                            console.log(v)
                          }}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                        >
                          x
                        </Box>
                      )}
                    </Flex>
                  )
                })(_indexes)}
              </Box>
              <Flex mt={2} px={2}>
                <Input
                  onChange={e => setNewIndex(e.target.value)}
                  placeholder="Index"
                  value={newIndex}
                  height="auto"
                  flex={1}
                  bg="white"
                  fontSize="12px"
                  py={1}
                  px={3}
                  sx={{ borderRadius: "3px 0 0 3px" }}
                />
                <Flex
                  width="80px"
                  align="center"
                  p={1}
                  justify="center"
                  bg="#666"
                  color="white"
                  onClick={async () => {
                    const sort_fields = map(v => {
                      const ind = v.split(":")
                      const ord = ind.length < 2 ? "desc" : ind[1]
                      return [ind[0], ord]
                    })(newIndex.split("/"))
                    let i = 0
                    for (let v of sort_fields) {
                      if (v[1] === "array") {
                        if (i !== 0) {
                          alert("array index should come first")
                          return
                        }
                      } else if (!includes(v[1], ["asc", "desc"])) {
                        alert("sort order should be either asc or desc")
                        return
                      }
                      i++
                    }
                    if (sort_fields.length <= 1) {
                      alert("You can only add multi-field indexes")
                      return
                    }
                    const index_key = `indexes-${col}`
                    let __indexes = (await lf.getItem(index_key)) || {}
                    if (!isNil(__indexes[newIndex])) return alert("exists")
                    const count = (await lf.getItem(`count-${col}`)) ?? 0
                    let docs = {}
                    for (let i = 1; i <= count; i++) {
                      // need to handle updates...
                      const _log = await lf.getItem(`log-${col}-${i}`)
                      if (_log.op === "create") {
                        docs[_log.key] = true
                      } else if (_log.op === "del") {
                        delete docs[_log.key]
                      }
                    }
                    const i_fields = compose(
                      without(["__name__"]),
                      map(v => v.split(":")[0])
                    )(newIndex.split("/"))
                    const skey = `index.${col}/`
                    if (sort_fields[0][1] === "array") {
                      let array_indexes = {}
                      let kvs = {}
                      for (let k in docs) {
                        let _data = await idtree.data(k)
                        const fields = keys(_data.val)
                        const diff = difference(i_fields, fields)
                        if (
                          i_fields.length > 0 &&
                          diff.length === 0 &&
                          is(Array, _data.val[i_fields[0]])
                        ) {
                          for (const v of _data.val[i_fields[0]]) {
                            const prefix = `${compose(
                              join("/"),
                              flatten
                            )(tail(sort_fields))}`
                            const _md5 = md5(JSON.stringify(v))
                            const _prefix = `${sort_fields[0][0]}/array:${_md5}`
                            const key = `${_prefix}/${prefix}`
                            let _tree = null
                            const akey = `${
                              sort_fields[0][0]
                            }:array:${_md5}/${map(v => v.join(":"))(
                              tail(sort_fields)
                            ).join("/")}`
                            if (isNil(kvs[_md5])) {
                              array_indexes[_md5] = { order: 5, key: akey }
                              const kv = new KV(`index.${col}/`)
                              _tree = new BPT(
                                5,
                                tail(sort_fields),
                                kv,
                                key,
                                function (stats) {}
                              )
                            } else {
                              _tree = kvs[_md5]
                            }
                            await _tree.insert(k, _data.val, true)
                          }
                        }
                      }
                      __indexes[newIndex] = {
                        key: newIndex,
                        items: array_indexes,
                      }
                    } else {
                      __indexes[newIndex] = { order: 5, key: newIndex }
                      const prefix = `${compose(
                        join("/"),
                        flatten
                      )(sort_fields)}`
                      const kv = new KV(skey)
                      const tree = new BPT(
                        5,
                        sort_fields,
                        kv,
                        prefix,
                        function (stats) {}
                      )
                      for (let k in docs) {
                        let _data = await idtree.data(k)
                        const fields = keys(_data.val)
                        const diff = difference(i_fields, fields)
                        if (i_fields.length > 0 && diff.length === 0) {
                          await tree.insert(k, _data.val, true)
                        }
                      }
                    }
                    setIndexes(__indexes)
                    await lf.setItem(index_key, __indexes)
                  }}
                  sx={{
                    borderRadius: "0 3px 3px 0",
                    cursor: "pointer",
                    ":hover": { opacity: 0.75 },
                  }}
                >
                  Add
                </Flex>
              </Flex>
            </Box>
          </>
        )}
        {!isNil(col) ? null : (
          <>
            <Box as="hr" my={3} />
            <Flex>
              <Box flex={1}>
                <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
                  Data Type
                </Flex>
                <Flex mx={2} mb={2}>
                  <Select
                    onChange={e => setDataType(e.target.value)}
                    value={data_type}
                    bg="white"
                    fontSize="12px"
                    height="28px"
                    sx={{ borderRadius: "3px" }}
                  >
                    {map(v => <option value={v}>{v}</option>)([
                      "number",
                      "string",
                      "boolean",
                      "object",
                    ])}
                  </Select>
                </Flex>
              </Box>
              <Box flex={1}>
                <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
                  Order
                </Flex>
                <Flex mx={2} mb={2}>
                  <Input
                    onChange={e => {
                      const ord = e.target.value * 1
                      if (!isNaN(ord)) setOrder(ord)
                    }}
                    placeholder="Order"
                    value={order}
                    height="auto"
                    flex={1}
                    bg="white"
                    fontSize="12px"
                    py={1}
                    px={3}
                    sx={{ borderRadius: "3px 0 0 3px" }}
                  />
                </Flex>
              </Box>
            </Flex>
            {data_type !== "object" ? null : (
              <Box fontSize="10px">
                <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
                  Schema
                </Flex>
                <Flex mx={2}>
                  <Input
                    onChange={e => setField(e.target.value)}
                    placeholder="name"
                    value={field}
                    height="auto"
                    flex={1}
                    bg="white"
                    fontSize="12px"
                    py={1}
                    px={3}
                    sx={{ borderRadius: "3px 0 0 3px" }}
                  />
                  <Select
                    onChange={e => {
                      setFieldType(e.target.value)
                    }}
                    value={field_type}
                    height="28px"
                    width="100px"
                    bg="white"
                    fontSize="12px"
                    sx={{ borderRadius: "0" }}
                  >
                    {map(v => <option value={v}>{v}</option>)([
                      "number",
                      "string",
                      "boolean",
                    ])}
                  </Select>
                  <Flex
                    width="30px"
                    align="center"
                    p={1}
                    justify="center"
                    bg="#666"
                    color="white"
                    onClick={async () => {
                      if (!/^\s*$/.test(field)) {
                        setField("")
                        setSchema(
                          compose(
                            append({ key: field, type: field_type }),
                            reject(propEq(field, "key"))
                          )(schema)
                        )
                      }
                    }}
                    sx={{
                      borderRadius: "0 3px 3px 0",
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                  >
                    +
                  </Flex>
                </Flex>
                <Box mx={3} my={2}>
                  {map(v => {
                    return (
                      <Flex align="center" my={1}>
                        <Flex flex={1}>{v.key}</Flex>
                        <Flex flex={1}>{v.type}</Flex>
                        <Flex
                          onClick={() => {
                            setSchema(reject(propEq(v.key, "key"))(schema))
                          }}
                          sx={{
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          color="#6441AF"
                        >
                          Remove
                        </Flex>
                      </Flex>
                    )
                  })(schema)}
                </Box>
              </Box>
            )}
            <Flex mx={2} color="#666" mb={1} fontSize="10px">
              <Box>
                Initial Values (
                {currentType === "object" ? "csv" : "comma separeted"})
              </Box>
            </Flex>
            <Flex mx={2} mb={2}>
              {data_type === "boolean" ? (
                <Input
                  onChange={e => setInitValuesBool(e.target.value)}
                  placeholder="Order"
                  value={initValuesBool}
                  height="auto"
                  flex={1}
                  bg="white"
                  fontSize="12px"
                  py={1}
                  px={3}
                  sx={{ borderRadius: "3px 0 0 3px" }}
                />
              ) : data_type === "string" ? (
                <Input
                  onChange={e => setInitValuesStr(e.target.value)}
                  placeholder="Order"
                  value={initValuesStr}
                  height="auto"
                  flex={1}
                  bg="white"
                  fontSize="12px"
                  py={1}
                  px={3}
                  sx={{ borderRadius: "3px 0 0 3px" }}
                />
              ) : data_type === "object" ? (
                <Textarea
                  onChange={e => setInitValuesObject(e.target.value)}
                  placeholder="Order"
                  value={initValuesObject}
                  height="auto"
                  flex={1}
                  bg="white"
                  fontSize="12px"
                  py={1}
                  px={3}
                  sx={{ borderRadius: "3px 0 0 3px" }}
                />
              ) : (
                <Input
                  onChange={e => setInitValues(e.target.value)}
                  placeholder="Order"
                  value={initValues}
                  height="auto"
                  flex={1}
                  bg="white"
                  fontSize="12px"
                  py={1}
                  px={3}
                  sx={{ borderRadius: "3px 0 0 3px" }}
                />
              )}
            </Flex>
            {data_type === "object" ? (
              <>
                <Flex mx={2} color="#666" mb={1} fontSize="10px">
                  <Box>Sort Fields (e.g. age=asc,name=desc)</Box>
                </Flex>
                <Flex mx={2} mb={2}>
                  <Input
                    onChange={e => setFields(e.target.value)}
                    placeholder="Order"
                    value={fields}
                    height="auto"
                    flex={1}
                    bg="white"
                    fontSize="12px"
                    py={1}
                    px={3}
                    sx={{ borderRadius: "3px 0 0 3px" }}
                  />
                </Flex>
              </>
            ) : null}
            <Flex
              align="center"
              p={1}
              mx={2}
              justify="center"
              bg="#666"
              color="white"
              onClick={async () => {
                reset()
              }}
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              Reset
            </Flex>
          </>
        )}
        <Box as="hr" my={3} />
        <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
          {map(v => (
            <Box
              mr={2}
              sx={{ cursor: "pointer" }}
              color={v.key === update_type ? "#6441AF" : "#333"}
              onClick={() => setUpdateType(v.key)}
            >
              {v.key}
            </Box>
          ))([{ key: "create" }, { key: "update" }])}
        </Flex>
        {update_type !== "update" ? null : (
          <Flex mx={2} mb={2}>
            <Input
              height="auto"
              py={1}
              px={3}
              bg="white"
              fontSize="12px"
              placeholder="docid"
              sx={{ borderRadius: "3px 0 0 3px" }}
              value={updateId}
              onChange={e => setUpdateId(e.target.value)}
            />
          </Flex>
        )}
        <Flex mx={2} mb={2}>
          {!isNil(col) || currentType !== "boolean" ? (
            <Input
              onChange={e => {
                if (!isNil(col)) {
                  setData(e.target.value)
                } else if (currentType === "number") {
                  const num = e.target.value * 1
                  if (!isNaN(num)) setNumber(num)
                } else if (currentType === "string") {
                  setStr(e.target.value)
                } else {
                  setObj(e.target.value)
                }
              }}
              placeholder={
                !isNil(col)
                  ? "data"
                  : currentType === "object"
                  ? pluck("type")(schema).join(",")
                  : currentType
              }
              value={
                !isNil(col)
                  ? data
                  : currentType === "number"
                  ? number
                  : currentType === "string"
                  ? str
                  : obj
              }
              height="auto"
              flex={1}
              bg="white"
              fontSize="12px"
              id="number"
              py={1}
              px={3}
              sx={{ borderRadius: "3px 0 0 3px" }}
              onKeyDown={async e => {
                if (e.code === "Enter") {
                  !isNil(col)
                    ? addData(data)
                    : currentType === "number"
                    ? addNumber()
                    : currentType === "string"
                    ? addString()
                    : addObject()
                }
              }}
            />
          ) : (
            <Select
              onChange={e => {
                setBool(e.target.value)
              }}
              value={bool}
              height="28px"
              flex={1}
              bg="white"
              fontSize="12px"
              sx={{ borderRadius: "3px 0 0 3px" }}
            >
              <option value={"true"}>True</option>
              <option value={"false"}>False</option>
            </Select>
          )}
          <Flex
            width="80px"
            align="center"
            p={1}
            justify="center"
            bg="#666"
            color="white"
            onClick={async () => {
              if (err) return
              !isNil(col)
                ? addData(data)
                : currentType === "number"
                ? addNumber()
                : currentType === "string"
                ? addString()
                : currentType === "boolean"
                ? addBool()
                : addObject()
            }}
            sx={{
              borderRadius: "0 3px 3px 0",
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            {update_type === "update" ? "Update" : "Add"}
          </Flex>
        </Flex>
        {!isNil(col) && update_type === "update" ? null : (
          <Flex
            m={2}
            p={1}
            justify="center"
            bg="#666"
            color="white"
            onClick={async () => {
              if (err) return
              if (!isNil(col)) {
                await addRandomData()
              } else {
                const num = gen(currentType, currentSchema)
                await insert(num)
              }
            }}
            sx={{
              borderRadius: "3px",
              cursor: "pointer",
              ":hover": { opacity: 0.75 },
            }}
          >
            Add Random Value
          </Flex>
        )}
        <Box as="hr" my={3} />
        <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
          Auto Test
        </Flex>
        <Flex
          m={2}
          p={1}
          justify="center"
          bg="#6441AF"
          color="white"
          onClick={async () => {
            stop = auto
            if (!stop) go()
            setAuto(!auto)
          }}
          sx={{
            borderRadius: "3px",
            cursor: "pointer",
            ":hover": { opacity: 0.75 },
          }}
        >
          {!auto ? "Run" : "Stop"}
        </Flex>
        <Box as="hr" my={3} />
        <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
          Health Check
        </Flex>
        <Box mx={2} color={err ? "salmon" : "#6441AF"}>
          {err ? (
            <Box>
              Error!
              <Box mx={2} as="span" sx={{ textDecoration: "underline" }}>
                {where.id}
              </Box>
              <Box mx={2} as="span" sx={{ textDecoration: "underline" }}>
                {where.type}
              </Box>
              [ {typeof where === "string" ? where : where.arr.join(", ")} ]
            </Box>
          ) : (
            "Fine!"
          )}
        </Box>
        <Box as="hr" my={3} />
        <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
          <Box mr={3}>Query</Box>
          <Flex>
            {map(v => (
              <Box
                mx={1}
                onClick={() => setQueryType(v)}
                color={queryType === v ? "#6441AF" : "#333"}
                sx={{
                  textDecoration: queryType === v ? "underline" : "none",
                  cursor: "pointer",
                }}
              >
                {v}
              </Box>
            ))(["single", "multi"])}
          </Flex>
        </Flex>
        {queryType === "multi" ? (
          <>
            <Flex>
              <Box flex={1}>
                <Flex mx={2} mt={2} color="#666" mb={1} fontSize="10px">
                  Options (JSON) - limit, where, sort
                </Flex>
                <Flex mx={2} mb={2}>
                  <Input
                    onChange={e => {
                      setOptions(e.target.value)
                    }}
                    placeholder="Options"
                    value={options}
                    height="auto"
                    flex={1}
                    bg="white"
                    fontSize="12px"
                    py={1}
                    px={3}
                    sx={{ borderRadius: "3px 0 0 3px" }}
                  />
                </Flex>
              </Box>
            </Flex>
            <Flex
              mx={2}
              align="center"
              p={1}
              justify="center"
              bg="#666"
              color="white"
              onClick={async () => {
                let opt = null
                try {
                  eval(`opt = ${options}`)
                } catch (e) {
                  alert("options couldn't parse")
                  return
                }
                setResult(await tree.range(opt))
              }}
              mt={2}
              sx={{
                borderRadius: "3px",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              Get
            </Flex>
          </>
        ) : (
          <Flex mx={2} mb={2}>
            <Input
              onChange={e => setGetKey(e.target.value)}
              placeholder="doc id"
              value={getKey}
              height="auto"
              flex={1}
              bg="white"
              fontSize="12px"
              id="number"
              py={1}
              px={3}
              sx={{ borderRadius: "3px 0 0 3px" }}
            />
            <Flex
              width="80px"
              align="center"
              p={1}
              justify="center"
              bg="#666"
              color="white"
              onClick={async () => {
                if (!/^\s*$/.test(getKey)) {
                  setResult(await tree.read(getKey))
                }
              }}
              sx={{
                borderRadius: "0 3px 3px 0",
                cursor: "pointer",
                ":hover": { opacity: 0.75 },
              }}
            >
              Get
            </Flex>
          </Flex>
        )}
        {isNil(result) ? null : (
          <Box m={3} color={result.val === null ? "salmon" : "#6441AF"}>
            {JSON.stringify(result)}
          </Box>
        )}
      </Box>
      <Flex
        minH="100%"
        direction="column"
        minW="calc(100vw - 250px)"
        sx={{ position: "absolute", top: 0, left: "250px" }}
      >
        <Box flex={1} p={4}>
          <Box>
            {addIndex(map)((v, i) => (
              <Flex justify="center" fontSize="10px">
                {map(v2 => {
                  return (
                    <Flex
                      m={1}
                      direction="column"
                      p={1}
                      bg="#ccc"
                      sx={{ borderRadius: "3px" }}
                    >
                      <Flex justify="center" fontSize="8px" mb={1}>
                        {v2.parent || "root"}
                      </Flex>
                      <Flex justify="center" align="center">
                        <Box
                          fontSize="8px"
                          ml={1}
                          mr={2}
                          minW="9px"
                          align="center"
                        >
                          {v2.prev ?? "-"}
                        </Box>
                        {addIndex(map)((v3, i3) => {
                          let v3val = v3.val ?? v3.child
                          let val = includes(typeof v3val, ["number", "string"])
                            ? v3val
                            : typeof v3val === "boolean"
                            ? v3val
                              ? "true"
                              : "false"
                            : typeof v3val === "object"
                            ? compose(
                                join(":"),
                                map(v4 => {
                                  return v4[0] === "__name__"
                                    ? typeof v3.key === "object"
                                      ? v3.key.__name__
                                      : v3.key
                                    : v3val[v4[0]]
                                })
                              )(currentFields || [])
                            : v3.key
                          return (
                            <Flex
                              px={1}
                              justify="center"
                              bg={
                                !isNil(v3.val)
                                  ? v2.leaf
                                    ? "#bbb"
                                    : "#ddd"
                                  : "white"
                              }
                              sx={{
                                borderY: "1px solid #333",
                                borderRight: "1px solid #333",
                                borderLeft: i3 === 0 ? "1px solid #333" : "",
                                cursor:
                                  i === arrs.length - 1 ? "pointer" : "default",
                                ":hover": { opacity: 0.75 },
                                whiteSpace: "nowrap",
                              }}
                              title={
                                typeof v3.key === "object"
                                  ? v3.key.__name__
                                  : v3.key ?? null
                              }
                              onClick={async () => {
                                if (err) return
                                if (i !== arrs.length - 1) return
                                if (!isNil(v3.key)) await del(v3.key)
                              }}
                            >
                              {val}
                            </Flex>
                          )
                        })(v2.arr)}
                        <Box
                          fontSize="8px"
                          mr={1}
                          ml={2}
                          minW="9px"
                          align="center"
                        >
                          {v2.next ?? "-"}
                        </Box>
                      </Flex>
                      <Flex
                        justify="center"
                        fontSize="8px"
                        mt={1}
                        sx={{ textDecoration: "underline" }}
                      >
                        {v2.id}
                      </Flex>
                    </Flex>
                  )
                })(v)}
              </Flex>
            ))(arrs)}
          </Box>
        </Box>
        <Flex
          p={4}
          fontSize="10px"
          mt={3}
          sx={{ borderTop: "1px solid #eee" }}
          direction="column"
          color="#333"
        >
          <Flex mb={2}>
            <Box px={4} bg="#ddd" sx={{ borderRadius: "3px" }}>
              History
            </Box>
            <Box mx={3}>
              {map(v => (
                <Box
                  mx={1}
                  as="span"
                  color={display === v ? "#6441AF" : "#333"}
                  sx={{
                    textDecoration: display === v ? "underline" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setDisplay(v)}
                >
                  {v}
                </Box>
              ))(["Box", "JSON"])}
            </Box>
          </Flex>
          <Flex
            wrap="wrap"
            fontSize={display === "JSON" ? "10px" : "8px"}
            justify="flex-start"
            w="100%"
          >
            {display === "JSON"
              ? `[ ${map(
                  v =>
                    `${
                      v.op === "del"
                        ? `-${v.id.split(":")[1]}`
                        : currentType === "object"
                        ? compose(
                            join(":"),
                            map(v4 => JSON.stringify(v.val))
                          )(currentFields || [])
                        : v.val
                    }`
                )(his).join(", ")} ]`
              : map(v => (
                  <Flex
                    onClick={() => setUpdateId(v.id)}
                    title={v.id}
                    justify="center"
                    align="center"
                    minW="16px"
                    minH="16px"
                    m={1}
                    p={1}
                    as="span"
                    color="white"
                    bg={v.op === "del" ? "salmon" : "#6441AF"}
                    sx={{
                      cursor: "pointer",
                      ":hover": { opacity: 0.75 },
                      borderRadius: "3px",
                      wordBreak: "break-all",
                    }}
                  >
                    {typeof v.val === "boolean"
                      ? v.val
                        ? "true"
                        : "false"
                      : typeof v.val === "object"
                      ? compose(
                          join(":"),
                          map(v4 =>
                            v4[0] === "__name__" ? v.id : v.val[v4[0]] ?? "-"
                          )
                        )(currentFields || [])
                      : v.val ?? v.id}
                  </Flex>
                ))(his)}
          </Flex>
        </Flex>
      </Flex>
    </ChakraProvider>
  )
}
