const { isNil } = require("ramda")
const lf = require("localforage")
const shortid = require("shortid")
class KV {
  constructor(prefix) {
    this.prefix = prefix ?? shortid.generate()
    this.store = {}
  }
  async get(key) {
    const data = (await lf.getItem(`${this.prefix}/${key}`)) ?? null
    if (!isNil(data)) this.store[key] = data
    return data
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
