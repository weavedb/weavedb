const { is, concat, map } = require("ramda")
const { keccak256 } = require("./keccak")

function hash([bufs, bytes = 20]) {
  let _bufs = map(v => {
    let type = "utf8"
    let val = v
    if (is(Array, v)) {
      val = v[0]
      type = v[1] ?? "utf8"
    }
    if (type === "hex" && val.startsWith("0x")) val = val.slice(2)
    return Buffer.from(val, type)
  })(bufs)
  return to64(keccak256(Buffer.concat(_bufs)))
}
function to64(from, type, bytes = 20) {
  return Buffer.from(from, type)
    .slice(0, bytes)
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
}
function toBase64([str, type = "hex", bytes = 20]) {
  if (str.startsWith("0x")) str = str.slice(2)
  return to64(str, type, bytes)
}

module.exports = {
  parse: async str => [JSON.parse(str), false],
  stringfy: async json => [JSON.stringify(json), false],
  toBatchAll: async (query, obj) => {
    obj.batch = concat(obj.batch, query)
    return [null, false]
  },
  toBatch: async (query, obj) => {
    obj.batch.push(query)
    return [null, false]
  },
  upsert: execQuery => async query => [await execQuery("upsert", query), false],
  delete: execQuery => async query => [await execQuery("delete", query), false],
  update: execQuery => async query => [await execQuery("update", query), false],
  set: execQuery => async query => [await execQuery("set", query), false],
  add: execQuery => async query => [await execQuery("add", query), false],
  batch: execQuery => async (query, obj) => {
    obj.batchExecuted = true
    return [await execQuery("batch", query), false]
  },
  toBase64: query => [toBase64(query), false],
  hash: query => [hash(query), false],
}
