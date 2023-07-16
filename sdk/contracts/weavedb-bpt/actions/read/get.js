const {
  assoc,
  tail,
  last,
  splitWhen,
  complement,
  is,
  isNil,
  includes,
  append,
  any,
  map,
  clone,
} = require("ramda")

const { kv, getDoc } = require("../../lib/utils")
const { err } = require("../../../common/lib/utils")
const { ranges: _ranges, range: _range } = require("../../lib/index")
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
    let res = null
    if (!isNil(_filter?.["!="])) {
      const limit = opt.limit || null
      delete opt.limit
      let opt1 = clone(opt)
      let opt2 = clone(opt)
      opt1.endBefore = { [_filter?.["!="][0]]: _filter?.["!="][2] }
      opt2.startAfter = { [_filter?.["!="][0]]: _filter?.["!="][2] }
      let ranges = [
        { opt: opt1, sort: _sort },
        { opt: opt2, sort: _sort },
      ]
      res = await _ranges(ranges, limit, path, kvs, SmartWeave)
    } else {
      res = await _range(
        _sort || [["__id__", "asc"]],
        opt,
        path,
        kvs,
        SmartWeave
      )
    }
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
