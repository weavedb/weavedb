import { of, ka } from "monade"
import { wdb23, toAddr, setTS64 } from "./utils.js"
import version from "./version.js"
import { isNil } from "ramda"

function setMeta({ state, msg, env }) {
  let id = null
  for (const k in msg.commitments) {
    id = k
    break
  }
  if (msg.type === "Process") {
    state.version = msg.version ?? null
    state.query = ["init"]
    state.op = "init"
    state.opcode = "init"
    state.id = id
  } else {
    const action = msg.action?.toLowerCase?.()
    state.id = msg.target.toString("base64url")
    if (action === "query") {
      state.query = JSON.parse(msg?.query ?? [])
      state.op = state.query[0]
      state.opcode = state.query[0]
    } else {
      state.op = action
      state.opcode = action
      if (action === "commit") {
        env.info.zkhash = msg.zkhash
        if (!msg.zkhash) throw Error("zkhash is missing")
      }
    }
  }
  for (const k in msg.commitments) {
    state.signer = toAddr(msg.commitments[k].owner.toString("base64url"))
    break
  }
  state.signer23 = wdb23(state.signer)
  if (!isNil(msg.nonce)) state.nonce = msg.nonce
  return arguments[0]
}

const setState = ka().map(setMeta).map(setTS64)

function setEnv({ state, msg, env }) {
  if (!msg) return arguments[0]
  env.info = env.kv.get("__sst__", "info") ?? { i: -1 }
  env.module_version = version
  env.info.ts = msg.ts ?? Date.now()
  env.info.i++
  env.kv.put("__sst__", "info", env.info)
  return arguments[0]
}

export default ka().map(setEnv).chain(setState.k)
