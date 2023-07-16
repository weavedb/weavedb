const {
  assoc,
  path: __path,
  then,
  hasPath,
  uniq,
  pluck,
  range,
  addIndex,
  keys,
  groupBy,
  flatten,
  sortBy,
  reverse,
  take,
  tail,
  intersection,
  always,
  o,
  compose,
  when,
  last,
  prop,
  values,
  ifElse,
  splitWhen,
  complement,
  is,
  isNil,
  includes,
  append,
  any,
  slice,
  filter,
  map,
} = require("ramda")

const { kv, getDoc } = require("../../lib/utils")
const { err } = require("../../../common/lib/utils")
const { range: _range } = require("../../lib/index")
const md5 = require("md5")

const parseQuery = query => {
  const [path, opt] = splitWhen(complement(is)(String), query)
  let _limit = null
  let _filter = null
  let _sort = null
  let _startAt = null
  let _startAfter = null
  let _endAt = null
  let _endBefore = null
  for (const v of opt) {
    if (is(Number)(v)) {
      if (isNil(_limit)) {
        _limit = v
      } else {
        err()
      }
    } else if (is(Array)(v)) {
      if (v.length === 0) err()
      if (v[0] === "startAt") {
        if (isNil(_startAt) && v.length > 1 && v.length > 1) {
          _startAt = v
        } else {
          err()
        }
      } else if (v[0] === "startAfter") {
        if (isNil(_startAfter) && v.length > 1 && v.length > 1) {
          _startAfter = v
        } else {
          err()
        }
      } else if (v[0] === "endAt") {
        if (isNil(_endAt) && v.length > 1 && v.length > 1) {
          _endAt = v
        } else {
          err()
        }
      } else if (v[0] === "endBefore") {
        if (isNil(_endBefore) && v.length > 1 && v.length > 1) {
          _endBefore = v
        } else {
          err()
        }
      } else if (v.length === 3) {
        if (
          includes(v[1])([
            ">",
            "=", // deprecated at v0.23
            "==",
            "!=",
            "<",
            ">=",
            "<=",
            "in",
            "not-in",
            "array-contains",
            "array-contains-any",
          ])
        ) {
          if (isNil(_filter)) {
            _filter = {}
          }
          if (!isNil(_filter[v[1]])) err()
          _filter[v[1]] = v
        } else {
          err()
        }
      } else if (v.length === 2) {
        if (includes(v[1])(["asc", "desc"])) {
          if (isNil(_sort)) {
            _sort = [v]
          } else {
            _sort.push(v)
          }
        } else {
          err()
        }
      } else if (v.length === 1) {
        if (isNil(_sort)) {
          _sort = [append("asc", v)]
        } else {
          _sort.push(append("asc", v))
        }
      } else {
        err()
      }
    }
  }
  const checkSkip = (a, b) => {
    if (!isNil(a) || !isNil(b)) {
      if (!isNil(a) && !isNil(b)) err()
      if ((a || b).length < (_sort || []).length) err()
    }
  }
  if (isNil(path) || path.length === 0) err()
  checkSkip(_startAt, _startAfter)
  checkSkip(_endAt, _endBefore)
  return {
    path,
    _limit,
    _filter,
    _sort,
    _startAt,
    _startAfter,
    _endAt,
    _endBefore,
  }
}

const getColIndex = async (path, _sort, SmartWeave, kvs) => {
  if (isNil(_sort)) _sort = [["__id__"]]
  let _reverse = false
  if (!isNil(_sort) && _sort.length === 1 && _sort[0][1] === "desc") {
    _sort[0][1] = "asc"
    _reverse = true
  }
  const indexes = await kv(kvs, SmartWeave).get(getKey(path, _sort))
  return _reverse ? reverse(indexes) : indexes
}

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
  sort,
  db,
  start = 0,
  end = arr.length - 1
) {
  if (start > end) return null
  let mid = Math.floor((start + end) / 2)
  const val = await Promise.all(
    addIndex(map)(async (v, i) => ({
      desc: sort[i][1] === "desc",
      val: (await db(arr[mid])).__data[sort[i][0]],
    }))(tail(x))
  )
  let res = comp(val, tail(x))
  let res2 = 1
  if (includes(x[0])(["startAt", "startAfter"])) {
    if (mid > 0) {
      const val2 = await Promise.all(
        addIndex(map)(async (v, i) => ({
          desc: sort[i][1] === "desc",
          val: (await db(arr[mid - 1])).__data[sort[i][0]],
        }))(tail(x))
      )
      res2 = comp(val2, tail(x))
    }
  } else {
    if (mid < arr.length - 1) {
      const val2 = await Promise.all(
        addIndex(map)(async (v, i) => ({
          desc: sort[i][1] === "desc",
          val: (await db(arr[mid + 1])).__data[sort[i][0]],
        }))(tail(x))
      )
      res2 = comp(val2, tail(x))
    }
  }
  let down = false
  switch (x[0]) {
    case "startAt":
      if (res2 === 1 && res <= 0) return mid
      if (res <= 0) down = true
      break
    case "startAfter":
      if (res2 >= 0 && res === -1) return mid
      if (res < 0) down = true
      break
    case "endAt":
      if (res2 === -1 && res >= 0) return mid
      if (res < 0) down = true
      break
    case "endBefore":
      if (res2 <= 0 && res === 1) return mid
      if (res <= 0) down = true
      break
  }
  if (down) {
    return await bsearch(arr, x, sort, db, start, mid - 1)
  } else {
    return await bsearch(arr, x, sort, db, mid + 1, end)
  }
}

