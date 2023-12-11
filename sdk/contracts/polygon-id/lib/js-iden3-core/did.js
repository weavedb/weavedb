const { NetworkId, Blockchain, DidMethod, Constants } = require("./constants")
const { BytesHelper } = require("./elemBytes")
const { Parser } = require("./did-parser")
const {
  findBlockchainForDIDMethodByValue,
  findDIDMethodByValue,
  findNetworkIDForDIDMethodByValue,
} = require("./did-helper")

class DID {
  constructor(d) {
    this.method = ""
    this.id = ""
    this.idStrings = []
    this.params = []
    this.path = ""
    this.pathSegments = []
    this.query = ""
    this.fragment = ""
    if (d) {
      Object.assign(this, d)
    }
  }
  static isUnsupported(method, blockchain, networkId) {
    return (
      method == DidMethod.Other &&
      blockchain == Blockchain.Unknown &&
      networkId == NetworkId.Unknown
    )
  }
  static parse(s) {
    const parser = new Parser(s)

    let parserState = parser.checkLength()

    while (parserState) {
      parserState = parserState()
    }

    parser.out.id = parser.out.idStrings.join(":")
    parser.out.path = parser.out.pathSegments.join("/")

    return new DID(parser.out)
  }
  static decodePartsFromId(id) {
    const method = findDIDMethodByValue(id.bytes[0])
    const blockchain = findBlockchainForDIDMethodByValue(method, id.bytes[1])

    const networkId = findNetworkIDForDIDMethodByValue(method, id.bytes[1])

    return { method, blockchain, networkId }
  }
  static throwIfDIDUnsupported(id) {
    const { method, blockchain, networkId } = DID.decodePartsFromId(id)
    if (DID.isUnsupported(method, blockchain, networkId)) {
      throw new Error(
        `${Constants.ERRORS.UNKNOWN_DID_METHOD.message}: unsupported DID`
      )
    }

    return { method, blockchain, networkId }
  }
  static parseFromId(id) {
    if (!BytesHelper.checkChecksum(id.bytes)) {
      throw new Error(
        `${Constants.ERRORS.UNSUPPORTED_ID.message}: invalid checksum`
      )
    }
    const { method, blockchain, networkId } = DID.throwIfDIDUnsupported(id)

    const didParts = [
      Constants.DID.DID_SCHEMA,
      method.toString(),
      blockchain.toString(),
    ]
    if (networkId) {
      didParts.push(networkId.toString())
    }
    didParts.push(id.string())

    const didString = didParts.join(":")

    const did = DID.parse(didString)

    return did
  }
  string() {
    const buff = ["did:"]
    if (this.method) {
      buff.push(`${this.method}:`)
    } else {
      return ""
    }

    if (this.id) {
      buff.push(this.id)
    } else if (this.idStrings.length) {
      buff.push(this.idStrings.join(":"))
    } else {
      return ""
    }

    if (this.params.length) {
      for (const param of this.params) {
        const p = param.toString()
        if (p) {
          buff.push(`;${p}`)
        } else {
          return ""
        }
      }
    }

    if (this.path) {
      buff.push(`/${this.path}`)
    } else if (this.pathSegments.length) {
      buff.push(`/${this.pathSegments.join("/")}`)
    }

    if (this.query) {
      buff.push(`?${this.query}`)
    }

    if (this.fragment) {
      buff.push(`#${this.fragment}`)
    }

    return buff.join("")
  }
}
module.exports = DID
