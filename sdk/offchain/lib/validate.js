const { is, includes, isNil } = require("ramda")
const { err, read } = require("./utils")
const {
  recoverTypedSignature,
  recoverPersonalSignature,
} = require("@metamask/eth-sig-util")
const { verifyII } = require("./internet-identity")

const validate = async (state, action, func, SmartWeave) => {
  const {
    query,
    nonce,
    signature,
    caller,
    type = "secp256k1",
    pubKey,
  } = action.input
  if (
    !includes(type)(
      state.auth.algorithms || ["secp256k1", "secp256k1-2", "ed25519", "rsa256"]
    )
  ) {
    err(`The wrong algorithm`)
  }
  let _caller = caller
  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]
  const domain = {
    name: state.auth.name,
    version: state.auth.version,
    verifyingContract: isNil(SmartWeave.contract)
      ? "exm"
      : SmartWeave.contract.id,
  }

  const message = {
    nonce,
    query: JSON.stringify({ func, query }),
  }

  const _data = {
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
  let signer = null
  if (type === "ed25519") {
    let isValid = false
    try {
      isValid = await verifyII(_data, signature, caller)
      if (isValid) {
        signer = caller
      } else {
        err = true
      }
    } catch (e) {
      err = true
    }
    /*
    const { isValid } = await read(state.contracts.dfinity, {
      function: "verify",
      data: _data,
      signature,
      signer: caller,
    })
    */
    if (isValid) {
      signer = caller
    } else {
      err(`The wrong signature`)
    }
  } else if (type === "rsa256") {
    let encoded_data = JSON.stringify(_data)
    if (typeof TextEncoder !== "undefined") {
      const enc = new TextEncoder()
      encoded_data = enc.encode(encoded_data)
    }
    const _crypto =
      SmartWeave.arweave.crypto || SmartWeave.arweave.wallets.crypto
    const isValid = await _crypto.verify(
      pubKey,
      encoded_data,
      Buffer.from(signature, "hex")
    )
    if (isValid) {
      signer = caller
    } else {
      err(`The wrong signature`)
    }
  } else if (type == "secp256k1") {
    signer = recoverTypedSignature({
      version: "V4",
      data: _data,
      signature,
    })
    /*
    signer = (
      await read(state.contracts.ethereum, {
        function: "verify712",
        data: _data,
        signature,
      })
    ).signer*/
  } else if (type == "secp256k1-2") {
    signer = recoverPersonalSignature({
      data: JSON.stringify(_data),
      signature,
    })
    /*
    signer = (
      await read(state.contracts.ethereum, {
        function: "verify",
        data: _data,
        signature,
      })
      ).signer
    */
  }

  if (includes(type)(["secp256k1", "secp256k1-2"])) {
    if (/^0x/.test(signer)) signer = signer.toLowerCase()
    if (/^0x/.test(_caller)) _caller = _caller.toLowerCase()
  }

  let original_signer = signer
  let _signer = signer
  if (_signer !== _caller) {
    const link = state.auth.links[_signer]
    if (!isNil(link)) {
      let _address = is(Object, link) ? link.address : link
      let _expiry = is(Object, link) ? link.expiry || 0 : 0
      if (_expiry === 0 || SmartWeave.block.timestamp <= _expiry) {
        _signer = _address
      }
    }
  }
  if (_signer !== _caller) err(`signer[${_signer}] is not caller[${_caller}]`)
  let next_nonce = (state.nonces[original_signer] || 0) + 1
  if (next_nonce !== nonce) {
    err(
      `The wrong nonce[${nonce}] for ${original_signer}: expected ${next_nonce}`
    )
  }
  if (isNil(state.nonces[original_signer])) state.nonces[original_signer] = 0
  state.nonces[original_signer] += 1
  return { signer: _signer, original_signer }
}

module.exports = { validate }
