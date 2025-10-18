import { of, ka } from "monade"
import { toAddr, parseOp, wdb23, setTS64 } from "./utils.js"
import { includes, isNil } from "ramda"
import version from "./version.js"

function setMeta({ state, msg, env }) {
  if (!isNil(msg.headers.nonce)) state.nonce = msg.headers.nonce
  if (env.info.branch) state.branch = env.info.branch
  state.id = msg.headers.id
  state.nonce = msg.headers.nonce
  state.signer = toAddr(msg.keyid)
  state.signer23 = wdb23(state.signer)
  state.query = JSON.parse(msg.headers.query)
  return arguments[0]
}

const setState = ka().map(setMeta).map(setTS64).map(parseOp)

function setEnv({ state, msg, env }) {
  if (!msg) return arguments[0]
  env.info = env.kv.get("_config", "info") ?? { i: -1 }
  env.module_version = version
  env.info.i++
  env.info.ts = msg.ts ?? Date.now()
  env.kv.put("_config", "info", env.info)
  return arguments[0]
}

export default ka().map(setEnv).chain(setState.k)
