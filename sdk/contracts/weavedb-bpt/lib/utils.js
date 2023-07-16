let fpjson = require("fpjson-lang")
fpjson = fpjson.default || fpjson
const jsonLogic = require("json-logic-js")
const {
  init,
  is,
  isNil,
  slice,
  includes,
  last,
  intersection,
  append,
} = require("ramda")
const {
  parse: _parse,
  err,
  genId,
  getField,
  mergeData,
} = require("../../common/lib/utils")
const { clone, isValidName } = require("../../common/lib/pure")
const { validate: validator } = require("../../common/lib/jsonschema")
const { get: _get } = require("./index")

const getCol = async (
  data,
  path,
  _signer,
  SmartWeave,
  current_path = [],
  kvs
) => await _getCol(path, _signer, SmartWeave, (current_path = []), kvs)

const _getCol = async (path, _signer, SmartWeave, current_path = [], kvs) => {
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
    return await _getCol(
      slice(2, path.length, path),
      _signer,
      SmartWeave,
      current_path,
      kvs
    )
  }
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
) =>
  await _getDoc(
    null,
    path,
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

const _getDoc = async (
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
  kvs,
  doc
) => {
  data = (await kv(kvs, SmartWeave).get(`data.${current_path.join("/")}`)) || {}
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
  if (isNil(doc)) {
    doc = await _get(last(path), init(path), kvs, SmartWeave)
    doc.__data = doc.val
    doc.subs = {}
    delete doc.val
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
    ? await _getDoc(
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
        kvs,
        doc
      )
    : {
        doc,
        schema,
        rules,
        col,
        next_data,
      }
}

const addNewDoc = async (id, SmartWeave, state, kvs) => {
  let tx_ids =
    (await kv(kvs, SmartWeave).get(`tx_ids.${SmartWeave.transaction.id}`)) || []
  tx_ids.push(id)
  await kv(kvs, SmartWeave).put(`tx_ids.${SmartWeave.transaction.id}`, tx_ids)
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
  return await _parse(
    state,
    action,
    func,
    signer,
    salt,
    contractErr,
    SmartWeave,
    kvs,
    { getDoc, getCol, addNewDoc }
  )
}

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
  return state
}

module.exports = { trigger, getDoc: _getDoc, getCol: _getCol, parse, kv }
