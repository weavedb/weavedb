// In-memory mock of the R2Bucket subset R2Archive uses.
// Faithful to:
//   https://developers.cloudflare.com/r2/api/workers/workers-api-reference/
//
// Implements: put(key, value, opts) → {etag, customMetadata, size, key},
//   get(key) → null | {arrayBuffer(), customMetadata, size, key},
//   delete(key) → void,
//   list({prefix, startAfter, cursor, include, limit}) →
//     {objects: [{key, size, customMetadata}], truncated, cursor}.
//
// Not a substitute for Miniflare's R2 binding — used for fast unit
// tests of the R2Archive wrapper. The Miniflare integration tests
// (cf/test/miniflare.test.js) exercise the real binding.

export class MockR2Bucket {
  constructor() {
    /** @type {Map<string, {body: Uint8Array, customMetadata: Record<string,string>}>} */
    this.data = new Map()
    let n = 0
    this._etag = () => `mock-etag-${++n}`
  }

  async put(key, value, opts = {}) {
    if (typeof key !== "string") throw new TypeError("put: key must be a string")
    let body
    if (value instanceof Uint8Array) body = new Uint8Array(value)
    else if (value instanceof ArrayBuffer) body = new Uint8Array(value)
    else if (typeof value === "string") body = new TextEncoder().encode(value)
    else throw new TypeError("MockR2Bucket.put: unsupported value type")
    const customMetadata = { ...(opts.customMetadata ?? {}) }
    this.data.set(key, { body, customMetadata })
    return {
      key,
      size: body.byteLength,
      etag: this._etag(),
      customMetadata,
    }
  }

  async get(key) {
    const entry = this.data.get(key)
    if (!entry) return null
    return {
      key,
      size: entry.body.byteLength,
      customMetadata: { ...entry.customMetadata },
      arrayBuffer: async () => entry.body.buffer.slice(
        entry.body.byteOffset,
        entry.body.byteOffset + entry.body.byteLength,
      ),
      text: async () => new TextDecoder().decode(entry.body),
    }
  }

  async delete(key) {
    this.data.delete(key)
  }

  async list({ prefix = "", startAfter, cursor, limit = 1000 } = {}) {
    // Sort keys ascending — same as R2's behavior.
    const allKeys = [...this.data.keys()].sort()
    const start = cursor ?? startAfter
    let filtered = allKeys.filter(k => k.startsWith(prefix))
    if (start) filtered = filtered.filter(k => k > start)
    const page = filtered.slice(0, limit)
    const truncated = filtered.length > limit
    const objects = page.map(k => {
      const e = this.data.get(k)
      return {
        key: k,
        size: e.body.byteLength,
        customMetadata: { ...e.customMetadata },
      }
    })
    return {
      objects,
      truncated,
      cursor: truncated ? page[page.length - 1] : undefined,
    }
  }
}

export default MockR2Bucket
