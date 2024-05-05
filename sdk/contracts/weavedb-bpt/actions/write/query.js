const { includes, init, last, isNil, tail } = require("ramda")
const { err, parse, trigger } = require("../../lib/utils")
const { validateSchema, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { put } = require("../../lib/index")

const { add } = require("./add")
const { set } = require("./set")
const { update } = require("./update")
const { upsert } = require("./upsert")
const { remove } = require("./remove")

const query = async (
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
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "query",
      SmartWeave,
      true,
      kvs
    ))
  }
  const [func, ...input] = action.input.query
  let action2 = {
    caller: action.caller,
    input: { function: func, query: input, caller: action.input.caller },
    timestamp: action.timestamp,
  }
  if (!isNil(action.jobID)) action2.jobID = action.jobID
  if (!isNil(action.relayer)) action2.relayer = action.relayer
  if (!isNil(action.extra)) action2.extra = action.extra
  const params = [
    state,
    action2,
    signer,
    null,
    SmartWeave,
    kvs,
    executeCron,
    undefined,
    type,
    get,
  ]
  const [_func, ..._method] = func.split(":")
  if (_method.length < 1) {
    err(`method name required`)
  } else if (_method.length > 1) {
    err(`method name cannot contain ":"`)
  } else if (
    includes(_method[0])([
      "add",
      "set",
      "update",
      "upsert",
      "delete",
      "write",
      "create",
      "get",
    ])
  ) {
    err(
      `method name cannot be add | set | update | upsert | delete | write | create | get`
    )
  }
  switch (_func) {
    case "add":
      return await add(
        state,
        action2,
        signer,
        undefined,
        null,
        SmartWeave,
        kvs,
        executeCron,
        undefined,
        type,
        get
      )
    case "set":
      return await set(...params)
    case "update":
      return await update(...params)
    case "upsert":
      return await upsert(...params)
    case "delete":
      return await remove(...params)

    default:
      err(
        `No function supplied or function not recognised: "${action2.input.function}"`
      )
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { query }
