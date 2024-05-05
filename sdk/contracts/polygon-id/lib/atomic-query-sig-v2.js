const Id = require("./js-iden3-core/id")
const { newHashFromString } = require("./js-merkletree/hash")
const SchemaHash = require("./js-iden3-core/schemaHash")
const byteDecoder = new TextDecoder()
const defaultValueArraySize = 64
const getValueArrSize = () => {
  return defaultValueArraySize
}

const pubSignalsUnmarshal = data => {
  const fieldLength = 13

  const sVals = JSON.parse(byteDecoder.decode(data))

  if (sVals.length !== fieldLength + getValueArrSize()) {
    throw new Error(
      `invalid number of Output values expected ${
        fieldLength + getValueArrSize()
      } got ${sVals.length}`
    )
  }

  let fieldIdx = 0
  const _this = { value: [] }
  // -- merklized
  _this.merklized = parseInt(sVals[fieldIdx])
  fieldIdx++

  //  - userID
  _this.userID = Id.fromBigInt(BigInt(sVals[fieldIdx]))
  fieldIdx++

  // - issuerAuthState
  _this.issuerAuthState = newHashFromString(sVals[fieldIdx])
  fieldIdx++

  // - requestID
  _this.requestID = BigInt(sVals[fieldIdx])
  fieldIdx++

  // - issuerID
  _this.issuerID = Id.fromBigInt(BigInt(sVals[fieldIdx]))
  fieldIdx++

  // - isRevocationChecked
  _this.isRevocationChecked = parseInt(sVals[fieldIdx])
  fieldIdx++

  // - issuerClaimNonRevState
  _this.issuerClaimNonRevState = newHashFromString(sVals[fieldIdx])
  fieldIdx++

  //  - timestamp
  _this.timestamp = parseInt(sVals[fieldIdx])
  fieldIdx++

  //  - claimSchema
  _this.claimSchema = SchemaHash.newSchemaHashFromInt(BigInt(sVals[fieldIdx]))
  fieldIdx++

  // - ClaimPathNotExists
  _this.claimPathNotExists = parseInt(sVals[fieldIdx])
  fieldIdx++

  // - ClaimPathKey
  _this.claimPathKey = BigInt(sVals[fieldIdx])
  fieldIdx++

  // - slotIndex
  _this.slotIndex = parseInt(sVals[fieldIdx])
  fieldIdx++

  // - operator
  _this.operator = parseInt(sVals[fieldIdx])
  fieldIdx++

  //  - values
  for (let index = 0; index < getValueArrSize(); index++) {
    _this.value.push(BigInt(sVals[fieldIdx]))
    fieldIdx++
  }

  return _this
}

module.exports = { pubSignalsUnmarshal }
