const { isNil } = require("ramda")
const { clone } = require("../../../common/lib/pure")
const { err, isOwner, wrapResult } = require("../../../common/lib/utils")
const { validate } = require("../../lib/validate")
const { executeCron } = require("../../lib/cron")
const c = require("../../lib/cron")

const addCron = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs,
  executeCron,
  depth = 1,
  type = "direct"
) => {
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }

  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "addCron",
      SmartWeave,
      true,
      kvs
    ))
  }
  const owner = isOwner(signer, state)

  const timestamp = isNil(action.timestamp)
    ? SmartWeave.block.timestamp
    : Math.round(action.timestamp / 1000)

  if (isNil(state.crons)) {
    state.crons = { lastExecuted: timestamp, crons: {} }
  }
  const [cron, key] = action.input.query
  let _cron = clone(cron)
  if (isNil(_cron.start)) {
    _cron.start = timestamp
  }
  if (timestamp > _cron.start) {
    err("start cannot be before the block time")
  }
  if (!isNil(_cron.end) && timestamp > _cron.end) {
    err("end cannot be before start")
  }
  if (isNil(_cron.jobs) || _cron.jobs.length === 0) {
    err("cron has no jobs")
  }
  if (isNil(_cron.span) || Number.isNaN(_cron.span * 1) || _cron.span <= 0) {
    err("span must be greater than 0")
  }
  state.crons.crons[key] = _cron
  if (_cron.do) {
    try {
      await executeCron(
        { start: _cron.start, crons: _cron },
        state,
        SmartWeave,
        kvs,
        action.timestamp
      )
    } catch (e) {
      console.log(e)
      err("cron failed to execute")
    }
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { addCron }
