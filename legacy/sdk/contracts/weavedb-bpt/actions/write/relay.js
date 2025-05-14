const {
  intersection,
  is,
  uniq,
  includes,
  map,
  toLower,
  init,
  last,
  isNil,
  head,
  nth,
} = require("ramda")
const { err, read, validateSchema, wrapResult } = require("../../lib/utils")
const { validate } = require("../../lib/validate")

const { lockTokens } = require("./lockTokens")
const { add } = require("./add")
const { set } = require("./set")
const { update } = require("./update")
const { upsert } = require("./upsert")
const { remove } = require("./remove")
const { addAddressLink } = require("./addAddressLink")
const { removeAddressLink } = require("./removeAddressLink")
const { query: _query } = require("./query")

const relay = async (
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
  batch,
) => {
  if ((state.bundlers ?? []).length !== 0 && type === "direct") {
    err("only bundle queries are allowed")
  }
  let jobID = head(action.input.query)
  let input = nth(1, action.input.query)
  let query = nth(2, action.input.query)
  let relayer = type === "bundle" ? action.caller : null
  const relayers = state.relayers || {}
  let action2 = {
    caller: action.caller,
    input,
    relayer,
    extra: query,
    jobID,
    timestamp: action.timestamp,
  }
  let original_signer = null
  if (type !== "bundle") {
    if (isNil(relayers[jobID])) err(`relayer jobID [${jobID}] doesn't exist`)
    if (input.jobID !== jobID) err(`jobID mismatch [${input.jobID}|${jobID}]`)
    if (relayers[jobID]?.internalWrites !== true) {
      if (isNil(signer)) {
        ;({ signer, original_signer } = await validate(
          state,
          action,
          "relay",
          SmartWeave,
          false,
          kvs,
        ))
      }
      relayer = signer
    } else {
      relayer = action.caller
    }
    if (!isNil(relayers[jobID].relayers)) {
      const allowed_relayers = map(v => (/^0x.+$/.test(v) ? toLower(v) : v))(
        relayers[jobID].relayers || [],
      )
    }

    if (includes(relayers[jobID].multisig_type)(["number", "percent"])) {
      const allowed_signers = map(toLower)(relayers[jobID].signers || [])
      let signers = []
      if (is(Array)(action.input.multisigs)) {
        const data = {
          extra: action2.extra,
          jobID,
          params: input,
        }

        for (const signature of action.input.multisigs) {
          const _signer = (
            await read(
              state.contracts.ethereum,
              {
                function: "verify",
                data,
                signature,
              },
              SmartWeave,
            )
          ).signer
          signers.push(_signer)
        }
      }
      const matched_signers = intersection(allowed_signers, signers)
      let min = 1
      if (relayers[jobID].multisig_type === "percent") {
        min = Math.ceil(
          (relayers[jobID].signers.length * (relayers[jobID].multisig || 100)) /
            100,
        )
      } else if (relayers[jobID].multisig_type === "number") {
        min = relayers[jobID].multisig || 1
      }
      if (matched_signers.length < min) {
        err(
          `not enough number of allowed signers [${matched_signers.length}/${min}] for the job[${jobID}]`,
        )
      }
    }

    if (!isNil(relayers[jobID].schema)) {
      try {
        validateSchema(relayers[jobID].schema, query)
      } catch (e) {
        err("relayer data validation error")
      }
    }
  }
  const params = [
    state,
    action2,
    null,
    null,
    SmartWeave,
    kvs,
    executeCron,
    undefined,
    type,
    get,
  ]
  switch (action2.input.function) {
    case "add":
      return await add(
        state,
        action2,
        null,
        undefined,
        null,
        SmartWeave,
        kvs,
        executeCron,
        undefined,
        type,
        get,
      )
    case "lockTokens":
      return await lockTokens(...params)
    case "query":
      return await _query(...params)
    case "set":
      return await set(...params)
    case "update":
      return await update(...params)
    case "upsert":
      return await upsert(...params)
    case "delete":
      return await remove(...params)
    case "removeAddressLink":
      return await removeAddressLink(...params)
    case "batch":
      return await batch(...params)
    case "addAddressLink":
      return await addAddressLink(
        state,
        action2,
        null,
        null,
        SmartWeave,
        action2.extra.linkTo,
        kvs,
        executeCron,
        undefined,
        type,
        get,
      )
    default:
      err(
        `No function supplied or function not recognised: "${action2.input.function}"`,
      )
  }

  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { relay }
