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

const bsearch = function (arr, x, k, db, start = 0, end = arr.length - 1) {
  if (start > end) return null
  const mid = Math.floor((start + end) / 2)
  const val = isNil(k) ? arr[mid] : db[arr[mid]].__data[k]
  if (val === x) return mid
  if (val > x && mid === 0) return 0
  if (
    mid !== 0 &&
    val > x &&
    (isNil(k) ? arr[mid - 1] : db[arr[mid - 1]].__data[k]) <= x
  ) {
    return mid
  }
  if (val > x) {
    return bsearch(arr, x, k, db, start, mid - 1)
  } else {
    return bsearch(arr, x, k, db, mid + 1, end)
  }
}

const addSingleIndex = (_id, k, data, ind, db) => {
  if (!isNil(k) && isNil(ind[k])) {
    ind[k] = { asc: { _: [], subs: {} } }
  }
  const _k = k || "__id__"
  const _data = isNil(k) ? _id : data[k]
  let indexes = ind[_k].asc._
  const _ind = bsearch(indexes, _data, k, db)
  if (isNil(_ind)) indexes.push(_id)
  else ind[_k].asc._.splice(_ind, 0, _id)
}

const removeSingleIndex = (_id, k, ind) => {
  const _k = k || "__id__"
  let indexes = ind[_k].asc._
  const _ind = indexOf(_id, indexes)
  if (!isNil(_ind)) ind[_k].asc._.splice(_ind, 1)
}

const bsearch2 = function (arr, x, sort, db, start = 0, end = arr.length - 1) {
  if (start > end) return null
  let mid = Math.floor((start + end) / 2)
  const val = map(v => ({
    desc: v[1] === "desc",
    val: db[arr[mid]].__data[v[0]],
  }))(sort)
  const res = comp(val, x)
  if (res === 0) return mid
  if (res === -1 && mid === 0) return 0
  if (mid > 0) {
    const val2 = map(v => ({
      desc: v[1] === "desc",
      val: db[arr[mid - 1]].__data[v[0]],
    }))(sort)
    const res2 = comp(val2, x)
    if (res === -1 && res2 >= 0) return mid
  }
  if (res === -1) {
    return bsearch2(arr, x, sort, db, start, mid - 1)
  } else {
    return bsearch2(arr, x, sort, db, mid + 1, end)
  }
}

const addInd = (_id, index, db, sort, data) => {
  const x = map(v => data[v[0]])(sort)
  const _ind = bsearch2(index._, x, sort, db)
  if (isNil(_ind)) index._.push(_id)
  else index._.splice(_ind, 0, _id)
}

const removeInd = (_id, index) => {
  const _ind = indexOf(_id, index._)
  if (!isNil(_ind)) index._.splice(_ind, 1)
}

const _addData = (ind, _id, path = [], db, data, top = false) => {
  for (let k in ind) {
    if (k === "__id__") continue
    for (let k2 in ind[k]) {
      if (!isNil(ind[k][k2]._) && !top) {
        let sort = append([k, k2])(path)
        const fields = map(prop(0), sort)
        if (difference(fields, keys(data)).length === 0) {
          addInd(_id, ind[k][k2], db, sort, data)
        }
      }
      _addData(
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

const addData = (_id, data, ind, db) => {
  if (isNil(ind["__id__"])) {
    ind["__id__"] = { asc: { _: [_id], subs: {} } }
  } else {
    addSingleIndex(_id, null, data, ind, db)
  }
  for (let k in data) {
    if (k === "__id__") continue
    if (isNil(ind[k])) {
      ind[k] = { asc: { _: [_id], subs: {} } }
    } else {
      addSingleIndex(_id, k, data, ind, db)
    }
  }
  _addData(ind, _id, [], db, data, true)
}

const _updateData = (
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
          addInd(_id, ind[k][k2], db, sort, new_data)
        } else if (intersection(update.u, fields).length !== 0) {
          removeInd(_id, ind[k][k2])
          addInd(_id, ind[k][k2], db, sort, new_data)
        }
      }
      _updateData(
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

const updateData = (_id, data, old_data, ind, db) => {
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
      addSingleIndex(_id, v, data, ind, db)
    } else if (!equals(data[v], old_data[v])) {
      u.push(v)
      removeSingleIndex(_id, v, ind)
      addSingleIndex(_id, v, data, ind, db)
    }
  }
  _updateData(ind, _id, [], db, true, { c, d, u }, data, old_data)
}

const _removeData = (ind, _id, path = [], db, top = false) => {
  for (let k in ind) {
    if (k === "__id__") continue
    for (let k2 in ind[k]) {
      if (!isNil(ind[k][k2]._) && !top) {
        let sort = append([k, k2])(path)
        const fields = map(prop(0), sort)
        if (difference(fields, keys(db[_id].__data)).length === 0) {
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

const _sort = (sort, ind, db) => {
  const fields = map(prop(0), sort)
  for (let id in db) {
    if (difference(fields, keys(db[id].__data)).length === 0) {
      const x = map(v => db[id].__data[v[0]])(sort)
      const _ind = bsearch2(ind, x, sort, db)
      if (isNil(_ind)) ind.push(id)
      else ind.splice(_ind, 0, id)
    }
  }
  return ind
}

const removeData = (_id, ind, db) => {
  if (isNil(db[_id])) return
  if (!isNil(ind["__id__"])) {
    removeSingleIndex(_id, null, ind)
  }
  let data = db[_id]
  for (let k in db[_id].__data) {
    if (!isNil(ind[k])) removeSingleIndex(_id, k, ind)
  }
  _removeData(ind, _id, [], db, true)
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

const addIndex = (sort, ind, db) => {
  let { index: _ind, ex } = _getIndex(sort, ind)
  if (isNil(_ind._)) _ind._ = []
  if (!ex) _ind._ = _sort(sort, _ind._, db)
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
