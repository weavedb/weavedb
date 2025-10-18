export default op =>
  function ({ state, msg }) {
    state.opcode = op
    state.query = [op, ...msg]
    return arguments[0]
  }
