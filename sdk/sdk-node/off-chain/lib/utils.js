const fpjson = require("fpjson-lang")
const jsonLogic = require("json-logic-js")
const {
  concat,
  without,
  is,
  complement,
  isNil,
  slice,
  includes,
  last,
  intersection,
} = require("ramda")

const clone = state => JSON.parse(JSON.stringify(state))

const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    const error = typeof ContractError === "undefined" ? Error : ContractError
    throw new error(msg)
  } else {
    throw msg
  }
}

const getCol = (data, path, _signer) => {
  const [col, id] = path
  if (!isValidName(col)) err(`collection id is not valid: ${col}`)
  data[col] ||= { __docs: {} }
  if (isNil(id)) {
    return data[col]
  } else {
    if (!isValidName(id)) err(`doc id is not valid: ${id}`)
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

const getDoc = (
  data,
  path,
  _signer,
  func,
  new_data,
  secure = false,
  relayer,
  jobID,
  extra
) => {
  const [_col, id] = path
  if (!isValidName(_col)) err(`collection id is not valid: ${_col}`)
  if (!isValidName(id)) err(`doc id is not valid: ${id}`)
  data[_col] ||= { __docs: {} }
  const col = data[_col]
  const { rules, schema } = col
  col.__docs[id] ||= { __data: null, subs: {} }
  const doc = col.__docs[id]
  if (!isNil(_signer) && isNil(doc.setter)) doc.setter = _signer
  let next_data = null
  return path.length >= 4
    ? getDoc(
        doc.subs,
        slice(2, path.length, path),
        _signer,
        func,
        new_data,
        secure,
        relayer,
        jobID,
        extra
      )
    : {
        doc,
        schema,
        rules,
        col,
        next_data,
      }
}

module.exports = { err, getDoc, getCol }
