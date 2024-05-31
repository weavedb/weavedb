const { valiate } = require("../../lib/jsonschema")

const validate = async (state, action) => {
  let valid = false
  let error = false
  try {
    valid = validate(action.input.data, action.input.schema).valid
  } catch (e) {
    error = true
  }
  return { result: { valid, error } }
}

module.exports = validate
