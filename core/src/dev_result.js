export default function result({ state, msg, env: { no_commit, kv, info } }) {
  if (no_commit !== true) state.updates = kv.commit(msg, null, state, info).data
  state.result ??= null
  state.i = info.i
  state.ts = info.ts
  return arguments[0]
}
