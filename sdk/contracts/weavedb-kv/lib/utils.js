let fpjson = require("fpjson-lang")
fpjson = fpjson.default || fpjson
const jsonLogic = require("json-logic-js")
const {
  of,
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
const { isValidName } = require("./pure")
const clone = state => JSON.parse(JSON.stringify(state))
const { validate: validator } = require("./jsonschema")
const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    const error = typeof ContractError === "undefined" ? Error : ContractError
    throw new error(msg)
  } else {
    throw msg
  }
}

const getCol = async (data, path, _signer, SmartWeave, current_path = []) => {
  if (isNil(data)) {
    const _data = await SmartWeave.kv.get(`data.${current_path.join("/")}`)
    if (isNil(_data)) {
      data = {}
    } else {
      data = _data
    }
  }
  const [col, id] = path
  if (!isValidName(col)) err(`collection id is not valid: ${col}`)
  if (isNil(data[col])) {
    data[col] = { __docs: {} }
    await SmartWeave.kv.put(`data.${current_path.join("/")}`, data)
  }
  current_path.push(col)
  current_path.push(id)
  if (isNil(id)) {
    return data[col]
  } else {
    if (!isValidName(id)) err(`doc id is not valid: ${id}`)
    data[col].__docs[id] ||= { __data: null, subs: {} }
    if (!isNil(_signer) && isNil(data[col].__docs[id].setter)) {
      data[col].__docs[id].setter = _signer
    }
    return await getCol(
      data[col].__docs[id].subs,
      slice(2, path.length, path),
      _signer,
      SmartWeave,
      current_path
    )
  }
}

