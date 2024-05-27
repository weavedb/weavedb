const {
  includes,
  init,
  of,
  isNil,
  tail,
  is,
  complement,
  concat,
  without,
} = require("ramda")
const md5 = require("./md5")
const { clone, bigIntFromBytes } = require("./pure")

const read = async (contract, param, SmartWeave) => {
  return (await SmartWeave.contracts.viewContractState(contract, param)).result
}

const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    const error = typeof ContractError === "undefined" ? Error : ContractError
    throw new error(msg)
  } else {
    throw msg
  }
}

const getField = (data, path) => {
  if (path.length === 1) {
    return [path[0], data]
  } else {
    if (isNil(data[path[0]])) data[path[0]] = {}
    return getField(data[path[0]], tail(path))
  }
}
const mergeDataP = async (
  _data,
  new_data,
  extra = {},
  overwrite = false,
  signer,
  SmartWeave,
  action,
  state,
) => {
  let exists = true
  if (isNil(_data.__data) || overwrite) {
    _data.__data = {}
    exists = false
  }
  for (let k in new_data) {
    const path = exists ? k.split(".") : [k]
    const [field, obj] = getField(_data.__data, path)
    const d = new_data[k]
    if (is(Object)(d) && d.__op === "zkp") {
      const res = await read(
        state.contracts.polygonID,
        {
          function: "verify",
          proof: d.proof,
          pub_signals: d.pub_signals,
        },
        SmartWeave,
      )
      obj[field] = res
    } else if (is(Object)(d) && d.__op === "data") {
      obj[field] = extra[d.key] ?? null
    } else if (is(Object)(d) && d.__op === "arrayUnion") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, obj[field])) obj[field] = []
      obj[field] = concat(obj[field], d.arr)
    } else if (is(Object)(d) && d.__op === "arrayRemove") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, obj[field])) obj[field] = []
      obj[field] = without(d.arr, obj[field])
    } else if (is(Object)(d) && d.__op === "inc") {
      if (isNaN(d.n)) err()
      if (isNil(obj[field])) obj[field] = 0
      obj[field] += d.n
    } else if (is(Object)(d) && d.__op === "del") {
      delete obj[field]
    } else if (is(Object)(d) && d.__op === "ts") {
      obj[field] = SmartWeave.block.timestamp
    } else if (is(Object)(d) && d.__op === "ms") {
      obj[field] = action.timestamp ?? SmartWeave.block.timestamp * 1000
    } else if (is(Object)(d) && d.__op === "signer") {
      obj[field] = signer
    } else {
      obj[field] = d
    }
  }
  return _data
}

const mergeData = (
  _data,
  new_data,
  extra = {},
  overwrite = false,
  signer,
  SmartWeave,
  action,
) => {
  let exists = true
  if (isNil(_data.__data) || overwrite) {
    _data.__data = {}
    exists = false
  }
  for (let k in new_data) {
    const path = exists ? k.split(".") : [k]
    const [field, obj] = getField(_data.__data, path)
    const d = new_data[k]
    if (is(Object)(d) && d.__op === "data") {
      obj[field] = extra[d.key] ?? null
    } else if (is(Object)(d) && d.__op === "arrayUnion") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, obj[field])) obj[field] = []
      obj[field] = concat(obj[field], d.arr)
    } else if (is(Object)(d) && d.__op === "arrayRemove") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, obj[field])) obj[field] = []
      obj[field] = without(d.arr, obj[field])
    } else if (is(Object)(d) && d.__op === "inc") {
      if (isNaN(d.n)) err()
      if (isNil(obj[field])) obj[field] = 0
      obj[field] += d.n
    } else if (is(Object)(d) && d.__op === "del") {
      delete obj[field]
    } else if (is(Object)(d) && d.__op === "ts") {
      obj[field] = SmartWeave.block.timestamp
    } else if (is(Object)(d) && d.__op === "ms") {
      obj[field] = action.timestamp ?? SmartWeave.block.timestamp * 1000
    } else if (is(Object)(d) && d.__op === "signer") {
      obj[field] = signer
    } else {
      obj[field] = d
    }
  }
  return _data
}

const genId = async (action, salt, SmartWeave) => {
  const id = md5(
    JSON.stringify({
      input: action.input,
      txid: SmartWeave.transaction?.id ?? SmartWeave.block?.height,
      timestamp:
        SmartWeave.transaction?.timestamp ?? SmartWeave.block?.timestamp,
    }),
  )
  return Buffer.from(id, "hex")
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
}

const parse = async (
  state,
  action,
  _func,
  signer,
  salt,
  contractErr = true,
  SmartWeave,
  kvs,
  type,
  fn,
) => {
  let func
  if (!isNil(_func)) func = _func.split(":")[0]
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
      path.push(id)
      await fn.addNewDoc(id, SmartWeave, state, kvs)
    } else if (
      includes(func)(["setRules", "addTrigger"]) &&
      query.length % 2 === 1
    ) {
      path = init(path)
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
        "addTrigger",
        "removeTrigger",
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
      "addTrigger",
      "removeTrigger",
      "removeIndex",
      "setSchema",
      "getSchema",
      "setRules",
      "getRules",
    ])
  ) {
    _data = await fn.getCol(
      data,
      path,
      signer,
      SmartWeave,
      undefined,
      kvs,
      state,
    )
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
    const doc = await fn.getDoc(
      data,
      path,
      signer,
      func,
      new_data,
      state.secure,
      relayer,
      jobID,
      extra,
      state,
      action,
      SmartWeave,
      undefined,
      kvs,
      fn.get,
      type,
      _func,
    )
    _data = doc.doc
    ;({ next_data, schema, rules, col } = doc)
  }
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (
    !isNil(state.auth) &&
    includes(func)([
      "addRelayerJob",
      "removeRelayerJob",
      "addIndex",
      "addTrigger",
      "removeTrigger",
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
    err(
      `caller[${signer}] is not contract owner[${owner.join(", ")}]`,
      contractErr,
    )
  }
  return { data, query, new_data, path, _data, schema, col, next_data }
}

module.exports = {
  err,
  read,
  getField,
  mergeData,
  mergeDataP,
  genId,
  parse,
}
