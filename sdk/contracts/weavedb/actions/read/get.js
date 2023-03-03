const {
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

const { getDoc, getCol, err } = require("../../lib/utils")
const { getIndex } = require("../../lib/index")

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

const getColIndex = (state, data, path, _sort) => {
  let index = []
  let ind = getIndex(state, path)
  if (!isNil(_sort)) {
    let i = 0
    let _ind = ind
    for (let v of _sort) {
      let subs = i === 0 ? _ind : _ind.subs
      if (isNil(subs[v[0]])) {
        if (i === 0) break
        err()
      }
      _ind = subs[v[0]][_sort.length === 1 ? "asc" : v[1] || "asc"]
      i++
    }
    index = _ind._ || []
    if (_sort.length === 1 && _sort[0][1] === "desc") index = reverse(index)
  } else {
    index = !isNil(ind.__id__)
      ? ind.__id__.asc._
      : keys(getCol(data, path).__docs)
  }
  return index
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

const bsearch = function (arr, x, sort, db, start = 0, end = arr.length - 1) {
  if (start > end) return null
  let mid = Math.floor((start + end) / 2)
  const val = addIndex(map)((v, i) => ({
    desc: sort[i][1] === "desc",
    val: db[arr[mid]].__data[sort[i][0]],
  }))(tail(x))
  let res = comp(val, tail(x))
  let res2 = 1
  if (includes(x[0])(["startAt", "startAfter"])) {
    if (mid > 0) {
      const val2 = addIndex(map)((v, i) => ({
        desc: sort[i][1] === "desc",
        val: db[arr[mid - 1]].__data[sort[i][0]],
      }))(tail(x))
      res2 = comp(val2, tail(x))
    }
  } else {
    if (mid < arr.length - 1) {
      const val2 = addIndex(map)((v, i) => ({
        desc: sort[i][1] === "desc",
        val: db[arr[mid + 1]].__data[sort[i][0]],
      }))(tail(x))
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
    return bsearch(arr, x, sort, db, start, mid - 1)
  } else {
    return bsearch(arr, x, sort, db, mid + 1, end)
  }
}

const get = async (state, action, cursor = false, SmartWeave) => {
  const {
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
    const { doc: _data } = getDoc(
      data,
      path,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      SmartWeave
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
    let index = getColIndex(state, data, path, _sort)
    if (isNil(index)) err("index doesn't exist")
    const { doc: _data } =
      path.length === 1
        ? { doc: data }
        : getDoc(
            data,
            slice(0, -1, path),
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            SmartWeave
          )
    const docs =
      (path.length === 1 ? _data : _data.subs)[last(path)]?.__docs || {}
    let _docs = []
    let start = null
    let end = null
    let _start = _startAt || _startAfter
    let _end = _endAt || _endBefore
    if (!isNil(_start)) {
      if (is(Object)(_start[1]) && hasPath([1, "id"])(_start)) {
        start = bsearch(
          index,
          [
            "startAt",
            map(v =>
              v[0] === "__id__" ? _start[1].id : docs[_start[1].id].__data[v[0]]
            )(_sort || [["__id__"]]),
          ],
          _sort || [["__id__"]],
          docs
        )
        for (let i = start; i < index.length; i++) {
          if (index[i] === _start[1].id) {
            start = i
            break
          }
        }
        if (!isNil(start)) {
          if (_start[0] === "startAfter") start += 1
          index.splice(0, start)
        }
      } else {
        start = bsearch(index, _start, _sort || [["__id__"]], docs)
        index.splice(0, start)
      }
    }
    if (!isNil(_end)) {
      if (!isNil(_start)) {
        const len = Math.min(_end.length, _start.length) - 1
        const val = take(
          len,
          addIndex(map)((v, i) => ({
            desc: _sort[i][1] === "desc",
            val: v,
          }))(tail(_start))
        )
        if (comp(val, tail(_end)) === -1) err()
      }
      if (is(Object)(_end[1]) && hasPath([1, "id"])(_end)) {
        end = bsearch(
          index,
          [
            "startAt",
            map(v =>
              v[0] === "__id__" ? _end[1].id : docs[_end[1].id].__data[v[0]]
            )(_sort || [["__id__"]]),
          ],
          _sort || [["__id__"]],
          docs
        )
        for (let i = end; i < index.length; i++) {
          if (index[i] === _end[1].id) {
            end = i
            break
          }
        }
        if (!isNil(end)) {
          if (_end[0] === "endBefore" && end !== 0) end -= 1
          index.splice(end + 1, index.length - end)
        }
      } else {
        end = bsearch(index, _end, _sort || [["__id__"]], docs)
        index.splice(end + 1, index.length - end)
      }
    }
    let res = index
    if (!isNil(_filter)) {
      res = []
      const sort_field = compose(
        uniq,
        pluck(0),
        filter(v => includes(v[1])([">", ">=", "<", "<=", "!=", "not-in"])),
        values
      )(_filter)
      if (sort_field.length > 1) {
        err()
      }
      if (
        sort_field.length === 1 &&
        (isNil(_sort) || _sort[0][0] !== sort_field[0])
      ) {
        err()
      }
      for (let _v of index) {
        const v = docs[_v].__data
        let ok = true
        for (let v2 of values(_filter)) {
          if (isNil(v[v2[0]]) && v[v2[0]] !== null) {
            ok = false
          }
          switch (v2[1]) {
            case ">":
              ok = v[v2[0]] > v2[2]
              break
            case "<":
              ok = v[v2[0]] < v2[2]
              break
            case ">=":
              ok = v[v2[0]] >= v2[2]
              break
            case "<=":
              ok = v[v2[0]] <= v2[2]
              break
            case "=": // deprecated at v0.23
            case "==":
              ok = v[v2[0]] === v2[2]
              break
            case "!=":
              ok = v[v2[0]] !== v2[2]
              break
            case "in":
              ok = includes(v[v2[0]])(v2[2])
              break
            case "not-in":
              ok = !includes(v[v2[0]])(v2[2])
              break
            case "array-contains":
              ok = is(Array, v[v2[0]]) && includes(v2[2])(v[v2[0]])
              break
            case "array-contains-any":
              ok =
                is(Array, v[v2[0]]) && intersection(v2[2])(v[v2[0]]).length > 0
              break
          }
          if (!ok) break
        }
        if (ok) {
          res.push(_v)
          if (!isNil(_limit) && res.length >= _limit) break
        }
      }
    }

    return {
      result: compose(
        when(o(complement(isNil), always(_limit)), take(_limit)),
        map(v =>
          cursor
            ? {
                id: v,
                setter: docs[v].setter,
                data: docs[v].__data,
              }
            : docs[v].__data
        )
      )(res),
    }
  }
}
module.exports = { get, parseQuery }
