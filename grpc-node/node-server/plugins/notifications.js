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

  async exec(v, arts = {}) {
    const input =
      v.data.input.function === "relay" ? v.data.input.query[1] : v.data.input
    const func = input.function
    const data = input.query[0]
    const col = input.query[1]
    if (func === "set" && col === "likes") {
      const from = data.user
      arts[data.aid] ??= await this.db.get("posts", data.aid)
      const article = arts[data.aid]
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
      const from = data.from
      const to = data.to
      const date = data.date
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
    if (func === "set" && col === "posts") {
      if (data.repost !== "") {
        arts[data.aid] ??= await this.db.get("posts", data.repost)
        const article = arts[data.aid]
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
        arts[data.reply_to] ??= await this.db.get("posts", data.reply_to)
        const article = arts[data.reply_to]
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
