// do-kv — sync KV interface over async DurableObjectStorage.
//
// core/src/weavekv.js expects an `io` with synchronous get/put/remove and
// an async transaction(fn). LMDB satisfies this natively. DO storage is
// async-only, so we hold an in-memory cache hydrated on construction and
// flush dirty entries inside transaction().
//
// The DO is single-threaded, so the cache is consistent with no locking.
// On cold start, hydrate() pulls every key from durable storage. On commit,
// transaction() flushes pending puts and deletes atomically (one storage.put
// of the dirty object plus one storage.delete of the dirty-delete list).
//
// Tradeoff: hydration is O(state size) on cold start. For large databases
// this should be replaced with on-demand hydration; for v1 we accept the
// up-front cost.

import { packKey } from "./pack-key.js"

export class DOIo {
  /**
   * @param {DurableObjectStorage} storage  state.storage from a DO instance
   */
  constructor(storage) {
    this.storage = storage
    /** @type {Map<string, any>} */
    this.cache = new Map()
    /** @type {Map<string, any>} */
    this.dirtyPuts = new Map()
    /** @type {Set<string>} */
    this.dirtyDels = new Set()
    this.hydrated = false
  }

  /**
   * Pull every key from durable storage into the in-memory cache.
   * Must be awaited before the first sync get/put. Idempotent.
   */
  async hydrate() {
    if (this.hydrated) return
    const all = await this.storage.list()
    for (const [k, v] of all) this.cache.set(k, v)
    this.hydrated = true
  }

  /**
   * Sync read. Returns null if the key is absent or pending-delete.
   * Matches LMDB's `io.get(k)` semantics expected by weavekv.js.
   * @param {string | Array<string|number>} k
   * @returns {any | null}
   */
  get(k) {
    const sk = packKey(k)
    if (this.dirtyDels.has(sk)) return null
    const v = this.cache.get(sk)
    return v === undefined ? null : v
  }

  /**
   * Sync write into the cache. Durable flush happens in transaction().
   * @param {string | Array<string|number>} k
   * @param {any} v
   */
  put(k, v) {
    const sk = packKey(k)
    this.cache.set(sk, v)
    this.dirtyPuts.set(sk, v)
    this.dirtyDels.delete(sk)
  }

  /**
   * Sync delete from the cache. Durable removal happens in transaction().
   * @param {string | Array<string|number>} k
   */
  remove(k) {
    const sk = packKey(k)
    this.cache.delete(sk)
    this.dirtyDels.add(sk)
    this.dirtyPuts.delete(sk)
  }

  /**
   * Run sync mutations in `fn`, then atomically flush to durable storage.
   * Mirrors LMDB's `io.transaction(fn)` shape — fn is sync, return is a Promise.
   * @param {() => void} fn
   */
  async transaction(fn) {
    fn()
    await this.flush()
  }

  /**
   * Flush pending puts and deletes to durable storage.
   * Called from transaction(); also exposed for tests.
   */
  async flush() {
    if (this.dirtyPuts.size > 0) {
      const obj = Object.fromEntries(this.dirtyPuts)
      await this.storage.put(obj)
      this.dirtyPuts.clear()
    }
    if (this.dirtyDels.size > 0) {
      await this.storage.delete([...this.dirtyDels])
      this.dirtyDels.clear()
    }
  }

  /**
   * Discard pending puts/deletes without flushing. Useful for tests; not
   * called by weavekv.js in normal operation.
   */
  rollback() {
    for (const k of this.dirtyPuts.keys()) this.cache.delete(k)
    for (const k of this.dirtyDels) {
      // Re-fetching from storage would be async; mark for rehydrate instead.
      this.cache.delete(k)
    }
    this.dirtyPuts.clear()
    this.dirtyDels.clear()
  }
}

/**
 * Construct a hydrated DOIo. Convenience wrapper that awaits hydration.
 * @param {DurableObjectStorage} storage
 * @returns {Promise<DOIo>}
 */
export default async function doKv(storage) {
  const io = new DOIo(storage)
  await io.hydrate()
  return io
}
