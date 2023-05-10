const { isNil } = require("ramda")
const lf = require("localforage")
const shortid = require("shortid")
class KV {
  constructor(setStore) {
    this.prefix = shortid.generate()
    this.store = {}
    this.setStore = setStore
  }
  async get(key) {
    return (await lf.getItem(`${this.prefix}/${key}`)) ?? null
    return this.store[key] ?? null
  }
  async put(key, val) {
    await lf.setItem(`${this.prefix}/${key}`, val)
    this.store[key] = val
    if (!isNil(this.setStore)) {
      this.setStore(JSON.stringify(this.store))
    }
  }
  async del(key) {
    await lf.removeItem(`${this.prefix}/${key}`)
    delete this.store[key]
    if (!isNil(this.setStore)) {
      this.setStore(JSON.stringify(this.store))
    }
  }
}

module.exports = KV
