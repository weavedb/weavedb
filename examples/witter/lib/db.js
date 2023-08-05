import SDK from "weavedb-client"
let db = null
let ndb = null
import {
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

export const initDB = async () => {
  db ??= new SDK({
    rpc: process.env.NEXT_PUBLIC_RPC,
    contractTxId: "offchain",
  })
  return db
}

export const initNDB = async () => {
  ndb ??= new SDK({
    rpc: process.env.NEXT_PUBLIC_RPC,
    contractTxId: "notifications",
  })
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

export const postArticle = async ({
  description,
  title,
  address,
  user,
  body,
  cover,
  user: _user,
}) => {
  const { identity } = await lf.getItem("user")
  const id = nanoid()
  let post = {
    id,
    date: Date.now(),
    title,
    description,
    body: db.data("body"),
    owner: user.address,
    likes: 0,
    reposts: 0,
    comments: 0,
    reply_to: "",
    repost: "",
  }
  if (!isNil(cover)) post.cover = db.data("cover")
  const sign = await db.sign("set", post, "posts", id, {
    ...identity,
    jobID: "article",
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
    body: JSON.stringify({ body, query: sign, cover }),
  }).then(e => e.json())
  post.body = _body
  post.cover = _cover
  return { err: null, post }
}

export const updateProfile = async ({
  name,
  address,
  image,
  cover,
  handle,
  intro,
  user: _user,
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
  }
  let user = {}
  for (let k in new_fields) {
    const v = new_fields[k]
    if (!isNil(v) && (isNil(_user) || _user[k] !== v)) user[k] = v
  }
  if (isEmpty(user) && isNil(image)) return { err: "nothing to update" }
  user.address = address
  let op = "update"
  if (isNil(_user)) {
    op = "set"
    user.followers = 0
    user.following = 0
  }
  let tx, __image, __cover
  if (!isNil(image) || !isNil(cover)) {
    if (!isNil(image)) user.image = db.data("image")
    if (!isNil(cover)) user.cover = db.data("cover")
    const sign = await db.sign(op, user, "users", address, {
      ...identity,
      jobID: "profile",
    })
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
    tx = await db[op](user, "users", address, identity)
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
  const like = {
    date: Date.now(),
    user: user.address,
    aid: tweet.id,
  }
  await db.set(like, "likes", `${like.aid}:${like.user}`, identity)
  return { like }
}

export const repostPost = async ({ user, tweet }) => {
  const { identity } = await lf.getItem("user")
  const id = nanoid()
  const repost = {
    id: `${id}`,
    date: Date.now(),
    owner: user.address,
    repost: tweet.id,
    reply_to: "",
  }
  await db.set(repost, "posts", `${id}`, identity)
  return { repost }
}

export const followUser = async ({ user, puser }) => {
  const { identity } = await lf.getItem("user")
  const follow = { date: Date.now(), from: user.address, to: puser.address }
  const id = `${user.address}:${puser.address}`
  await db.set(follow, "follows", id, identity)
  return { follow: { id, data: follow } }
}

export const postStatus = async ({ body, user, title, replyTo, repost }) => {
  const { identity } = await lf.getItem("user")
  const id = nanoid()
  let post = {
    id,
    date: Date.now(),
    owner: user.address,
    likes: 0,
    reposts: 0,
    comments: 0,
    reply_to: repost !== "" ? "" : replyTo ?? "",
    repost,
    description: body,
  }
  if (isNil(replyTo)) post.title = title

  await db.set(post, "posts", post.id, identity)
  return { post }
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
