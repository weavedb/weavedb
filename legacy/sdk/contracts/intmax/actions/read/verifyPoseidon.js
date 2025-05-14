const { buildEddsa } = require("../../lib/circomlibjs")
const Scalar = require("../../lib/ffjavascript").Scalar
const sha256 = new (require("../../lib/sha.js/sha256"))()

const toArrayBuffer = buf => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

const getEddsa = async state => {
  let constants = {}
  for (let i = 1; i < 9; i++) {
    constants[i] = (
      await SmartWeave.contracts.viewContractState(
        state.contracts[`poseidonConstants${i}`],
        {
          function: "get",
        }
      )
    ).result
  }
  let S = []
  for (let i = 3; i < 9; i++) S = S.concat(constants[i].S)
  return await buildEddsa({
    C: constants["1"].C,
    M: constants["2"].M,
    P: constants["2"].P,
    S,
  })
}

const parse = (action, eddsa) => {
  const { data, signature, pubKey } = action.input
  const msg = Buffer.from(
    toArrayBuffer(sha256.update(JSON.stringify(data)).digest())
  )
  const sig = eddsa.unpackSignature(
    Uint8Array.from(Buffer.from(signature.replace(/^0x/, ""), "hex"))
  )
  const pub = eddsa.babyJub.unpackPoint(
    Uint8Array.from(Buffer.from(pubKey.replace(/^0x/, ""), "hex"))
  )
  return { msg, sig, pub }
}
module.exports.verifyPoseidon = async (state, action) => {
  const eddsa = await getEddsa(state)
  const { msg, sig, pub } = parse(action, eddsa)
  const isValid = eddsa.verifyPoseidon(msg, sig, pub)

  return { result: { isValid } }
}
