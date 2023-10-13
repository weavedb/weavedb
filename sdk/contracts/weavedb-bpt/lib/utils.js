let fpjson = require("fpjson-lang")
fpjson = fpjson.default || fpjson
const jsonLogic = require("json-logic-js")
const md5 = require("./md5")
const {
  keys,
  symmetricDifference,
  uniq,
  sortBy,
  identity,
  reverse,
  indexOf,
  prop,
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
  difference,
  path: _path,
} = require("ramda")
const {
  parse: _parse,
  err,
  genId,
  getField,
  mergeData,
} = require("../../common/lib/utils")
const {
  fpj,
  ac_funcs,
  clone,
  isValidName,
  setElm,
  parse: __parse,
} = require("../../common/lib/pure")
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

const validateData = async ({
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
  get,
  kvs,
}) => {
  if (!isNil(func)) {
    let [_func, ..._method] = func.split(":")
    _method = _method.join(":")
    if (
      includes(_func)(["set", "add", "update", "upsert", "delete"]) &&
      (secure || !isNil(rules))
    ) {
      let op = _func
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
          func: _func,
          op: op,
          method: _method === "" ? op : _method,
          auth: { signer: _signer, relayer, jobID, extra },
          block: {
            height: SmartWeave.block.height,
            timestamp: SmartWeave.block.timestamp,
          },
          transaction: {
            id: SmartWeave.transaction.id,
            timestamp:
              action.timestamp ??
              SmartWeave.transaction.timestamp ??
              SmartWeave.block.timestamp * 1000,
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
      rule_data.signer = rule_data.request.auth.signer
      rule_data.id = rule_data.request.id
      rule_data.ts = rule_data.request.block.timestamp
      rule_data.ms = rule_data.request.transaction.timestamp
      rule_data.new = rule_data.resource.newData
      rule_data.old = rule_data.resource.data
      rule_data.req = rule_data.request.resource.data

      const isAllowed = (_ops, request) => {
        if (_ops === "*") return true
        const ops = _ops.split(",")
        let methods = uniq([
          "write",
          request.op,
          request.func,
          request.method,
          `${request.func}:${request.method}`,
          `${request.op}:${request.method}`,
          `write:${request.method}`,
        ])
        return intersection(ops)(methods).length > 0
      }
      const fn = {
        parse: async str => [JSON.parse(str), false],
        stringify: async json => [JSON.stringify(json), false],
        get: async query => {
          let val = null
          let isBreak = false
          val =
            (
              await get(
                state,
                {
                  input: {
                    function: "get",
                    query,
                  },
                },
                undefined,
                SmartWeave,
                kvs
              )
            )?.result ?? null
          return [val, isBreak]
        },
      }
      if (!isNil(rules)) {
        if (is(Array, rules)) {
          for (const v of rules || []) {
            if (isAllowed(v[0], rule_data.request)) {
              await fpj(v[1], rule_data, { ...fn, ...ac_funcs })
            }
          }
          allowed = rule_data.request.allow === true
        } else {
          for (let k in rules || {}) {
            const [permission, _ops] = k.split(" ")
            if (permission !== "let") continue
            const rule = rules[k]
            let ok = false
            if (isNil(_ops)) {
              ok = true
            } else {
              const ops = _ops.split(",")
              if (
                intersection(ops)(["write", rule_data.request.method]).length >
                0
              ) {
                ok = true
              }
            }

            if (ok) {
              for (let k2 in rule || {}) {
                let _op = rule[k2][0]
                let logic = rule[k2]
                if (_op === "if") {
                  if (!fpjson(clone(rule[k2][1]), rule_data)) continue
                  logic = rule[k2][2]
                } else if (_op === "ifelse") {
                  if (fpjson(clone(rule[k2][1]), rule_data)) {
                    logic = rule[k2][2]
                  } else {
                    logic = rule[k2][3]
                  }
                }
                _op = logic[0]
                if (_op === "get") {
                  const result =
                    (
                      await get(
                        state,
                        {
                          input: {
                            function: "get",
                            query: __parse(logic[1], rule_data),
                          },
                        },
                        undefined,
                        SmartWeave,
                        kvs
                      )
                    )?.result ?? null
                  setElm(k2, result, rule_data)
                } else {
                  setElm(k2, fpjson(clone(logic), rule_data), rule_data)
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
            if (
              intersection(ops)(["write", rule_data.request.method]).length > 0
            ) {
              const ok = jsonLogic.apply(rule, rule_data)
              if (permission === "allow" && ok) {
                allowed = true
              } else if (permission === "deny" && ok) err()
            }
          }
        }
      }
      if (!allowed) err("operation not allowed")
      return rule_data.resource.newData
    } else {
      return next_data
    }
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
  kvs,
  get,
  type,
  _func
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
    kvs,
    undefined,
    get,
    type,
    _func
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
  doc,
  get,
  type,
  _func
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
        extra,
        true,
        _signer,
        SmartWeave,
        action
      ).__data
    } else if (includes(func)(["update", "upsert"])) {
      next_data = mergeData(
        clone(doc),
        new_data,
        extra,
        false,
        _signer,
        SmartWeave,
        action
      ).__data
    }
  }
  if (type !== "cron") {
    await validateData({
      func: _func,
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
      get,
      kvs,
    })
  }
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
        doc,
        get,
        type,
        _func
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
  kvs,
  get,
  type
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
    type,
    { getDoc, getCol, addNewDoc, get }
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
  vars,
  timestamp
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
        { crons: { jobs: t.func, version: t.version, key: t.key } },
        _state,
        SmartWeave,
        _kvs,
        depth,
        { ...vars, batch: [] },
        timestamp
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
  let _startAtCursor = null
  let _startAfterCursor = null
  let _endAtCursor = null
  let _endBeforeCursor = null
  let _array_contains = null
  let _array_contains_any = null
  for (const v of clone(opt)) {
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
        if (
          !isNil(_startAt) ||
          !isNil(_startAfter) ||
          !isNil(_startAtCursor) ||
          !isNil(_startAfterCursor)
        ) {
          err(`only one startAt/startAfter is allowed`)
        } else if (v.length <= 1) {
          err(`startAt has no value`)
        } else {
          if (v[1].__cursor__) {
            _startAtCursor = v
            _startAtCursor[1].data.__id__ = _startAtCursor[1].id
          } else {
            _startAt = v
          }
        }
      } else if (v[0] === "startAfter") {
        if (
          !isNil(_startAt) ||
          !isNil(_startAfter) ||
          !isNil(_startAtCursor) ||
          !isNil(_startAfterCursor)
        ) {
          err(`only one startAt/startAfter is allowed`)
        } else if (v.length <= 1) {
          err(`startAfter has no value`)
        } else {
          if (v[1].__cursor__) {
            _startAfterCursor = v
            _startAfterCursor[1].data.__id__ = _startAfterCursor[1].id
          } else {
            _startAfter = v
          }
        }
      } else if (v[0] === "endAt") {
        if (
          !isNil(_endAt) ||
          !isNil(_endBefore) ||
          !isNil(_endAtCursor) ||
          !isNil(_endBeforeCursor)
        ) {
          err(`only one endAt/endBefore is allowed`)
        } else if (v.length <= 1) {
          err(`endAt has no value`)
        } else {
          if (v[1].__cursor__) {
            _endAtCursor = v
            _endAtCursor[1].data.__id__ = _endAtCursor[1].id
          } else {
            _endAt = v
          }
        }
      } else if (v[0] === "endBefore") {
        if (
          !isNil(_endAt) ||
          !isNil(_endBefore) ||
          !isNil(_endAtCursor) ||
          !isNil(_endBeforeCursor)
        ) {
          err(`only one endAt/endBefore is allowed`)
        } else if (v.length <= 1) {
          err(`endBefore has no value`)
        } else {
          if (v[1].__cursor__) {
            _endBeforeCursor = v
            _endBeforeCursor[1].data.__id__ = _endBeforeCursor[1].id
          } else {
            _endBefore = v
          }
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
            if (
              !isNil(_filter.range) ||
              !isNil(_filter["!="]) ||
              !isNil(_filter["in"]) ||
              !isNil(_filter["not-in"])
            ) {
              err(`== must come before inequity [${JSON.stringify(v)}]`)
            } else if (_keys[v[0]])
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
  q.startCursor = _startAtCursor ?? _startAfterCursor ?? null
  q.endCursor = _endAtCursor ?? _endBeforeCursor ?? null
  q.sort = _sort ?? []
  q.reverse = { start: false, end: false }
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
  q.sortByTail = false
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
        for (const [i, v] of tail(q.start).entries()) {
          if (isNil(q.sort[i]))
            err(`sort must exist for [${JSON.stringify(v)}]`)
          start[1][q.sort[i][0]] = v
        }
      }
    } else if (!isNil(q.end)) {
      end ??= []
      end[0] = q.end[0]
      end[1] ??= {}
      if (q.end[1]?.__cursor__) {
        end[1] = assoc("__id__", q.end[1].id, q.end[1].data)
      } else {
        for (const [i, v] of tail(q.end).entries()) {
          if (isNil(q.sort[i]))
            err(`sort must exist for [${JSON.stringify(v)}]`)
          end[1][q.sort[i][0]] = v
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
        q.reverse.end = true
      } else if (v[1] === "<=") {
        end ??= ["endAt"]
        end[1] ??= {}
        end[1][v[0]] = v[2]
        q.reverse.end = true
      } else if (v[1] === ">") {
        start ??= ["startAfter"]
        start[1] ??= {}
        if (start[0] === "startAt") start[0] = "startAfter"
        start[1][v[0]] = v[2]
        q.reverse.start = true
      } else if (v[1] === ">=") {
        start ??= ["startAt"]
        start[1] ??= {}
        start[1][v[0]] = v[2]
        q.reverse.start = true
      }
    }
  }
  q.start = start
  q.end = end
}

const checkSort = q => {
  let sort = []
  if (q.equals.length > 0) {
    const eq_keys = pluck(0, q.equals)
    const qkeys = pluck(0, q.sort)
    let ex = false
    for (const v of qkeys) {
      if (!includes(v, eq_keys)) {
        ex = true
      } else if (ex) {
        err(`the wrong sort ${JSON.stringify(q.sort)}`)
      }
    }
    const dups = intersection(eq_keys, qkeys)
    const imap = indexOf(prop(0), q.sort)
    let new_sort = slice(dups.length, q.sort.length, q.sort)
    for (const v of reverse(eq_keys)) {
      new_sort.unshift(imap[v] ?? [v, "asc"])
      sort.unshift(imap[v] ?? [v, "asc"])
    }
    q.sort = new_sort
  }
  const next_index = sort.length
  if (!isNil(q.range?.[0][0])) {
    if (q.sort.length === sort.length || q.range[0][1] === "in") {
      sort.push([q.range[0][0]])
    } else if (
      !isNil(q.sort[next_index]) &&
      q.range[0][0] !== q.sort[next_index][0]
    ) {
      err(`the sort field at [${next_index}] must be [${q.range[0][0]}]`)
    }

    if (includes(q.range[0][1], ["!=", "in", "not-in"])) {
      const qkeys = pluck(0, q.sort)
      if (qkeys.length !== 0 && qkeys[next_index] !== q.range[0][0]) {
        if (includes(q.range[0][0], qkeys)) {
          err(`the wrong sort ${JSON.stringify(q.sort)}`)
        } else {
          q.sort.splice(q.equals.length, 0, [q.range[0][0], "asc"])
          q.sortByTail = true
        }
      }
    }
  }
  for (const [i, v] of (q.sort || []).entries()) {
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
  }
  q.sort = map(v => {
    if (isNil(v[1])) v[1] = "asc"
    return v
  })(sort)
}

const buildQueries = q => {
  q.queries = []
  if (!isNil(q.array)) {
    let opt = { limit: q.limit }
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
      let opt1 = {}
      let end = clone(q.end)
      end ??= ["endBefore"]
      end[1] ??= {}
      if (end[0] !== "endBefore") end[0] = "endBefore"
      end[1][q.range[0][0]] = q.range[0][2]
      opt1.endBefore = end[1]
      if (!isNil(q.start)) opt1[q.start[0]] = q.start[1]
      let opt2 = {}
      let start = clone(q.start)
      start ??= ["startAfter"]
      start[1] ??= {}
      if (start[0] !== "startAfter") start[0] = "startAfter"
      start[1][q.range[0][0]] = q.range[0][2]
      opt2.startAfter = start[1]
      if (!isNil(q.end)) opt2[q.end[0]] = q.end[1]
      q.queries = [{ opt: opt1 }, { opt: opt2 }]
      q.reverse.start = true
      q.reverse.end = true
      q.sortRange = true
    } else if (op === "in") {
      let __ranges = sortBy(identity)(q.range[0][2])
      for (let v of __ranges) {
        let opt = {}
        let start = clone(q.start)
        start ??= ["startAt"]
        start[1] ??= {}
        start[1][q.range[0][0]] = v
        opt.startAt = start[1]
        let end = clone(q.end)
        end ??= ["endAt"]
        end[1] ??= {}
        end[1][q.range[0][0]] = v
        opt.endAt = end[1]
        q.queries.push({ opt })
        q.sortRange = true
        q.reverse.start = true
        q.reverse.end = true
      }
    } else if (op === "not-in") {
      let prev = null
      let __ranges = sortBy(identity)(q.range[0][2])
      for (let [i, v] of __ranges.entries()) {
        let opt = {}
        let start = clone(q.start)
        if (i !== 0) {
          start ??= ["startAfter"]
          start[1] ??= {}
          start[1][q.range[0][0]] = prev
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
      }
      q.sortRange = true
      q.reverse.start = true
      q.reverse.end = true
    }
    q.type = q.sortByTail ? "pranges" : "ranges"
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

const auth = async (
  state,
  action,
  func,
  SmartWeave,
  use_nonce = true,
  kvs,
  fn
) => {
  if (isNil(state.auth)) return { signer: null, original_signer: null }
  const {
    query,
    nonce,
    signature,
    caller,
    type = "secp256k1",
    pubKey,
  } = action.input
  if (
    !includes(type)(
      state.auth.algorithms || ["secp256k1", "secp256k1-2", "ed25519", "rsa256"]
    )
  ) {
    err(`The wrong algorithm`)
  }
  let _caller = caller
  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]
  const domain = {
    name: state.auth.name,
    version: state.auth.version,
    verifyingContract: isNil(SmartWeave.contract)
      ? "exm"
      : SmartWeave.contract.id,
  }

  const message = {
    nonce,
    query: JSON.stringify({ func, query }),
  }

  const _data = {
    types: {
      EIP712Domain,
      Query: [
        { name: "query", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    },
    domain,
    primaryType: "Query",
    message,
  }
  let signer = null
  if (type === "ed25519") {
    const { isValid } = await read(
      state.contracts.dfinity,
      {
        function: "verify",
        data: _data,
        signature,
        signer: caller,
      },
      SmartWeave
    )
    if (isValid) {
      signer = caller
    } else {
      err(`The wrong signature`)
    }
  } else if (type === "rsa256") {
    let encoded_data = JSON.stringify(_data)
    if (typeof TextEncoder !== "undefined") {
      const enc = new TextEncoder()
      encoded_data = enc.encode(encoded_data)
    }
    const _crypto =
      SmartWeave.arweave.crypto || SmartWeave.arweave.wallets.crypto
    const isValid = await _crypto.verify(
      pubKey,
      encoded_data,
      Buffer.from(signature, "hex")
    )
    if (isValid) {
      signer = caller
    } else {
      err(`The wrong signature`)
    }
  } else if (type == "secp256k1") {
    signer = (
      await read(
        state.contracts.ethereum,
        {
          function: "verify712",
          data: _data,
          signature,
        },
        SmartWeave
      )
    ).signer
  } else if (type == "secp256k1-2") {
    signer = (
      await read(
        state.contracts.ethereum,
        {
          function: "verify",
          data: _data,
          signature,
        },
        SmartWeave
      )
    ).signer
  }

  if (includes(type)(["secp256k1", "secp256k1-2"])) {
    if (/^0x/.test(signer)) signer = signer.toLowerCase()
    if (/^0x/.test(_caller)) _caller = _caller.toLowerCase()
  }
  const timestamp = isNil(action.timestamp)
    ? isNil(SmartWeave.transaction.timestamp)
      ? Math.round(SmartWeave.transaction.timestamp)
      : SmartWeave.block.timestamp
    : Math.round(action.timestamp / 1000)
  let original_signer = signer
  let _signer = signer
  if (_signer !== _caller) {
    const link = state.auth.links[_signer]
    if (!isNil(link)) {
      let _address = is(Object, link) ? link.address : link
      let _expiry = is(Object, link) ? link.expiry || 0 : 0
      if (_expiry === 0 || timestamp <= _expiry) _signer = _address
    }
  }
  if (_signer !== _caller) err(`signer[${_signer}] is not caller[${_caller}]`)
  if (use_nonce !== false)
    await fn.useNonce(nonce, original_signer, state, kvs, SmartWeave)
  return { signer: _signer, original_signer }
}

module.exports = {
  trigger,
  getDoc: _getDoc,
  getCol: _getCol,
  parse,
  kv,
  parseQuery,
  err,
  auth,
}
