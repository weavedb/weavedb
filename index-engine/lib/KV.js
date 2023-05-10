const { isNil } = require("ramda")
const lf = require("localforage")
const shortid = require("shortid")
class KV {
  constructor() {
    this.prefix = shortid.generate()
    this.store = {}
  }
  async get(key) {
    return (await lf.getItem(`${this.prefix}/${key}`)) ?? null
    return this.store[key] ?? null
  }
  async put(key, val) {
    await lf.setItem(`${this.prefix}/${key}`, val)
    this.store[key] = val
  }
  async del(key) {
    await lf.removeItem(`${this.prefix}/${key}`)
    delete this.store[key]
  }
}

module.exports = KV
