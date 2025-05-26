import { includes, isNil, mergeLeft } from "ramda"
import { fpj, ac_funcs, replace$ } from "./fpjson.js"

function anyone() {
  return arguments[0]
}

function onlyOwner({ state, env }) {
  if (state.signer !== env.owner) throw Error("only owner can execute")
  return arguments[0]
}

function default_auth({
  state: { op, signer, ts, opcode, operand, dir, doc, query, before, data },
  msg,
  env: { kv, id, owner },
}) {
  let vars = {
    op,
    opcode,
    operand,
    id: id,
    owner: owner,
    signer,
    ts,
    dir,
    doc,
    query,
    before,
    after: data,
    allow: false,
  }
  let _dir = kv.dir(dir)
  if (!_dir && dir === "_")
    _dir = {
      auth: [
        [
          "set:init",
          [
            ["=$isOwner", ["equals", "$signer", "$owner"]],
            ["allowif()", "$isOwner"],
          ],
        ],
      ],
    }
  if (isNil(_dir)) throw Error(`dir doesn't exist: ${dir}`)
  let allow = false
  const fn = {
    get: (v, obj, set) => [kv.get(...v), false],
    set: (v, obj, set) => {
      const [data, dir, doc] = v
      kv.put(dir, doc, data)
      return [true, false]
    },
    update: (v, obj, set) => {
      const [data, dir, doc] = v
      const old = kv.get(dir, doc)
      if (!old) return [false, false]
      kv.put(dir, doc, mergeLeft(data, old))
      return [true, false]
    },
    upsert: (v, obj, set) => {
      const [data, dir, doc] = v
      const old = kv.get(dir, doc) ?? {}
      kv.put(dir, doc, mergeLeft(data, old))
      return [true, false]
    },
    del: (v, obj, set) => {
      const [dir, doc] = v
      const old = kv.get(dir, doc)
      if (!old) return [false, false]
      kv.del(dir, doc)
      return [true, false]
    },
  }
  for (const v of _dir.auth) {
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
}

function auth({ state, env }) {
  const func = authenticator[state.opcode] ?? authenticator.default
  func(arguments[0])
  return arguments[0]
}

export default auth
