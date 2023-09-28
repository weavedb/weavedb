const { isNil } = require("ramda")
const { err, read } = require("../../../common/lib/utils")
const { set } = require("./set")
const nostr = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
  get
) => {
  if (isNil(state.nostr)) err("nostr is disabled")
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }
  const event = action.input.query
  const { isValid } = await read(
    state.contracts.nostr,
    { function: "verify", event },
    SmartWeave
  )
  if (!isValid) err(`The wrong signature`)
  let params = [
    state,
    {
      input: {
        query: [event, state.nostr, event.id],
        function: `set:${state.nostr}`,
      },
    },
    event.pubkey,
    false,
    SmartWeave,
    kvs,
    executeCron,
    undefined,
    "direct",
    get,
  ]
  return await set(...params)
}

module.exports = { nostr }
