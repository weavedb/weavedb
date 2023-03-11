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
const { wrapResult, err, read, validateSchema } = require("../../lib/utils")
const { validate } = require("../../lib/validate")

const { add } = require("./add")
const { set } = require("./set")
const { update } = require("./update")
const { upsert } = require("./upsert")
const { remove } = require("./remove")
const { addAddressLink } = require("./addAddressLink")
const { batch } = require("./batch")

const relay = async (state, action, signer, contractErr = true, SmartWeave) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "relay",
      SmartWeave,
      false
    ))
  }
  let [jobID, input, query] = action.input.query
  if (input.jobID !== jobID) err("the wrong jobID")
  let action2 = { input, relayer: signer, extra: query, jobID }
  const relayers = state.relayers || {}
  if (isNil(relayers[jobID])) err("relayer jobID doesn't exist")
  if (!isNil(relayers[jobID].relayers)) {
    const allowed_relayers = map(toLower)(relayers[jobID].relayers || [])
    if (!includes(signer)(allowed_relayers)) err("relayer is not allowed")
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
            SmartWeave
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
          100
      )
    } else if (relayers[jobID].multisig_type === "number") {
      min = relayers[jobID].multisig || 1
    }
    if (matched_signers.length < min) {
      err(
        `not enough number of allowed signers [${matched_signers.length}/${min}] for the job[${jobID}]`
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

  switch (action2.input.function) {
    case "add":
      return await add(state, action2, null, undefined, null, SmartWeave)
    case "set":
      return await set(state, action2, null, null, SmartWeave)
    case "update":
      return await update(state, action2, null, null, SmartWeave)
    case "upsert":
      return await upsert(state, action2, null, null, SmartWeave)
    case "delete":
      return await remove(state, action2, null, null, SmartWeave)
    case "batch":
      return await batch(state, action2, null, null, SmartWeave)
    case "addAddressLink":
      return await addAddressLink(
        state,
        action2,
        null,
        null,
        SmartWeave,
        action2.extra.linkTo
      )

    default:
      err(
        `No function supplied or function not recognised: "${action2.input.function}"`
      )
  }
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { relay }
