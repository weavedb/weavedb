import SDK from "weavedb-client"
let db = null
let ndb = null
import {
  pluck,
  dissoc,
  append,
  concat,
  compose,
  difference,
  __,
  keys,
  uniq,
  indexBy,
  prop,
  isEmpty,
  mergeLeft,
  isNil,
} from "ramda"

import lf from "localforage"
import { nanoid } from "nanoid"
const contractTxId = process.env.NEXT_PUBLIC_TXID ?? "offchain"
const rpc = process.env.NEXT_PUBLIC_RPC
export const initDB = async () => {
  db ??= new SDK({ rpc, contractTxId })
  return db
}

export const initNDB = async () => {
  ndb ??= new SDK({ rpc, contractTxId: `${contractTxId}#notifications` })
  return ndb
}

export const login = async () => {
  const { tx, identity } = await db.createTempAddress()
  let user = null
  if (tx.success) {
    user =
      (await db.get("users", ["address", "==", identity.signer]))[0] ?? null
    await lf.setItem("user", { identity, user })
    return { identity, user }
  } else {
    return { identity: null, user: null }
  }
}

export const inviteUser = async ({ addr }) => {
  const { identity } = await lf.getItem("user")
  const _addr = addr.toLowerCase()
  const _invite = {}
  const { doc, success } = await db.query(
    "set:invite_user",
    _invite,
    "users",
    _addr,
    identity
  )
  return { err: !success, doc }
}
export const postArticle = async ({
  description,
  title,
  address,
  user,
  body,
  cover,
  user: _user,
  editID,
}) => {
  const { identity } = await lf.getItem("user")
  const date = Date.now()
  let post = {
    title,
    description,
    body: db.data("body"),
  }
  if (!isNil(cover)) post.cover = db.data("cover")
  let sign = null
  if (isNil(editID)) {
    sign = await db.sign("query", "add:article", post, "posts", {
      ...identity,
      jobID: "article",
    })
  } else {
    sign = await db.sign("query", "update:edit", post, "posts", editID, {
      ...identity,
      jobID: "article",
    })
  }
  const __body = JSON.stringify({
    title,
    description,
    owner: user.address,
    date: post.date,
    type: "html",
    content: body,
  })
  let {
    tx: _tx,
    body: _body,
    cover: _cover,
  } = await fetch("/api/updateArticle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: __body, query: sign, cover }),
  }).then(e => e.json())
  let new_post = _tx.doc
  new_post.body = _body
  new_post.cover = _cover
  return { err: null, post: new_post }
}

export const updateProfile = async ({
  name,
  address,
  image,
  cover,
  handle,
  intro,
  user: _user,
  hashes,
  mentions,
}) => {
  const { identity } = await lf.getItem("user")
  if (isNil(_user)) {
    const ex = (
      await db.get("users", ["handle", "==", handle.toLowerCase()])
    )[0]
    if (!isNil(ex)) return { err: "handle" }
  }
  const new_fields = {
    name,
    image,
    handle: handle.toLowerCase(),
    description: intro,
    cover,
    hashes,
    mentions,
  }
  let user = {}
  for (let k in new_fields) {
    const v = new_fields[k]
    if (!isNil(v) && (isNil(_user) || _user[k] !== v)) user[k] = v
  }
  if (isEmpty(user) && isNil(image)) return { err: "nothing to update" }
  let tx, __image, __cover
  if (!isNil(image) || !isNil(cover)) {
    if (!isNil(image)) user.image = db.data("image")
    if (!isNil(cover)) user.cover = db.data("cover")
    const sign = await db.sign(
      "query",
      "update:profile",
      user,
      "users",
      address,
      {
        ...identity,
        jobID: "profile",
      }
    )
    let {
      tx: _tx,
      image: _image,
      cover: _cover,
    } = await fetch("/api/updateProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image, query: sign, cover }),
    }).then(e => e.json())
    tx = _tx
    if (!isNil(_image)) __image = _image
    if (!isNil(_cover)) __cover = _cover
  } else {
    tx = await db.query("update:profile", user, "users", address, identity)
  }
  if (tx.success) {
    if (!isNil(__image)) user.image = __image
    if (!isNil(__cover)) user.cover = __cover
    const new_user = mergeLeft(user, _user ?? {})
    await lf.setItem("user", { identity, user: new_user })
    return { err: null, user: new_user }
  } else {
    return { err: "unknown" }
  }
}

