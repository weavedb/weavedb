import {
  clone,
  splitWhen,
  complement,
  is,
  isNil,
  includes,
  append,
} from "ramda"

const err = v => {
  throw Error(v)
}
const parser = query => {
  const [path, opt] = splitWhen(complement(is)(String), query)
  if (isNil(path) || path.length === 0) err(`the wrong path`)
  if (!is(Object, opt)) err(`option must be an object`)
  let q = { path }
  let _filter = { "==": [] }
  let _keys = {}
  let _ranges = {}
  let _range_field = null
  let _sort = null
  let _startAt = null
  let _startAfter = null
  let _endAt = null
  let _endBefore = null
  let _startAtCursor = null
  let _startAfterCursor = null
  let _endAtCursor = null
  let _endBeforeCursor = null
  let _array_contains = null
  let _array_contains_any = null
  for (const v of clone(opt)) {
    if (is(Number)(v)) {
      if (isNil(q.limit)) {
        if (v > 1000) err(`limit cannot be above 1000 [${v}]`)
        if (v !== Math.round(Math.abs(v)) || v < 1) {
          err(`limit must be a natural number [${v}]`)
        }
        q.limit = v
      } else {
        err(`only one limit is allowed [${v}]`)
      }
    } else if (!is(Array)(v)) {
      err(`unknown query [${JSON.stringify(v)}]`)
    } else {
      if (v.length === 0) {
        err(`empty query option []`)
      } else if (v[0] === "startAt") {
        if (
          !isNil(_startAt) ||
          !isNil(_startAfter) ||
          !isNil(_startAtCursor) ||
          !isNil(_startAfterCursor)
        ) {
          err(`only one startAt/startAfter is allowed`)
        } else if (v.length <= 1) {
          err(`startAt has no value`)
        } else {
          if (v[1].__cursor__) {
            _startAtCursor = v
            _startAtCursor[1].data.__id__ = _startAtCursor[1].id
          } else {
            _startAt = v
          }
        }
      } else if (v[0] === "startAfter") {
        if (
          !isNil(_startAt) ||
          !isNil(_startAfter) ||
          !isNil(_startAtCursor) ||
          !isNil(_startAfterCursor)
        ) {
          err(`only one startAt/startAfter is allowed`)
        } else if (v.length <= 1) {
          err(`startAfter has no value`)
        } else {
          if (v[1].__cursor__) {
            _startAfterCursor = v
            _startAfterCursor[1].data.__id__ = _startAfterCursor[1].id
          } else {
            _startAfter = v
          }
        }
      } else if (v[0] === "endAt") {
        if (
          !isNil(_endAt) ||
          !isNil(_endBefore) ||
          !isNil(_endAtCursor) ||
          !isNil(_endBeforeCursor)
        ) {
          err(`only one endAt/endBefore is allowed`)
        } else if (v.length <= 1) {
          err(`endAt has no value`)
        } else {
          if (v[1].__cursor__) {
            _endAtCursor = v
            _endAtCursor[1].data.__id__ = _endAtCursor[1].id
          } else {
            _endAt = v
          }
        }
      } else if (v[0] === "endBefore") {
        if (
          !isNil(_endAt) ||
          !isNil(_endBefore) ||
          !isNil(_endAtCursor) ||
          !isNil(_endBeforeCursor)
        ) {
          err(`only one endAt/endBefore is allowed`)
        } else if (v.length <= 1) {
          err(`endBefore has no value`)
        } else {
          if (v[1].__cursor__) {
            _endBeforeCursor = v
            _endBeforeCursor[1].data.__id__ = _endBeforeCursor[1].id
          } else {
            _endBefore = v
          }
        }
      } else if (v.length === 3) {
        if (
          includes(v[1])([
            "==",
            "!=",
            ">",
            "<",
            ">=",
            "<=",
            "in",
            "not-in",
            "array-contains",
            "array-contains-any",
          ])
        ) {
          if (includes(v[1], ["array-contains", "array-contains-any"])) {
            if (
              !isNil(_filter["array-contains"]) ||
              !isNil(_filter["array-contains-any"])
            ) {
              err(`only one array-contains/array-contains-any is allowed`)
            }
            if (v[1] === "array-contains-any" && !is(Array, v[2])) {
              err(`array-contains-any must be an array ${JSON.stringify(v[2])}`)
            }
            _filter[v[1]] = v
          } else if (
            includes(v[1], ["!=", "in", "not-in", ">", ">=", "<", "<="])
          ) {
            if (includes(v[1], ["in", "not-in"]) && !is(Array, v[2])) {
              err(`${v[1]} must be an array [${JSON.stringify(v[2])}]`)
            }
            if (includes(v[1], [">", ">=", "<", "<="])) {
              if (
                !isNil(_filter["!="]) ||
                !isNil(_filter["in"]) ||
                !isNil(_filter["not-in"])
              ) {
                err(`only one inequity is allowed [${JSON.stringify(v)}]`)
              }
              if (!isNil(_range_field) && _range_field !== v[0]) {
                err(
                  `inequity has to be on the same field [${JSON.stringify(v)}]`,
                )
              } else if (
                _ranges[v[1]] ||
                (v[1] === ">" && _ranges[">="]) ||
                (v[1] === ">=" && _ranges[">"]) ||
                (v[1] === "<" && _ranges["<="]) ||
                (v[1] === "<=" && _ranges["<"])
              ) {
                err(`duplicate inequity [${JSON.stringify(v)}]`)
              } else {
                _filter.range ??= []
                _filter.range.push(v)
                _range_field = v[0]
                _ranges[v[1]] = true
              }
            } else {
              if (
                !isNil(_filter.range) ||
                !isNil(_filter["!="]) ||
                !isNil(_filter["in"]) ||
                !isNil(_filter["not-in"])
              ) {
                err(`only one inequity is allowed [${JSON.stringify(v)}]`)
              }
              _filter[v[1]] = v
            }
          } else if (v[1] === "==") {
            if (
              !isNil(_filter.range) ||
              !isNil(_filter["!="]) ||
              !isNil(_filter["in"]) ||
              !isNil(_filter["not-in"])
            ) {
              err(`== must come before inequity [${JSON.stringify(v)}]`)
            } else if (_keys[v[0]])
              err(`only one == per field is allowed [${JSON.stringify(v)}]`)
            _filter["=="].push(v)
            _keys[v[0]] = true
          } else {
            if (!isNil(_filter[v[1]])) err()
            _filter[v[1]] = v
          }
        } else {
          err(`The wrong where operant [${v[1]}]`)
        }
      } else if (v.length === 2) {
        if (includes(v[1])(["asc", "desc"])) {
          if (isNil(_sort)) {
            _sort = [v]
          } else {
            _sort.push(v)
          }
        } else {
          err(`sort order [${JSON.stringify(v[1])}] must be either asc or desc`)
        }
      } else if (v.length === 1) {
        if (isNil(_sort)) {
          _sort = [append("asc", v)]
        } else {
          _sort.push(append("asc", v))
        }
      } else {
        err(`unknown query option [${JSON.stringify(v)}]`)
      }
    }
  }
  q.limit ??= 1000
  q.start = _startAt ?? _startAfter ?? null
  q.end = _endAt ?? _endBefore ?? null
  q.startCursor = _startAtCursor ?? _startAfterCursor ?? null
  q.endCursor = _endAtCursor ?? _endBeforeCursor ?? null
  q.sort = _sort ?? []
  q.reverse = { start: false, end: false }
  q.array = _filter["array-contains"] ?? _filter["array-contains-any"] ?? null
  q.equals = _filter["=="]
  q.range =
    _filter.range ??
    (!isNil(_filter.in)
      ? [_filter.in]
      : !isNil(_filter["not-in"])
        ? [_filter["not-in"]]
        : !isNil(_filter["!="])
          ? [_filter["!="]]
          : null)
  q.sortByTail = false
  return q
}

export default parser
