import { of, ka } from "monade"
import { wdb23, toAddr } from "./utils.js"
import version from "./version_sst.js"
import { isNil } from "ramda"
function pickInput({ state, msg, env }) {
  if (!msg) return arguments[0]
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
    if (env.info.id && env.info.id !== state.id) throw Error("the wrong id")
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
  env.info ??= { i: -1 }
  env.module_version = version
  env.info.i++
  const now = Date.now()
  env.info.ts = msg.ts ?? now
  let ts_count = env.kv.get("__ts__", "latest") ?? {
    count: -1,
    ts: env.info.ts,
  }
  if (ts_count.ts === env.info.ts) ts_count.count += 1
  else ((ts_count.count = 0), (ts_count.ts = env.info.ts))
  env.kv.put("__ts__", "latest", ts_count)
  state.ts = env.info.ts ?? now
  state.ts64 = env.info.ts * 1000 + ts_count.count
  env.kv.put("__sst__", "info", env.info)
  return arguments[0]
}

function setEnv({ state, msg, env }) {
  env.info = env.kv.get("__sst__", "info")
  return arguments[0]
}

const normalize = ka().map(setEnv).map(pickInput)

export default normalize
