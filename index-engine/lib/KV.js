const { isNil } = require("ramda")
const lf = require("localforage")
const shortid = require("shortid")

class KV {
  constructor(prefix) {
    this.prefix = prefix ?? shortid.generate()
    this.store = {}
  }
  async get(key, _prefix = "") {
    const data = (await lf.getItem(`${this.prefix}/${_prefix}${key}`)) ?? null
    if (!isNil(data)) this.store[key] = data
    return data
  }
  async put(key, val, _prefix = "", nosave = false) {
    if (!nosave) await lf.setItem(`${this.prefix}/${_prefix}${key}`, val)
    this.store[key] = val
  }
  async del(key, _prefix = "", nosave = false) {
    if (!nosave) await lf.removeItem(`${this.prefix}/${_prefix}${key}`)
    delete this.store[key]
  }
}

module.exports = KV
