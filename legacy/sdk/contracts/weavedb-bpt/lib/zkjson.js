const { isNil, splitEvery, flatten } = require("ramda")
const ops = {
  $eq: 10,
  $ne: 11,
  $gt: 12,
  $gte: 13,
  $lt: 14,
  $lte: 15,
  $in: 16,
  $nin: 17,
  $contains: 18,
  $contains_any: 19,
  $contains_all: 20,
  $contains_none: 21,
}
const opMap = {}
for (let k in ops) opMap[ops[k]] = k

function encodePath(path) {
  const parts = []
  let str = ""
  let num = 0
  for (const s of path) {
    if (num == 2 && !(s == "." || s == "[")) throw Error()
    if (s == ".") {
      if (num == 2) {
        num = 0
      } else {
        parts.push(str)
        str = ""
      }
    } else if (s == "[") {
      if (num != 2) {
        if (str != "" || parts.length > 0) parts.push(str)
        str = ""
      }
      num = 1
    } else if (s == "]") {
      if (num != 1) throw Error()
      num = 2
      if (str == "" || Number.isNaN(+str)) throw Error()
      parts.push(+str)
      str = ""
    } else {
      str += s
    }
  }
  if (str != "") parts.push(str)
  if (parts.length == 0) parts.push("")
  let encoded = [parts.length]
  for (const p of parts) {
    if (typeof p == "number") {
      encoded = encoded.concat([0, 0, p])
    } else {
      let plen = [p.length]
      if (p.length == 0) plen.push(1)
      encoded = encoded.concat([
        ...plen,
        ...p.split("").map(c => c.charCodeAt(0)),
      ])
    }
  }
  return encoded
}

function flattenPath(path) {
  let p = [path.length]
  for (const v of path) {
    p = p.concat(v)
  }
  return p
}

function _encode(v, path = []) {
  let vals = []
  if (typeof v == "number") {
    vals.push([path, encodeVal(v)])
  } else if (typeof v == "boolean") {
    vals.push([path, encodeVal(v)])
  } else if (v == null) {
    vals.push([path, encodeVal(v)])
  } else if (typeof v == "string") {
    vals.push([path, encodeVal(v)])
  } else if (Array.isArray(v)) {
    let i = 0
    for (const v2 of v) {
      for (const v3 of _encode(v2, [...path, [0, 0, i]])) vals.push(v3)
      i++
    }
  } else if (typeof v == "object") {
    for (const k in v) {
      const key = k.split("").map(c => c.charCodeAt(0))
      for (let v4 of _encode(v[k], [
        ...path,
        [key.length, ...(key.length == 0 ? [1] : key)],
      ])) {
        vals.push(v4)
      }
    }
  }
  return vals
}

function encode(json) {
  let flattened = _encode(json)
  flattened.sort((a, b) => {
    const isUndefined = v => typeof v == "undefined"
    const max = Math.max(a[0].length, b[0].length)
    if (max > 0) {
      for (let i = 0; i < max; i++) {
        const exA = !isUndefined(a[0][i])
        const exB = !isUndefined(b[0][i])
        if (exA && !exB) return 1
        if (!exA && exB) return -1
        const max2 = Math.max(a[0][i].length, b[0][i].length)
        if (max2 > 0) {
          for (let i2 = 0; i2 < max2; i2++) {
            const vA = a[0][i][i2]
            const vB = b[0][i][i2]
            const exA = !isUndefined(vA)
            const exB = !isUndefined(vB)
            if (exA && !exB) return 1
            if (!exA && exB) return -1
            if (vA > vB) return 1
            if (vA < vB) return -1
          }
        }
      }
    }
    return 0
  })

  return flattened.reduce(
    (arr, v) => arr.concat([...flattenPath(v[0]), ...v[1]]),
    [],
  )
}

function _decode(arr) {
  let vals = []
  while (arr.length > 0) {
    let plen = arr.shift()
    let keys = []
    let val = null
    while (plen > 0) {
      const plen2 = arr.shift()
      if (plen2 == 0) {
        const plen3 = arr.shift()
        if (plen3 == 1) {
          keys.push([plen2, plen3])
        } else {
          keys.push([plen2, plen3, arr.shift()])
        }
      } else if (plen2 != 0) {
        const plen3 = plen2
        const key = []
        for (let i2 = 0; i2 < plen3; i2++) key.push(arr.shift())
        keys.push([plen2, ...key])
      }
      plen--
    }
    const type = arr.shift()
    val = [type]
    if (type == 2) {
      val.push(arr.shift())
      val.push(arr.shift())
      val.push(arr.shift())
    } else if (type == 1) {
      val.push(arr.shift())
    } else if (type == 3) {
      const strlen = arr.shift()
      val.push(strlen)
      for (let i2 = 0; i2 < strlen; i2++) val.push(arr.shift())
    }
    vals.push([keys, val])
  }
  return vals
}

