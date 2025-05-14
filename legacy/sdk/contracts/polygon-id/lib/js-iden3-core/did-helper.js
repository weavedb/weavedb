const { Constants, DidMethodNetwork, DidMethodByte } = require("./constants")

class DIDNetworkFlag {
  constructor(blockchain, networkId) {
    this.blockchain = blockchain
    this.networkId = networkId
  }
  static fromString(s) {
    const [blockchain, networkId] = s.split(":")
    return new DIDNetworkFlag(
      blockchain.replace("_", ""),
      networkId.replace("_", "")
    )
  }
}

function findNetworkIDForDIDMethodByValue(method, byteNumber) {
  const methodMap = DidMethodNetwork[method]
  if (!methodMap) {
    throw Constants.ERRORS.UNSUPPORTED_DID_METHOD
  }
  for (const [key, value] of Object.entries(methodMap)) {
    if (value === byteNumber) {
      return DIDNetworkFlag.fromString(key).networkId
    }
  }
  throw Constants.ERRORS.NETWORK_NOT_SUPPORTED_FOR_DID
}

// findBlockchainForDIDMethodByValue finds blockchain type by byte value
function findBlockchainForDIDMethodByValue(method, byteNumber) {
  const methodMap = DidMethodNetwork[method]
  if (!methodMap) {
    throw new Error(
      `${Constants.ERRORS.NETWORK_NOT_SUPPORTED_FOR_DID}: did method ${method} is not defined in core lib`
    )
  }
  for (const [key, value] of Object.entries(methodMap)) {
    if (value === byteNumber) {
      return DIDNetworkFlag.fromString(key).blockchain
    }
  }
  throw Constants.ERRORS.UNSUPPORTED_BLOCKCHAIN_FOR_DID
}

// findDIDMethodByValue finds did method by its byte value
function findDIDMethodByValue(byteNumber) {
  for (const [key, value] of Object.entries(DidMethodByte)) {
    if (value === byteNumber) {
      return key
    }
  }
  throw Constants.ERRORS.UNSUPPORTED_DID_METHOD
}

module.exports = {
  findNetworkIDForDIDMethodByValue,
  findBlockchainForDIDMethodByValue,
  findDIDMethodByValue,
}
