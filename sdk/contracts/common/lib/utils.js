const {
  mergeLeft,
  includes,
  of,
  isNil,
  tail,
  is,
  complement,
  concat,
  without,
  last,
} = require("ramda")
const { clone, bigIntFromBytes } = require("./pure")
const { validate } = require("../../common/lib/jsonschema")

const err = (msg = `The wrong query`, contractErr = false) => {
  if (contractErr) {
    const error = typeof ContractError === "undefined" ? Error : ContractError
    throw new error(msg)
  } else {
    throw msg
  }
}

const getField = (data, path) => {
  if (path.length === 1) {
    return [path[0], data]
  } else {
    if (isNil(data[path[0]])) data[path[0]] = {}
    return getField(data[path[0]], tail(path))
  }
}

const mergeData = (_data, new_data, overwrite = false, signer, SmartWeave) => {
  let exists = true
  if (isNil(_data.__data) || overwrite) {
    _data.__data = {}
    exists = false
  }
  for (let k in new_data) {
    const path = exists ? k.split(".") : [k]
    const [field, obj] = getField(_data.__data, path)
    const d = new_data[k]
    if (is(Object)(d) && d.__op === "arrayUnion") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, obj[field])) obj[field] = []
      obj[field] = concat(obj[field], d.arr)
    } else if (is(Object)(d) && d.__op === "arrayRemove") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, obj[field])) obj[field] = []
      obj[field] = without(d.arr, obj[field])
    } else if (is(Object)(d) && d.__op === "inc") {
      if (isNaN(d.n)) err()
      if (isNil(obj[field])) obj[field] = 0
      obj[field] += d.n
    } else if (is(Object)(d) && d.__op === "del") {
      delete obj[field]
    } else if (is(Object)(d) && d.__op === "ts") {
      obj[field] = SmartWeave.block.timestamp
    } else if (is(Object)(d) && d.__op === "signer") {
      obj[field] = signer
    } else {
      obj[field] = d
    }
  }
  return _data
}

const isEvolving = state =>
  !isNil(state.evolveHistory) &&
  !isNil(last(state.evolveHistory)) &&
  isNil(last(state.evolveHistory).newVersion)

async function getRandomIntNumber(
  max,
  action,
  uniqueValue = "",
  salt,
  SmartWeave
) {
  const pseudoRandomData = SmartWeave.arweave.utils.stringToBuffer(
    SmartWeave.block.height +
      SmartWeave.block.timestamp +
      SmartWeave.transaction.id +
      action.caller +
      uniqueValue +
      salt.toString()
  )
  const hashBytes = await SmartWeave.arweave.crypto.hash(pseudoRandomData)
  const randomBigInt = bigIntFromBytes(hashBytes)
  return Number(randomBigInt % BigInt(max))
}

const genId = async (action, salt, SmartWeave) => {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let autoId = ""
  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(
      (await getRandomIntNumber(CHARS.length, action, i, salt, SmartWeave)) - 1
    )
  }
  return autoId
}

const isOwner = (signer, state) => {
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (!includes(signer)(owner)) {
    err(`Signer[${signer}] is not the owner[${owner.join(", ")}].`)
  }
  return owner
}

const read = async (contract, param, SmartWeave) => {
  return (await SmartWeave.contracts.viewContractState(contract, param)).result
}

const validateSchema = (schema, data, contractErr) => {
  if (!isNil(schema)) {
    const valid = validate(data, clone(schema)).valid
    if (!valid) err("invalid schema", contractErr)
  }
}

const wrapResult = (state, original_signer, SmartWeave, extra) => ({
  state,
  result: mergeLeft(extra, {
    original_signer,
    transaction: {
      id: SmartWeave?.transaction?.id || null,
      owner: SmartWeave?.transaction?.owner || null,
      tags: SmartWeave?.transaction?.tags || null,
      quantity: SmartWeave?.transaction?.quantity || null,
      target: SmartWeave?.transaction?.target || null,
      reward: SmartWeave?.transaction?.reward || null,
    },
    block: {
      height: SmartWeave?.block?.height || null,
      timestamp: SmartWeave?.block?.timestamp || null,
      indep_hash: SmartWeave?.block?.indep_hash || null,
    },
  }),
})

