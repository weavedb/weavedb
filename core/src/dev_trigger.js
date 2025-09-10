import { of, ka } from "monade"
import { fpj } from "./fpjson.js"
import {
  isNil,
  includes,
  intersection,
  difference,
  equals,
  keys,
  uniq,
} from "ramda"
import { putData, delData, validateSchema, merge, genDocID } from "./utils.js"

function trigger({ state, env }) {
  const { kv, kv_dir } = env
  const { doc, dir, data, before } = state
  let mod = { on: null, diff: {}, before, after: data, id: doc }
  if (before !== null && data === null) {
    mod.on = "delete"
    for (const k in before) mod.diff[k] = { before: before[k], after: null }
  } else if (before !== null && data !== null) {
    const bkeys = keys(before)
    const akeys = keys(data)
    const allkeys = uniq(bkeys, akeys)
    for (const k of allkeys) {
      if (!equals(before[k], data[k])) {
        mod.on = "update"
        mod.diff[k] = { before: before[k] ?? null, after: data[k] ?? null }
      }
    }
  } else if (before === null && data !== null) {
    mod.on = "create"
    for (const k in data) mod.diff[k] = { before: null, after: data[k] }
  }
  const _putData = ({ before, op, data, dir, doc }) => {
    let _state = {
      dir,
      doc,
      signer: state.signer,
      ts: state.ts,
      id: env.id,
      owner: env.owner,
      before,
    }
    if (op === "del") {
      _state.data = null
      of({ state: _state, env }).map(delData)
    } else {
      _state.data = merge(data, _state, undefined, env)
      if (op === "add") {
        of({ state: _state, env })
          .map(genDocID)
          .tap(validateSchema)
          .map(putData)
      } else {
        of({ state: _state, env }).tap(validateSchema).map(putData)
      }
    }
    return [true, false]
  }
  const checkDir = (v, op) => {
    let data, dir, doc
    if (op === "del") [dir, doc] = v
    else [data, dir, doc] = v
    if (isNil(kv.get("_", dir))) throw Error("dir doesn't exist:", dir)
    const before = op === "add" ? null : (kv.get(dir, doc) ?? null)
    return { data, dir, doc, before }
  }
  if (mod.on) {
    let { triggers } = kv.get("_", dir)
    for (const k in triggers ?? {}) {
      const t = triggers[k]
      let ons = t.on.split(",")
      if (includes(mod.on, ons)) {
        const diff_keys = keys(mod.diff)
        let ok = !t.fields
        let match = t.match ?? "all"
        if (!ok) {
          if (match === "all" && difference(t.fields, diff_keys).length === 0) {
            ok = true
          } else if (
            match === "any" &&
            intersection(t.fields, diff_keys).length > 0
          ) {
            ok = true
          } else if (
            match === "none" &&
            intersection(t.fields, diff_keys).length === 0
          ) {
            ok = true
          }
        }
        if (ok) {
          let vars = { data: mod, batch: [] }
          const fns = {
            add: v => {
              const { data, dir, before } = checkDir(v, "add")
              return _putData({ before, op: "add", data, dir })
            },
            set: v => {
              const { data, dir, doc, before } = checkDir(v)
              if (before) throw Error("doc exists")
              return _putData({ before, data, dir, doc })
            },
            update: v => {
              const { data, dir, doc, before } = checkDir(v)
              if (!before) throw Error("doc doesn't exist")
              return _putData({ before, data, dir, doc })
            },
            upsert: v => {
              const { data, dir, doc, before } = checkDir(v)
              return _putData({ before, data, dir, doc })
            },
            del: v => {
              const { dir, doc, before } = checkDir(v, "del")
              if (!before) throw Error("doc doesn't exist")
              return _putData({ before, op: "del", dir, doc })
            },
          }
          fpj(t.fn, vars, fns)
          for (const v of vars.batch) {
            const [op, ...query] = v
            fns[op](query)
          }
        }
      }
    }
  }
  return arguments[0]
}

export default trigger
