import {
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
} from "ramda"

import { err, getDoc, getCol } from "../../lib/utils"
import { getIndex, _getIndex } from "../../lib/index"
export const get = async (state, action) => {
  const { data } = state
  const { query } = action.input
  const [path, opt] = splitWhen(complement(is)(String), query)
  let _limit = null
  let _filter = null
  let _sort = null
  let _start = null
  let _end = null
  for (const v of opt) {
    if (is(Number)(v)) {
      if (isNil(_limit)) {
        _limit = v
      } else {
        err()
      }
    } else if (is(Array)(v)) {
      if (v.length === 0) err()

      if (includes(v[0])(["startAt", "startAfter"])) {
        if (
          isNil(_start) &&
          v.length > 1 &&
          (v[0] === "startAt" || v.length === 2)
        ) {
          _start = v
        } else {
          err()
        }
      } else if (includes(v[0])(["endAt", "endBefore"])) {
        if (
          isNil(_end) &&
          v.length > 1 &&
          (v[0] === "endAt" || v.length === 2)
        ) {
          _end = v
        } else {
          err()
        }
      } else if (v.length === 3) {
        if (
          includes(v[1])([
            ">",
            "=",
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
            _filter = v
          } else {
            err()
          }
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
  if (!isNil(_start) && (_sort || []).length < _start.length - 1) err()
  if (!isNil(_end) && (_sort || []).length < _end.length - 1) err()
  if (isNil(path) || path.length === 0) err()
  if (path.length % 2 === 0) {
    if (any(complement(isNil))([_limit, _sort, _filter])) err()
    const { doc: _data } = getDoc(data, path)
    return { result: _data.__data || null }
  } else {
    let index = null
    let ind = getIndex(state, path)
    if (!isNil(_sort)) {
      let i = 0
      let _ind = ind
      for (let v of _sort) {
        let subs = i === 0 ? _ind : _ind.subs
        _ind = subs[v[0]][_sort.length === 1 ? "asc" : v[1] || "asc"]
        i++
      }
      index = _ind._
      if (_sort.length === 1 && _sort[0][1] === "desc") index = reverse(index)
    } else {
      index = keys(getCol(data, path).__docs)
    }
    const { doc: _data } =
      path.length === 1 ? { doc: data } : getDoc(data, slice(0, -1, path))
    const skipInclusive = (v2, end = false, i = 0) => {
      const tar = end ? _end : _start
      const field = _sort[i][0]
      const desc = _sort[i][1] === "desc"
      let [a, b] = [v2[field], tar[i + 1]]
      if (end) [b, a] = [a, b]
      let ok = desc ? a <= b : a >= b
      if (ok && tar.length - 2 > i && a === b) {
        ok = skipInclusive(v2, end, i + 1)
      }
      return ok
    }
    const skipExclusive = (v2, val, end = false) => {
      const field = _sort[0][0]
      const desc = _sort[0][1] === "desc"
      let [a, b] = [v2[field], val]
      if (end) [b, a] = [a, b]
      return desc ? a < b : a > b
    }
    const skip = (v, end) => {
      const tar = end ? _end : _start
      return filter(v2 =>
        tar[0] === (end ? "endAt" : "startAt")
          ? skipInclusive(v2, end)
          : skipExclusive(v2, tar[1], end)
      )(v)
    }
    const start = v => skip(v)
    const end = v => skip(v, true)
    const sorter = (v, str = _sort) => {
      let s = str[0]
      return compose(
        ifElse(
          always(str.length > 1),
          compose(
            flatten,
            map(prop("vals")),
            when(always(s[1] === "desc"), reverse),
            sortBy(prop("key")),
            values,
            map(v2 => {
              let ss = tail(_sort)
              let v3 = map(prop("val"))(v2)
              return {
                key: v2[0].key,
                vals: sorter(map(prop("val"))(v2), tail(str)),
              }
            }),
            groupBy(prop("key")),
            map(v2 => ({ key: v2[s[0]], val: v2 }))
          ),
          o(when(always(s[1] === "desc"), reverse), sortBy(prop(s[0])))
        ),
        filter(v => !isNil(v[s[0]]))
      )(v)
    }
    if (!isNil(index)) {
      const docs =
        (path.length === 1 ? _data : _data.subs)[last(path)]?.__docs || {}
      return {
        result: compose(
          when(o(complement(isNil), always(_limit)), take(_limit)),
          when(o(complement(isNil), always(_end)), end),
          when(o(complement(isNil), always(_start)), start),
          when(
            o(complement(isNil), always(_filter)),
            filter(v => {
              if (isNil(v[_filter[0]]) && v[_filter[0]] !== null) {
                return false
              }
              switch (_filter[1]) {
                case ">":
                  return v[_filter[0]] > _filter[2]
                case "<":
                  return v[_filter[0]] < _filter[2]
                case ">=":
                  return v[_filter[0]] >= _filter[2]
                case "<=":
                  return v[_filter[0]] <= _filter[2]
                case "=":
                  return v[_filter[0]] === _filter[2]
                case "!=":
                  return v[_filter[0]] !== _filter[2]
                case "in":
                  return includes(v[_filter[0]])(_filter[2])
                case "not-in":
                  return !includes(v[_filter[0]])(_filter[2])
                case "array-contains":
                  return (
                    is(Array, v[_filter[0]]) &&
                    includes(_filter[2])(v[_filter[0]])
                  )
                case "array-contains-any":
                  return (
                    is(Array, v[_filter[0]]) &&
                    intersection(_filter[2])(v[_filter[0]]).length > 0
                  )
              }
            })
          ),
          filter(complement(isNil)),
          map(k => docs[k]?.__data)
        )(index),
      }
    }
  }
}
