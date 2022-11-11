import {
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
} from "ramda"
import * as R from "ramda"
import jsonLogic from "json-logic-js"
import { validator } from "@exodus/schemasafe"
import fpjson from "fpjson-lang"

export const mergeData = (_data, new_data, overwrite = false, signer) => {
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

export const getDoc = (data, path, _signer, func, new_data, secure = false) => {
  const [_col, id] = path
  data[_col] ||= { __docs: {} }
  const col = data[_col]
  const { rules, schema } = col
  col.__docs[id] ||= { __data: null, subs: {} }
  const doc = col.__docs[id]
  if (!isNil(_signer) && isNil(doc.setter)) doc.setter = _signer
  let next_data = null
  if (path.length === 2) {
    if (includes(func)(["set", "add"])) {
      next_data = mergeData(clone(doc), new_data, true, _signer).__data
    } else if (includes(func)(["update", "upsert"])) {
      next_data = mergeData(clone(doc), new_data, false, _signer).__data
    }
  }
  if (
    includes(func)(["set", "add", "update", "upsert", "delete"]) &&
    (secure || !isNil(rules))
  ) {
    let op = func
    if (includes(op)(["set", "add"])) op = "create"
    if (op === "create" && !isNil(doc.__data)) op = "update"
    if (op === "upsert") {
      if (!isNil(doc.__data)) {
        op = "update"
      } else {
        op = "create"
      }
    }
    let allowed = false
    let rule_data = {
      request: {
        method: op,
        auth: { signer: _signer },
        block: {
          height: SmartWeave.block.height,
          timestamp: SmartWeave.block.timestamp,
        },
        transaction: {
          id: SmartWeave.transaction.id,
        },
        resource: { data: new_data },
        id: last(path),
        path,
      },
      resource: {
        data: doc.__data,
        setter: doc.setter,
        newData: next_data,
        id: last(path),
        path,
      },
    }
    const setElm = (k, val) => {
      let elm = rule_data
      let elm_path = k.split(".")
      let i = 0
      for (let v of elm_path) {
        if (i === elm_path.length - 1) {
          elm[v] = val
          break
        } else if (isNil(elm[v])) elm[v] = {}
        elm = elm[v]
        i++
      }
      return elm
    }

    if (!isNil(rules)) {
      for (let k in rules || {}) {
        const [permission, _ops] = k.split(" ")
        if (permission !== "let") continue
        const rule = rules[k]
        let ok = false
        if (isNil(_ops)) {
          ok = true
        } else {
          const ops = _ops.split(",")
          if (intersection(ops)(["write", op]).length > 0) {
            ok = true
          }
        }
        if (ok) {
          for (let k2 in rule || {}) {
            setElm(k2, fpjson(rule[k2], rule_data))
          }
        }
      }
    }

    for (let k in rules || {}) {
      const spk = k.split(" ")
      if (spk[0] === "let") continue
      const rule = rules[k]
      const [permission, _ops] = k.split(" ")
      const ops = _ops.split(",")
      if (intersection(ops)(["write", op]).length > 0) {
        const ok = jsonLogic.apply(rule, rule_data)
        if (permission === "allow" && ok) {
          allowed = true
        } else if (permission === "deny" && ok) err()
      }
    }
    if (!allowed) err("operation not allowed")
  }
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

export const getCol = (data, path, _signer) => {
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

function bigIntFromBytes(byteArr) {
  let hexString = ""
  for (const byte of byteArr) {
    hexString += byte.toString(16).padStart(2, "0")
  }
  return BigInt("0x" + hexString)
}

async function getRandomIntNumber(max, action, uniqueValue = "", salt) {
  const pseudoRandomData = SmartWeave.arweave.utils.stringToBuffer(
    SmartWeave.block.height +
      SmartWeave.block.timestamp +
      SmartWeave.transaction.id +
      action.caller +
      uniqueValue +
      salt.toString()
  )
  const hashBytes = await SmartWeave.arweave.crypto.hash(pseudoRandomData)
  const randomBigInt = bigIntFromBytes(hashBytes)
  return Number(randomBigInt % BigInt(max))
}

const genId = async (action, salt) => {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let autoId = ""
  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(
      (await getRandomIntNumber(CHARS.length, action, i, salt)) - 1
    )
  }
  return autoId
}

export const parse = async (
  state,
  action,
  func,
  signer,
  salt,
  contractErr = true
) => {
  const { data } = state
  const { query } = action.input
  let new_data = null
  let path = null
  let col
  if (includes(func)(["delete", "getSchema", "getRules", "getAlgorithms"])) {
    path = query
  } else {
    ;[new_data, ...path] = query
    if (func === "add") {
      const id = await genId(action, salt)
      if (isNil(state.ids[SmartWeave.transaction.id])) {
        state.ids[SmartWeave.transaction.id] = []
      }
      state.ids[SmartWeave.transaction.id].push(id)
      path.push(id)
    }
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
  if (
    includes(func)(["update", "upsert", "delete"]) &&
    _data.setter !== signer
  ) {
  } else if (
    includes(func)([
      "addIndex",
      "removeIndex",
      "setSchema",
      "setAlgorithms",
      "setRules",
      "unlinkContract",
      "linkContract",
      "unlinkContract",
    ]) &&
    action.caller !== state.owner
  ) {
    err("caller is not contract owner", contractErr)
  }
  return { data, query, new_data, path, _data, schema, col, next_data }
}
export const validateSchema = (schema, data, contractErr) => {
  if (!isNil(schema)) {
    const _validate = validator(schema)
    if (!_validate(data)) err(null, contractErr)
  }
}
export const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    throw new ContractError(msg)
  } else {
    throw msg
  }
}
