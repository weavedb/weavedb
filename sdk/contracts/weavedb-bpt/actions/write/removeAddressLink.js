const { is, isNil } = require("ramda")
const { validate } = require("../../lib/validate")
const { err, wrapResult } = require("../../../common/lib/utils")
const { kv } = require("../../lib/utils")

const removeAddressLink = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  kvs
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "removeAddressLink",
      SmartWeave,
      true,
      kvs
    ))
  }
  const { address } = action.input.query
  const link = await kv(kvs, SmartWeave).get(`auth.${address.toLowerCase()}`)
  if (isNil(link)) err("link doesn't exist")
  let _address = is(Object, link) ? link.address : link
  if (signer !== address.toLowerCase() && signer !== _address) {
    err("signer is neither owner nor delegator")
  }
  await kv(kvs, SmartWeave).put(`auth.${address.toLowerCase()}`, null)
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { removeAddressLink }
