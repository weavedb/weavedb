const {
  recoverPersonalSignature,
} = require("../../lib/eth-sig-util/personal-sign")

const verify = async (state, action) => {
  const { data, signature } = action.input
  const signer = recoverPersonalSignature({
    data: JSON.stringify(data),
    signature,
  })
  return { result: { signer } }
}

module.exports = verify
