import { of, ka } from "monade"
import { wdb23, toAddr } from "./utils.js"
import version from "./version.js"

function pickInput({ state, msg, env }) {
  if (!msg) return arguments[0]
  let id = null
  for (const k in msg.commitments) {
    id = k
    break
  }
  if (msg.type === "Process") {
    state.query = [{ schema: { type: "object" }, auth: [] }]
    state.op = "init"
    state.opcode = "init"
    state.id = id
  } else {
    const action = msg.action?.toLowerCase?.()
    state.id = msg.target.toString("base64url")
    if (action === "query") {
      state.query = JSON.parse(msg.query)
      state.op = state.query[0]
      state.opcode = state.query[0]
    } else {
      state.query = []
      state.op = "commit"
      state.opcode = "commit"
      env.info.zkhash = msg.zkhash
    }
  }
  for (const k in msg.commitments) {
    state.signer = toAddr(msg.commitments[k].owner.toString("base64url"))
    break
  }
  state.signer23 = wdb23(state.signer)
  state.nonce = msg.nonce
  env.info ??= { i: -1 }
  env.info.i++
  env.info.ts = msg.ts ?? Date.now()
  env.kv.put("_config", "info", env.info)
  if (env.info.id && env.info.version) {
    if (version !== env.info.version && env.ignore_version !== true) {
      throw Error(
        `the wrong version: ${env.info.version} running on ${version}`,
      )
    }
  }

  return arguments[0]
}

function setEnv({ state, msg, env }) {
  env.info = env.kv.get("__sst__", "info")
  return arguments[0]
}

const normalize = ka().map(setEnv).map(pickInput)

export default normalize
