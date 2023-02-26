const { validate } = require("./validate")
const { keys, indexBy, includes, isNil, last, prop } = require("ramda")
const users_schema = {
  type: "object",
  required: ["address", "allow"],
  properties: {
    address: {
      type: "string",
    },
    allow: {
      type: "boolean",
    },
    limit: {
      type: "number",
    },
  },
}
const users_rules = {
  "allow create,update": {
    and: [
      {
        "==": [{ var: "resource.newData.address" }, { var: "request.id" }],
      },
      {
        in: [{ var: "request.auth.signer" }, { var: "contract.owners" }],
      },
    ],
  },
  "allow delete": {
    in: [{ var: "request.auth.signer" }, { var: "contract.owners" }],
  },
}
const contracts_schema = {
  type: "object",
  required: ["address", "txid", "date"],
  properties: {
    address: {
      type: "string",
    },
    txid: {
      type: "string",
    },
    date: {
      type: "number",
    },
  },
}
const contracts_rules = {
  "allow create": {
    and: [
      {
        "==": [{ var: "resource.newData.txid" }, { var: "request.id" }],
      },
      {
        in: [{ var: "request.auth.signer" }, { var: "contract.owners" }],
      },
      {
        "==": [
          { var: "resource.newData.date" },
          { var: "request.block.timestamp" },
        ],
      },
    ],
  },
  "allow delete": {
    in: [{ var: "request.auth.signer" }, { var: "contract.owners" }],
  },
}

const execAdminRead = async ({ query, res, txid, node }) => {
  let _query, op
  try {
    _query = JSON.parse(query)
    ;({ op } = _query.query)
  } catch (e) {
    return res(`The wrong query`)
  }
  switch (op) {
    case "stats":
      let stats = { start: node.start }
      if (!isNil(node.conf.admin) && !isNil(node.conf.admin.contractTxId)) {
        stats.contractTxId = node.conf.admin.contractTxId
      }
      try {
        const db = node.sdks[stats.contractTxId]
        stats.owners = await db.getOwner()
      } catch (e) {
        console.log(e)
      }
      return res(null, stats)
    default:
      return res(`operation not found: ${op}`)
  }
}

