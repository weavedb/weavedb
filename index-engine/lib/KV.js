const { isNil } = require("ramda")
class KV {
  constructor(setStore) {
    this.store = {}
    this.setStore = setStore
  }
  async get(key) {
    return this.store[key] ?? null
  }
  async put(key, val) {
    this.store[key] = val
    if (!isNil(this.setStore)) {
      this.setStore(JSON.stringify(this.store))
    }
  }
  async del(key) {
    delete this.store[key]
    if (!isNil(this.setStore)) {
      this.setStore(JSON.stringify(this.store))
    }
  }
}

module.exports = KV
