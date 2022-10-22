const ethereumjs_util_1 = require("../ethereumjs-util")
const ethereumjs_abi_1 = require("../ethereumjs-abi")
const { isHexString } = require("../ethjs-util")
var SignTypedDataVersion = {}
SignTypedDataVersion["V1"] = "V1"
SignTypedDataVersion["V3"] = "V3"
SignTypedDataVersion["V4"] = "V4"

function encodeField(types, name, type, value, version) {
  //    validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);
  if (types[type] !== undefined) {
    return [
      "bytes32",
      version === SignTypedDataVersion.V4 && value == null // eslint-disable-line no-eq-null
        ? "0x0000000000000000000000000000000000000000000000000000000000000000"
        : ethereumjs_util_1.keccak(encodeData(type, value, types, version)),
    ]
  }
  if (value === undefined) {
    throw new Error(`missing value for field ${name} of type ${type}`)
  }
  if (type === "bytes") {
    return ["bytes32", ethereumjs_util_1.keccak(value)]
  }
  if (type === "string") {
    // convert string to buffer - prevents ethUtil from interpreting strings like '0xabcd' as hex
    if (typeof value === "string") {
      value = Buffer.from(value, "utf8")
    }
    return ["bytes32", ethereumjs_util_1.keccak(value)]
  }
  if (type.lastIndexOf("]") === type.length - 1) {
    if (version === SignTypedDataVersion.V3) {
      throw new Error(
        "Arrays are unimplemented in encodeData; use V4 extension"
      )
    }
    const parsedType = type.slice(0, type.lastIndexOf("["))
    const typeValuePairs = value.map(item =>
      encodeField(types, name, parsedType, item, version)
    )
    return [
      "bytes32",
      ethereumjs_util_1.keccak(
        ethereumjs_abi_1.rawEncode(
          typeValuePairs.map(([t]) => t),
          typeValuePairs.map(([, v]) => v)
        )
      ),
    ]
  }
  return [type, value]
}

function findTypeDependencies(primaryType, types, results = new Set()) {
  ;[primaryType] = primaryType.match(/^\w*/u)
  if (results.has(primaryType) || types[primaryType] === undefined) {
    return results
  }
  results.add(primaryType)
  for (const field of types[primaryType]) {
    findTypeDependencies(field.type, types, results)
  }
  return results
}
function encodeType(primaryType, types) {
  let result = ""
  const unsortedDeps = findTypeDependencies(primaryType, types)
  unsortedDeps.delete(primaryType)
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()]
  for (const type of deps) {
    const children = types[type]
    if (!children) {
      throw new Error(`No type definition specified: ${type}`)
    }
    result += `${type}(${types[type]
      .map(({ name, type: t }) => `${t} ${name}`)
      .join(",")})`
  }
  return result
}

function hashType(primaryType, types) {
  return ethereumjs_util_1.keccak(encodeType(primaryType, types))
}

function encodeData(primaryType, data, types, version) {
  //validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);
  const encodedTypes = ["bytes32"]
  const encodedValues = [hashType(primaryType, types)]
  for (const field of types[primaryType]) {
    if (version === SignTypedDataVersion.V3 && data[field.name] === undefined) {
      continue
    }
    const [type, value] = encodeField(
      types,
      field.name,
      field.type,
      data[field.name],
      version
    )
    encodedTypes.push(type)
    encodedValues.push(value)
  }
  return ethereumjs_abi_1.rawEncode(encodedTypes, encodedValues)
}

function hashStruct(primaryType, data, types, version) {
  //   validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);
  return ethereumjs_util_1.keccak(encodeData(primaryType, data, types, version))
}
function isNullish(value) {
  return value === null || value === undefined
}
const TYPED_MESSAGE_SCHEMA = {
  type: "object",
  properties: {
    types: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
          },
          required: ["name", "type"],
        },
      },
    },
    primaryType: { type: "string" },
    domain: { type: "object" },
    message: { type: "object" },
  },
  required: ["types", "primaryType", "domain", "message"],
}

function sanitizeData(data) {
  const sanitizedData = {}
  for (const key in TYPED_MESSAGE_SCHEMA.properties) {
    if (data[key]) {
      sanitizedData[key] = data[key]
    }
  }
  if ("types" in sanitizedData) {
    sanitizedData.types = Object.assign(
      { EIP712Domain: [] },
      sanitizedData.types
    )
  }
  return sanitizedData
}

function eip712Hash(typedData, version) {
  //validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4]);
  const sanitizedData = sanitizeData(typedData)
  const parts = [Buffer.from("1901", "hex")]
  parts.push(
    hashStruct(
      "EIP712Domain",
      sanitizedData.domain,
      sanitizedData.types,
      version
    )
  )
  if (sanitizedData.primaryType !== "EIP712Domain") {
    parts.push(
      hashStruct(
        // TODO: Validate that this is a string, so this type cast can be removed.
        sanitizedData.primaryType,
        sanitizedData.message,
        sanitizedData.types,
        version
      )
    )
  }
  return ethereumjs_util_1.keccak(Buffer.concat(parts))
}

function recoverPublicKey(messageHash, signature) {
  const sigParams = ethereumjs_util_1.fromRpcSig(signature)
  return ethereumjs_util_1.ecrecover(
    messageHash,
    sigParams.v,
    sigParams.r,
    sigParams.s
  )
}

function recoverTypedSignature({ data, signature, version }) {
  //validateVersion(version);

  if (isNullish(data)) {
    throw new Error("Missing data parameter")
  } else if (isNullish(signature)) {
    throw new Error("Missing signature parameter")
  }
  const messageHash = eip712Hash(data, "V4")
  const publicKey = recoverPublicKey(messageHash, signature)
  const sender = ethereumjs_util_1.publicToAddress(publicKey)
  return ethereumjs_util_1.bufferToHex(sender)
}

function legacyToBuffer(value) {
  return typeof value === "string" && !isHexString(value)
    ? Buffer.from(value)
    : ethereumjs_util_1.toBuffer(value)
}

function getPublicKeyFor(message, signature) {
  const messageHash = ethereumjs_util_1.hashPersonalMessage(
    legacyToBuffer(message)
  )
  return recoverPublicKey(messageHash, signature)
}

function recoverPersonalSignature({ data, signature }) {
  if (isNullish(data)) {
    throw new Error("Missing data parameter")
  } else if (isNullish(signature)) {
    throw new Error("Missing signature parameter")
  }
  const publicKey = getPublicKeyFor(data, signature)
  const sender = ethereumjs_util_1.publicToAddress(publicKey)
  const senderHex = ethereumjs_util_1.bufferToHex(sender)
  return senderHex
}

module.exports = {
  recoverTypedSignature,
  recoverPersonalSignature,
}
