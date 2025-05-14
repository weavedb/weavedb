const { err, wrapResult } = require("../../lib/utils")
const { isNil } = require("ramda")
const { update } = require("./update")
const { validate } = require("../../lib/validate")

const withdrawToken = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct",
  get,
) => {
  let { token, to } = action.input.query
  if (!/^[a-z0-9_-]{43}$/i.test(to)) err("Invalid Arweave address.")
  state.tokens ??= {
    available: {},
    available_l2: {},
    locked: {},
    allocated: {},
  }
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "withdrawToken",
      SmartWeave,
      true,
      kvs,
    ))
  }
  const _token =
    (
      await get(
        state,
        {
          caller: action.caller,
          input: {
            function: "get",
            query: ["__tokens__", ["key", "==", `${token}:${signer}`]],
          },
        },
        true,
        SmartWeave,
        kvs,
      )
    )?.result?.[0] || null
  const withdraw = _token?.data?.withdraw ?? 0
  if (withdraw === 0) err("No withdrawable token found")
  await update(
    state,
    {
      caller: action.caller,
      input: {
        function: "update",
        query: [{ withdraw: 0 }, "__tokens__", _token.id],
      },
    },
    signer,
    undefined,
    SmartWeave,
    kvs,
    executeCron,
    undefined,
    "cron",
    get,
  )

  state.tokens.allocated[token] = (
    BigInt(state.tokens.allocated[token]) - BigInt(withdraw)
  ).toString()

  if (type === "bundle") {
    state.tokens.locked[token] = (
      BigInt(state.tokens.locked[token]) - BigInt(withdraw)
    ).toString()
  }

  return wrapResult(state, original_signer, SmartWeave, {
    events: [
      {
        type: "ao_message",
        attributes: [
          { key: "Target", value: token },
          { key: "Action", value: "Transfer" },
          { key: "Quantity", value: BigInt(withdraw).toString() },
          { key: "Recipient", value: to },
        ],
      },
    ],
  })
}
module.exports = { withdrawToken }
