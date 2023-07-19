let fpjson = require("fpjson-lang")
fpjson = fpjson.default || fpjson
const jsonLogic = require("json-logic-js")
const md5 = require("./md5")
const {
  assoc,
  tail,
  pluck,
  map,
  toString,
  splitWhen,
  complement,
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
      for (const v of elm_path) {
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

const _parser = query => {
  const [path, opt] = splitWhen(complement(is)(String), query)
  if (isNil(path) || path.length === 0) err(`the wrong path`)
  if (!is(Object, opt)) err(`option must be an object`)
  let q = { path }
  let _filter = { "==": [] }
  let _keys = {}
  let _ranges = {}
  let _range_field = null
  let _sort = null
  let _startAt = null
  let _startAfter = null
  let _endAt = null
  let _endBefore = null
  let _array_contains = null
  let _array_contains_any = null
  for (const v of opt) {
    if (is(Number)(v)) {
      if (isNil(q.limit)) {
        if (v > 1000) err(`limit cannot be above 1000 [${v}]`)
        if (v !== Math.round(Math.abs(v)) || v < 1) {
          err(`limit must be a natural number [${v}]`)
        }
        q.limit = v
      } else {
        err(`only one limit is allowed [${v}]`)
      }
    } else if (!is(Array)(v)) {
      err(`unknown query [${JSON.stringify(v)}]`)
    } else {
      if (v.length === 0) {
        err(`empty query option []`)
      } else if (v[0] === "startAt") {
        if (!isNil(_startAt) || !isNil(_startAfter)) {
          err(`only one startAt/startAfter is allowed`)
        } else if (v.length <= 1) {
          err(`startAt has no value`)
        } else {
          _startAt = v
        }
      } else if (v[0] === "startAfter") {
        if (!isNil(_startAt) || !isNil(_startAfter)) {
          err(`only one startAt/startAfter is allowed`)
        } else if (v.length <= 1) {
          err(`startAfter has no value`)
        } else {
          _startAfter = v
        }
      } else if (v[0] === "endAt") {
        if (!isNil(_endAt) || !isNil(_endBefore)) {
          err(`only one endAt/endBefore is allowed`)
        } else if (v.length <= 1) {
          err(`endAt has no value`)
        } else {
          _endAt = v
        }
      } else if (v[0] === "endBefore") {
        if (!isNil(_endAt) || !isNil(_endBefore)) {
          err(`only one endAt/endBefore is allowed`)
        } else if (v.length <= 1) {
          err(`endBefore has no value`)
        } else {
          _endBefore = v
        }
      } else if (v.length === 3) {
        if (
          includes(v[1])([
            "==",
            "!=",
            ">",
            "<",
            ">=",
            "<=",
            "in",
            "not-in",
            "array-contains",
            "array-contains-any",
          ])
        ) {
          if (includes(v[1], ["array-contains", "array-contains-any"])) {
            if (
              !isNil(_filter["array-contains"]) ||
              !isNil(_filter["array-contains-any"])
            ) {
              err(`only one array-contains/array-contains-any is allowed`)
            }
            if (v[1] === "array-contains-any" && !is(Array, v[2])) {
              err(`array-contains-any must be an array ${JSON.stringify(v[2])}`)
            }
            _filter[v[1]] = v
          } else if (
            includes(v[1], ["!=", "in", "not-in", ">", ">=", "<", "<="])
          ) {
            if (includes(v[1], ["in", "not-in"]) && !is(Array, v[2])) {
              err(`${v[1]} must be an array [${JSON.stringify(v[2])}]`)
            }
            if (includes(v[1], [">", ">=", "<", "<="])) {
              if (
                !isNil(_filter["!="]) ||
                !isNil(_filter["in"]) ||
                !isNil(_filter["not-in"])
              ) {
                err(`only one inequity is allowed [${JSON.stringify(v)}]`)
              }
              if (!isNil(_range_field) && _range_field !== v[0]) {
                err(
                  `inequity has to be on the same field [${JSON.stringify(v)}]`
                )
              } else if (
                _ranges[v[1]] ||
                (v[1] === ">" && _ranges[">="]) ||
                (v[1] === ">=" && _ranges[">"]) ||
                (v[1] === "<" && _ranges["<="]) ||
                (v[1] === "<=" && _ranges["<"])
              ) {
                err(`duplicate inequity [${JSON.stringify(v)}]`)
              } else {
                _filter.range ??= []
                _filter.range.push(v)
                _range_field = v[0]
                _ranges[v[1]] = true
              }
            } else {
              if (
                !isNil(_filter.range) ||
                !isNil(_filter["!="]) ||
                !isNil(_filter["in"]) ||
                !isNil(_filter["not-in"])
              ) {
                err(`only one inequity is allowed [${JSON.stringify(v)}]`)
              }
              _filter[v[1]] = v
            }
          } else if (v[1] === "==") {
            if (_keys[v[0]])
              err(`only one == per field is allowed [${JSON.stringify(v)}]`)
            _filter["=="].push(v)
            _keys[v[0]] = true
          } else {
            if (!isNil(_filter[v[1]])) err()
            _filter[v[1]] = v
          }
        } else {
          err(`The wrong where operant [${v[1]}]`)
        }
      } else if (v.length === 2) {
        if (includes(v[1])(["asc", "desc"])) {
          if (isNil(_sort)) {
            _sort = [v]
          } else {
            _sort.push(v)
          }
        } else {
          err(`sort order [${JSON.stringify(v[1])}] must be either asc or desc`)
        }
      } else if (v.length === 1) {
        if (isNil(_sort)) {
          _sort = [append("asc", v)]
        } else {
          _sort.push(append("asc", v))
        }
      } else {
        err(`unknown query option [${JSON.stringify(v)}]`)
      }
    }
  }
  q.limit ??= 1000
  q.start = _startAt ?? _startAfter ?? null
  q.end = _endAt ?? _endBefore ?? null
  q.sort = _sort ?? []
  q.array = _filter["array-contains"] ?? _filter["array-contains-any"] ?? null
  q.equals = _filter["=="]
  q.range =
    _filter.range ??
    (!isNil(_filter.in)
      ? [_filter.in]
      : !isNil(_filter["not-in"])
      ? [_filter["not-in"]]
      : !isNil(_filter["!="])
      ? [_filter["!="]]
      : null)
  return q
}
const checkStartEnd = q => {
  if (q.equals.length > 0 && !isNil(q.range)) {
    if (includes(q.range[0][0], pluck(0, q.equals))) {
      err(`== and range field must be different [${JSON.stringify(q.range)}]`)
    }
  }
  if (
    (!isNil(q.start) || !isNil(q.end)) &&
    (q.equals.length > 0 || !isNil(q.range))
  ) {
    err(
      `range [${JSON.stringify(
        q.start ?? q.end
      )}] cannot be used with ==/inequity`
    )
  }
  let start = null
  let end = null
  if (!isNil(q.start) || !isNil(q.end)) {
    if (!isNil(q.start)) {
      start ??= []
      start[0] = q.start[0]
      start[1] ??= {}
      if (q.start[1]?.__cursor__) {
        start[1] = assoc("__id__", q.start[1].id, q.start[1].data)
      } else {
        let i = 0
        for (const v of tail(q.start)) {
          if (isNil(q.sort[i]))
            err(`sort must exist for [${JSON.stringify(v)}]`)
          start[1][q.sort[i][0]] = v
          i++
        }
      }
    } else if (!isNil(q.end)) {
      end ??= []
      end[0] = q.end[0]
      end[1] ??= {}
      let i = 0
      if (q.end[1]?.__cursor__) {
        end[1] = assoc("__id__", q.end[1].id, q.end[1].data)
      } else {
        for (const v of tail(q.end)) {
          if (isNil(q.sort[i]))
            err(`sort must exist for [${JSON.stringify(v)}]`)
          end[1][q.sort[i][0]] = v
          i++
        }
      }
    }
  } else {
    for (const v of q.equals) {
      start ??= ["startAt"]
      end ??= ["endAt"]
      start[1] ??= {}
      end[1] ??= {}
      start[1][v[0]] = v[2]
      end[1][v[0]] = v[2]
    }
    for (const v of q.range || []) {
      if (v[1] === "<") {
        end ??= ["endBefore"]
        end[1] ??= {}
        if (end[0] === "endAt") end[0] = "endBefore"
        end[1][v[0]] = v[2]
      } else if (v[1] === "<=") {
        end ??= ["endAt"]
        end[1] ??= {}
        end[1][v[0]] = v[2]
      } else if (v[1] === ">") {
        start ??= ["startAfter"]
        start[1] ??= {}
        if (start[0] === "startAt") start[0] = "startAfter"
        start[1][v[0]] = v[2]
      } else if (v[1] === ">=") {
        start ??= ["startAt"]
        start[1] ??= {}
        start[1][v[0]] = v[2]
      }
    }
  }
  q.start = start
  q.end = end
}
const checkSort = q => {
  let sort = []
  for (const v of q.equals) {
    sort.push([v[0]])
  }
  if (!isNil(q.range?.[0][0])) {
    sort.push([q.range?.[0][0]])
  }
  let i = 0
  for (const v of q.sort || []) {
    if (isNil(sort[i])) {
      sort[i] = v
    } else if (sort[i][0] === v[0]) {
      if (!isNil(sort[i][1]) && !isNil(v[1]) && sort[i][1] !== v[1]) {
        err(`the wrong sort ${JSON.stringify(q.sort)}`)
      }
      if (isNil(sort[i][1]) && !isNil(v[1])) sort[i][1] = v[1]
    } else {
      err(`the wrong sort ${JSON.stringify(q.sort)}`)
    }
    i++
  }
  q.sort = map(v => {
    if (isNil(v[1])) v[1] = "asc"
    return v
  })(sort)
}
const buildQueries = q => {
  q.queries = []
  if (!isNil(q.array)) {
    let opt = {}
    if (!isNil(q.start)) opt[q.start[0]] = q.start[1]
    if (!isNil(q.end)) opt[q.end[0]] = q.end[1]
    if (q.array[1] === "array-contains-any") {
      for (let v of q.array[2]) {
        const prefix = `${q.array[0]}/array:${md5(JSON.stringify(v))}`
        q.queries.push({ opt, prefix })
      }
      q.type = "pranges"
    } else {
      const prefix = `${q.array[0]}/array:${md5(JSON.stringify(q.array[2]))}`
      q.queries.push({ opt, prefix })
      q.type = "range"
    }
  } else if (includes(q.range?.[0]?.[1], ["!=", "not-in", "in"])) {
    const op = q.range?.[0]?.[1]
    if (op === "!=") {
      let end = clone(q.end)
      end ??= ["endBefore"]
      end[1] ??= {}
      if (end[0] !== "endBefore") end[0] = "endBefore"
      end[1][q.range[0][0]] = q.range[0][2]
      let opt1 = { endBefore: end[1] }
      if (!isNil(q.start)) opt1[q.start[0]] = q.start[1]

      let start = clone(q.start)
      start ??= ["startAfter"]
      start[1] ??= {}
      if (start[0] !== "startAfter") start[0] = "startAfter"
      start[1][q.range[0][0]] = q.range[0][2]
      let opt2 = { startAfter: start[1] }
      if (!isNil(q.end)) opt2[q.end[0]] = q.end[1]
      q.queries = [{ opt: opt1 }, { opt: opt2 }]
    } else if (op === "in") {
      for (let v of q.range[0][2]) {
        let start = clone(q.start)
        start ??= ["startAt"]
        start[1] ??= {}
        start[1][q.range[0][0]] = v
        let end = clone(q.end)
        end ??= ["endAt"]
        end[1] ??= {}
        end[1][q.range[0][0]] = v
        q.queries.push({ opt: { startAt: start[1], endAt: end[1] } })
      }
    } else if (op === "not-in") {
      let i = 0
      let prev = null
      for (let v of q.range[0][2]) {
        let opt = {}
        let start = clone(q.start)
        if (i !== 0) {
          start ??= ["startAt"]
          start[1] ??= {}
          start[1][q.range[0][0]] = v
        }
        if (!isNil(start)) opt[start[0]] = start[1]

        let end = clone(q.end)
        end ??= ["endBefore"]
        end[1] ??= {}
        end[1][q.range[0][0]] = v
        opt.endBefore = end[1]
        q.queries.push({ opt })
        if (i == q.range[0][2].length - 1) {
          let opt = {}
          let start = clone(q.start)
          start ??= ["startAfter"]
          start[1] ??= {}
          start[1][q.range[0][0]] = v
          opt.startAfter = start[1]
          let end = clone(q.end)
          if (!isNil(end)) opt[end[0]] = end[1]
          q.queries.push({ opt })
        }

        prev = v
        i++
      }
    }
    q.type = "ranges"
  } else {
    q.type = "range"
    let opt = { limit: q.limit }
    if (!isNil(q.start)) opt[q.start[0]] = q.start[1]
    if (!isNil(q.end)) opt[q.end[0]] = q.end[1]
    q.queries.push({ opt })
  }
}

const parseQuery = query => {
  const parsed = _parser(query)
  checkSort(parsed)
  checkStartEnd(parsed)
  buildQueries(parsed)
  return parsed
}

module.exports = {
  trigger,
  getDoc: _getDoc,
  getCol: _getCol,
  parse,
  kv,
  parseQuery,
}
