import {
  clone,
  splitWhen,
  complement,
  is,
  isNil,
  includes,
  append,
  pluck,
  intersection,
  indexOf,
  prop,
  slice,
  reverse,
  map,
  assoc,
  tail,
  sortBy,
  identity,
} from "ramda"
import md5 from "./md5.js"

const err = v => {
  throw Error(v)
}

const buildQueries = q => {
  q.queries = []
  if (!isNil(q.array)) {
    let opt = { limit: q.limit }
    if (!isNil(q.start)) opt[q.start[0]] = q.start[1]
    if (!isNil(q.end)) opt[q.end[0]] = q.end[1]
    if (q.array[1] === "array-contains-any") {
      for (let v of q.array[2]) {
        const prefix = `${q.array[0]}/array:${md5(JSON.stringify(v))}`
        q.queries.push({ opt, prefix })
      }
      q.type = "pranges"
    } else {
      const prefix = `${q.array[0]}/array:${md5(JSON.stringify(q.array[2]))}`
      q.queries.push({ opt, prefix })
      q.type = "range"
    }
  } else if (includes(q.range?.[0]?.[1], ["!=", "not-in", "in"])) {
    const op = q.range?.[0]?.[1]
    if (op === "!=") {
      let opt1 = {}
      let end = clone(q.end)
      end ??= ["endBefore"]
      end[1] ??= {}
      if (end[0] !== "endBefore") end[0] = "endBefore"
      end[1][q.range[0][0]] = q.range[0][2]
      opt1.endBefore = end[1]
      if (!isNil(q.start)) opt1[q.start[0]] = q.start[1]
      let opt2 = {}
      let start = clone(q.start)
      start ??= ["startAfter"]
      start[1] ??= {}
      if (start[0] !== "startAfter") start[0] = "startAfter"
      start[1][q.range[0][0]] = q.range[0][2]
      opt2.startAfter = start[1]
      if (!isNil(q.end)) opt2[q.end[0]] = q.end[1]
      q.queries = [{ opt: opt1 }, { opt: opt2 }]
      q.reverse.start = true
      q.reverse.end = true
      q.sortRange = true
    } else if (op === "in") {
      let __ranges = sortBy(identity)(q.range[0][2])
      for (let v of __ranges) {
        let opt = {}
        let start = clone(q.start)
        start ??= ["startAt"]
        start[1] ??= {}
        start[1][q.range[0][0]] = v
        opt.startAt = start[1]
        let end = clone(q.end)
        end ??= ["endAt"]
        end[1] ??= {}
        end[1][q.range[0][0]] = v
        opt.endAt = end[1]
        q.queries.push({ opt })
        q.sortRange = true
        q.reverse.start = true
        q.reverse.end = true
      }
    } else if (op === "not-in") {
      let prev = null
      let __ranges = sortBy(identity)(q.range[0][2])
      for (let [i, v] of __ranges.entries()) {
        let opt = {}
        let start = clone(q.start)
        if (i !== 0) {
          start ??= ["startAfter"]
          start[1] ??= {}
          start[1][q.range[0][0]] = prev
        }
        if (!isNil(start)) opt[start[0]] = start[1]
        let end = clone(q.end)
        end ??= ["endBefore"]
        end[1] ??= {}
        end[1][q.range[0][0]] = v
        opt.endBefore = end[1]
        q.queries.push({ opt })
        if (i == q.range[0][2].length - 1) {
          let opt = {}
          let start = clone(q.start)
          start ??= ["startAfter"]
          start[1] ??= {}
          start[1][q.range[0][0]] = v
          opt.startAfter = start[1]
          let end = clone(q.end)
          if (!isNil(end)) opt[end[0]] = end[1]
          q.queries.push({ opt })
        }

        prev = v
      }
      q.sortRange = true
      q.reverse.start = true
      q.reverse.end = true
    }
    q.type = q.sortByTail ? "pranges" : "ranges"
  } else {
    q.type = "range"
    let opt = { limit: q.limit }
    if (!isNil(q.start)) opt[q.start[0]] = q.start[1]
    if (!isNil(q.end)) opt[q.end[0]] = q.end[1]
    q.queries.push({ opt })
  }
}

