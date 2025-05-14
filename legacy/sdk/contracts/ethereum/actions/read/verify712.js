const {
  recoverTypedSignature,
} = require("../../lib/eth-sig-util/sign-typed-data")

const verify712 = async (state, action) => {
  const { data, signature } = action.input
  const signer = recoverTypedSignature({
    version: "V4",
    data,
    signature,
  })
  return { result: { signer } }
}

module.exports = verify712
