const { open } = require("lmdb")
const DB = require("weavedb-offchain")
const path = require("path")
const md5 = require("md5")
const { isNil, last } = require("ramda")

class Notifications {
  constructor({ dir, owner, db, txid }) {
    this.txid = txid
    this.db = db
    this.dir = dir
    this.kvs = {}
    this.pdb = new DB({
      type: 3,
      noauth: true,
      cache: {
        initialize: async obj => {
          obj.lmdb_plg_notifications = open({
            path: path.resolve(this.dir, "plugins", `notifications`),
          })
          let saved_state = await obj.lmdb_plg_notifications.get("state")
          if (!isNil(saved_state)) obj.state = saved_state
        },
        onWrite: async (tx, obj, param) => {
          let prs = [obj.lmdb_plg_notifications.put("state", tx.state)]
          for (const k in tx.result.kvs) {
            this.kvs[k] = tx.result.kvs[k]
            prs.push(obj.lmdb_plg_notifications.put(k, tx.result.kvs[k]))
          }
          Promise.all(prs).then(() => {})
        },
        get: async (key, obj) => {
          let val = this.kvs[key]
          if (typeof val === "undefined")
            val = await obj.lmdb_plg_notifications.get(key)
          return val
        },
      },
      state: { owner, secure: false },
    })
  }

  async exec(v, cache = {}) {
    cache.arts ??= {}
    cache.users ??= {}
    const input =
      v.data.input.function === "relay" ? v.data.input.query[1] : v.data.input
    const func = input.function
    const data = v.data.doc
    const col = input.query[1]
    if (func === "set" && col === "likes") {
      const from = data.user
      cache.arts[data.aid] ??= await this.db.get("posts", data.aid)
      const article = cache.arts[data.aid]
      const to = article.owner
      if (from === to) return
      const date = data.date
      const id = md5(`like:${from}:${to}:${article.id}:${date}`)
      await this.pdb.set(
        {
          wid: v.data.id,
          type: "like",
          id,
          from,
          to,
          date,
          aid: article.id,
          viewed: from === to,
        },
        "notifications",
        id
      )
      console.log(
        `<${this.txid}> (${v.id}) [${to.slice(0, 5)}] ${
          article.id
        } liked by ${from.slice(0, 5)} at ${date}`
      )
    }
    if (func === "set" && col === "follows") {
      const [from, to] = v.data.input.query[2].split(":")
      const date = v.data.tx_ts
      const id = md5(`follow:${from}:${to}:${date}`)
      await this.pdb.set(
        {
          wid: v.data.id,
          type: "follow",
          id,
          from,
          to,
          date,
          viewed: from === to,
        },
        "notifications",
        id
      )
      console.log(
        `<${this.txid}> (${v.id}) [${to.slice(0, 5)}] followed by ${from.slice(
          0,
          5
        )} at ${date}`
      )
    }
    if (func === "add" && col === "posts") {
      for (let _to of data.mentions || []) {
        const article = data
        cache.users[_to] ??= (
          await this.db.get("users", ["handle", "==", _to])
        )[0]
        const to = cache.users[_to]?.address
        const from = data.owner
        if (isNil(to) || from === to) return
        const date = data.date
        const id = md5(`mention:${from}:${to}:${article.id}:${date}`)
        await this.pdb.set(
          {
            wid: v.data.id,
            type: "mention",
            id,
            from,
            to,
            date,
            aid: article.id,
            viewed: from === to,
          },
          "notifications",
          id
        )
        console.log(
          `<${this.txid}> (${v.id}) [${to.slice(
            0,
            5
          )}:${_to}] mentioned by ${from.slice(0, 5)} at ${date}`
        )
      }
      if (data.repost !== "") {
        cache.arts[data.aid] ??= await this.db.get("posts", data.repost)
        const article = cache.arts[data.aid]
        const from = data.owner
        const to = article.owner
        if (from === to) return
        const date = data.date
        const id = md5(`repost:${from}:${to}:${article.id}:${data.id}:${date}`)
        await this.pdb.set(
          {
            wid: v.data.id,
            type: isNil(data.description) ? "repost" : "quote",
            id,
            from,
            to,
            date,
            aid: article.id,
            rid: data.id,
            viewed: from === to,
          },
          "notifications",
          id
        )
        console.log(
          `<${this.txid}> (${v.id}) [${to.slice(0, 5)}] ${
            isNil(data.description) ? "reposted" : "quoted"
          } by ${from.slice(0, 5)} at ${date}`
        )
      } else if (data.reply_to !== "") {
        cache.arts[data.reply_to] ??= await this.db.get("posts", data.reply_to)
        const article = cache.arts[data.reply_to]
        const from = data.owner
        const to = article.owner
        if (from === to) return
        const date = data.date
        const id = md5(`reply:${from}:${to}:${article.id}:${data.id}:${date}`)
        await this.pdb.set(
          {
            wid: v.data.id,
            type: "reply",
            id,
            from,
            to,
            date,
            aid: article.id,
            rid: data.id,
            viewed: from === to,
          },
          "notifications",
          id
        )
        console.log(
          `<${this.txid}> (${v.id}) [${to.slice(0, 5)}] replied by ${from.slice(
            0,
            5
          )} at ${date}`
        )
      }
    }
    await this.pdb.set({ last_wal: v.id }, "conf", "notifications")
  }
}

module.exports = Notifications
