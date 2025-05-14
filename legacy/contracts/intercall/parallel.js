export async function handle(state, action) {
  let result = null
  if (action.input.function === "add") {
    state.num += 1
  } else if (action.input.function === "get") {
    return { result: { num: state.num } }
  }
  return { state }
}
