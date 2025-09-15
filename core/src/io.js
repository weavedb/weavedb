export default () => {
  let store = {}
  return {
    put: async (key, val) => (store[key] = val),
    get: key => store[key] ?? null,
    remove: key => delete store[key],
    transaction: async fn => fn(),
  }
}
