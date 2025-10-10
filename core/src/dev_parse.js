import { of, ka } from "monade"
import { keys, uniq, concat, compose, is, isNil, includes } from "ramda"
import { merge, genDocID, checkDocID } from "./utils.js"
import _fpjson from "fpjson-lang"
import version from "./dev_version.js"
const fpjson = _fpjson.default || _fpjson

import { replace$ } from "./fpjson.js"

function setData({ state, env }) {
  const { data, dir } = state
  if (isNil(env.kv.get("_", dir))) throw Error("dir doesn't exist:", dir)
  state.data = merge(data, state, {}, env)
  return arguments[0]
}

function updateData({ state, env }) {
  const { data, dir, doc } = state
  if (isNil(state.before)) throw Error("data doesn't exist")
  state.data = merge(data, state, undefined, env)
  return arguments[0]
}

function upsertData({ state, env }) {
  const { data, dir, doc } = state
  if (isNil(env.kv.get("_", dir))) throw Error("dir doesn't exist:", dir)
  if (!isNil(state.before)) state.data = merge(data, state, undefined, env)
  return arguments[0]
}

const parser = {
  add: ka().map(genDocID).map(setData),
  set: ka().map(setData),
  update: ka().map(updateData),
  upsert: ka().map(upsertData),
}

function parse({ state, env }) {
  state.query.shift()
  if (state.opcode === "batch") return arguments[0]
  const { kv } = env
  let data, dir, doc
  if (includes(state.opcode, ["upgrade"])) {
    ;[data] = state.query
    state.data = data
  } else if (includes(state.opcode, [, "revert", "migrate", "init"])) {
  } else if (state.opcode === "get" || state.opcode === "cget") {
    ;[dir, doc] = state.query
    state.dir = dir
    if (typeof doc === "string") {
      checkDocID(doc, kv)
      state.doc = doc
      state.range = false
    } else state.range = true
  } else if (
    includes(state.opcode, [
      "add",
      "addIndex",
      "removeIndex",
      "addTrigger",
      "removeTrigger",
      "setSchema",
      "setAuth",
    ])
  ) {
    ;[data, dir] = state.query
    state.dir = dir
    state.data = data
    if (state.opcode === "add") state.before = null
  } else if (state.opcode === "del") {
    ;[dir, doc] = state.query
    checkDocID(doc, kv)
    state.before = kv.get(dir, doc)
    state.dir = dir
    state.doc = doc
    state.data = null
  } else {
    ;[data, dir, doc] = state.query
    checkDocID(doc, kv)
    state.before = kv.get(dir, doc)
    state.dir = dir
    state.doc = doc
    state.data = data
  }

  of(arguments[0]).map(version)

  if (dir) state.dirinfo = kv.get("_", dir)
  env.kv_dir = {
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
  if (parser[state.opcode]) of(arguments[0]).chain(parser[state.opcode].fn())
  return arguments[0]
}
export default parse
