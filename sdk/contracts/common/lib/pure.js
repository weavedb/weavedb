const {
  split,
  uniq,
  path: _path,
  map,
  isNil,
  keys,
  difference,
  intersection,
  is,
  tail,
} = require("ramda")
let fpjson = require("fpjson-lang")
fpjson = fpjson.default || fpjson

const isValidName = str =>
  /^[^\/]+$/.test(str) &&
  !/^__.*__+$/.test(str) &&
  !/^\.{1,2}$/.test(str) &&
  Buffer.byteLength(str, "utf8") <= 1500

const clone = state => JSON.parse(JSON.stringify(state))

const replace$ = arrs => {
  if (typeof arrs === "string") {
    return arrs.slice(0, 2) === "l$"
      ? ["toLower", { var: arrs.slice(2) }]
      : arrs.slice(0, 2) === "u$"
      ? ["toUpser", { var: arrs.slice(2) }]
      : arrs.slice(0, 2) === "o$"
      ? [["complement", ["isNil"]], { var: arrs.slice(2) }]
      : arrs.slice(0, 2) === "x$"
      ? ["isNil", { var: arrs.slice(2) }]
      : arrs.slice(0, 2) === "!$"
      ? ["not", { var: arrs.slice(2) }]
      : arrs[0] === "$"
      ? { var: tail(arrs) }
      : arrs
  } else if (is(Array, arrs)) {
    if (arrs[0] === "toBatch()") {
      return [
        "pipe",
        ["var", "batch"],
        ["append", ["[]", ...arrs[1]]],
        ["let", "batch"],
      ]
    } else {
      for (const [i, v] of arrs.entries()) arrs[i] = replace$(v)
    }
  } else if (typeof arrs === "object") {
    for (let k in arrs) arrs[k] = replace$(arrs[k])
  }
  return arrs
}

function bigIntFromBytes(byteArr) {
  let hexString = ""
  for (const byte of byteArr) {
    hexString += byte.toString(16).padStart(2, "0")
  }
  return BigInt("0x" + hexString)
}

const replaceVars = _cond => {
  let cond = clone(_cond)
  for (const [i, v] of cond.entries()) {
    if (typeof v === "string" && v[0] === "$") {
      cond[i] = { var: v.replace(/^\$/, "") }
    }
  }
  return cond
}

const setElm = (k, val, rule_data) => {
  let elm = rule_data
  let elm_path = k.split("#")[0].split(".")
  for (const [i, v] of elm_path.entries()) {
    if (i === elm_path.length - 1) {
      if (is(Object, val) && val._op === "del") {
        delete elm[v]
      } else {
        elm[v] = val
      }
      break
    } else if (isNil(elm[v])) elm[v] = {}
    elm = elm[v]
  }
  return elm
}
const _parse = (query, vars) => {
  if (is(Array, query)) {
    query = map(v => (is(Object, v) ? _parse(v, vars) : v))(query)
  } else if (is(Object, query)) {
    if (is(String, query.var)) {
      return _path(query.var.split("."))(vars)
    } else {
      query = map(v => _parse(v, vars))(query)
    }
  }
  return query
}

