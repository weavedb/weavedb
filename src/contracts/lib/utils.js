import { concat, without, isNil, slice, includes, is, complement } from "ramda"
import { validate } from "./validate"

export const getDoc = (data, path, _signer) => {
  const [col, id] = path
  data[col] ||= { __docs: {} }
  data[col].__docs[id] ||= { __data: null, subs: {} }
  if (!isNil(_signer) && isNil(data[col].__docs[id].setter)) {
    data[col].__docs[id].setter = _signer
  }
  return path.length >= 4
    ? getDoc(data[col].__docs[id].subs, slice(2, path.length, path), _signer)
    : data[col].__docs[id]
}
function bigIntFromBytes(byteArr) {
  let hexString = ""
  for (const byte of byteArr) {
    hexString += byte.toString(16).padStart(2, "0")
  }
  return BigInt("0x" + hexString)
}

async function getRandomIntNumber(max, action, uniqueValue = "") {
  const pseudoRandomData = SmartWeave.arweave.utils.stringToBuffer(
    SmartWeave.block.height +
      SmartWeave.block.timestamp +
      SmartWeave.transaction.id +
      action.caller +
      uniqueValue
  )
  const hashBytes = await SmartWeave.arweave.crypto.hash(pseudoRandomData)
  const randomBigInt = bigIntFromBytes(hashBytes)
  return Number(randomBigInt % BigInt(max))
}

const genId = async action => {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let autoId = ""
  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(
      (await getRandomIntNumber(CHARS.length, action, i)) - 1
    )
  }
  return autoId
}

export const parse = async (state, action, func) => {
  const { data } = state
  const { query } = action.input
  const _signer = validate(state, action, func)
  let new_data = null
  let path = null
  if (func === "delete") {
    path = query
  } else {
    ;[new_data, ...path] = query
    if (func === "add") {
      const id = await genId(action)
      if (isNil(state.ids[SmartWeave.transaction.id])) {
        state.ids[SmartWeave.transaction.id] = []
      }
      state.ids[SmartWeave.transaction.id].push(id)

      path.push(id)
    }
  }
  if (
    (isNil(new_data) && func !== "delete") ||
    path.length === 0 ||
    path.length % 2 !== 0
  ) {
    err()
  }
  const _data = getDoc(data, path, _signer, func)
  if (
    includes(func)(["update", "upsert", "delete"]) &&
    _data.setter !== _signer
  ) {
    err("caller is not data owner")
  }
  return { data, query, _signer, new_data, path, _data }
}

export const mergeData = (_data, new_data, overwrite = false) => {
  if (isNil(_data.__data) || overwrite) _data.__data = {}
  for (let k in new_data) {
    const d = new_data[k]

    if (is(Object)(d) && d.__op === "arrayUnion") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, _data.__data[k])) _data.__data[k] = []
      _data.__data[k] = concat(_data.__data[k], d.arr)
    } else if (is(Object)(d) && d.__op === "arrayRemove") {
      if (complement(is)(Array, d.arr)) err()
      if (complement(is)(Array, _data.__data[k])) _data.__data[k] = []
      _data.__data[k] = without(d.arr, _data.__data[k])
    } else if (is(Object)(d) && d.__op === "inc") {
      if (isNaN(d.n)) err()
      if (isNil(_data.__data[k])) _data.__data[k] = 0
      _data.__data[k] += d.n
    } else if (is(Object)(d) && d.__op === "del") {
      delete _data.__data[k]
    } else {
      _data.__data[k] = d
    }
  }
  return _data
}

export const err = (msg = `The wrong query`) => {
  throw new ContractError(msg)
}
