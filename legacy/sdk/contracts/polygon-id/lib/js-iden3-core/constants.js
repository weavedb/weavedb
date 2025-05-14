const Constants = Object.freeze({
  ERRORS: {
    // ErrDataOverflow means that given *big.Int value does not fit in Field Q
    // e.g. greater than Q constant:
    // Q constant: 21888242871839275222246405745257275088548364400416034343698204186575808495617
    DATA_OVERFLOW: new Error("data does not fits SNARK size"),
    // ErrIncorrectIDPosition means that passed position is not one of predefined:
    // IDPositionIndex or IDPositionValue
    INCORRECT_ID_POSITION: new Error("incorrect ID position"),
    // throws when ID not found in the Claim.
    NO_ID: new Error("ID is not set"),
    // throws when subject position flags sets in invalid value.
    INVALID_SUBJECT_POSITION: new Error("invalid subject position"),
    // ErrIncorrectMerklizePosition means that passed position is not one of predefined:
    // MerklizePositionIndex or MerklizePositionValue
    INCORRECT_MERKLIZED_POSITION: new Error("incorrect Merklize position"),
    // ErrNoMerklizedRoot returns when Merklized Root is not found in the Claim.
    NO_MERKLIZED_ROOT: new Error("Merklized root is not set"),
    NETWORK_NOT_SUPPORTED_FOR_DID: new Error(
      "network in not supported for did"
    ),
    UNSUPPORTED_BLOCKCHAIN_FOR_DID: new Error(
      "not supported blockchain for did"
    ),
    UNSUPPORTED_DID_METHOD: new Error("not supported DID method"),
    UNKNOWN_DID_METHOD: new Error("unknown DID method"),
    INCORRECT_DID: new Error("incorrect DID"),
    UNSUPPORTED_ID: new Error("unsupported Id"),
  },
  SCHEMA: {
    HASH_LENGTH: 16,
  },
  ETH_ADDRESS_LENGTH: 20,
  BYTES_LENGTH: 32,
  ELEM_BYTES_LENGTH: 4,
  NONCE_BYTES_LENGTH: 8,
  Q: BigInt(
    "21888242871839275222246405745257275088548364400416034343698204186575808495617"
  ),
  ID: {
    TYPE_DEFAULT: Uint8Array.from([0x00, 0x00]),
    TYPE_READONLY: Uint8Array.from([0b00000000, 0b00000001]),
    ID_LENGTH: 31,
  },
  DID: {
    DID_SCHEMA: "did",
  },
  GENESIS_LENGTH: 27,
})
const Blockchain = {
  Ethereum: "eth",
  Polygon: "polygon",
  ZkEVM: "zkevm",
  Unknown: "unknown",
  NoChain: "",
  ReadOnly: "readonly",
}

const NetworkId = {
  Main: "main",
  Mumbai: "mumbai",
  Goerli: "goerli",
  Sepolia: "sepolia",
  Test: "test",
  Unknown: "unknown",
  NoNetwork: "",
}

const DidMethod = {
  Iden3: "iden3",
  PolygonId: "polygonid",
  Other: "",
}
const DidMethodByte = Object.freeze({
  [DidMethod.Iden3]: 0b00000001,
  [DidMethod.PolygonId]: 0b00000010,
  [DidMethod.Other]: 0b11111111,
})
const DidMethodNetwork = Object.freeze({
  [DidMethod.Iden3]: {
    [`${Blockchain.ReadOnly}:${NetworkId.NoNetwork}`]: 0b00000000,
    [`${Blockchain.Polygon}:${NetworkId.Main}`]: 0b00010000 | 0b00000001,
    [`${Blockchain.Polygon}:${NetworkId.Mumbai}`]: 0b00010000 | 0b00000010,
    [`${Blockchain.Ethereum}:${NetworkId.Main}`]: 0b00100000 | 0b00000001,
    [`${Blockchain.Ethereum}:${NetworkId.Goerli}`]: 0b00100000 | 0b00000010,
    [`${Blockchain.Ethereum}:${NetworkId.Sepolia}`]: 0b00100000 | 0b00000011,
    [`${Blockchain.ZkEVM}:${NetworkId.Main}`]: 0b00110000 | 0b00000001,
    [`${Blockchain.ZkEVM}:${NetworkId.Test}`]: 0b00110000 | 0b00000010,
  },
  [DidMethod.PolygonId]: {
    [`${Blockchain.ReadOnly}:${NetworkId.NoNetwork}`]: 0b00000000,
    [`${Blockchain.Polygon}:${NetworkId.Main}`]: 0b00010000 | 0b00000001,
    [`${Blockchain.Polygon}:${NetworkId.Mumbai}`]: 0b00010000 | 0b00000010,
    [`${Blockchain.Ethereum}:${NetworkId.Main}`]: 0b00100000 | 0b00000001,
    [`${Blockchain.Ethereum}:${NetworkId.Goerli}`]: 0b00100000 | 0b00000010,
    [`${Blockchain.Ethereum}:${NetworkId.Sepolia}`]: 0b00100000 | 0b00000011,
    [`${Blockchain.ZkEVM}:${NetworkId.Main}`]: 0b00110000 | 0b00000001,
    [`${Blockchain.ZkEVM}:${NetworkId.Test}`]: 0b00110000 | 0b00000010,
  },
  [DidMethod.Other]: {
    [`${Blockchain.Unknown}:${NetworkId.Unknown}`]: 0b11111111,
  },
})

module.exports = {
  Constants,
  DidMethodNetwork,
  DidMethodByte,
  DidMethod,
  NetworkId,
  Blockchain,
}
