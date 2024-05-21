const { err, wrapResult } = require("../../../common/lib/utils")
const { isEVMAddress } = require("../../lib/utils")
const { isNil, includes } = require("ramda")
const { update } = require("./update")
const { add } = require("./add")
const { validate } = require("../../lib/validate")

const bridgeToken = async (
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
  let { token, to, amount, destination } = action.input.query
  if (!includes(destination)(state.bridges ?? [])) {
    err(`Destination not allowed: ${destination}`)
  }
  if (!isEVMAddress(to)) err("Invalid EVM address.")
  if (amount <= 0) err(`amount must be positive: ${amount}`)
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
      "bridgeToken",
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
  if (withdraw - amount < 0) err("Not enough withdrawable token")
  await update(
    state,
    {
      caller: action.caller,
      input: {
        function: "update",
        query: [
          { withdraw: { __op: "inc", n: -amount } },
          "__tokens__",
          _token.id,
        ],
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
  await add(
    state,
    {
      caller: action.caller,
      input: {
        function: "add",
        query: [
          {
            from: signer,
            amount,
            to,
            token,
            destination,
          },
          "__bridge__",
        ],
      },
    },
    signer,
    undefined,
    undefined,
    SmartWeave,
    kvs,
    executeCron,
    undefined,
    "cron",
    get,
  )
  state.tokens.allocated[token] = (
    BigInt(state.tokens.allocated[token]) - BigInt(amount)
  ).toString()

  if (type === "bundle") {
    state.tokens.locked[token] = (
      BigInt(state.tokens.locked[token]) - BigInt(amount)
    ).toString()
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { bridgeToken }
