const reader = {
  get: "get",
  cget: "get",
  getInputs: "get_zkp_inputs",
}

function read({ state }) {
  state.branch = reader[state.opcode]
  return arguments[0]
}

export default read