export const checkUser = async () => {
  return (await lf.getItem("user")) ?? { user: null, identity: null }
}

export const logout = async () => {
  await lf.removeItem("user")
}

export const likePost = async ({ user, tweet }) => {
  const { identity } = await lf.getItem("user")
  const like = {}
  await db.query(
    "set:like",
    like,
    "likes",
    `${tweet.id}:${user.address}`,
    identity
  )
  return { like }
}

export const repostPost = async ({ user, tweet }) => {
  const { identity } = await lf.getItem("user")
  const repost = { repost: tweet.id }
  const { doc } = await db.query("add:repost", repost, "posts", identity)
  return { repost: doc }
}

export const followUser = async ({ user, puser }) => {
  const { identity } = await lf.getItem("user")
  const follow = {}
  const id = `${user.address}:${puser.address}`
  await db.query("set:follow", follow, "follows", id, identity)
  return { follow: { id, data: follow } }
}

export const unfollowUser = async ({ user, puser }) => {
  const { identity } = await lf.getItem("user")
  const id = `${user.address}:${puser.address}`
  await db.query("delete:unfollow", "follows", id, identity)
  return { follow: { id, data: null } }
}

export const postStatus = async ({
  body,
  user,
  title,
  replyTo,
  repost,
  tweet,
  cover,
  hashes = [],
  mentions = [],
}) => {
  const { identity } = await lf.getItem("user")
  let post = {
    description: body,
    hashes: uniq(hashes),
    mentions: uniq(mentions),
  }
  let op = "add:status"
  if (repost !== "") {
    op = "add:quote"
    post.repost = repost
  } else if (!isNil(replyTo)) {
    op = "add:reply"
    post.reply_to = replyTo
  }

  let new_post = null
  if (!isNil(cover)) {
    post.cover = db.data("cover")
    const sign = await db.sign("query", op, post, "posts", {
      ...identity,
      jobID: "article",
    })
    let { tx: _tx, cover: _cover } = await fetch("/api/updateArticle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sign, cover }),
    }).then(e => e.json())
    new_post = _tx.doc
    new_post.cover = _cover
  } else {
    const _tx = await db.query(op, post, "posts", identity)
    new_post = _tx.doc
  }
  return { err: null, post: new_post }
}

export const deletePost = async ({ tweet }) => {
  const { identity } = await lf.getItem("user")
  await db.query("update:del_post", {}, "posts", tweet.id, identity)
  return { post: dissoc("date", tweet) }
}

let __tweets = {}
let __ids = []
export const getTweets = async ({ ids, tweets, setTweets }) => {
  if (ids.length === 0) return
  const db = await initDB()
  const new_ids = uniq(ids)
  const _ids = difference(new_ids, __ids)
  __ids = uniq(concat(__ids, new_ids))
  if (!isEmpty(_ids)) {
    const _tweets = indexBy(prop("id"))(
      await db.get("posts", ["id", "in", _ids])
    )
    __tweets = mergeLeft(_tweets, __tweets)
  }
  setTweets(__tweets)
  return __tweets
}

let __users = {}
let __user_ids = []
export const getUsers = async ({ ids, users, setUsers }) => {
  const db = await initDB()
  const new_ids = uniq(ids)
  const _ids = difference(new_ids, __user_ids)
  if (!isEmpty(_ids)) {
    const _users = indexBy(prop("address"))(
      await db.get("users", ["address", "in", _ids])
    )
    __users = mergeLeft(_users, __users)
  }
  setUsers(__users)
}

export const searchUsers = async (str, cb) => {
  const db = await initDB()
  const users = await db.get(
    "users",
    ["handle"],
    ["startAt", str.toLowerCase()],
    5
  )
  cb(users)
}