const parse = async (
  state,
  action,
  func,
  signer,
  salt,
  contractErr = true,
  SmartWeave,
  kvs,
  fn
) => {
  const { data } = state
  const { query } = action.input
  const { relayer, jobID, extra } = action
  let new_data = null
  let path = null
  let col
  if (
    includes(func)([
      "delete",
      "getSchema",
      "getRules",
      "getAlgorithms",
      "removeRelayerJob",
      "getRelayerJob",
      "listCollections",
    ])
  ) {
    path = query
  } else {
    ;[new_data, ...path] = query
    if (func === "add") {
      const id = await genId(action, salt, SmartWeave)
      path.push(id)
      await fn.addNewDoc(id, SmartWeave, state, kvs)
    }
  }
  if (
    (isNil(new_data) &&
      !includes(func)([
        "listCollections",
        "delete",
        "getSchema",
        "getRules",
        "getAlgorithms",
        "getRelayerJob",
        "removeRelayerJob",
        "getRelayerJob",
      ])) ||
    (path.length === 0 &&
      !includes(func)(["setAlgorithms", "listCollections"])) ||
    (path.length % 2 !== 0 &&
      !includes(func)([
        "addRelayerJob",
        "removeRelayerJob",
        "getRelayerJob",
        "addIndex",
        "addTrigger",
        "removeTrigger",
        "removeIndex",
        "setSchema",
        "getSchema",
        "getAlgorithms",
        "setRules",
        "getRules",
        "linkContract",
        "unlinkContract",
      ]))
  ) {
    err(`the wrong query length[${query.length}] for ${func}`, contractErr)
  }
  let _data = null
  let schema = null
  let rules = null
  let next_data
  if (
    includes(func)([
      "addIndex",
      "addTrigger",
      "removeTrigger",
      "removeIndex",
      "setSchema",
      "getSchema",
      "setRules",
      "getRules",
    ])
  ) {
    _data = await fn.getCol(data, path, signer, SmartWeave, undefined, kvs)
    col = _data
  } else if (
    !includes(func)([
      "setAlgorithms",
      "addRelayerJob",
      "removeRelayerJob",
      "getAlgorithms",
      "linkContract",
      "unlinkContract",
    ]) &&
    path.length !== 0
  ) {
    const doc = await fn.getDoc(
      data,
      path,
      signer,
      func,
      new_data,
      state.secure,
      relayer,
      jobID,
      extra,
      state,
      action,
      SmartWeave,
      undefined,
      kvs
    )
    _data = doc.doc
    ;({ next_data, schema, rules, col } = doc)
  }
  let owner = state.owner || []
  if (is(String)(owner)) owner = of(owner)
  if (
    includes(func)([
      "addRelayerJob",
      "removeRelayerJob",
      "addIndex",
      "addTrigger",
      "removeTrigger",
      "removeIndex",
      "setSchema",
      "setAlgorithms",
      "setRules",
      "unlinkContract",
      "linkContract",
      "unlinkContract",
    ]) &&
    !includes(signer)(owner)
  ) {
    err("caller is not contract owner", contractErr)
  }
  return { data, query, new_data, path, _data, schema, col, next_data }
}

const auth = async (
  state,
  action,
  func,
  SmartWeave,
  use_nonce = true,
  kvs,
  fn
) => {
  const {
    query,
    nonce,
    signature,
    caller,
    type = "secp256k1",
    pubKey,
  } = action.input
  if (
    !includes(type)(
      state.auth.algorithms || ["secp256k1", "secp256k1-2", "ed25519", "rsa256"]
    )
  ) {
    err(`The wrong algorithm`)
  }
  let _caller = caller
  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]
  const domain = {
    name: state.auth.name,
    version: state.auth.version,
    verifyingContract: isNil(SmartWeave.contract)
      ? "exm"
      : SmartWeave.contract.id,
  }

  const message = {
    nonce,
    query: JSON.stringify({ func, query }),
  }

  const _data = {
    types: {
      EIP712Domain,
      Query: [
        { name: "query", type: "string" },
        { name: "nonce", type: "uint256" },
      ],
    },
    domain,
    primaryType: "Query",
    message,
  }
  let signer = null
  if (type === "ed25519") {
    const { isValid } = await read(
      state.contracts.dfinity,
      {
        function: "verify",
        data: _data,
        signature,
        signer: caller,
      },
      SmartWeave
    )
    if (isValid) {
      signer = caller
    } else {
      err(`The wrong signature`)
    }
  } else if (type === "rsa256") {
    let encoded_data = JSON.stringify(_data)
    if (typeof TextEncoder !== "undefined") {
      const enc = new TextEncoder()
      encoded_data = enc.encode(encoded_data)
    }
    const _crypto =
      SmartWeave.arweave.crypto || SmartWeave.arweave.wallets.crypto
    const isValid = await _crypto.verify(
      pubKey,
      encoded_data,
      Buffer.from(signature, "hex")
    )
    if (isValid) {
      signer = caller
    } else {
      err(`The wrong signature`)
    }
  } else if (type == "secp256k1") {
    signer = (
      await read(
        state.contracts.ethereum,
        {
          function: "verify712",
          data: _data,
          signature,
        },
        SmartWeave
      )
    ).signer
  } else if (type == "secp256k1-2") {
    signer = (
      await read(
        state.contracts.ethereum,
        {
          function: "verify",
          data: _data,
          signature,
        },
        SmartWeave
      )
    ).signer
  }

  if (includes(type)(["secp256k1", "secp256k1-2"])) {
    if (/^0x/.test(signer)) signer = signer.toLowerCase()
    if (/^0x/.test(_caller)) _caller = _caller.toLowerCase()
  }

  let original_signer = signer
  let _signer = signer
  if (_signer !== _caller) {
    const link = state.auth.links[_signer]
    if (!isNil(link)) {
      let _address = is(Object, link) ? link.address : link
      let _expiry = is(Object, link) ? link.expiry || 0 : 0
      if (_expiry === 0 || SmartWeave.block.timestamp <= _expiry) {
        _signer = _address
      }
    }
  }
  if (_signer !== _caller) err(`signer[${_signer}] is not caller[${_caller}]`)
  if (use_nonce !== false)
    await fn.useNonce(nonce, original_signer, state, kvs, SmartWeave)
  return { signer: _signer, original_signer }
}

module.exports = {
  err,
  getField,
  mergeData,
  isEvolving,
  genId,
  isOwner,
  read,
  validateSchema,
  wrapResult,
  parse,
  auth,
}
