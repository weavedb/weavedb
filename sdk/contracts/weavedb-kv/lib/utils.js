let fpjson = require("fpjson-lang")
fpjson = fpjson.default || fpjson
const jsonLogic = require("json-logic-js")
const {
  tail,
  init,
  mergeLeft,
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
  append,
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

const getCol = async (path, _signer, SmartWeave, current_path = [], kvs) => {
  const [col, id] = path
  if (!isValidName(col)) err(`collection id is not valid: ${col}`)
  let key = `data.${append(col)(current_path).join("/")}`
  let data =
    (await kv(kvs, SmartWeave).get(`data.${current_path.join("/")}`)) ?? {}
  if (isNil(data[col])) {
    data[col] = true
    await kv(kvs, SmartWeave).put(`data.${current_path.join("/")}`, data)
  }
  let _data = await kv(kvs, SmartWeave).get(key)
  if (isNil(_data)) {
    _data = { __docs: {} }
    await kv(kvs, SmartWeave).put(key, _data)
  }
  if (isNil(id)) {
    return _data
  } else {
    if (!isValidName(id)) err(`doc id is not valid: ${id}`)
    current_path.push(col)
    current_path.push(id)
    return await getCol(
      slice(2, path.length, path),
      _signer,
      SmartWeave,
      current_path,
      kvs
    )
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

const validateData = ({
  func,
  secure,
  rules,
  doc,
  SmartWeave,
  state,
  action,
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
        caller: action.caller,
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
  action,
  SmartWeave,
  current_path = [],
  kvs
) => {
  data ??=
    (await kv(kvs, SmartWeave).get(`data.${current_path.join("/")}`)) ?? {}
  const [_col, id] = path
  if (!isValidName(_col)) err(`collection id is not valid: ${_col}`)
  if (!isValidName(id)) err(`doc id is not valid: ${id}`)
  if (isNil(data[_col])) {
    data[_col] = true
    await kv(kvs, SmartWeave).put(`data.${current_path.join("/")}`, data)
  }
  current_path.push(_col)
  current_path.push(id)
  const col_key = `data.${current_path.slice(0, -1).join("/")}`
  const doc_key = `data.${current_path.join("/")}`
  const col = (await kv(kvs, SmartWeave).get(col_key)) || { __docs: {} }
  const { rules, schema } = col
  const doc = (await kv(kvs, SmartWeave).get(doc_key)) || {
    __data: null,
    subs: {},
  }
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
    action,
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
        action,
        SmartWeave,
        current_path,
        kvs
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
  SmartWeave,
  kvs
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
        (await kv(kvs, SmartWeave).get(
          `tx_ids.${SmartWeave.transaction.id}`
        )) || []
      tx_ids.push(id)
      await kv(kvs, SmartWeave).put(
        `tx_ids.${SmartWeave.transaction.id}`,
        tx_ids
      )
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
    _data = await getCol(path, signer, SmartWeave, undefined, kvs)
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

const kv = (kvs, SW) => ({
  get: async key =>
    typeof kvs[key] !== "undefined" ? kvs[key] : await SW.kv.get(key),
  put: async (key, val) => {
    kvs[key] = val
  },
})

const trigger = async (
  on,
  state,
  path,
  SmartWeave,
  kvs,
  executeCron,
  depth,
  vars
) => {
  const trigger_key = `trigger.${init(path).join("/")}`
  state.triggers ??= {}
  const triggers = (state.triggers[trigger_key] ??= [])
  for (const t of triggers) {
    if (!includes(t.on)(on)) continue
    try {
      let _state = clone(state)
      let _kvs = clone(kvs)
      await executeCron(
        { crons: { jobs: t.func } },
        _state,
        SmartWeave,
        _kvs,
        depth,
        vars
      )
      state = _state
      for (const k in _kvs) kvs[k] = _kvs[k]
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = {
  trigger,
  wrapResult,
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
  kv,
}
