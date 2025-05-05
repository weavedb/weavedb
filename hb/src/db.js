import { of } from "./monade.js"
import { isNil, mergeLeft } from "ramda"

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

function tob64(n) {
  if (!Number.isInteger(n) || n < 0)
    throw new Error("Only non-negative integers allowed")
  if (n === 0) return BASE64_CHARS[0]
  let result = ""
  while (n > 0) {
    result = BASE64_CHARS[n % 64] + result
    n = Math.floor(n / 64)
  }
  return result
}

const updateData = ({ ctx, q }) => {
  const [data, dir, doc] = q
  if (!isNil(ctx.state[dir]?.[doc])) {
    ctx.state[dir][doc] = mergeLeft(data, ctx.state[dir][doc])
  }
  return { ctx, q }
}

const upsertData = ({ ctx, q }) => {
  const [data, dir, doc] = q
  ctx.state[dir] ??= {}
  if (!isNil(ctx.state[dir]?.[doc])) {
    ctx.state[dir][doc] = mergeLeft(data, ctx.state[dir][doc])
  } else ctx.state[dir][doc] = data

  return { ctx, q }
}

const setData = ({ ctx, q }) => {
  const [data, dir, doc] = q
  ctx.state[dir] ??= {}
  ctx.state[dir][doc] = data
  return { ctx, q }
}

const delData = ({ ctx, q }) => {
  const [dir, doc] = q
  ctx.state[dir] ??= {}
  delete ctx.state[dir][doc]
  return { ctx, q }
}

const getDocID = ({ ctx, q }) => {
  const [, dir] = q
  const docs = ctx.state[dir] ?? {}
  let i = isNil(ctx.state[0][dir]?.autoid) ? 0 : ctx.state[0][dir].autoid + 1
  while (docs[tob64(i)]) i++
  q.push(tob64(i))
  ctx.state[0][dir] ??= {}
  ctx.state[0][dir].autoid = i
  return { ctx, q }
}

const add = (ctx, q) => of({ ctx, q }).map(getDocID).map(setData)
const set = (ctx, q) => of({ ctx, q }).map(setData)
const del = (ctx, q) => of({ ctx, q }).map(delData)
const update = (ctx, q) => of({ ctx, q }).map(updateData)
const upsert = (ctx, q) => of({ ctx, q }).map(upsertData)

const db = ctx => {
  ctx ??= { env: {}, state: {} }
  return of(ctx, {
    to: {
      get:
        (...q) =>
        ctx => {
          const [dir, doc] = q
          return doc ? ctx.state[dir][doc] : ctx.state[dir]
        },
    },
    map: {
      init: msg => ctx => {
        ctx.state = [
          { 0: { name: "__dirs__" }, 1: { name: "__config__" } },
          { info: { id: msg.id, owner: msg.from } },
        ]
        return ctx
      },
      set:
        (...msg) =>
        ctx => {
          const [op, ...q] = msg
          switch (op) {
            case "add":
              add(ctx, q)
              break
            case "set":
              set(ctx, q)
              break
            case "update":
              update(ctx, q)
              break
            case "upsert":
              upsert(ctx, q)
              break

            case "del":
              del(ctx, q)
              break
          }
          return ctx
        },
    },
  })
}

export default db