const get = async (state, action, cursor = false, SmartWeave, kvs) => {
  let {
    path,
    _limit,
    _filter,
    _sort,
    _startAt,
    _endAt,
    _startAfter,
    _endBefore,
  } = parseQuery(action.input.query)
  const { data } = state
  if (path.length % 2 === 0) {
    if (any(complement(isNil))([_limit, _sort, _filter])) err()
    const { doc: _data } = await getDoc(
      null,
      path,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      SmartWeave,
      undefined,
      kvs
    )
    return {
      result: isNil(_data.__data)
        ? null
        : cursor
        ? {
            id: last(path),
            setter: _data.setter,
            data: _data.__data || null,
          }
        : _data.__data || null,
    }
  } else {
    let opt = {}
    let pagenation = {
      startAfter: _startAfter,
      startAt: _startAt,
      endAt: _endAt,
      endBefore: _endBefore,
    }
    if (!isNil(_limit)) opt.limit = _limit
    if (!isNil(_filter?.["=="])) {
      _sort ??= []
      if (_sort.length === 0 || _sort[0][0] !== _filter["=="][0]) {
        _sort.push([_filter["=="][0], "asc"])
      }
      pagenation.startAt = ["startAt", _filter["=="][2]]
      pagenation.endAt = ["endAt", _filter["=="][2]]
    } else {
      if (!isNil(_filter?.[">"])) {
        _sort ??= []
        if (_sort.length === 0 || _sort[0][0] !== _filter[">"][0]) {
          _sort.push([_filter[">"][0], "asc"])
        }
        pagenation.startAfter = ["startAfter", _filter[">"][2]]
      } else if (!isNil(_filter?.[">="])) {
        _sort ??= []
        if (_sort.length === 0 || _sort[0][0] !== _filter[">="][0]) {
          _sort.push([_filter[">="][0], "asc"])
        }
        pagenation.startAt = ["startAt", _filter[">="][2]]
      }
      if (!isNil(_filter?.["<"])) {
        _sort ??= []
        if (_sort.length === 0 || _sort[0][0] !== _filter["<"][0]) {
          _sort.push([_filter["<"][0], "asc"])
        }
        pagenation.endBefore = ["endBefore", _filter["<"][2]]
      } else if (!isNil(_filter?.["<="])) {
        _sort ??= []
        if (_sort.length === 0 || _sort[0][0] !== _filter["<="][0]) {
          _sort.push([_filter["<="][0], "asc"])
        }
        pagenation.endAt = ["endAt", _filter["<="][2]]
      }
      if (!isNil(_filter?.["array-contains"])) {
        _sort ??= []
        const key = `${_filter["array-contains"][0]}/array:${md5(
          JSON.stringify(_filter["array-contains"][2])
        )}`
        if (_sort.length === 0 || _sort[0][0] !== key) _sort.push([key])
      }
    }

    for (const k in pagenation) {
      const p = pagenation[k]
      if (!isNil(p)) {
        if (p[1].__cursor__) {
          opt[k] = assoc("__id__", p[1].id, p[1].data)
        } else {
          opt[k] = {}
          let i = 0
          for (let v of tail(p)) {
            opt[k][_sort[i][0]] = v
            i++
          }
        }
      }
    }
    const res = await _range(
      _sort || [["__id__", "asc"]],
      opt,
      path,
      kvs,
      SmartWeave
    )
    return {
      result: map(v =>
        cursor
          ? {
              id: v.key,
              setter: v.setter,
              data: v.val,
              __cursor__: true,
            }
          : v.val
      )(res),
    }
  }
}
module.exports = { get, parseQuery }
