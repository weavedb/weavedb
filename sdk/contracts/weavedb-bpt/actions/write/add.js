const { includes, isNil, init, last } = require("ramda")
const {
  parse,
  trigger,
  err,
  validateSchema,
  wrapResult,
} = require("../../lib/utils")
const { validate } = require("../../lib/validate")
const { put } = require("../../lib/index")
const { encode, toSignal } = require("../../lib/zkjson")

const add = async (
  state,
  action,
  signer,
  salt = 0,
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
      "add",
      SmartWeave,
      true,
      kvs,
    ))
  }
  let { _data, path, schema, next_data } = await parse(
    state,
    action,
    action.input.function,
    signer,
    salt,
    contractErr,
    SmartWeave,
    kvs,
    get,
    type,
  )
  if (type !== "cron" && includes(path[0])(["__tokens__", "__bridge__"])) {
    err(`${path[0]} cannot be updated directly`)
  }
  if (!isNil(_data.__data)) err("doc already exists")
  await validateSchema(schema, next_data, contractErr, state, SmartWeave)
  let { before, after } = await put(
    next_data,
    last(path),
    init(path),
    kvs,
    SmartWeave,
    signer,
  )
  if (!isNil(state.max_doc_size)) {
    let doc_size = null
    try {
      const zkjson = toSignal(encode(after.val))
      doc_size = zkjson.length
    } catch (e) {
      err("doc cannot be encoded")
    }
    if (doc_size !== null && doc_size > state.max_doc_size) err("doc too large")
  }
  if (isNil(before.val)) state.collections[init(path).join("/")].count += 1
  if (depth < 10) {
    state = await trigger(
      ["create"],
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
    doc: next_data,
    path: init(path),
  })
}

module.exports = { add }
