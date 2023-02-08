const md5 = require("md5")
const { includes, init, is, complement, splitWhen } = require("ramda")

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

const getKey = (contractTxId, func, query) =>
  `${contractTxId}.${md5(getPath(func, query))}.${func}.${md5(query)}`





  const getPath2 = (func, query) => {

    if (includes(func)(["add","set", "upsert", "update", "delete"])) {
      const _path = drop(1, JSON.parse(query)['query'])
      return (_path.length % 2 === 0 ? init(_path) : _path).join("/")
    } else if (
      includes(func)([
        "get",
        "cget",
        "getSchema",
        "getRules",
        "getIndexes",
      ])
    ) {
      const _path = splitWhen(complement(is)(String), JSON.parse(query))[0]
      const len = _path.length
      return (len % 2 === 0 ? init(_path) : _path).join("/")
    } else if (func === "listCollections") {
      const _path = splitWhen(complement(is)(String), JSON.parse(query))[0]
      const len = _path.length
      return len === 0 ? "__root__" : _path.join("/")
    }
    return "__admin__"
  }
  
  const getKey2 = (contractTxId, func, query) =>
    `${getKey2Pref(contractTxId, func, query)}.${func}.${md5(query)}`
  
  const getKey2Pref = (contractTxId, func, query) => {
    return `${serviceKeyPref}.${contractTxId}.${md5(getPath2(func, query))}`
  }
  
module.exports = { getKey, getPath, getKey2, getKey2Pref }





