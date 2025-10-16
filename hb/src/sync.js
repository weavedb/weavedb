import { open } from "lmdb"
import { sortBy, prop, isEmpty, keys } from "ramda"
import { getMsgs } from "./server-utils.js"

export default class Sync {
  constructor({
    autosync,
    pid,
    dbpath,
    vid,
    hb = "http://localhost:10001",
    limit = 20,
    onslot,
  }) {
    this.autosync = autosync
    this.limit = limit
    this.deltas = {}
    this.pid = pid
    this.dbpath = dbpath
    this.hb = hb
    this.vid = vid
    this.io = open({ path: this.dbpath })
    this.isInit = false
    this.onslot = onslot
  }
  async init() {
    this.slot = this.io.get("__slot__") ?? -1
    this.isInit = true
    this.get()
    return this
  }
  async get() {
    if (!this.isInit) return console.log("not initialized yet...")
    if (this.ongoing) return void (this.next = true)
    this.ongoing = true
    try {
      let from = 0
      from = this.slot + 1
      let from2 = from
      let to = from + (this.limit - 1)
      let res = await getMsgs({ pid: this.pid, hb: this.hb, from, to })
      /*console.log(
        `[${this.pid}:${this.vid}]  ${from} - ${to} (${keys(res?.assignments ?? {}).length})`,
      )*/
      while (!isEmpty(res.assignments)) {
        for (let k in res.assignments ?? {}) {
          const m = res.assignments[k]
          if (this.slot + 1 === m.slot) this.slot = m.slot
          await this.io.put(`__msg__/${m.slot}`, m)
          if (typeof this.onslot === "function") await this.onslot(m)
          from2++
        }
        await this.io.put("__slot__", this.slot)
        if (from2 - from >= this.limit) {
          from = from2
          to = from + this.limit
          res = await getMsgs({ pid: this.pid, hb: this.hb, from, to })
        } else break
      }
    } catch (e) {
      console.log(e)
    }
    this.ongoing = false
    if (this.autosync) {
      if (this.next !== true && this.stop) {
        this.stop = false
        delete this.autosync
        if (typeof this.cb === "function") this.cb()
      } else setTimeout(() => this.get(), this.next ? 0 : this.autosync)
    } else if (this.next) this.get()
    this.next = false
    return { slot: this.slot }
  }
  stopSync(cb) {
    this.stop = true
    if (cb) this.cb = cb
    else return new Promise(res => (this.cb = res))
  }
  startSync(to) {
    this.autosync = to
    this.get()
  }
}