async function fpj(arr = [], obj = {}, fn = {}) {
  const exec = v => fpjson(replace$(clone(v)), obj)
  const cmd = async (arr, ctx = {}) => {
    let val = null
    let isBreak = false
    if (!is(Array, arr)) {
      val = exec(arr)
    } else if (/^=\$/.test(arr[0])) {
      ;[val, isBreak] = await cmd(arr[1])
      if (!isBreak) setElm(arr[0].replace(/^=\$/, ""), val, obj)
    } else if (/^.+\(\)$/.test(arr[0])) {
      if (!isNil(fn[arr[0].slice(0, -2)])) {
        ;[val, isBreak] = await fn[arr[0].slice(0, -2)](
          _parse(replace$(arr[1]), obj),
          obj,
          setElm
        )
      } else {
        throw Error(`unknow function ${arr[0]}`)
      }
    } else if (arr[0] === "break") {
      isBreak = true
    } else if (arr[0] === "if") {
      if (exec(arr[1])) {
        if (typeof arr[2] === "undefined") {
          throw Error("wrong fpjson")
        } else {
          ;[val, isBreak] = await cmd(arr[2])
        }
      } else {
        ;[val, isBreak] = await cmd(arr.slice(3), { if: true })
      }
    } else if (arr[0] === "else") {
      if (ctx.if) {
        ;[val, isBreak] = await cmd(arr[1])
      } else {
        throw Error("wrong fpjson")
      }
    } else if (arr[0] === "elif") {
      if (ctx.if) {
        if (exec(arr[1])) {
          ;[val, isBreak] = await cmd(arr[2])
        } else {
          ;[val, isBreak] = await cmd(arr.slice(3), { if: true })
        }
      } else {
        throw Error("wrong fpjson")
      }
    } else {
      val = exec(arr)
    }
    return [val, isBreak]
  }
  for (const v of arr) {
    const [val, isBreak] = await cmd(v)
    if (isBreak) break
  }
}

const ac_funcs = {
  split: (v, obj, set) => {
    let val = null
    let isBreak = false
    const elms = split(v[0], fpjson(v[1], obj))
    if (is(Array, v[2])) {
      for (const [i2, v2] of elms.entries()) {
        if (
          !isNil(v[2][i2]) &&
          typeof v[2][i2] === "string" &&
          /^=\$.+$/.test(v[2][i2])
        ) {
          set(v[2][i2].replace(/^=\$/, ""), v2, obj)
        }
      }
    }
    return [val, isBreak]
  },
  update: (v, obj, set) => {
    let val = null
    let isBreak = false
    for (const k3 in v) {
      set(`new.${k3}`, fpjson(v[k3], obj), obj)
    }
    return [val, isBreak]
  },
  fields: (v, obj, set) => {
    let val = null
    let isBreak = false
    let _keys = keys(obj.req)
    let fields = []
    let required = []
    for (let v2 of v) {
      const field = v2.replace(/^\*/, "")
      fields.push(field)
      if (/^\*/.test(v2)) required.push(field)
    }
    if (
      difference(_keys, fields).length > 0 ||
      difference(required, _keys).length > 0
    ) {
      obj.request.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  required_fields: (v, obj, set) => {
    let val = null
    let isBreak = false
    let _keys = keys(obj.req)
    let fields = v
    if (difference(fields, _keys).length > 0) {
      obj.request.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  disallowed_fields: (v, obj, set) => {
    let val = null
    let isBreak = false
    let _keys = keys(obj.req)
    let fields = v
    if (intersection(_keys, fields).length > 0) {
      obj.request.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  denyifall: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(["all", ["equals", true], v], obj)) {
      obj.request.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  denyifany: (v, obj, set) => {
    let val = null
    let isBreak = false

    if (fpjson(["any", ["equals", true], v], obj)) {
      obj.request.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  allowifall: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(["all", ["equals", true], v], obj)) {
      obj.request.allow = true
      isBreak = true
    }
    return [val, isBreak]
  },
  allow: (v, obj, set) => {
    let val = null
    let isBreak = false
    obj.request.allow = v
    isBreak = true
    return [val, isBreak]
  },
  allowifany: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(["any", ["equals", true], v], obj)) {
      obj.request.allow = true
      isBreak = true
    }
    return [val, isBreak]
  },
  denyif: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(v, obj)) {
      obj.request.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  allowif: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(v, obj)) {
      obj.request.allow = true
      isBreak = true
    }
    return [val, isBreak]
  },
  breakif: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(v, obj)) isBreak = true
    return [val, isBreak]
  },
}

module.exports = {
  isValidName,
  clone,
  bigIntFromBytes,
  replace$,
  fpj,
  ac_funcs,
  setElm,
}
