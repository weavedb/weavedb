import build from "./build.js"
import kv from "./kv_nosql.js"
const wait = ms => new Promise(res => setTimeout(() => res(), ms))
async function test({ state, msg, env }) {
  state.num = 1
  return arguments[0]
}

async function test2({ state, msg, env }) {
  await wait(10000)
  state.num += 2
  return arguments[0]
}

export default build({
  kv,
  async: true,
  write: [test, test2],
})
