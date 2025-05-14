const { pubSignalsUnmarshal } = require("../../lib/atomic-query-sig-v2")
const DID = require("../../lib/js-iden3-core/did")
const { verificationKey } = require("../../lib/groth16/verificationKey")
const { groth16Verify } = require("../../lib/groth16/groth16")

const verify = async (state, action) => {
  const { proof, pub_signals } = action.input
  const valid = await groth16Verify(verificationKey, pub_signals, proof)
  const byteEncoder = new TextEncoder()
  const pubSig = pubSignalsUnmarshal(
    byteEncoder.encode(JSON.stringify(pub_signals))
  )
  const _pub_signals = {
    value: pubSig.value,
    merklized: pubSig.merklized,
    userID: DID.parseFromId(pubSig.userID).string(),
    issuerAuthState: pubSig.issuerAuthState.string(),
    requestID: pubSig.requestID,
    issuerID: DID.parseFromId(pubSig.issuerID).string(),
    isRevocationChecked: pubSig.isRevocationChecked,
    issuerClaimNonRevState: pubSig.issuerClaimNonRevState.string(),
    timestamp: pubSig.timestamp,
    claimSchema: pubSig.claimSchema.marshalText(),
    claimPathNotExists: pubSig.claimPathNotExists,
    claimPathKey: pubSig.claimPathKey,
    slotIndex: pubSig.slotIndex,
    operator: pubSig.operator,
  }
  return { result: { valid, pub_signals: _pub_signals } }
}

module.exports = { verify }
