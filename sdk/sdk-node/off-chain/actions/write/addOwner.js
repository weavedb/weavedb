const { err, isOwner } = require("../../lib/utils")
const { includes, is, of, append } = require("ramda")
const { validate } = require("../../lib/validate")

const addOwner = async (state, action, signer, SmartWeave) => {
  signer ||= await validate(state, action, "addOwner", SmartWeave)
  const owner = isOwner(signer, state)
  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }

  if (!is(String)(action.input.query.address)) {
    err("Value must be string.")
  }
  if (includes(action.input.query.address, owner)) {
    err("The owner already exists.")
  }
  state.owner = append(action.input.query.address, owner)
  return { state }
}
module.exports = { addOwner }
