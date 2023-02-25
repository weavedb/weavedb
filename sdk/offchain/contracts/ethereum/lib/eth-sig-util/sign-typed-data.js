const { isNullish, numberToBuffer, recoverPublicKey } = require("./utils")
const { keccak256 } = require("../ethereum-cryptography/keccak")
const {
  arrToBufArr,
  publicToAddress,
  bufferToHex,
} = require("../ethereumjs/util")
const { isHexString } = require("../ethjs-util")
const { rawEncode } = require("./ethereumjs-abi-utils")
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

function encodeField(types, name, type, value, version) {
  if (types[type] !== undefined) {
    return [
      "bytes32",
      value == null // eslint-disable-line no-eq-null
        ? "0x0000000000000000000000000000000000000000000000000000000000000000"
        : arrToBufArr(keccak256(encodeData(type, value, types, version))),
    ]
  }

  if (value === undefined) {
    throw new Error(`missing value for field ${name} of type ${type}`)
  }

  if (type === "bytes") {
    if (typeof value === "number") {
      value = numberToBuffer(value)
    } else if (isHexString(value)) {
      const prepend = value.length % 2 ? "0" : ""
      value = Buffer.from(prepend + value.slice(2), "hex")
    } else {
      value = Buffer.from(value, "utf8")
    }
    return ["bytes32", arrToBufArr(keccak256(value))]
  }

  if (type === "string") {
    if (typeof value === "number") {
      value = numberToBuffer(value)
    } else {
      value = Buffer.from(value ?? "", "utf8")
    }
    return ["bytes32", arrToBufArr(keccak256(value))]
  }

  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["))
    const typeValuePairs = value.map(item =>
      encodeField(types, name, parsedType, item, version)
    )
    return [
      "bytes32",
      arrToBufArr(
        keccak256(
          rawEncode(
            typeValuePairs.map(([t]) => t),
            typeValuePairs.map(([, v]) => v)
          )
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
  const encodedHashType = Buffer.from(encodeType(primaryType, types), "utf-8")
  return keccak256(encodedHashType)
  return arrToBufArr(keccak256(encodedHashType))
}

function encodeData(primaryType, data, types, version) {
  const encodedTypes = ["bytes32"]
  const encodedValues = [hashType(primaryType, types)]
  for (const field of types[primaryType]) {
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
  return rawEncode(encodedTypes, encodedValues)
}

function hashStruct(primaryType, data, types, version) {
  return arrToBufArr(keccak256(encodeData(primaryType, data, types, version)))
}

function sanitizeData(data) {
  const sanitizedData = {}
  for (const key in TYPED_MESSAGE_SCHEMA.properties) {
    if (data[key]) {
      sanitizedData[key] = data[key]
    }
  }

  if ("types" in sanitizedData) {
    sanitizedData.types = { EIP712Domain: [], ...sanitizedData.types }
  }
  return sanitizedData
}

function eip712Hash(typedData, version) {
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
        sanitizedData.primaryType,
        sanitizedData.message,
        sanitizedData.types,
        version
      )
    )
  }
  return arrToBufArr(keccak256(Buffer.concat(parts)))
}

function recoverTypedSignature({ data, signature, version }) {
  if (isNullish(data)) {
    throw new Error("Missing data parameter")
  } else if (isNullish(signature)) {
    throw new Error("Missing signature parameter")
  }
  const messageHash = eip712Hash(data, version)
  const publicKey = recoverPublicKey(messageHash, signature)
  const sender = publicToAddress(publicKey)
  return bufferToHex(sender)
}

module.exports = { recoverTypedSignature }