const checkStartEnd = q => {
  if (q.equals.length > 0 && !isNil(q.range)) {
    if (includes(q.range[0][0], pluck(0, q.equals))) {
      err(`== and range field must be different [${JSON.stringify(q.range)}]`)
    }
  }
  if (
    (!isNil(q.start) || !isNil(q.end)) &&
    (q.equals.length > 0 || !isNil(q.range))
  ) {
    err(
      `range [${JSON.stringify(
        q.start ?? q.end,
      )}] cannot be used with ==/inequity`,
    )
  }
  let start = null
  let end = null
  if (!isNil(q.start) || !isNil(q.end)) {
    if (!isNil(q.start)) {
      start ??= []
      start[0] = q.start[0]
      start[1] ??= {}
      if (q.start[1]?.__cursor__) {
        start[1] = assoc("__id__", q.start[1].id, q.start[1].data)
      } else {
        for (const [i, v] of tail(q.start).entries()) {
          if (isNil(q.sort[i]))
            err(`sort must exist for [${JSON.stringify(v)}]`)
          start[1][q.sort[i][0]] = v
        }
      }
    } else if (!isNil(q.end)) {
      end ??= []
      end[0] = q.end[0]
      end[1] ??= {}
      if (q.end[1]?.__cursor__) {
        end[1] = assoc("__id__", q.end[1].id, q.end[1].data)
      } else {
        for (const [i, v] of tail(q.end).entries()) {
          if (isNil(q.sort[i]))
            err(`sort must exist for [${JSON.stringify(v)}]`)
          end[1][q.sort[i][0]] = v
        }
      }
    }
  } else {
    for (const v of q.equals) {
      start ??= ["startAt"]
      end ??= ["endAt"]
      start[1] ??= {}
      end[1] ??= {}
      start[1][v[0]] = v[2]
      end[1][v[0]] = v[2]
    }
    for (const v of q.range || []) {
      if (v[1] === "<") {
        end ??= ["endBefore"]
        end[1] ??= {}
        if (end[0] === "endAt") end[0] = "endBefore"
        end[1][v[0]] = v[2]
        q.reverse.end = true
      } else if (v[1] === "<=") {
        end ??= ["endAt"]
        end[1] ??= {}
        end[1][v[0]] = v[2]
        q.reverse.end = true
      } else if (v[1] === ">") {
        start ??= ["startAfter"]
        start[1] ??= {}
        if (start[0] === "startAt") start[0] = "startAfter"
        start[1][v[0]] = v[2]
        q.reverse.start = true
      } else if (v[1] === ">=") {
        start ??= ["startAt"]
        start[1] ??= {}
        start[1][v[0]] = v[2]
        q.reverse.start = true
      }
    }
  }
  q.start = start
  q.end = end
}

const checkSort = q => {
  let sort = []
  if (q.equals.length > 0) {
    const eq_keys = pluck(0, q.equals)
    const qkeys = pluck(0, q.sort)
    let ex = false
    for (const v of qkeys) {
      if (!includes(v, eq_keys)) {
        ex = true
      } else if (ex) {
        err(`the wrong sort ${JSON.stringify(q.sort)}`)
      }
    }
    const dups = intersection(eq_keys, qkeys)
    const imap = indexOf(prop(0), q.sort)
    let new_sort = slice(dups.length, q.sort.length, q.sort)
    for (const v of reverse(eq_keys)) {
      new_sort.unshift(imap[v] ?? [v, "asc"])
      sort.unshift(imap[v] ?? [v, "asc"])
    }
    q.sort = new_sort
  }
  const next_index = sort.length
  if (!isNil(q.range?.[0][0])) {
    if (q.sort.length === sort.length || q.range[0][1] === "in") {
      sort.push([q.range[0][0]])
    } else if (
      !isNil(q.sort[next_index]) &&
      q.range[0][0] !== q.sort[next_index][0]
    ) {
      err(`the sort field at [${next_index}] must be [${q.range[0][0]}]`)
    }

    if (includes(q.range[0][1], ["!=", "in", "not-in"])) {
      const qkeys = pluck(0, q.sort)
      if (qkeys.length !== 0 && qkeys[next_index] !== q.range[0][0]) {
        if (includes(q.range[0][0], qkeys)) {
          err(`the wrong sort ${JSON.stringify(q.sort)}`)
        } else {
          q.sort.splice(q.equals.length, 0, [q.range[0][0], "asc"])
          q.sortByTail = true
        }
      }
    }
  }
  for (const [i, v] of (q.sort || []).entries()) {
    if (isNil(sort[i])) {
      sort[i] = v
    } else if (sort[i][0] === v[0]) {
      if (!isNil(sort[i][1]) && !isNil(v[1]) && sort[i][1] !== v[1]) {
        err(`the wrong sort ${JSON.stringify(q.sort)}`)
      }
      if (isNil(sort[i][1]) && !isNil(v[1])) sort[i][1] = v[1]
    } else {
      err(`the wrong sort ${JSON.stringify(q.sort)}`)
    }
  }
  q.sort = map(v => {
    if (isNil(v[1])) v[1] = "asc"
    return v
  })(sort)
}

const parseQuery = query => {
  const parsed = parser(query)
  checkSort(parsed)
  checkStartEnd(parsed)
  buildQueries(parsed)
  return parsed
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

export default parseQuery
