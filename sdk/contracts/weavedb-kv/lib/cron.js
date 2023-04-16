let fpjson = require("fpjson-lang")
fpjson = fpjson.default ?? fpjson
const {
  mergeLeft,
  path,
  is,
  map,
  isNil,
  includes,
  sortBy,
  prop,
  head,
} = require("ramda")
const { clone } = require("../lib/utils")
const { get } = require("../actions/read/get")
const { upsert } = require("../actions/write/upsert")
const { update } = require("../actions/write/update")
const { add } = require("../actions/write/add")
const { remove } = require("../actions/write/remove")
const { set } = require("../actions/write/set")
const { batch } = require("../actions/write/batch")

const executeCron = async (
  cron,
  state,
  SmartWeave,
  kvs,
  depth = 1,
  _vars = {}
) => {
  let vars = mergeLeft(_vars, {
    block: {
      height: SmartWeave.block.height,
      timestamp: SmartWeave.block.timestamp,
    },
  })
  let ops = { upsert, update, add, delete: remove, set, batch }
  const parse = query => {
    if (is(Array, query)) {
      query = map(v => (is(Object, v) ? parse(v) : v))(query)
    } else if (is(Object, query)) {
      if (is(String, query.var)) {
        return path(query.var.split("."))(vars)
      } else {
        query = map(v => parse(v))(query)
      }
    }
    return query
  }
  for (let job of cron.crons.jobs) {
    const op = head(job)
    let _var = null
    let query = null
    if (includes(op)(["get", "let"])) {
      _var = job[1]
      query = job[2]
    } else {
      query = job[1]
    }
    if (op === "do") {
      fpjson(query, vars)
    } else if (op === "let") {
      vars[_var] = fpjson(query, vars)
    } else if (op === "get") {
      const _default = job[3]
      vars[_var] =
        (
          await get(state, {
            caller: state.owner,
            input: { function: "get", query: await parse(query) },
          })
        ).result || _default
    } else if (
      includes(op)(["set", "upsert", "add", "delete", "update", "batch"])
    ) {
      let params = [
        state,
        {
          caller: state.owner,
          input: { function: op, query: await parse(query) },
        },
        true,
      ]
      if (op === "add") params.push(0)
      params.push(false)
      params.push(SmartWeave)
      params.push(kvs)
      params.push(executeCron)
      params.push(depth + 1)
      await ops[op](...params)
    }
  }
}
const cron = async (state, SmartWeave, _kvs) => {
  const now = SmartWeave.block.timestamp
  if (isNil(state.crons)) {
    state.crons = { lastExecuted: now, crons: {} }
  }
  const last = state.crons.lastExecuted
  let crons = []
  for (let k in state.crons.crons) {
    const v = state.crons.crons[k]
    let start = v.start
    let end = v.end
    let times = v.do ? 1 : 0
    while (start <= now && (isNil(v.times) || v.times >= times)) {
      if ((start > last && isNil(end)) || end >= start) {
        if (start !== v.start || v.do) crons.push({ start, crons: v })
      }
      start += v.span
      times += 1
    }
  }
  crons = sortBy(prop("start"))(crons)
  let _state = clone(state)
  for (let cron of crons) {
    try {
      let kvs = {}
      await executeCron(cron, _state, SmartWeave, kvs)
      for (const k in kvs) _kvs[k] = kvs[k]
    } catch (e) {
      console.log(e)
    }
  }
  _state.crons.lastExecuted = SmartWeave.block.timestamp
  return { state: _state }
}

module.exports = { cron, executeCron }
