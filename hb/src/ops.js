import { validate } from "jsonschema"
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

const updateData = ({ db, q }) => {
  const [data, dir, doc] = q
  if (isNil(db[dir]?.[doc])) throw Error("data doesn't exist")
  q[0] = mergeLeft(data, db[dir][doc])
  return { db, q }
}

const upsertData = ({ db, q }) => {
  const [data, dir, doc] = q
  if (isNil(db[0][dir])) throw Error("dir doesn't exist")
  db[dir] ??= {}
  if (!isNil(db[dir]?.[doc])) {
    q[0] = mergeLeft(data, db[dir][doc])
  }
  return { db, q }
}

const validateSchema = ({ db, q }) => {
  let valid = false
  const [data, dir] = q
  const schema = db[0][dir].schema
  try {
    valid = validate(data, schema).valid
  } catch (e) {}
  if (!valid) throw Error("invalid schema")
}

const setData = ({ db, q }) => {
  const [data, dir, doc] = q
  if (isNil(db[0][dir])) throw Error("dir doesn't exist")
  db[dir] ??= {}
  db[dir][doc] = data
  return { db, q }
}

const delData = ({ db, q }) => {
  const [dir, doc] = q
  if (isNil(db[0][dir])) throw Error("dir doesn't exist")
  db[dir] ??= {}
  delete db[dir][doc]
  return { db, q }
}

const getDocID = ({ db, q }) => {
  const [, dir] = q
  if (isNil(db[0][dir])) throw Error("dir doesn't exist")
  const docs = db[dir] ?? {}
  let i = isNil(db[0][dir]?.autoid) ? 0 : db[0][dir].autoid + 1
  while (docs[tob64(i)]) i++
  q.push(tob64(i))
  db[0][dir] ??= {}
  db[0][dir].autoid = i
  return { db, q }
}

export { updateData, upsertData, validateSchema, setData, delData, getDocID }
