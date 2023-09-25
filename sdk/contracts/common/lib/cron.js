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
const { fpj, clone, replace$ } = require("./pure")

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
    let batchExecuted = false
    const execQuery = async (op, query) => {
      let params = [
        state,
        {
          caller: state.owner,
          input: { function: op, query: await parse(replace$(query)) },
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
      params.push(ops.get)
      return await ops[op](...params)
    }
    await fpj(cron.crons.jobs, vars, {
      upsert: async query => [await execQuery("upsert", query), false],
      delete: async query => [await execQuery("delete", query), false],
      update: async query => [await execQuery("update", query), false],
      set: async query => [await execQuery("set", query), false],
      add: async query => [await execQuery("add", query), false],
      batch: async (query, obj) => {
        obj.batchExecuted = true
        return [await execQuery("batch", query), false]
      },
      get: async (query, obj) => {
        const val =
          (
            await ops.get(
              state,
              {
                caller: state.owner,
                input: { function: "get", query },
              },
              undefined,
              SmartWeave,
              kvs
            )
          ).result || null
        return [val, false]
      },
    })
    if (
      !isNil(vars.batch) &&
      vars.batch.length > 0 &&
      vars.batchExecuted !== true
    ) {
      await execQuery("batch", vars.batch)
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
      let kvs = { batch: [] }
      await executeCron(ops)(cron, _state, SmartWeave, kvs)
      for (const k in kvs) _kvs[k] = kvs[k]
    } catch (e) {
      console.log(e)
    }
  }
  _state.crons.lastExecuted = SmartWeave.block.timestamp
  return { state: _state, count: crons.length }
}

module.exports = { cron, executeCron }
