import { clone } from "ramda"

export default () => {
  let store = {}

  // Convert key to string for storage, matching LMDB key types
  const keyToString = key => {
    if (Array.isArray(key)) {
      return `__array__:${JSON.stringify(key)}`
    }
    if (Buffer.isBuffer(key)) {
      return `__buffer__:${key.toString("base64")}`
    }
    if (typeof key === "object" && key !== null) {
      throw new Error(
        "Object keys are not supported (use string, number, buffer, or array)",
      )
    }
    // Handles strings and numbers
    return `__string__:${String(key)}`
  }

  return {
    put: async (key, val) => {
      store[keyToString(key)] = val
    },
    get: key => clone(store[keyToString(key)] ?? null),
    remove: key => delete store[keyToString(key)],
    transaction: async fn => fn(),
  }
}
