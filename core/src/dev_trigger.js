import { of } from "monade"
import read from "./dev_read.js"
import { replace$, fpj } from "./fpjson.js"
import { checkDocID } from "./utils.js"
import {
  concat,
  isNil,
  includes,
  intersection,
  difference,
  equals,
  keys,
  uniq,
  map,
  path,
  is,
} from "ramda"
import {
  putData,
  delData,
  validateSchema,
  merge,
  genDocID,
  wdb23,
  wdb160,
  cid,
} from "./utils.js"

function trigger({ state, env }) {
  const { kv, kv_dir, info } = env
  const { ts, doc, dir, data, before, dirinfo } = state
  let mod = {
    on: null,
    diff: {},
    before,
    after: data,
    doc,
    dir,
    i: info.i,
    ts,
    db: info.id,
    owner: info.owner,
    signer: state.signer,
    signer23: state.signer23,
  }
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
      dirinfo: state.dirinfo,
      signer: state.signer,
      signer23: state.signer23,
      i: info.i,
      ts,
      id: info.id,
      owner: info.owner,
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
    const _env = { kv, kv_dir, info }

    if (op === "del") {
      _state.data = null
      of({ state: _state, env: _env }).map(delData)
    } else {
      _state.data = merge(data, _state, undefined, _env)
      if (op === "add") {
        of({ state: _state, env: _env })
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
    let data, dir, doc, dirinfo
    if (op === "del") [dir, doc] = v
    else [data, dir, doc] = v
    if (isNil(kv.get("_", dir))) throw Error("dir doesn't exist:", dir)
    const before = op === "add" ? null : (kv.get(dir, doc) ?? null)
    return { data, dir, doc, before }
  }
  if (mod.on) {
    //let { triggers } = kv.get("_", dir)
    let triggers = {}
    for (let k in dirinfo.triggers || {}) {
      triggers[k] = kv.get(
        "_config",
        `triggers_${dirinfo.index}_${dirinfo.triggers[k]}`,
      )
    }
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
            wdb23: v => [wdb23(v), false],
            wdb160: v => [wdb160(v), false],
            cid: v => [cid(v), false],
            get: v => {
              const [dir, doc] = v
              if (dir[0] === "_") return [kv.get(...v), false]
              let state = { opcode: "get" }
              state.query = v
              state.dir = dir
              state.dirinfo = kv.get("_", dir)
              if (typeof doc === "string") {
                checkDocID(doc, kv)
                state.doc = doc
                state.range = false
              } else state.range = true
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

              return [
                of({ state, env: { ...env, kv_dir } })
                  .map(read)
                  .val(),
                false,
              ]
            },
            add: v => {
              const { data, dir, before } = checkDir(v, "add")
              return _putData({ before, op: "add", data, dir })
            },
            set: v => {
              const { data, dir, doc, before } = checkDir(v, "set")
              if (before) throw Error("doc exists")
              return _putData({ before, data, dir, doc })
            },
            update: v => {
              const { data, dir, doc, before } = checkDir(v, "update")
              if (!before) throw Error("doc doesn't exist")
              return _putData({ before, data, dir, doc })
            },
            upsert: v => {
              const { data, dir, doc, before } = checkDir(v, "upsert")
              return _putData({ before, data, dir, doc })
            },
            del: v => {
              const { dir, doc, before } = checkDir(v, "del")
              if (!before) throw Error("doc doesn't exist")
              return _putData({ before, op: "del", dir, doc })
            },
            toBatchAll: (query, obj) => {
              obj.batch = concat(obj.batch, query)
              return [true, false]
            },
            toBatch: (query, obj) => {
              obj.batch.push(query)
              return [true, false]
            },
          }
          fpj(t.fn, vars, fns)
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
          let batch = []
          for (const v of vars.batch) {
            if (typeof v === "string") {
              batch = [...batch, ...parse(replace$(v))]
            } else {
              batch.push(v)
            }
          }
          for (const v of batch) {
            let [op, ...query] = v
            if (op[0] === "%") op = op.slice(1)
            fns[op](parse(replace$(query)))
          }
        }
      }
    }
  }
  return arguments[0]
}

export default trigger
