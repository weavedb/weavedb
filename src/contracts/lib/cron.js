import fpjson from "fpjson-lang"

import {
  path,
  is,
  map,
  isNil,
  clone,
  includes,
  sortBy,
  prop,
  head,
} from "ramda"
import { get } from "../actions/read/get"
import { upsert } from "../actions/write/upsert"
import { update } from "../actions/write/update"
import { add } from "../actions/write/add"
import { remove } from "../actions/write/remove"
import { set } from "../actions/write/set"
import { batch } from "../actions/write/batch"

export const executeCron = async (cron, state) => {
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
      await ops[op](...params)
    }
  }
}
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
      await executeCron(cron, _state)
    } catch (e) {
      console.log(e)
    }
  }
  _state.crons.lastExecuted = SmartWeave.block.timestamp
  return { state: _state }
}