const execAdmin = async ({ query, res, txid, node }) => {
  let _query, op, owners, err, signer
  try {
    _query = JSON.parse(query)
    ;({ op } = _query.query)
  } catch (e) {
    return res(`The wrong query`)
  }

  const db = node.sdks[txid]
  if (isNil(node.conf.admin) || isNil(node.conf.admin.contractTxId)) {
    return res(`Admin doesn't exist`)
  }

  const nonAdmin = ["remove_contract", "add_contract"]
  const reads = ["stats"]

  if (includes(op)(reads)) {
    return execAdminRead({ query, res, txid, node })
  }

  if (txid !== node.conf.admin.contractTxId) {
    return res(`The wrong admin contract (${txid})`)
  }

  if (isNil(db)) {
    return res(`Admin contract not ready`)
  }

  if (_query.type !== "rsa256" && !includes(op)(nonAdmin)) {
    return res("Admin must be an Arweave account")
  }

  try {
    owners = await db.getOwner()
    ;({ err, signer } = await validate(_query, txid))
  } catch (e) {}
  if (err) {
    return res(`The wrong signature`)
  } else if (!includes(signer)(owners) && !includes(op)(nonAdmin)) {
    return res(`The signer is not admin`)
  }

  let txs = []
  const auth = {
    ar: node.conf.admin.owner,
  }
  let isErr = null
  switch (op) {
    case "add_contract":
      const { contractTxId: txid } = _query.query
      try {
        const user = await db.get("users", signer)
        if (isNil(user) || !user.allow) {
          return res(`${signer} is not allowed to add contract`, txs)
        }
        const contracts = await db.get("contracts", [
          "address",
          "=",
          user.address,
        ])
        const contractMap = indexBy(prop("txid"), contracts)
        if (!isNil(contractMap[txid])) return res(`${txid} already exists`, txs)
        if (!isNil(user.limit) && contracts.length >= user.limit) {
          return res(
            `You reached the limit[${contracts.length}/${user.limit}]`,
            txs
          )
        }
        txs.push(
          await db.set(
            { date: db.ts(), address: signer, txid },
            "contracts",
            txid,
            auth
          )
        )
        if (!last(txs).success) throw new Error()
        res(null, txs)
        if (isNil(node.sdks[txid])) {
          await node.addContract(txid)
          await node.manager.admin(
            { op: "init_contract", contractTxId: txid },
            { ar: node.conf.admin.owner, nonce: 1 }
          )
        }
        return
      } catch (e) {
        console.log(e)
        return res("something went wrong", txs)
      }
    case "remove_contract":
      const { contractTxId: txid2 } = _query.query
      try {
        const contract = await db.get("contracts", txid2)
        if (isNil(contract)) return res(`${txid2} doesn't exist`, txs)
        if (node.node_type !== "contract_manager") {
          try {
            if (contract.address !== signer) {
              return res(`${signer} is not contract registrator`, txs)
            }
            txs.push(
              await node.manager.admin(
                { op: "remove_contract", contractTxId: txid2 },
                { ar: node.conf.admin.owner, nonce: 1 }
              )
            )
          } catch (e) {
            console.log(e)
          }
        } else {
          if (!includes(signer)(owners)) {
            return res(`${signer} is not admin`, txs)
          }
          try {
            txs.push(await db.delete("contracts", txid2, auth))
            if (!last(txs).success) throw new Error()
          } catch (e) {
            console.log(e)
          }
        }
        res(null, txs)
        await node.db.delete("contracts", txid2, {
          ar: node.conf.admin.owner,
        })
        delete node.sdks[txid2]
        return
      } catch (e) {
        console.log(e)
        return res("something went wrong", txs)
      }
    case "init_contract":
      if (node.node_type !== "contract_manager") {
        isErr = "operation not allowed"
        res(isErr, txs)
      } else {
        const { contractTxId: txid3 } = _query.query
        res(isErr, txs)
        if (isNil(node.sdks[txid3])) node.initSDK(txid3)
      }
      return

    case "whitelist":
      let { address, allow, limit } = _query.query
      if (/^0x.+$/.test(address)) address = address.toLowerCase()
      let newUser = { address, allow }
      if (!isNil(limit)) newUser.limit = limit
      try {
        txs.push(await db.upsert(newUser, "users", address, auth))
        if (!last(txs).success) throw new Error()
      } catch (e) {
        isErr = `something went wrong`
        console.log(e)
      }
      return res(isErr, txs)

    case "reset_cache":
      const { contractTxId } = _query.query
      const cache_type = node.conf.cache || "lmdb"
      if (isNil(node.sdks[contractTxId])) {
        isErr = `cache doesn't exist[${node.node_type || "gateway"}]`
      } else {
        await node.db.delete("contracts", contractTxId, {
          ar: node.conf.admin.owner,
        })
        if (node.node_type !== "contract_manager") {
          try {
            txs.push(
              await node.manager.admin(
                { op: "reset_cache", contractTxId },
                { ar: node.conf.admin.owner, nonce: 1 }
              )
            )
          } catch (e) {
            console.log(e)
          }
          node.addContract(contractTxId)
        } else {
          delete node.sdks[contractTxId]
          if (cache_type === "redis") {
            try {
              const prefix =
                isNil(node.conf.redis) || isNil(node.conf.redis.prefix)
                  ? "warp"
                  : node.conf.redis.prefix
              for (const key of await node.redis.KEYS(
                `${prefix}.${contractTxId}.*`
              )) {
                await node.redis.del(key)
              }
            } catch (e) {}
          } else if (cache_type === "lmdb") {
            await node.snapshot.delete(contractTxId)
          }
          node.initSDK(contractTxId, true)
        }
      }
      return res(isErr, txs)

    case "setup":
      try {
        txs.push(
          await db.batch(
            [
              ["setSchema", users_schema, "users"],
              ["setRules", users_rules, "users"],
              ["setSchema", contracts_schema, "contracts"],
              ["setRules", contracts_rules, "contracts"],
            ],
            auth
          )
        )
        if (!last(txs).success) throw new Error()
      } catch (e) {
        isErr = isErr = "something went wrong"
      }
      return res(isErr, txs)

    default:
      return res(`operation not found: ${op}`)
  }
}

module.exports = { execAdmin }
