import _fpjson from "fpjson-lang"
const fpjson = _fpjson.default || _fpjson
import {
  clone,
  complement,
  concat,
  without,
  split,
  uniq,
  path,
  map,
  isNil,
  keys,
  difference,
  intersection,
  is,
  tail,
} from "ramda"

const replace$ = arrs => {
  if (typeof arrs === "string") {
    return arrs.slice(0, 2) === "l$"
      ? ["toLower", { var: arrs.slice(2) }]
      : arrs.slice(0, 2) === "u$"
        ? ["toUpper", { var: arrs.slice(2) }]
        : arrs.slice(0, 2) === "o$"
          ? [["complement", ["isNil"]], { var: arrs.slice(2) }]
          : arrs.slice(0, 2) === "x$"
            ? ["isNil", { var: arrs.slice(2) }]
            : arrs.slice(0, 2) === "!$"
              ? ["not", { var: arrs.slice(2) }]
              : arrs.slice(0, 2) === "$$"
                ? tail(arrs)
                : arrs[0] === "$"
                  ? { var: tail(arrs) }
                  : arrs
  } else if (is(Array, arrs)) {
    if (arrs[0] === "toBatchAll") {
      return [
        [
          "pipe",
          ["var", "batch"],
          ["concat", ["__"], arrs[1]],
          ["let", "batch"],
        ],
      ]
    } else if (arrs[0] === "toBatch") {
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

const setElm = (k, d, rule_data) => {
  let obj = rule_data
  let elm_path = k.split("#")[0].split(".")
  for (const [i, field] of elm_path.entries()) {
    if (i === elm_path.length - 1) {
      if (is(Object)(d) && d.__op__ === "union") {
        if (complement(is)(Array, d.arr)) throw Error("field is not array")
        if (complement(is)(Array, obj[field])) obj[field] = []
        obj[field] = concat(obj[field], d.arr)
      } else if (is(Object)(d) && d.__op__ === "without") {
        if (complement(is)(Array, d.arr)) throw Error("field is not array")
        if (complement(is)(Array, obj[field])) obj[field] = []
        obj[field] = without(d.arr, obj[field])
      } else if (is(Object)(d) && d.__op__ === "inc") {
        if (isNaN(d.n)) throw Error("field is not number")
        if (isNil(obj[field])) obj[field] = 0
        obj[field] += d.n
      } else if (is(Object)(d) && d.__op__ === "del") {
        delete obj[field]
      } else if (is(Object)(d) && d.__op__ === "ts") {
        obj[field] = rule_data.ts
      } else if (is(Object)(d) && d.__op__ === "from") {
        obj[field] = rule_data.from
      } else {
        obj[field] = d
      }
      break
    } else if (isNil(obj[field])) obj[field] = {}
    obj = obj[field]
  }
  return obj
}

const parse = (query, vars) => {
  if (is(Array, query)) {
    query = map(v => (is(Object, v) ? parse(v, vars) : v))(query)
  } else if (is(Object, query)) {
    if (is(String, query.var)) {
      return path(query.var.split("."))(vars)
    } else {
      query = map(v => parse(v, vars))(query)
    }
  }
  return query
}

function fpj(arr = [], obj = {}, fn = {}) {
  const exec = v => fpjson(replace$(clone(v)), obj)
  const cmd = (arr, ctx = {}) => {
    let val = null
    let isBreak = false
    if (!is(Array, arr)) {
      val = exec(arr)
    } else if (/^=\$/.test(arr[0])) {
      ;[val, isBreak] = cmd(arr[1])
      if (!isBreak) setElm(arr[0].replace(/^=\$/, ""), val, obj)
    } else if (/^.+\(\)$/.test(arr[0])) {
      if (!isNil(fn[arr[0].slice(0, -2)])) {
        ;[val, isBreak] = fn[arr[0].slice(0, -2)](
          parse(replace$(arr[1]), obj),
          obj,
          setElm,
        )
      } else {
        throw Error(`unknown function ${arr[0]}`)
      }
    } else if (arr[0] === "break") {
      isBreak = true
    } else if (arr[0] === "[]") {
      for (let v of tail(arr)) cmd(v)
    } else if (arr[0] === "if") {
      if (exec(arr[1])) {
        if (typeof arr[2] === "undefined") {
          throw Error("wrong fpjson")
        } else {
          ;[val, isBreak] = cmd(arr[2])
        }
      } else {
        ;[val, isBreak] = cmd(arr.slice(3), { if: true })
      }
    } else if (arr[0] === "else") {
      if (ctx.if) {
        ;[val, isBreak] = cmd(arr[1])
      } else {
        throw Error("wrong fpjson")
      }
    } else if (arr[0] === "elif") {
      if (ctx.if) {
        if (exec(arr[1])) {
          ;[val, isBreak] = cmd(arr[2])
        } else {
          ;[val, isBreak] = cmd(arr.slice(3), { if: true })
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
    const [val, isBreak] = cmd(v)
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
  mod: (v, obj, set) => {
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
      obj.allow = false
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
      obj.allow = false
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
      obj.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  denyifall: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(["all", ["equals", true], v], obj)) {
      obj.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  denyifany: (v, obj, set) => {
    let val = null
    let isBreak = false

    if (fpjson(["any", ["equals", true], v], obj)) {
      obj.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  allowifall: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(["all", ["equals", true], v], obj)) {
      obj.allow = true
      isBreak = true
    }
    return [val, isBreak]
  },
  allow: (v, obj, set) => {
    let val = null
    let isBreak = false
    obj.allow = true
    isBreak = true
    return [val, isBreak]
  },
  deny: (v, obj, set) => {
    let val = null
    let isBreak = false
    obj.allow = false
    isBreak = true
    return [val, isBreak]
  },
  allowifany: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(["any", ["equals", true], v], obj)) {
      obj.allow = true
      isBreak = true
    }
    return [val, isBreak]
  },
  denyif: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(v, obj)) {
      obj.allow = false
      isBreak = true
    }
    return [val, isBreak]
  },
  allowif: (v, obj, set) => {
    let val = null
    let isBreak = false
    if (fpjson(v, obj)) {
      obj.allow = true
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

export { fpj, ac_funcs, replace$ }