const mergeData = (_data, new_data, overwrite = false, signer, SmartWeave) => {
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

const validateData = ({
  func,
  secure,
  rules,
  doc,
  SmartWeave,
  state,
  _signer,
  relayer,
  jobID,
  extra,
  new_data,
  next_data,
  path,
}) => {
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
      contract: {
        id: SmartWeave.contract.id,
        version: state.version,
        owners: is(Array, state.owner) ? state.owner : [state.owner],
      },
      request: {
        method: op,
        auth: { signer: _signer, relayer, jobID, extra },
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
            setElm(k2, fpjson(clone(rule[k2]), rule_data))
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
}

const getDoc = async (
  data,
  path,
  _signer,
  func,
  new_data,
  secure = false,
  relayer,
  jobID,
  extra,
  state,
  SmartWeave,
  current_path = []
) => {
  if (isNil(data)) {
    const _data = await SmartWeave.kv.get(`data.${current_path.join("/")}`)
    if (isNil(_data)) {
      data = {}
    } else {
      data = _data
    }
  }
  const [_col, id] = path
  if (!isValidName(_col)) err(`collection id is not valid: ${_col}`)
  if (!isValidName(id)) err(`doc id is not valid: ${id}`)
  if (isNil(data[_col])) {
    data[_col] = { __docs: {} }
    await SmartWeave.kv.put(`data.${current_path.join("/")}`, data)
  }
  current_path.push(_col)
  current_path.push(id)
  const col_key = `data.${current_path.slice(0, -1).join("/")}`
  const doc_key = `data.${current_path.join("/")}`
  const col = (await SmartWeave.kv.get(col_key)) || { __docs: {} }
  const { rules, schema } = col
  const doc = (await SmartWeave.kv.get(doc_key)) || { __data: null, subs: {} }
  if (!isNil(_signer) && isNil(doc.setter)) doc.setter = _signer
  let next_data = null
  if (path.length === 2) {
    if (includes(func)(["set", "add"])) {
      next_data = mergeData(
        clone(doc),
        new_data,
        true,
        _signer,
        SmartWeave
      ).__data
    } else if (includes(func)(["update", "upsert"])) {
      next_data = mergeData(
        clone(doc),
        new_data,
        false,
        _signer,
        SmartWeave
      ).__data
    }
  }
  validateData({
    func,
    secure,
    rules,
    doc,
    SmartWeave,
    state,
    _signer,
    relayer,
    jobID,
    extra,
    new_data,
    next_data,
    path,
  })

  return path.length >= 4
    ? await getDoc(
        doc.subs,
        slice(2, path.length, path),
        _signer,
        func,
        new_data,
        secure,
        relayer,
        jobID,
        extra,
        state,
        SmartWeave,
        current_path
      )
    : {
        doc,
        schema,
        rules,
        col,
        next_data,
      }
}

const isEvolving = state =>
  !isNil(state.evolveHistory) &&
  !isNil(last(state.evolveHistory)) &&
  isNil(last(state.evolveHistory).newVersion)

function bigIntFromBytes(byteArr) {
  let hexString = ""
  for (const byte of byteArr) {
    hexString += byte.toString(16).padStart(2, "0")
  }
  return BigInt("0x" + hexString)
}

async function getRandomIntNumber(
  max,
  action,
  uniqueValue = "",
  salt,
  SmartWeave
) {
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

const genId = async (action, salt, SmartWeave) => {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let autoId = ""
  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(
      (await getRandomIntNumber(CHARS.length, action, i, salt, SmartWeave)) - 1
    )
  }
  return autoId
}

const parse = async (
  state,
  action,
  func,
  signer,
  salt,
  contractErr = true,
  SmartWeave
) => {
  const { data } = state
  const { query } = action.input
  const { relayer, jobID, extra } = action
  let new_data = null
  let path = null
  let col
  if (
    includes(func)([
      "delete",
      "getSchema",
      "getRules",
      "getAlgorithms",
      "removeRelayerJob",
      "getRelayerJob",
      "listCollections",
    ])
  ) {
    path = query
  } else {
    ;[new_data, ...path] = query
    if (func === "add") {
      const id = await genId(action, salt, SmartWeave)
      let tx_ids =
        (await SmartWeave.kv.get(`tx_ids.${SmartWeave.transaction.id}`)) || []
      tx_ids.push(id)
      await SmartWeave.kv.put(`tx_ids.${SmartWeave.transaction.id}`, tx_ids)
      path.push(id)
    }
  }
  if (
    (isNil(new_data) &&
      !includes(func)([
        "listCollections",
        "delete",
        "getSchema",
        "getRules",
        "getAlgorithms",
        "getRelayerJob",
        "removeRelayerJob",
        "getRelayerJob",
      ])) ||
    (path.length === 0 &&
      !includes(func)(["setAlgorithms", "listCollections"])) ||
    (path.length % 2 !== 0 &&
      !includes(func)([
        "addRelayerJob",
        "removeRelayerJob",
        "getRelayerJob",
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
    err(`the wrong query length[${query.length}] for ${func}`, contractErr)
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
    _data = await getCol(null, path, signer, SmartWeave)
    col = _data
  } else if (
    !includes(func)([
      "setAlgorithms",
      "addRelayerJob",
      "removeRelayerJob",
      "getAlgorithms",
      "linkContract",
      "unlinkContract",
    ]) &&
    path.length !== 0
  ) {
    const doc = await getDoc(
      null,
      path,
      signer,
      func,
      new_data,
      state.secure,
      relayer,
      jobID,
      extra,
      state,
      SmartWeave
    )
    _data = doc.doc
    ;({ next_data, schema, rules, col } = doc)
  }
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (
    includes(func)([
      "addRelayerJob",
      "removeRelayerJob",
      "addIndex",
      "removeIndex",
      "setSchema",
      "setAlgorithms",
      "setRules",
      "unlinkContract",
      "linkContract",
      "unlinkContract",
    ]) &&
    !includes(signer)(owner)
  ) {
    err("caller is not contract owner", contractErr)
  }
  return { data, query, new_data, path, _data, schema, col, next_data }
}

const read = async (contract, param, SmartWeave) => {
  return (await SmartWeave.contracts.viewContractState(contract, param)).result
}

const validateSchema = (schema, data, contractErr) => {
  if (!isNil(schema)) {
    const valid = validator(data, clone(schema)).valid
    if (!valid) err(null, contractErr)
  }
}

const isOwner = (signer, state) => {
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (!includes(signer)(owner)) {
    err(`Signer[${signer}] is not the owner[${owner.join(", ")}].`)
  }
  return owner
}

module.exports = {
  isOwner,
  clone,
  err,
  getDoc,
  getCol,
  isEvolving,
  parse,
  read,
  validateSchema,
  mergeData,
}
