export async function handle(state, action) {
  if (action.input.function === "write") {
    await SmartWeave.contracts.write(action.input.to, action.input.params)
  } else if (action.input.function === "relay") {
    await SmartWeave.contracts.write(action.input.to, {
      function: "relay",
      query: [action.input.params.jobID, action.input.params, { height: 180 }],
    })
  }
  return { state }
}
