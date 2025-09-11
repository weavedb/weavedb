export default () => {
  let store = {}
  return {
    put: async (key, val) => (store[key] = val),
    get: key => store[key] ?? null,
    transaction: async fn => fn(),
  }
}
