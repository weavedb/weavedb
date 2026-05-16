// In-memory mock of the DurableObjectStorage subset DOIo uses.
// Faithful to:
//   https://developers.cloudflare.com/durable-objects/api/storage-api/
//
// Implements: get(k), get(k[]), put(k, v), put({...}), delete(k), delete(k[]),
// list({prefix}). All async, returning Promises like the real API.
//
// Not a substitute for Miniflare; that's PR 2's territory. This is a fast
// pure-JS mock for unit testing the DOIo adapter in isolation.

export class MockStorage {
  constructor() {
    /** @type {Map<string, any>} */
    this.data = new Map()
  }

  async get(k) {
    if (Array.isArray(k)) {
      const out = new Map()
      for (const key of k) {
        if (this.data.has(key)) out.set(key, this.data.get(key))
      }
      return out
    }
    return this.data.get(k)
  }

  async put(k, v) {
    if (typeof k === "object" && !Array.isArray(k) && k !== null) {
      for (const [key, val] of Object.entries(k)) this.data.set(key, val)
      return
    }
    this.data.set(k, v)
  }

  async delete(k) {
    if (Array.isArray(k)) {
      let count = 0
      for (const key of k) if (this.data.delete(key)) count++
      return count
    }
    return this.data.delete(k)
  }

  async list(opts = {}) {
    const out = new Map()
    for (const [k, v] of this.data) {
      if (opts.prefix && !k.startsWith(opts.prefix)) continue
      if (opts.start && k < opts.start) continue
      if (opts.end && k >= opts.end) continue
      out.set(k, v)
    }
    return out
  }

  async deleteAll() {
    this.data.clear()
  }
}
