const {
  sum,
  prop,
  filter,
  propEq,
  keys,
  append,
  isEmpty,
  compose,
  flatten,
  o,
  values,
  mapObjIndexed,
  map,
  includes,
  pluck,
  isNil,
  clone,
  of,
  is,
  unless,
  hasPath,
} = require("ramda")

const SDK = require("weavedb-sdk-node")
const { execAdmin } = require("./admin")
const { Node } = require("./Node")

class ContractManager extends Node {
  constructor({ conf, port }) {
    super({ conf, port })
    this.node_type = "contract_manager"
  }

  async init() {
    await this.initDB()
    for (let v of this.init_contracts) {
      const contract = await this.db.get("contracts", v)
      if (contract?.done !== true || v === this.conf.admin?.contractTxId) {
        this.initSDK(v)
      }
    }
    this.startServer()
  }

  async query(call, callback) {
    let parsed = this.parseQuery(call, callback)
    const { res, nocache, txid, func, query, isAdmin } = parsed
    if (isAdmin) return await execAdmin({ query, res, node: this, txid })
    return res("only admin requests are allowed")
  }
}

module.exports = { ContractManager }
