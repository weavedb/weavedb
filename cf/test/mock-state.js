// Minimal mocks for the DurableObjectState and DurableObjectNamespace surfaces
// that ProcessDO and the Worker use.
//
// Not a substitute for Miniflare. PR 2 only exercises routing + state
// mechanics; PR 3 introduces real Miniflare-driven integration tests that
// run the bundled Worker code end-to-end.

import { MockStorage } from "./mock-storage.js"
import doKv from "../src/do-kv.js"
import { ProcessDO } from "../src/process-do.js"

export function mockState() {
  return {
    storage: new MockStorage(),
    id: { toString: () => "test-id", name: "test-id", equals: () => false },
    /**
     * Real DOs serialize the callback so concurrent fetch() calls block
     * until it resolves. For testing we just await it.
     */
    blockConcurrencyWhile: async fn => fn(),
    /** No alarms exercised in PR 2. */
    setAlarm: () => {},
    getAlarm: () => null,
    deleteAlarm: () => {},
  }
}

/**
 * Mock DurableObjectNamespace. `idFromName(pid).get(id).fetch(req)` returns
 * a canned response so the Worker can be tested in isolation from the DO.
 */
export function mockNamespace(handler = async () => new Response("ok")) {
  return {
    idFromName: name => ({ name, toString: () => name, equals: () => false }),
    get: id => ({
      fetch: req => handler(req, id),
      id,
    }),
    /** Not needed in PR 2. */
    newUniqueId: () => ({ toString: () => "unique" }),
  }
}

/**
 * Mock pipeline. Mirrors the surface shape (write/get) without importing
 * core/. Used by tests that exercise routing without the real db.
 */
export function mockDb() {
  return {
    write: async () => ({ success: true, result: { mock: true } }),
    get: async args => ({ mock: "get", args }),
    cget: async args => ({ mock: "cget", args }),
  }
}

/**
 * Construct a ProcessDO with a mocked db pre-installed, so ensureDB() short-
 * circuits and we don't trigger the dynamic import of core/. Routing and
 * state-mechanics tests use this; PR 3 integration tests use the real db
 * via Miniflare.
 *
 * @param {object} env  Worker env bindings (HB_URL, JWK, ADMIN_ONLY, ...)
 */
export async function newMockedDO(env) {
  const state = mockState()
  const p = new ProcessDO(state, env)
  p.io = await doKv(state.storage)
  p.db = mockDb()
  p.initPromise = Promise.resolve()
  return { p, state }
}
