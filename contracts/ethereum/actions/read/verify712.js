const {
  recoverTypedSignature,
} = require("../../lib/eth-sig-util/sign-typed-data")

export default async (state, action) => {
  const { data, signature } = action.input
  const signer = recoverTypedSignature({
    version: "V4",
    data,
    signature,
  })
  return { result: { signer } }
}
