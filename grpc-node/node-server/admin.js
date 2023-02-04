const config = require("./weavedb.config.js")
const { validate } = require("./validate")
const { includes, isNil, last } = require("ramda")
const getSetups = address => {
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
    },
  }
  const users_rules = {
    "allow create,update": {
      and: [
        {
          "==": [{ var: "resource.newData.address" }, { var: "request.id" }],
        },
        { "==": [{ var: "request.auth.signer" }, address] },
      ],
    },
    "allow delete": { "==": [{ var: "request.auth.signer" }, address] },
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
        { "==": [{ var: "request.auth.signer" }, address] },
        {
          "==": [
            { var: "resource.newData.date" },
            { var: "request.block.timestamp" },
          ],
        },
      ],
    },
    "allow delete": { "==": [{ var: "request.auth.signer" }, address] },
  }

  return { users_schema, users_rules, contracts_schema, contracts_rules }
}

const execAdmin = async ({
  query,
  res,
  contractTxId,
  sdks,
  admin,
  initSDK,
}) => {
  const _query = JSON.parse(query)
  const { op } = _query.query
  const nonAdmin = ["remove_contract", "add_contract"]
  if (_query.type !== "rsa256" && !includes(op)(nonAdmin)) {
    return res("Admin must be an Arweave account")
  }
  if (contractTxId !== config.admin.contractTxId) {
    return res(`The wrong admin contract (${contractTxId})`)
  }
  const { err, signer } = await validate(_query, contractTxId)
  if (err) {
    return res(`The wrong signature`)
  } else if (signer !== admin && !includes(op)(nonAdmin)) {
    return res(`The signer is not admin`)
  }
  if (isNil(sdks[contractTxId])) {
    return res(`Admin contract not ready`)
  }

  let txs = []
  const db = sdks[contractTxId]
  const auth = {
    ar: config.admin.owner,
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
        const contract = await db.get("contracts", txid)
        if (!isNil(contract)) {
          return res(`${txid} already exists`, txs)
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
        console.log(contract, txid2)
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
      let { address, allow } = _query.query
      if (/^0x.+$/.test(address)) address = address.toLowerCase()
      try {
        txs.push(await db.upsert({ address, allow }, "users", address, auth))
        if (!last(txs).success) throw new Error()
      } catch (e) {
        isErr = `something went wrong`
        console.log(e)
      }
      return res(isErr, txs)

    case "setup":
      try {
        const { users_schema, users_rules, contracts_schema, contracts_rules } =
          getSetups(admin)
        txs.push(await db.setSchema(users_schema, "users", auth))
        if (!last(txs).success) throw new Error()
        txs.push(await db.setRules(users_rules, "users", auth))
        if (!last(txs).success) throw new Error()

        txs.push(await db.setSchema(contracts_schema, "contracts", auth))
        if (!last(txs).success) throw new Error()
        txs.push(await db.setRules(contracts_rules, "contracts", auth))
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
