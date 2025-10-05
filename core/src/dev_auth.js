import { includes, isNil, mergeLeft, clone } from "ramda"
import { of } from "monade"
import { fpj, ac_funcs } from "./fpjson.js"
import read from "./dev_read.js"
import {
  cid as _cid,
  wdb160 as _wdb160,
  wdb23 as _wdb23,
  checkDocID,
} from "./utils.js"

function anyone() {
  return arguments[0]
}

function onlyOwner({ state, env }) {
  if (state.signer !== env.owner) throw Error("only owner can execute")
  return arguments[0]
}

function default_auth({
  state: {
    op,
    signer,
    signer23,
    ts,
    opcode,
    operand,
    dir,
    doc,
    query,
    before,
    data,
    dirinfo,
  },
  msg,
  env,
}) {
  const { kv, id, owner } = env
  let req = opcode === "del" ? {} : query[0]
  let vars = {
    op,
    opcode,
    operand,
    owner,
    signer,
    signer23,
    ts,
    db: id,
    dir,
    doc,
    query,
    req,
    before,
    after: data,
    allow: false,
  }
  let auth = []
  if (isNil(dirinfo)) throw Error(`dir doesn't exist: ${dir}`)
  for (const k in dirinfo.auth) {
    const _auth = kv.get("_config", `auth_${dirinfo.index}_${dirinfo.auth[k]}`)
    if (_auth) auth.push(_auth.rules)
  }
  let allow = false
  const get = (v, obj, set) => {
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

    const kv_dir = {
      get: k => kv.get("__indexes__", `${dir}/${k}`),
      put: (k, v, nosave) => kv.put("__indexes__", `${dir}/${k}`, v),
      del: (k, nosave) => kv.del("__indexes__", `${dir}/${k}`),
      twdata: key => ({
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
  }
  const wdb23 = v => [_wdb23(v), false]
  const wdb160 = v => [_wdb160(v), false]
  const cid = v => [_cid(v), false]
  const fns = { get, wdb23, wdb160, cid }
  const fn =
    dir[0] === "_"
      ? {
          ...fns,
          set: (v, obj, set) => {
            const [data, dir, doc] = v
            if (dir[0] !== "_") return [false, false]
            kv.put(dir, doc, data)
            return [true, false]
          },
          update: (v, obj, set) => {
            const [data, dir, doc] = v
            if (dir[0] !== "_") return [false, false]
            const old = kv.get(dir, doc)
            if (!old) return [false, false]
            kv.put(dir, doc, mergeLeft(data, old))
            return [true, false]
          },
          upsert: (v, obj, set) => {
            const [data, dir, doc] = v
            if (dir[0] !== "_") return [false, false]
            const old = kv.get(dir, doc) ?? {}
            kv.put(dir, doc, mergeLeft(data, old))
            return [true, false]
          },
          del: (v, obj, set) => {
            const [dir, doc] = v
            if (dir[0] !== "_") return [false, false]
            const old = kv.get(dir, doc)
            if (!old) return [false, false]
            kv.del(dir, doc)
            return [true, false]
          },
        }
      : fns
  for (const v of auth) {
    if (includes(op, v[0].split(","))) {
      try {
        fpj(v[1], vars, { ...ac_funcs, ...fn })
        if (vars.allow) allow = true
        break
      } catch (e) {
        throw Error("authentication failed")
      }
    }
  }
  if (!allow) throw Error("operation not allowed")
  return arguments[0]
}

const authenticator = {
  default: default_auth,
  init: anyone,
  batch: anyone,
  addIndex: onlyOwner,
  removeIndex: onlyOwner,
  addTrigger: onlyOwner,
  removeTrigger: onlyOwner,
  setAuth: onlyOwner,
  setSchema: onlyOwner,
}

function auth({ state, env }) {
  const func = authenticator[state.opcode] ?? authenticator.default
  func(arguments[0])
  return arguments[0]
}

export default auth
