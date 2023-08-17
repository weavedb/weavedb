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
const { clone } = require("./pure")

const executeCron =
  ops =>
  async (cron, state, SmartWeave, kvs, depth = 1, _vars = {}) => {
    let vars = mergeLeft(_vars, {
      block: {
        height: SmartWeave.block.height,
        timestamp: SmartWeave.block.timestamp,
      },
    })
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
      let op = head(job)
      let _var = null
      let query = null
      if (op === "if") {
        if (!fpjson(job[1], vars)) continue
        job = job[2]
        op = head(job)
      }
      if (op === "ifelse") {
        job = fpjson(job[1], vars) ? job[2] : job[3]
        op = head(job)
      }
      if (op === "break") break
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
            await ops.get(
              state,
              {
                caller: state.owner,
                input: { function: "get", query: await parse(query) },
              },
              undefined,
              SmartWeave,
              kvs
            )
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
        params.push("cron")
        await ops[op](...params)
      }
    }
  }

const cron = ops => async (state, SmartWeave, _kvs) => {
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
      await executeCron(ops)(cron, _state, SmartWeave, kvs)
      for (const k in kvs) _kvs[k] = kvs[k]
    } catch (e) {
      console.log(e)
    }
  }
  _state.crons.lastExecuted = SmartWeave.block.timestamp
  return { state: _state }
}

module.exports = { cron, executeCron }
