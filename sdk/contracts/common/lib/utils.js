const {
  mergeLeft,
  includes,
  of,
  isNil,
  tail,
  is,
  complement,
  concat,
  without,
  last,
} = require("ramda")
const { clone, bigIntFromBytes } = require("./pure")
const { validate } = require("../../common/lib/jsonschema")

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

const mergeData = (_data, new_data, overwrite = false, signer, SmartWeave) => {
  let exists = true
  if (isNil(_data.__data) || overwrite) {
    _data.__data = {}
    exists = false
  }
  for (let k in new_data) {
    const path = exists ? k.split(".") : [k]
    const [field, obj] = getField(_data.__data, path)
    const d = new_data[k]
    if (is(Object)(d) && d.__op === "arrayUnion") {
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
    } else if (is(Object)(d) && d.__op === "signer") {
      obj[field] = signer
    } else {
      obj[field] = d
    }
  }
  return _data
}

const isEvolving = state =>
  !isNil(state.evolveHistory) &&
  !isNil(last(state.evolveHistory)) &&
  isNil(last(state.evolveHistory).newVersion)

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

const isOwner = (signer, state) => {
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (!includes(signer)(owner)) {
    err(`Signer[${signer}] is not the owner[${owner.join(", ")}].`)
  }
  return owner
}

const read = async (contract, param, SmartWeave) => {
  return (await SmartWeave.contracts.viewContractState(contract, param)).result
}

const validateSchema = (schema, data, contractErr) => {
  if (!isNil(schema)) {
    const valid = validate(data, clone(schema)).valid
    if (!valid) err(null, contractErr)
  }
}

const wrapResult = (state, original_signer, SmartWeave, extra) => ({
  state,
  result: mergeLeft(extra, {
    original_signer,
    transaction: {
      id: SmartWeave?.transaction?.id || null,
      owner: SmartWeave?.transaction?.owner || null,
      tags: SmartWeave?.transaction?.tags || null,
      quantity: SmartWeave?.transaction?.quantity || null,
      target: SmartWeave?.transaction?.target || null,
      reward: SmartWeave?.transaction?.reward || null,
    },
    block: {
      height: SmartWeave?.block?.height || null,
      timestamp: SmartWeave?.block?.timestamp || null,
      indep_hash: SmartWeave?.block?.indep_hash || null,
    },
  }),
})

const parse = async (
  state,
  action,
  func,
  signer,
  salt,
  contractErr = true,
  SmartWeave,
  kvs,
  fn
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
      path.push(id)
      await fn.addNewDoc(id, SmartWeave, state, kvs)
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
    _data = await fn.getCol(data, path, signer, SmartWeave, undefined, kvs)
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
      kvs
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
    err("caller is not contract owner", contractErr)
  }
  return { data, query, new_data, path, _data, schema, col, next_data }
}

module.exports = {
  err,
  getField,
  mergeData,
  isEvolving,
  genId,
  isOwner,
  read,
  validateSchema,
  wrapResult,
  parse,
}
