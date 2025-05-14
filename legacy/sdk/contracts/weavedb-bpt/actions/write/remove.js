const { includes, isNil, last, init } = require("ramda")
const { parse, trigger, err, wrapResult } = require("../../lib/utils")
const { clone } = require("../../lib/pure")
const { validate } = require("../../lib/validate")
const { del } = require("../../lib/index")

const remove = async (
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
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "delete",
      SmartWeave,
      true,
      kvs,
    ))
  }
  const { data, query, new_data, path, _data, col } = await parse(
    state,
    action,
    action.input.function,
    signer,
    0,
    contractErr,
    SmartWeave,
    kvs,
    get,
    type,
  )
  if (type !== "cron" && includes(path[0])(["__tokens__", "__bridge__"])) {
    err(`${path[0]} cannot be updated directly`)
  }
  if (isNil(_data.__data)) err(`Data doesn't exist`)
  let { before, after } = await del(
    last(path),
    init(path),
    kvs,
    SmartWeave,
    signer,
  )
  if (!isNil(before.val)) state.collections[init(path).join("/")].count -= 1
  if (depth < 10) {
    state = await trigger(
      ["delete"],
      state,
      path,
      SmartWeave,
      kvs,
      executeCron,
      depth,
      {
        data: {
          path: init(path),
          before: before.val,
          after: after.val,
          id: last(path),
          setter: _data.setter,
        },
      },
      action.timestamp,
    )
  }

  return wrapResult(state, original_signer, SmartWeave, {
    docID: last(path),
    doc: null,
    path: init(path),
  })
}

module.exports = { remove }
