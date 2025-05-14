const {
  complement,
  assoc,
  tail,
  last,
  isNil,
  includes,
  any,
  map,
  clone,
} = require("ramda")

const { kv, getDoc, parseQuery, err } = require("../../lib/utils")
const {
  ranges: _ranges,
  pranges: _pranges,
  range: _range,
} = require("../../lib/index")
const md5 = require("../../lib/md5")

const get = async (state, action, cursor = false, SmartWeave, kvs) => {
  let parsed = parseQuery(action.input.query)
  const { data } = state
  if (parsed.path.length % 2 === 0) {
    const { doc: _data } = await getDoc(
      null,
      parsed.path,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      state,
      null,
      SmartWeave,
      undefined,
      kvs,
    )
    return {
      result: isNil(_data.__data)
        ? null
        : cursor
          ? {
              id: last(parsed.path),
              setter: _data.setter,
              data: _data.__data || null,
              __cursor__: true,
            }
          : _data.__data || null,
    }
  } else {
    let res = null
    const { limit, path, sort } = parsed
    if (parsed.type === "range") {
      res = await _range(
        clone(sort),
        parsed.queries[0].opt,
        path,
        kvs,
        SmartWeave,
        false,
        parsed.queries[0].prefix,
        {
          start: parsed.startCursor,
          end: parsed.endCursor,
          reverse: parsed.reverse,
        },
      )
    } else if (parsed.type === "ranges") {
      res = await _ranges(
        map(v => ({
          ...v,
          sort: clone(sort),
        }))(parsed.queries),
        limit,
        path,
        kvs,
        SmartWeave,
        {
          start: parsed.startCursor,
          end: parsed.endCursor,
          reverse: parsed.reverse,
          sortRange: parsed.sortRange,
        },
      )
    } else if (parsed.type === "pranges") {
      res = await _pranges(
        map(v => ({
          ...v,
          sort: clone(sort),
          path,
        }))(parsed.queries),
        limit,
        kvs,
        SmartWeave,
        parsed.sortByTail,
        {
          start: parsed.startCursor,
          end: parsed.endCursor,
          reverse: parsed.reverse,
        },
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
          : v.val,
      )(res),
    }
  }
}
module.exports = { get, parseQuery }
