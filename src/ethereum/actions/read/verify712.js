const { recoverTypedSignature } = require("../../lib/eth-sig-util")

export default async (state, action) => {
  const { data, signature } = action.input
  const signer = recoverTypedSignature({
    version: "V4",
    data: data,
    signature,
  })
  return { result: { signer } }
}
