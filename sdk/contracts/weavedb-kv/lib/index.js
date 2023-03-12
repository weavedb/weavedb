const {
  includes,
  without,
  split,
  splitEvery,
  init,
  join,
  intersection,
  uniq,
  concat,
  pluck,
  indexOf,
  slice,
  findIndex,
  append,
  clone,
  keys,
  reverse,
  map,
  isNil,
  range,
  values,
  descend,
  ascend,
  compose,
  prop,
  hasPath,
  filter,
  none,
  difference,
  equals,
} = require("ramda")

const comp = (val, x) => {
  let res = 0
  for (let i of range(0, val.length)) {
    let a = val[i].val
    let b = x[i]
    if (val[i].desc) {
      a = x[i]
      b = val[i].val
    }
    if (a > b) {
      res = -1
      break
    } else if (a < b) {
      res = 1
      break
    }
  }
  return res
}

const bsearch = async function (
  arr,
  x,
  k,
  db,
  start = 0,
  end = arr.length - 1
) {
  if (start > end) return null
  const mid = Math.floor((start + end) / 2)
  const val = isNil(k) ? arr[mid] : (await db(arr[mid])).__data[k]
  if (val === x) return mid
  if (val > x && mid === 0) return 0
  if (
    mid !== 0 &&
    val > x &&
    (isNil(k) ? arr[mid - 1] : (await db(arr[mid - 1])).__data[k]) <= x
  ) {
    return mid
  }
  if (val > x) {
    return await bsearch(arr, x, k, db, start, mid - 1)
  } else {
    return await bsearch(arr, x, k, db, mid + 1, end)
  }
}

const bsearch2 = async function (
  arr,
  x,
  sort,
  db,
  start = 0,
  end = arr.length - 1
) {
  if (start > end) return null
  let mid = Math.floor((start + end) / 2)
  const val = await Promise.all(
    map(async v => ({
      desc: v[1] === "desc",
      val: isNil(v[0]) ? arr[mid] : (await db(arr[mid])).__data[v[0]],
    }))(sort)
  )
  const res = comp(val, x)
  if (res === 0) return mid
  if (res === -1 && mid === 0) return 0
  if (mid > 0) {
    const val2 = await Promise.all(
      map(async v => ({
        desc: v[1] === "desc",
        val: isNil(v[0]) ? arr[mid - 1] : (await db(arr[mid - 1])).__data[v[0]],
      }))(sort)
    )
    const res2 = comp(val2, x)
    if (res === -1 && res2 >= 0) return mid
  }
  if (res === -1) {
    return await bsearch2(arr, x, sort, db, start, mid - 1)
  } else {
    return await bsearch2(arr, x, sort, db, mid + 1, end)
  }
}

const addSingleIndex = async (_id, k, data, db, path, SmartWeave) => {
  const _k = k || "__id__"
  const key = getKey(path, [[_k]])
  let ind = (await SmartWeave.kv.get(key)) || []
  const _ind = await bsearch(ind, isNil(k) ? _id : data[k], k, db)
  if (isNil(_ind)) ind.push(_id)
  else ind.splice(_ind, 0, _id)
  await SmartWeave.kv.put(key, ind)
}

const removeSingleIndex = async (_id, k, path, SmartWeave) => {
  const _k = k || "__id__"
  const key = getKey(path, [[_k]])
  let ind = (await SmartWeave.kv.get(key)) || []
  const _ind = indexOf(_id, ind)
  if (!isNil(_ind)) ind.splice(_ind, 1)
  await SmartWeave.kv.put(key, ind)
}

const addInd = async (_id, index, db, sort, data) => {
  const x = map(v => data[v[0]])(sort)
  const _ind = await bsearch2(index, x, sort, db)
  if (isNil(_ind)) index.push(_id)
  else index.splice(_ind, 0, _id)
}

const removeInd = (_id, index) => {
  const _ind = indexOf(_id, index)
  if (!isNil(_ind)) index.splice(_ind, 1)
}

const _addData = async (_keys, _id, _sort = [], db, data, path, SmartWeave) => {
  for (let k of _keys) {
    if (k === "__id__/asc") continue
    const key = `index.${path.join("/")}//${k}`
    let ind = await SmartWeave.kv.get(key)
    if (!isNil(ind) && k.split("/").length >= 4) {
      const sort = splitEvery(2, k.split("/"))
      const fields = map(prop(0), sort)
      if (difference(fields, keys(data)).length === 0) {
        await addInd(_id, ind, db, sort, data)
        await SmartWeave.kv.put(key, ind)
      }
    }
  }
}

const getKey = (path, sort = []) =>
  `index.${path.join("/")}//${compose(
    join("/"),
    map(v => `${v[0]}/${v[1] || "asc"}`)
  )(sort)}`

const getIndex = async (path, SmartWeave) => {
  const key = getKey(path)
  return (await SmartWeave.kv.get(key)) || []
}

const getInventory = async (path, SmartWeave) => {
  return (await SmartWeave.kv.get(getKey(path))) || []
}

const addData = async (_id, data, db, path, SmartWeave) => {
  const _add = async k => {
    const key = getKey(path, [[k || "__id__"]])
    let _ind = await SmartWeave.kv.get(key)
    if (isNil(_ind)) {
      await SmartWeave.kv.put(key, [_id])
      await addToInventory([[k || "__id__"]], path, SmartWeave)
    } else {
      await addSingleIndex(_id, k, data, db, path, SmartWeave)
    }
  }
  await _add(null)
  for (let k in data) {
    if (k === "__id__") continue
    await _add(k)
  }
  let keys = await getInventory(path, SmartWeave)
  await _addData(keys, _id, [], db, data, path, SmartWeave)
}

