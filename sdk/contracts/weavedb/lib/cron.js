const { cron, executeCron } = require("../../common/lib/cron")

const { get } = require("../actions/read/get")
const { upsert } = require("../actions/write/upsert")
const { update } = require("../actions/write/update")
const { add } = require("../actions/write/add")
const { remove } = require("../actions/write/remove")
const { set } = require("../actions/write/set")
const { batch } = require("../actions/write/batch")

const ops = {
  get,
  upsert,
  update,
  add,
  delete: remove,
  set,
  batch,
}

module.exports = { cron: cron(ops), executeCron: executeCron(ops) }