function encodeVal(v) {
  let vals = []
  if (typeof v == "number" || typeof v == "bigint") {
    const int = Number.isInteger(v)
    let moved = 0
    let num = v
    while (num % 1 != 0) {
      num *= 10
      moved += 1
    }
    vals = v < 0 ? [2, 0, moved, -num] : [2, 1, moved, num]
  } else if (typeof v == "boolean") {
    vals = [1, v ? 1 : 0]
  } else if (v == null) {
    vals = [0]
  } else if (typeof v == "string") {
    vals = [3, v.length, ...v.split("").map(c => c.charCodeAt(0))]
  } else {
    vals = [4, ...encode(v)]
  }
  return vals
}

function toSignal(arr) {
  const _arr = flatten(
    arr.map(n => {
      let str = splitEvery(8, n.toString().split(""))
      let i = 0
      str = str.map(s => {
        const len = i == str.length - 1 ? s.length : 9
        i++
        return len.toString() + s.join("")
      })
      return str
    }),
  )
  let _arr2 = []
  let one = 0
  let i = 0
  let start = null
  for (let v of _arr) {
    _arr2.push(v)
    if (v.length - 1 == 1) {
      if (start == null) start = i
      one += v.length - 1
      if (one == 9) {
        _arr2[start] = `0${one}${_arr2[start][1]}`
        for (let i2 = start + 1; i2 <= i; i2++) _arr2[i2] = `${_arr2[i2][1]}`
        one = 0
        start = null
      }
    } else {
      if (one > 2) {
        _arr2[start] = `0${one}${_arr2[start][1]}`
        for (let i2 = start + 1; i2 < i; i2++) _arr2[i2] = `${_arr2[i2][1]}`
      }
      one = 0
      start = null
    }
    i++
  }
  if (one > 2) {
    _arr2[start] = `0${one}${_arr2[start][1]}`
    for (let i2 = start + 1; i2 <= i - 1; i2++) _arr2[i2] = `${_arr2[i2][1]}`
  }
  let _arr3 = []
  let chain = null
  let cur = 0
  let num = ""
  for (let v of _arr2) {
    if (chain == null && +v[0] == 0) {
      chain = +v[1]
      cur = 1
      num = v
    } else if (chain != null) {
      num += v
      cur++
      if (chain == cur) {
        _arr3.push(num)
        chain = null
        num = ""
        cur = 0
      }
    } else {
      _arr3.push(v)
    }
  }
  if (chain != null) _arr3.push(num)
  let arrs2 = []
  let len2 = 0
  let str2 = ""
  for (let v of _arr3) {
    if (len2 + v.length > 75) {
      arrs2.push("1" + str2)
      if (+v[0] == 0) {
        let len3 = 75 - len2
        if (len3 == 2 || len3 == 3) {
          arrs2[arrs2.length - 1] += `1${v[2]}`
          let new_len = +v[1] - 1
          if (new_len == 2) {
            v = `1${v[3]}1${v[4]}`
          } else {
            v = `0${new_len}${v.slice(3)}`
          }
        } else if (len3 > 3) {
          let new_len = +v[1] - 2
          let old_len = 2
          if (len3 == 4) {
            arrs2[arrs2.length - 1] += `1${v[2]}1${v[3]}`
          } else {
            old_len = len3 - 2
            new_len = +v[1] - old_len
            arrs2[arrs2.length - 1] += `0${old_len}${v.slice(2, 2 + old_len)}`
          }
          if (new_len == 1) {
            v = `1${v[old_len + 2]}`
          } else if (new_len == 2) {
            v = `1${v[old_len + 2]}1${v[old_len + 3]}`
          } else {
            v = `0${new_len}${v.slice(old_len + 2)}`
          }
        }
      }
      len2 = 0
      str2 = ""
    }
    len2 += v.length
    str2 += v
  }
  if (str2 != "") arrs2.push("1" + str2)
  return arrs2
}

function encodeQuery(v) {
  if (!Array.isArray(v)) throw Error("query must be an array")
  const op = v[0]
  if (isNil(ops[op])) throw Error(`query not supported: ${op}`)
  return [ops[op], ...encodeVal(v[1])]
}

module.exports = {
  encode,
  encodePath,
  encodeVal,
  _encode,
  flattenPath,
  toSignal,
  encodeQuery,
}
