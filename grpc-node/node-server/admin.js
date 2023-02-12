const conf = require("./weavedb.config.js")
const { validate } = require("./validate")
const { indexBy, includes, isNil, last, prop } = require("ramda")
const { createClient } = require("redis")
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

const execAdminRead = async ({
  query,
  res,
  contractTxId,
  sdks,
  admin,
  initSDK,
}) => {
  let _query, op
  try {
    _query = JSON.parse(query)
    ;({ op } = _query.query)
  } catch (e) {
    return res(`The wrong query`)
  }
  switch (op) {
    case "stats":
      let stats = {}
      if (!isNil(conf.admin) && !isNil(conf.admin.contractTxId)) {
        stats.contractTxId = conf.admin.contractTxId
      }
      try {
        const db = sdks[stats.contractTxId]
        stats.owners = await db.getOwner()
      } catch (e) {
        console.log(e)
      }
      return res(null, stats)
    default:
      return res(`operation not found: ${op}`)
  }
}

const execAdmin = async ({
  query,
  res,
  contractTxId,
  sdks,
  admin,
  initSDK,
  snapshot,
}) => {
  let _query, op, owners, err, signer
  try {
    _query = JSON.parse(query)
    ;({ op } = _query.query)
  } catch (e) {
    return res(`The wrong query`)
  }

  const db = sdks[contractTxId]
  if (isNil(conf.admin) || isNil(conf.admin.contractTxId)) {
    return res(`Admin doesn't exist`)
  }
  if (contractTxId !== conf.admin.contractTxId) {
    return res(`The wrong admin contract (${contractTxId})`)
  }

  if (isNil(db)) {
    return res(`Admin contract not ready`)
  }

  const nonAdmin = ["remove_contract", "add_contract"]
  const reads = ["stats"]

  if (includes(op)(reads)) {
    return execAdminRead({ query, res, contractTxId, sdks, admin, initSDK })
  }
  if (_query.type !== "rsa256" && !includes(op)(nonAdmin)) {
    return res("Admin must be an Arweave account")
  }

  try {
    owners = await db.getOwner()
    ;({ err, signer } = await validate(_query, contractTxId))
  } catch (e) {}
  if (err) {
    return res(`The wrong signature`)
  } else if (!includes(signer)(owners) && !includes(op)(nonAdmin)) {
    return res(`The signer is not admin`)
  }

  let txs = []
  const auth = {
    ar: conf.admin.owner,
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
        if (isNil(sdks[txid])) await initSDK(txid)
        return
      } catch (e) {
        console.log(e)
        return res("something went wrong", txs)
      }
    case "remove_contract":
      const { contractTxId: txid2 } = _query.query
      try {
        const contract = await db.get("contracts", txid2)
        if (isNil(contract)) {
          return res(`${txid2} doesn't exist`, txs)
        }
        if (contract.address !== signer) {
          return res(`${signer} is not contract registrator`, txs)
        }
        txs.push(await db.delete("contracts", txid2, auth))
        if (!last(txs).success) throw new Error()
        res(null, txs)
        delete sdks[txid2]
        return
      } catch (e) {
        console.log(e)
        return res("something went wrong", txs)
      }
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
      let { contractTxId } = _query.query
      const cache_type = conf.cache || "lmdb"
      if (isNil(sdks[contractTxId])) {
        isErr = "cache doesn't exist"
      } else {
        delete sdks[contractTxId]
        if (cache_type === "redis") {
          try {
            const prefix =
              isNil(conf.redis) || isNil(conf.redis.prefix)
                ? "warp"
                : conf.redis.prefix
            const client = createClient({ url: conf.redis?.prefix || null })
            await client.connect()
            for (const key of await client.KEYS(
              `${prefix}.${contractTxId}.*`
            )) {
              await client.del(key)
            }
          } catch (e) {}
        } else if (cache_type === "lmdb") {
          await snapshot.delete(contractTxId)
        }
        initSDK(contractTxId, true)
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
