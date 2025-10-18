function read({ state }) {
  state.branch = "get"
  return arguments[0]
}

export default read
