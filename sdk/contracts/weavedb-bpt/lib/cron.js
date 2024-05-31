let fpjson = require("fpjson-lang")
fpjson = fpjson.default ?? fpjson
let fn = require("./fn")
const { get } = require("../actions/read/get")
const { upsert } = require("../actions/write/upsert")
const { update } = require("../actions/write/update")
const { add } = require("../actions/write/add")
const { remove } = require("../actions/write/remove")
const { set } = require("../actions/write/set")
const { batch } = require("../actions/write/batch")

const ops = {
  get,
  upsert,
  update,
  add,
  delete: remove,
  set,
  batch,
}

const {
  concat,
  append,
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

const executeCron = async (
  cron,
  state,
  SmartWeave,
  kvs,
  depth = 1,
  _vars = { batch: [] },
  timestamp = null,
) => {
  let vars = mergeLeft(_vars, {
    block: {
      height: SmartWeave.block.height,
      timestamp: SmartWeave.block.timestamp,
    },
    transaction: {
      id: SmartWeave.transaction.id,
      timestamp:
        timestamp ??
        SmartWeave.transaction.timestamp ??
        SmartWeave.block.timestamp * 1000,
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
        timestamp,
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
  if (cron.crons.version === 2) {
    await fpj(replace$(cron.crons.jobs), vars, {
      hash: fn.hash,
      parse: fn.parse,
      transfer: async _query => {
        const query = _query[0]
        const token =
          (
            await ops.get(
              state,
              {
                caller: state.owner,
                input: {
                  function: "get",
                  query: [
                    "__tokens__",
                    ["key", "==", `${query.token}:${query.from}`],
                  ],
                },
              },
              true,
              SmartWeave,
              kvs,
            )
          ).result[0] || null
        const amount = token?.data?.amount ?? 0
        if (query.amount > amount) return [null, false]
        await execQuery("update", [
          {
            amount: { __op: "inc", n: -query.amount },
          },
          "__tokens__",
          token.id,
        ])
        const token2 =
          (
            await ops.get(
              state,
              {
                caller: state.owner,
                input: {
                  function: "get",
                  query: [
                    "__tokens__",
                    ["key", "==", `${query.token}:${query.to}`],
                  ],
                },
              },
              true,
              SmartWeave,
              kvs,
            )
          ).result[0] || null
        if (isNil(token2)) {
          await execQuery("add", [
            {
              key: `${query.token}:${query.to}`,
              amount: query.amount,
              address: query.to,
              token: query.token,
            },
            "__tokens__",
          ])
        } else {
          await execQuery("update", [
            {
              amount: { __op: "inc", n: query.amount },
            },
            "__tokens__",
            token2.id,
          ])
        }
        return [null, false]
      },
      withdraw: async _query => {
        const query = _query[0]
        const token =
          (
            await ops.get(
              state,
              {
                caller: state.owner,
                input: {
                  function: "get",
                  query: [
                    "__tokens__",
                    ["key", "==", `${query.token}:${query.from}`],
                  ],
                },
              },
              true,
              SmartWeave,
              kvs,
            )
          ).result[0] || null
        const amount = token?.data?.amount ?? 0
        if (query.amount > amount) return [null, false]
        await execQuery("update", [
          {
            amount: { __op: "inc", n: -query.amount },
            withdraw: { __op: "inc", n: query.amount },
          },
          "__tokens__",
          token.id,
        ])
        return [null, false]
      },
      mint: async _query => {
        const query = _query[0]
        state.tokens.available_l2 ??= {}
        state.tokens.allocated ??= {}
        state.tokens.available_l2[query.token] ??= "0"
        state.tokens.allocated[query.token] ??= "0"
        if (
          BigInt(state.tokens.available_l2[query.token]) -
            BigInt(query.amount) <
          0
        ) {
          return [null, false]
        }
        state.tokens.available_l2[query.token] = (
          BigInt(state.tokens.available_l2[query.token]) - BigInt(query.amount)
        ).toString()
        state.tokens.allocated[query.token] = (
          BigInt(state.tokens.allocated[query.token]) + BigInt(query.amount)
        ).toString()
        const token =
          (
            await ops.get(
              state,
              {
                caller: state.owner,
                input: {
                  function: "get",
                  query: [
                    "__tokens__",
                    ["key", "==", `${query.token}:${query.to}`],
                  ],
                },
              },
              true,
              SmartWeave,
              kvs,
            )
          ).result[0] || null
        if (token === null) {
          await execQuery("add", [
            {
              key: `${query.token}:${query.to}`,
              amount: query.amount,
              address: query.to,
              token: query.token,
            },
            "__tokens__",
          ])
        } else {
          await execQuery("update", [
            {
              amount: { __op: "inc", n: query.amount },
            },
            "__tokens__",
            token.id,
          ])
        }
        return [null, false]
      },
      toBase64: fn.toBase64,
      stringify: fn.stringify,
      upsert: fn.upsert(execQuery),
      delete: fn.delete(execQuery),
      update: fn.update(execQuery),
      set: fn.set(execQuery),
      add: fn.add(execQuery),
      batch: fn.batch(execQuery),
      toBatchAll: fn.toBatchAll,
      toBatch: fn.toBatch,
      get: async query => {
        const val =
          (
            await ops.get(
              state,
              {
                caller: state.owner,
                input: { function: "get", query },
                timestamp,
              },
              undefined,
              SmartWeave,
              kvs,
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
  } else {
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
              kvs,
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
        params.push(ops.get)
        await ops[op](...params)
      }
    }
  }
}

const cron = async (state, SmartWeave, _kvs = {}, timestamp) => {
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
      await executeCron(cron, _state, SmartWeave, kvs, timestamp)
      for (const k in kvs) _kvs[k] = kvs[k]
    } catch (e) {
      console.log(e)
    }
  }
  _state.crons.lastExecuted = SmartWeave.block.timestamp
  return { state: _state, count: crons.length }
}

module.exports = { cron, executeCron }
