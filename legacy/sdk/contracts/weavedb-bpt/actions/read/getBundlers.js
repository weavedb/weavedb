const getBundlers = async (state, action, SmartWeave, kvs) => {
  return { result: state.bundlers ?? [] }
}

module.exports = { getBundlers }
