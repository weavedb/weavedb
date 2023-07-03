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
} = require("ramda")
const {
  parse: _parse,
  genId,
  mergeData,
  getField,
  err,
} = require("../../common/lib/utils")
const { clone, isValidName } = require("../../common/lib/pure")

const getCol = async (data, path, _signer) => {
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
    return await getCol(
      data[col].__docs[id].subs,
      slice(2, path.length, path),
      _signer
    )
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
  SmartWeave
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
        SmartWeave
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
  const txid = SmartWeave.transaction.id
  if (isNil(state.ids[txid])) state.ids[txid] = []
  state.ids[txid].push(id)
}

const parse = async (
  state,
  action,
  func,
  signer,
  salt,
  contractErr = true,
  SmartWeave
) =>
  await _parse(
    state,
    action,
    func,
    signer,
    salt,
    contractErr,
    SmartWeave,
    undefined,
    { getDoc, getCol, addNewDoc }
  )

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
      await executeCron(
        { crons: { jobs: t.func } },
        _state,
        SmartWeave,
        undefined,
        depth,
        vars
      )
      state = _state
    } catch (e) {
      console.log(e)
    }
  }
  return state
}

module.exports = { getDoc, getCol, parse, trigger }
