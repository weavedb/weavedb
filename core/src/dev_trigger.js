import { of } from "monade"
import read from "./dev_read.js"
import { fpj } from "./fpjson.js"
import { checkDocID } from "./utils.js"
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
    const kv_dir = {
      get: k => kv.get("__indexes__", `${dir}/${k}`),
      put: (k, v, nosave) => kv.put("__indexes__", `${dir}/${k}`, v),
      del: (k, nosave) => kv.del("__indexes__", `${dir}/${k}`),
      data: key => ({
        val: kv.get(dir, key),
        __id__: key.split("/").pop(),
      }),
      putData: (key, val) => kv.put(dir, key, val),
      delData: key => kv.del(dir, key),
    }
    const _env = { kv, kv_dir }

    if (op === "del") {
      _state.data = null
      of({ state: _state, env: _env }).map(delData)
    } else {
      _state.data = merge(data, _state, undefined, env)
      if (op === "add") {
        of({ state: _state, env })
          .map(genDocID)
          .tap(validateSchema)
          .map(putData)
      } else {
        of({ state: _state, env: _env }).tap(validateSchema).map(putData)
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
          let vars = { ...mod, batch: [] }
          const fns = {
            get: v => {
              const [dir, doc] = v
              if (dir[0] === "_") return [kv.get(...v), false]
              let state = { opcode: "get" }
              state.query = v
              state.dir = dir
              if (typeof doc === "string") {
                checkDocID(doc, kv)
                state.doc = doc
                state.range = false
              } else state.range = true
              return [of({ state, env }).map(read).val(), false]
            },
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
