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
import { relayInit } from "nostr-tools"
let relay
const connectNostr = async () => {
  console.log("connecting ws...")
  relay = relayInit("ws://localhost:4736")
  relay.on("connect", () => {
    console.log(`connected to ${relay.url}`)
  })
  relay.on("error", () => {
    console.log(`failed to connect to ${relay.url}`)
  })

  await relay.connect()
}
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
  const address = await window.nostr.getPublicKey()
  let identity = null
  let user = null
  if (!isNil(address)) {
    identity = { address }
    user = { address }
    let _user = (
      await db.get(
        "nostr_events",
        ["kind", "==", 0],
        ["pubkey", "==", address],
        ["created_at", "desc"],
        1
      )
    )?.[0]
    if (!isNil(_user)) {
      try {
        const profile = JSON.stringify(_user.content)
        if (!isNil(profile.name)) {
          user = { name: profile.name, address: address }
        }
      } catch (e) {}
    }
  }
  return { identity, user }
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
    post.type = "article"
    sign = await db.sign("add", post, "posts", {
      ...identity,
      jobID: "article",
    })
  } else {
    sign = await db.sign("update", post, "posts", editID, {
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
  image,
  cover,
  handle,
  intro,
  user: _user,
  hashes,
  mentions,
}) => {
  if (isNil(relay)) await connectNostr()
  const address = await window.nostr.getPublicKey()
  //const user = { name: handle, display_name: name, about: intro }
  const user = { name, about: intro }
  const ev = await window.nostr.signEvent({
    kind: 0,
    content: JSON.stringify(user),
    tags: [],
    created_at: Math.floor(Date.now() / 1000),
  })
  try {
    console.log(ev)
    await relay.publish(ev)
    const new_user = { name, handle, description: intro, address }
    await lf.setItem("user", { identity: { address }, user: new_user })
    return { user: new_user }
  } catch (e) {
    console.log(e)
    return { err: true }
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
  await db.set(like, "likes", `${tweet.id}:${user.address}`, identity)
  return { like }
}

export const repostPost = async ({ user, tweet }) => {
  const { identity } = await lf.getItem("user")
  const repost = { repost: tweet.id, type: "status" }
  const { doc } = await db.add(repost, "posts", identity)
  return { repost: doc }
}

export const followUser = async ({ user, puser }) => {
  const { identity } = await lf.getItem("user")
  const follow = {}
  const id = `${user.address}:${puser.address}`
  await db.set(follow, "follows", id, identity)
  return { follow: { id, data: follow } }
}

export const unfollowUser = async ({ user, puser }) => {
  const { identity } = await lf.getItem("user")
  const id = `${user.address}:${puser.address}`
  await db.delete("follows", id, identity)
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
  if (isNil(relay)) await connectNostr()
  const address = await window.nostr.getPublicKey()
  const ev = await window.nostr.signEvent({
    kind: 1,
    content: body,
    tags: [],
    created_at: Math.floor(Date.now() / 1000),
  })
  try {
    await relay.publish(ev)
    const new_post = {
      id: ev.id,
      body,
      owner: address,
      date: ev.created_at * 1000,
    }
    return { err: null, post: new_post }
  } catch (e) {
    console.log(e)
    return { err: true }
  }
}

export const deletePost = async ({ tweet }) => {
  const { identity } = await lf.getItem("user")
  await db.update({ date: db.del() }, "posts", tweet.id, identity)
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
