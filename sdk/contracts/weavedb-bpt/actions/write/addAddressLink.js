const { is, isNil } = require("ramda")
const { read, err, wrapResult, kv } = require("../../lib/utils")
const { validate } = require("../../lib/validate")

const addAddressLink = async (
  state,
  action,
  signer,
  contractErr = true,
  SmartWeave,
  _linkTo,
  kvs,
) => {
  let original_signer = null
  if (isNil(signer)) {
    ;({ signer, original_signer } = await validate(
      state,
      action,
      "addAddressLink",
      SmartWeave,
      true,
      kvs,
    ))
  }
  let _expiry = 0
  let linkTo = null
  let address = null
  let linkToAddr = signer
  if (!isNil(action.input.query.proof)) {
    const q = action.input.query
    const res = await read(
      state.contracts.polygonID,
      {
        function: "verify",
        proof: q.proof,
        pub_signals: q.pub_signals,
      },
      SmartWeave,
    )
    if (!res.valid) err("invalid proof")
    if (res.pub_signals.userID !== action.input.query.address) {
      err("DID mismatch")
    }
    if (
      BigInt(signer).toString().slice(0, 15) !==
      res.pub_signals.value[0].toString()
    ) {
      err("the wrong proof")
    }
    address = signer
    linkToAddr = res.pub_signals.userID
  } else {
    const {
      address: _address,
      signature,
      expiry,
      linkTo: _linkTo,
    } = action.input.query
    address = _address
    linkTo = _linkTo
    if ((!isNil(linkTo) || !isNil(_linkTo)) && linkTo !== _linkTo)
      err("linkTo doesn't match")
    if (!isNil(expiry) && !is(Number, expiry)) err("expiry must be a number")
    const { nonce } = action.input
    _expiry = expiry || 0
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "verifyingContract", type: "string" },
    ]

    const domain = {
      name: state.auth.name,
      version: state.auth.version,
      verifyingContract: SmartWeave.contract.id,
    }
    let query =
      typeof expiry === "undefined"
        ? { address: signer }
        : { address: signer, expiry }
    if (!isNil(linkTo)) query.linkTo = linkTo
    const message = {
      nonce,
      query: JSON.stringify({
        func: "auth",
        query,
      }),
    }

    const data = {
      types: {
        EIP712Domain,
        Query: [
          { name: "query", type: "string" },
          { name: "nonce", type: "uint256" },
        ],
      },
      domain,
      primaryType: "Query",
      message,
    }
    let signer2 = (
      await SmartWeave.contracts.viewContractState(state.contracts.ethereum, {
        function: "verify712",
        data,
        signature,
      })
    ).result.signer
    const _signer = signer2.toLowerCase()
    if (_signer !== address.toLowerCase()) err()
  }

  const link = await kv(kvs, SmartWeave).get(`auth.${address}`)
  const timestamp = isNil(action.timestamp)
    ? SmartWeave.block.timestamp
    : Math.round(action.timestamp / 1000)
  if (!isNil(link)) {
    let prev_expiry = is(Object, link) ? link.expiry || 0 : 0
    if (timestamp < prev_expiry) {
      err("link already exists")
    }
  }
  await kv(kvs, SmartWeave).put(`auth.${address.toLowerCase()}`, {
    address: linkTo || linkToAddr,
    expiry: _expiry === 0 ? 0 : timestamp + _expiry,
  })
  return wrapResult(state, original_signer, SmartWeave)
}

module.exports = { addAddressLink }
