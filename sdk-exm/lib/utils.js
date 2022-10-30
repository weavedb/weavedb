const {
  cond,
  compose,
  o,
  map,
  apply,
  tail,
  intersection,
  concat,
  without,
  isNil,
  slice,
  includes,
  is,
  complement,
  clone,
  last,
} = require("ramda")
const jsonLogic = require("json-logic-js")
const fpjson = require("fpjson-lang")

const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    throw new ContractError(msg)
  } else {
    throw msg
  }
}

const mergeData = (_data, new_data, overwrite = false, signer) => {
  if (isNil(_data.__data) || overwrite) _data.__data = {}
  for (let k in new_data) {
    const d = new_data[k]
    if (is(Object)(d) && d.__op === "arrayUnion") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, _data.__data[k])) _data.__data[k] = []
      _data.__data[k] = concat(_data.__data[k], d.arr)
    } else if (is(Object)(d) && d.__op === "arrayRemove") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, _data.__data[k])) _data.__data[k] = []
      _data.__data[k] = without(d.arr, _data.__data[k])
    } else if (is(Object)(d) && d.__op === "inc") {
      if (isNaN(d.n)) err()
      if (isNil(_data.__data[k])) _data.__data[k] = 0
      _data.__data[k] += d.n
    } else if (is(Object)(d) && d.__op === "del") {
      delete _data.__data[k]
    } else if (is(Object)(d) && d.__op === "ts") {
      _data.__data[k] = SmartWeave.block.timestamp
    } else if (is(Object)(d) && d.__op === "signer") {
      _data.__data[k] = signer
    } else {
      _data.__data[k] = d
    }
  }
  return _data
}

const getDoc = (data, path, _signer, func, new_data, secure = false) => {
  const [_col, id] = path
  data[_col] ||= { __docs: {} }
  const col = data[_col]
  const { rules, schema } = col
  col.__docs[id] ||= { __data: null, subs: {} }
  const doc = col.__docs[id]
  if (!isNil(_signer) && isNil(doc.setter)) doc.setter = _signer
  let next_data = null
  return path.length >= 4
    ? getDoc(doc.subs, slice(2, path.length, path), _signer, func, null, secure)
    : {
        doc,
        schema,
        rules,
        col,
        next_data,
      }
}

const getCol = (data, path, _signer) => {
  const [col, id] = path
  data[col] ||= { __docs: {} }
  if (isNil(id)) {
    return data[col]
  } else {
    data[col].__docs[id] ||= { __data: null, subs: {} }
    if (!isNil(_signer) && isNil(data[col].__docs[id].setter)) {
      data[col].__docs[id].setter = _signer
    }
    return getCol(
      data[col].__docs[id].subs,
      slice(2, path.length, path),
      _signer
    )
  }
}

const parse = async (state, action, func, signer, salt, contractErr = true) => {
  const { data } = state
  const { query } = action.input
  let new_data = null
  let path = null
  let col
  if (includes(func)(["delete", "getSchema", "getRules", "getAlgorithms"])) {
    path = query
  } else {
    ;[new_data, ...path] = query
  }
  if (
    (isNil(new_data) &&
      !includes(func)(["delete", "getSchema", "getRules", "getAlgorithms"])) ||
    (path.length === 0 && !includes(func)(["setAlgorithms"])) ||
    (path.length % 2 !== 0 &&
      !includes(func)([
        "addIndex",
        "removeIndex",
        "setSchema",
        "getSchema",
        "getAlgorithms",
        "setRules",
        "getRules",
        "linkContract",
        "unlinkContract",
      ]))
  ) {
    err(null, contractErr)
  }
  let _data = null
  let schema = null
  let rules = null
  let next_data
  if (
    includes(func)([
      "addIndex",
      "removeIndex",
      "setSchema",
      "getSchema",
      "setRules",
      "getRules",
    ])
  ) {
    _data = getCol(data, path, signer, func)
    col = _data
  } else if (
    !includes(func)([
      "setAlgorithms",
      "getAlgorithms",
      "linkContract",
      "unlinkContract",
    ])
  ) {
    const doc = getDoc(data, path, signer, func, new_data, state.secure)
    _data = doc.doc
    ;({ next_data, schema, rules, col } = doc)
  }
  return { data, query, new_data, path, _data, schema, col, next_data }
}

module.exports = {
  getCol,
  getDoc,
  err,
  mergeData,
  parse,
}
