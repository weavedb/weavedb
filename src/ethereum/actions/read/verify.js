const {
  recoverPersonalSignature,
} = require("../../lib/eth-sig-util/personal-sign")

export default async (state, action) => {
  const { data, signature } = action.input
  const signer = recoverPersonalSignature({
    data: JSON.stringify(data),
    signature,
  })
  return { result: { signer } }
}
