import normalize from "./dev_normalize.js"
import verify from "./dev_verify.js"
import parse from "./dev_parse.js"
import auth from "./dev_auth.js"
import write from "./dev_write.js"
import read from "./dev_read.js"
import build from "./build.js"

function get({ state, msg }) {
  state.opcode = "get"
  state.query = ["get", ...msg]
  return arguments[0]
}

function cget({ state, msg }) {
  state.opcode = "cget"
  state.query = ["cget", ...msg]
  return arguments[0]
}

export default build({
  write: [normalize, verify, parse, auth, write],
  read: [normalize, parse, read],
  __read__: {
    get: [get, parse, read],
    cget: [cget, parse, read],
  },
})
