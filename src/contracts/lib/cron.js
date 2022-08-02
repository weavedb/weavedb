import { fn } from "./utils"
import { path, is, map, isNil, clone, includes, sortBy, prop } from "ramda"
import { get } from "../actions/read/get"
import { upsert } from "../actions/write/upsert"
import { update } from "../actions/write/update"
import { add } from "../actions/write/add"
import { remove } from "../actions/write/remove"
import { set } from "../actions/write/set"
import { batch } from "../actions/write/batch"

export const cron = async state => {
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
    while (start <= now) {
      if ((start > last && isNil(end)) || end >= start) {
        crons.push({ start, crons: v })
      }
      start += v.span
    }
  }
  let obj = { state: clone(state) }
  for (let cron of crons) {
    let vars = {
      block: {
        height: SmartWeave.block.height,
        timestamp: SmartWeave.block.timestamp,
      },
    }
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
      if (job.op === "do") {
        fn(job.code, vars)
      } else if (job.op === "let") {
        vars[job.var] = fn(job.code, vars)
      } else if (job.op === "get") {
        vars[job.var] =
          (
            await get(obj.state, {
              caller: state.owner,
              input: { function: "get", query: await parse(job.query) },
            })
          ).result || job.default
      } else if (
        includes(job.op)(["set", "upsert", "add", "delete", "update", "batch"])
      ) {
        let params = [
          obj.state,
          {
            caller: state.owner,
            input: { function: job.op, query: await parse(job.query) },
          },
          true,
        ]
        if (job.op === "add") params.push(0)
        params.push(false)
        await ops[job.op](...params)
      }
    }
  }
  obj.state.crons.lastExecuted = SmartWeave.block.timestamp
  return { state: obj.state }
}