const _updateData = async (
  _keys,
  _id,
  _sort = [],
  db,
  update,
  new_data,
  old_data,
  path,
  SmartWeave
) => {
  for (let k of _keys) {
    if (k === "__id__/asc") continue
    const key = `index.${path.join("/")}//${k}`
    let ind = await SmartWeave.kv.get(key)
    if (!isNil(ind) && k.split("/").length >= 4) {
      const sort = splitEvery(2, k.split("/"))
      const fields = map(prop(0), sort)
      let ex_old = false
      let ex_new = false
      if (difference(fields, keys(old_data)).length === 0) ex_old = true
      if (difference(fields, keys(new_data)).length === 0) ex_new = true
      if (ex_old && !ex_new) {
        removeInd(_id, ind)
      } else if (!ex_old && ex_new) {
        await addInd(_id, ind, db, sort, new_data)
      } else if (intersection(update.u, fields).length !== 0) {
        removeInd(_id, ind)
        await addInd(_id, ind, db, sort, new_data)
      }
    }
  }
}

const updateData = async (_id, data, old_data, db, path, SmartWeave) => {
  if (isNil(old_data)) return
  const _keys = compose(uniq, concat(keys(old_data)), keys)(data)
  let c = []
  let d = []
  let u = []
  for (let v of _keys) {
    if (v === "__id__") continue
    if (isNil(data[v])) {
      d.push(v)
      await removeSingleIndex(_id, v, path, SmartWeave)
    } else if (isNil(old_data[v])) {
      c.push(v)
      await addSingleIndex(_id, v, data, db, path, SmartWeave)
    } else if (!equals(data[v], old_data[v])) {
      u.push(v)
      await removeSingleIndex(_id, v, path, SmartWeave)
      await addSingleIndex(_id, v, data, db, path, SmartWeave)
    }
  }
  let __keys = await getInventory(path, SmartWeave)
  await _updateData(
    __keys,
    _id,
    [],
    db,
    { c, d, u },
    data,
    old_data,
    path,
    SmartWeave
  )
}

const _removeData = async (_keys, _id, _sort = [], db, path, SmartWeave) => {
  for (let k of _keys) {
    if (k === "__id__/asc") continue
    const key = `index.${path.join("/")}//${k}`
    let ind = await SmartWeave.kv.get(key)
    if (!isNil(ind) && k.split("/").length >= 4) {
      const sort = splitEvery(2, k.split("/"))
      const fields = map(prop(0), sort)
      if (difference(fields, keys((await db(_id)).__data)).length === 0) {
        removeInd(_id, ind)
        await SmartWeave.kv.put(key, ind)
      }
    }
  }
}

const removeData = async (_id, db, path, SmartWeave) => {
  let data = await db(_id)
  if (isNil(data)) return
  await removeSingleIndex(_id, null, path, SmartWeave)
  for (let k in data.__data) await removeSingleIndex(_id, k, path, SmartWeave)
  let keys = await getInventory(path, SmartWeave)
  await _removeData(keys, _id, [], db, path, SmartWeave)
}

const _getIndex = async (sort, path, SmartWeave) => {
  if (sort.length <= 1) return { index: null, ex: false }
  let index = await SmartWeave.kv.get(getKey(path, sort))
  return isNil(index) || index === false ? null : index
}

const format = v => map(v => [v[0], v[1] || "asc"].join("/"))(v).join("/")
const addToInventory = async (sort, path, SmartWeave) => {
  let ex_indexes = (await SmartWeave.kv.get(getKey(path))) || []
  ex_indexes.push(format(sort))
  await SmartWeave.kv.put(getKey(path), ex_indexes)
}

const addIndex = async (sort, path, db, SmartWeave) => {
  if (isNil(await _getIndex(sort, path, SmartWeave))) {
    await addToInventory(sort, path, SmartWeave)
    let docs = await SmartWeave.kv.get(getKey(path, [["__id__"]]))
    if (!isNil(docs) && docs === false) docs = null
    await SmartWeave.kv.put(
      getKey(path, sort),
      await _sort(sort, [], docs, db, SmartWeave)
    )
  }
}

const _sort = async (sort, ind, docs, db) => {
  const fields = map(prop(0), sort)
  for (let id of docs || []) {
    if (difference(fields, keys((await db(id)).__data)).length === 0) {
      const x = await Promise.all(
        map(async v => (await db(id)).__data[v[0]])(sort)
      )
      const _ind = await bsearch2(ind, x, sort, db)
      if (isNil(_ind)) ind.push(id)
      else ind.splice(_ind, 0, id)
    }
  }
  return ind
}

const removeIndex = async (sort, path, SmartWeave) => {
  let keys = await getInventory(path, SmartWeave)
  let key = getKey(path, sort)
  if (!isNil(key) && key !== false) {
    await SmartWeave.kv.put(getKey(path), without([key.split("//")[1]], keys))
    await SmartWeave.kv.put(key, false)
  }
}

module.exports = {
  getIndex,
  addData,
  removeIndex,
  addIndex,
  _getIndex,
  removeData,
  updateData,
  addInd,
  getKey,
  addSingleIndex,
  removeSingleIndex,
}
