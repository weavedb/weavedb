const config = require("./weavedb.config.js")
const { validate } = require("./validate")
const { isNil, last } = require("ramda")
const getSetups = address => {
  const schema = {
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
  const rules = {
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
  return { schema, rules }
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
  if (_query.type !== "rsa256" && op !== "add_contract") {
    return res("Admin must be an Arweave account")
  }
  if (contractTxId !== config.admin.contractTxId) {
    return res(`The wrong admin contract (${contractTxId})`)
  }
  const { err, signer } = await validate(_query, contractTxId)
  if (err) {
    return res(`The wrong signature`)
  } else if (signer !== admin && op !== "add_contract") {
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
  const isErr = null
  switch (op) {
    case "add_contract":
      const { contractTxId: txid } = _query.query
      try {
        const user = await db.get("users", signer)
        if (isNil(user) || !user.allow) {
          return res(`${signer} is not allowed to add contract`, txs)
        } else {
          res(null, txs)
          if (isNil(sdks[txid])) await initSDK(txid)
          return
        }
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
      }
      return res(isErr, txs)

    case "setup":
      try {
        const { schema, rules } = getSetups(admin)
        txs.push(await db.setSchema(schema, "users", auth))
        if (!last(txs).success) throw new Error()
        txs.push(await db.setRules(rules, "users", auth))
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
