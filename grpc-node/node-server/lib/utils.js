const md5 = require("md5")
const { isNil, includes, init, is, complement, splitWhen } = require("ramda")

const getPath = (func, query) => {
  if (
    !includes(func)([
      "get",
      "cget",
      "getSchema",
      "getRules",
      "getIndexes",
      "listCollections",
    ])
  ) {
    return "__admin__"
  } else {
    const _path = splitWhen(complement(is)(String), JSON.parse(query))[0]
    const len = _path.length
    if (func === "listCollections") {
      return len === 0 ? "__root__" : _path.join("/")
    } else {
      return (len % 2 === 0 ? init(_path) : _path).join("/")
    }
  }
}

const getKey = (contractTxId, func, query, prefix) => {
  let key = [contractTxId, md5(getPath(func, query)), func, md5(query)]
  if (!isNil(prefix)) key.unshift(prefix)
  return key.join(".")
}

module.exports = { getKey, getPath }
