const identicon = require("identicon.js")
import { nanoid } from "nanoid"
import lf from "localforage"
import { ethers } from "ethers"
import {
  mergeRight,
  o,
  assoc,
  reject,
  prepend,
  is,
  includes,
  difference,
  keys,
  compose,
  map,
  clone,
  indexBy,
  prop,
  pluck,
  mergeLeft,
  isNil,
  concat,
  last,
  path,
} from "ramda"

let db
const contractTxId = "exm"
import SDK from "weavedb-exm-sdk-web"

export const setupWeaveDB = async ({ set, val: { network } }) => {
  db = new SDK({
    endpoint: "/api/exm",
    functionId: process.env.NEXT_PUBLIC_FUNCTION_ID,
  })
  set(true, "initWDB")
  return db
}

export const signIn = async ({ conf, set, val: {} }) => {
  const wallet = window.arweaveWallet
  await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
  const addr = await wallet.getActiveAddress()
  const ex_identity = await lf.getItem(`temp_address:${contractTxId}:${addr}`)
  let identity = ex_identity
  let tx
  if (isNil(identity)) {
    identity = { publicKey: await wallet.getActivePublicKey(), address: addr }
    tx = {}
  } else {
    await lf.setItem("temp_address:current", addr)
    set(addr, "temp_current")
    await lf.setItem("temp_wallet:current", "arweave")
    set("arweave", "temp_wallet")
    return
  }
  if (!isNil(tx) && isNil(tx.err)) {
    await lf.setItem("temp_address:current", addr)
    await lf.setItem(`temp_address:${contractTxId}:${addr}`, identity)
    await lf.setItem("temp_wallet:current", "arweave")
    set(addr, "temp_current")
    set("arweave", "temp_wallet")
  }
}

export const checkTempAddress = async function ({ set, val: {} }) {
  const current = await lf.getItem(`temp_address:current`)
  if (!isNil(current)) {
    const identity = await lf.getItem(`temp_address:${contractTxId}:${current}`)
    if (!isNil(identity)) {
      set(current, "temp_current")
      set(await lf.getItem(`temp_wallet:current`), "temp_wallet")
    }
  }
}

export const signOut = async ({ set }) => {
  await lf.removeItem("temp_address:current")
  await lf.removeItem("temp_wallet:current")
  set(null, "temp_current")
  set(null, "temp_wallet")
}

export const getUserMap = async ({ set, get, val: { uids } }) => {
  let user_map = get("user_map")
  const _uids = o(difference(uids), keys)(user_map)
  if (_uids.length > 0) {
    set(
      compose(
        mergeRight(user_map),
        map(addImage),
        indexBy(prop("address"))
      )(await db.get("users", ["address", "in", _uids])),
      "user_map"
    )
  }
}

const addImage = user =>
  assoc(
    "image",
    `data:image/png;base64,${new identicon(user.address, 300).toString()}`
  )(user)

export const getPosts = async ({ set, get, fn, refs, val: { next, user } }) => {
  const limit = 10
  let args = ["wall"]
  args.push(["date", "desc"])
  if (!isNil(user)) args.push(["user", "=", user.address])
  if (next) args.push(["startAfter", refs.next])
  args.push(limit)
  const _posts = await db.cget(...args)
  const posts = pluck("data")(_posts)
  set(next ? concat(get("posts"), posts) : posts, "posts")
  fn(getUserMap)({ uids: pluck("user")(posts) })
  refs.next = last(_posts)
  set(posts.length >= limit, "next")
}

export const checkUser = async ({ set, get, val: { uid } }) => {
  let address = uid
  if (/^0x/.test(address)) address = address.toLowerCase()
  let user = await db.get("users", address)
  set(isNil(user) ? null : addImage(user), "user")
  if (!isNil(user)) {
    set(assoc(user.address, addImage(user), get("user_map")), "user_map")
  }
}

export const getUser = async ({ set, get, val: { uid } }) => {
  let address = uid
  if (/^0x/.test(address)) address = address.toLowerCase()
  const user = await db.get("users", address)
  if (!isNil(user)) {
    set(assoc(user.address, addImage(user), get("user_map")), "user_map")
  }
  return user
}

export const setProfile = async ({ ref, set, get, val: { username, uid } }) => {
  let address = uid
  if (/^0x/.test(address)) address = address.toLowerCase()
  const new_user = { name: username, address }
  const q = [new_user, "users", address]
  try {
    const opt = await getOpt(get)
    if (isNil(opt)) return false
    const res = await db.upsert(...q, opt)
    if (!isNil(res.err)) {
      return `Error: ${res.err.errorMessage}`
    } else {
      set(addImage(new_user), "user")
      set(assoc(address, addImage(new_user), get("user_map")), "user_map")
      return new_user
    }
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}

const getOpt = async get => {
  const current = get("temp_current")
  const type = get("temp_wallet")
  const pubKey = await lf.getItem(`temp_pubKey:current`)
  const identity = isNil(current)
    ? null
    : await lf.getItem(`temp_address:${contractTxId}:${current}`)
  const wallet = window.arweaveWallet
  await wallet.connect(["SIGNATURE", "ACCESS_PUBLIC_KEY", "ACCESS_ADDRESS"])
  return type === "arweave" ? { ar: wallet } : null
}

export const postMessage = async ({ set, get, val: { message, uid } }) => {
  let address = uid
  if (/^0x/.test(address)) address = address.toLowerCase()
  const post_id = nanoid()
  let msg = {
    text: message,
    user: address,
    date: Math.round(Date.now() / 1000),
    id: post_id,
  }
  const id = `${address}:${post_id}`
  const q = [msg, "wall", id]
  try {
    const opt = await getOpt(get)
    if (isNil(opt)) return false
    const res = await db.set(...q, opt)
    if (!isNil(res.err)) {
      console.log(`Error: ${res.err.errorMessage}`)
      return false
    } else {
      msg.date = Math.round(Date.now() / 1000)
      set(prepend(msg, get("posts")), "posts")
      return true
    }
  } catch (e) {
    console.log(e)
    return false
  }
}

export const deleteMessage = async ({ set, get, val: { message } }) => {
  const id = `${message.user}:${message.id}`
  const q = ["wall", id]
  try {
    const opt = await getOpt(get)
    if (isNil(opt)) return
    const res = await db.delete(...q, opt)
    if (!isNil(res.err)) {
      return `Error: ${res.err.errorMessage}`
    } else {
      set(
        reject(v => v.id === message.id, get("posts")),
        "posts"
      )
      return JSON.stringify(res)
    }
  } catch (e) {
    console.log(e)
    return `Error: Something went wrong`
  }
}
