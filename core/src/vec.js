import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import write from "./dev_write_vec.js"
import parse from "./dev_parse_vec.js"
import build from "./build.js"

function search({ msg, env: { kv } }) {
  return kv.search(...msg)
}

function vectorSearch({ msg, env: { kv } }) {
  return kv.vectorSearch(...msg)
}

function query({ msg, env: { kv } }) {
  return kv.query(...msg)
}

export default build({
  async: true,
  write: [normalize, verify, parse, write],
  __read__: { search: [search], vectorSearch: [vectorSearch], query: [query] },
})
