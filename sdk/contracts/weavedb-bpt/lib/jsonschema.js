const { read, err } = require("./base")
module.exports = {
  validate: async (data, schema, state, SmartWeave) => {
    let valid = false
    let error = false
    try {
      ;({ valid, error } = await read(
        state.contracts.jsonschema,
        {
          function: "validate",
          data,
          schema,
        },
        SmartWeave,
      ))
    } catch (e) {
      error = true
    }
    return { error, valid }
  },
}
