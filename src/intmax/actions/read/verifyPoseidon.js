const { buildEddsa } = require("../../lib/circomlibjs")
const Scalar = require("../../lib/ffjavascript").Scalar
const sha256 = new (require("../../lib/sha.js/sha256"))()
const { mergeLeft } = require("ramda")

const toArrayBuffer = buf => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export default async (state, action) => {
  const poseidonConstants1 = (
    await SmartWeave.contracts.viewContractState(
      state.contracts.poseidonConstants1,
      {
        function: "get",
      }
    )
  ).result
  const poseidonConstants2 = (
    await SmartWeave.contracts.viewContractState(
      state.contracts.poseidonConstants2,
      {
        function: "get",
      }
    )
  ).result
  const poseidonConstants = mergeLeft(poseidonConstants1, poseidonConstants2)
  const { data, signature, pubKey } = action.input
  const eddsa = await buildEddsa(poseidonConstants)
  let msg = JSON.stringify(data)
  const msgHashed = Buffer.from(toArrayBuffer(sha256.update(msg).digest()))
  const msg2 = eddsa.babyJub.F.e(Scalar.fromRprLE(msgHashed, 0))
  const packedSig = Uint8Array.from(
    Buffer.from(signature.replace(/^0x/, ""), "hex")
  )
  const sig = eddsa.unpackSignature(packedSig)
  const packedPublicKey = Uint8Array.from(
    Buffer.from(pubKey.replace(/^0x/, ""), "hex")
  )
  const publicKey = eddsa.babyJub.unpackPoint(packedPublicKey)
  const isValid = eddsa.verifyPoseidon(msg2, sig, publicKey)
  return { result: { isValid } }
}
