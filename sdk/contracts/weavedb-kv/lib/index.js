const {
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

const addSingleIndex = async (_id, k, data, ind, db) => {
  if (!isNil(k) && isNil(ind[k])) {
    ind[k] = { asc: { _: [], subs: {} } }
  }
  const _k = k || "__id__"
  const _data = isNil(k) ? _id : data[k]
  let indexes = ind[_k].asc._
  const _ind = await bsearch(indexes, _data, k, db)
  if (isNil(_ind)) indexes.push(_id)
  else ind[_k].asc._.splice(_ind, 0, _id)
}

const removeSingleIndex = (_id, k, ind) => {
  const _k = k || "__id__"
  let indexes = ind[_k].asc._
  const _ind = indexOf(_id, indexes)
  if (!isNil(_ind)) ind[_k].asc._.splice(_ind, 1)
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
  //const _sort = await Promise.all(map(v => db(arr[mid]).__data[v[0]])(sort))
  const val = await Promise.all(
    map(async v => ({
      desc: v[1] === "desc",
      val: (await db(arr[mid])).__data[v[0]],
    }))(sort)
  )
  const res = comp(val, x)
  if (res === 0) return mid
  if (res === -1 && mid === 0) return 0
  if (mid > 0) {
    const val2 = await Promise.all(
      map(async v => ({
        desc: v[1] === "desc",
        val: (await db(arr[mid - 1])).__data[v[0]],
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

const addInd = async (_id, index, db, sort, data) => {
  const x = map(v => data[v[0]])(sort)
  const _ind = await bsearch2(index._, x, sort, db)
  if (isNil(_ind)) index._.push(_id)
  else index._.splice(_ind, 0, _id)
}

const removeInd = (_id, index) => {
  const _ind = indexOf(_id, index._)
  if (!isNil(_ind)) index._.splice(_ind, 1)
}

const _addData = async (ind, _id, path = [], db, data, top = false) => {
  for (let k in ind) {
    if (k === "__id__") continue
    for (let k2 in ind[k]) {
      if (!isNil(ind[k][k2]._) && !top) {
        let sort = append([k, k2])(path)
        const fields = map(prop(0), sort)
        if (difference(fields, keys(data)).length === 0) {
          await addInd(_id, ind[k][k2], db, sort, data)
        }
      }
      await _addData(
        ind[k][k2].subs,
        _id,
        compose(append([k, k2]), clone)(path),
        db,
        data
      )
    }
  }
}

const getIndex = (state, path) => {
  if (isNil(state.indexes[path.join(".")])) state.indexes[path.join(".")] = {}
  return state.indexes[path.join(".")]
}

const addData = async (_id, data, ind, db) => {
  if (isNil(ind["__id__"])) {
    ind["__id__"] = { asc: { _: [_id], subs: {} } }
  } else {
    await addSingleIndex(_id, null, data, ind, db)
  }
  for (let k in data) {
    if (k === "__id__") continue
    if (isNil(ind[k])) {
      ind[k] = { asc: { _: [_id], subs: {} } }
    } else {
      await addSingleIndex(_id, k, data, ind, db)
    }
  }
  await _addData(ind, _id, [], db, data, true)
}

const _updateData = async (
  ind,
  _id,
  path = [],
  db,
  top = false,
  update,
  new_data,
  old_data
) => {
  for (let k in ind) {
    if (k === "__id__") continue
    for (let k2 in ind[k]) {
      if (!isNil(ind[k][k2]._) && !top) {
        let sort = append([k, k2])(path)
        const fields = map(prop(0), sort)
        let ex_old = false
        let ex_new = false
        if (difference(fields, keys(old_data)).length === 0) ex_old = true
        if (difference(fields, keys(new_data)).length === 0) ex_new = true
        if (ex_old && !ex_new) {
          removeInd(_id, ind[k][k2])
        } else if (!ex_old && ex_new) {
          await addInd(_id, ind[k][k2], sort, new_data)
        } else if (intersection(update.u, fields).length !== 0) {
          removeInd(_id, ind[k][k2])
          await addInd(_id, ind[k][k2], sort, new_data)
        }
      }
      await _updateData(
        ind[k][k2].subs,
        _id,
        compose(append([k, k2]), clone)(path),
        db,
        false,
        update,
        new_data,
        old_data
      )
    }
  }
}

const updateData = async (_id, data, old_data, ind, db) => {
  if (isNil(old_data)) return
  const _keys = compose(uniq, concat(keys(old_data)), keys)(data)
  let c = []
  let d = []
  let u = []
  for (let v of _keys) {
    if (v === "__id__") continue
    if (isNil(data[v])) {
      d.push(v)
      removeSingleIndex(_id, v, ind)
    } else if (isNil(old_data[v])) {
      c.push(v)
      await addSingleIndex(_id, v, data, ind, db)
    } else if (!equals(data[v], old_data[v])) {
      u.push(v)
      removeSingleIndex(_id, v, ind)
      await addSingleIndex(_id, v, data, ind, db)
    }
  }
  await _updateData(ind, _id, [], true, { c, d, u }, data, old_data)
}

const _removeData = async (ind, _id, path = [], db, top = false) => {
  for (let k in ind) {
    if (k === "__id__") continue
    for (let k2 in ind[k]) {
      if (!isNil(ind[k][k2]._) && !top) {
        let sort = append([k, k2])(path)
        const fields = map(prop(0), sort)
        if (difference(fields, keys((await db(_id)).__data)).length === 0) {
          removeInd(_id, ind[k][k2])
        }
      }
      _removeData(
        ind[k][k2].subs,
        _id,
        compose(append([k, k2]), clone)(path),
        db
      )
    }
  }
}

const _sort = async (sort, ind, docs, db) => {
  const fields = map(prop(0), sort)
  for (let id of docs) {
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

const removeData = async (_id, ind, db) => {
  let data = await db(_id)
  if (isNil(data)) return
  if (!isNil(ind["__id__"])) {
    removeSingleIndex(_id, null, ind)
  }
  for (let k in data.__data) {
    if (!isNil(ind[k])) removeSingleIndex(_id, k, ind)
  }
  await _removeData(ind, _id, [], db, true)
  delete db[_id]
}

const _getIndex = (sort, ind) => {
  if (sort.length <= 1) return { index: null, ex: false }
  let _ind = ind
  let i = 0
  let ex = true
  for (let v of sort) {
    let subs = i === 0 ? _ind : _ind.subs
    if (!hasPath([v[0]])(subs)) {
      subs[v[0]] = {}
    }
    if (!hasPath([v[0], v[1] || "asc", "_"])(subs)) {
      if (i === sort.length - 1) ex = false
      subs[v[0]][v[1] || "asc"] = { subs: {} }
    }
    _ind = subs[v[0]][v[1] || "asc"]
    i++
  }
  return { index: _ind, ex }
}

const addIndex = async (sort, ind, docs, db) => {
  let { index: _ind, ex } = _getIndex(sort, ind)
  if (isNil(_ind._)) _ind._ = []
  if (!ex) _ind._ = await _sort(sort, _ind._, docs, db)
}

const removeIndex = (sort, ind, db) => {
  let { index: _ind, ex } = _getIndex(sort, ind)
  delete _ind._
}

module.exports = {
  getIndex,
  addData,
  removeIndex,
  addIndex,
  _getIndex,
  removeData,
  updateData,
}
