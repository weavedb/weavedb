import { HB } from "wao"
import { toAddr } from "wao/utils"
import { dir_schema } from "./schemas.js"
import { dirs_set } from "./rules.js"
import { includes, filter } from "ramda"
const init_query = { schema: dir_schema, auth: [dirs_set] }

export default class DB {
  constructor({
    url = `http://localhost:6364`,
    jwk,
    id,
    hb = `http://localhost:10001`,
  }) {
    if (!jwk && typeof window === "object") jwk = window.arweaveWallet
    this.jwk = jwk
    if (this.jwk && !this.isArConnect()) this.addr = toAddr(jwk.n)
    this.id = id
    this.url = url
    this.hb = new HB({ url: hb, jwk: this.jwk })
    this.db = new HB({ url, jwk: this.jwk })
    this._nonce = 0
    this.count = 0
  }
  isArConnect() {
    return this.jwk?.id || this.jwk?.walletName === "ArConnect"
  }
  async spawn({ query = init_query } = {}) {
    if (this.id) throw Error("db already exists")
    const { pid } = await this.hb.spawn({
      "db-type": "nosql",
      "device-stack": [
        "wdb-normalize@1.0",
        "wdb-verify@1.0",
        "wdb-parse@1.0",
        "wdb-auth@1.0",
        "wdb-write@1.0",
      ],
    })
    this.id = pid
    await this.set("init", query)
    return pid
  }
  async addIndex(index, dir) {
    const query = ["addIndex", index, dir]
    return await this.set(...query)
  }
  async mkdir({ name, schema, auth }) {
    const query = ["set:dir", { schema, auth }, "_", name]
    return await this.set(...query)
  }
  async set(...args) {
    const res = await this.db.post(
      {
        path: "/~weavedb@1.0/set",
        nonce: ++this._nonce,
        id: this.id,
        query: JSON.stringify(args),
      },
      { path: false },
    )
    const json = JSON.parse(res.body)
    if (
      !json.success &&
      /the wrong nonce/.test(json.error) &&
      this.count === 0
    ) {
      await this.nonce()
      this.count++
      return await this.set(...args)
    } else {
      this.count = 0
      return json
    }
  }
  async nonce(...args) {
    if (!this.addr && this.isArConnect()) {
      await this.jwk.connect([
        "ACCESS_ADDRESS",
        "ACCESS_PUBLIC_KEY",
        "SIGN_TRANSACTION",
      ])
      this.addr = await this.jwk.getActiveAddress()
    }
    this._nonce = (await this.get("__accounts__", this.addr))?.nonce ?? 0
  }
  async get(...args) {
    return await this._get("get", ...args)
  }
  async cget(...args) {
    return await this._get("cget", ...args)
  }
  async iter(...args) {
    const docs = await this._get("cget", ...args)
    return {
      docs,
      isNext: docs.length !== 0,
      next: async () => {
        if (docs.length === 0) return null
        const cur = docs[docs.length - 1]
        const args2 = filter(v => {
          if (Array.isArray(v) && includes(v[0])(["startAt", "startAfter"]))
            return false
          return true
        })(args)
        return await this.iter(...args2, ["startAfter", cur])
      },
    }
  }
  async _get(...args) {
    console.log("lets fuking go..............", this.id, args)
    const res = await this.db.get({
      path: "/~weavedb@1.0/get",
      id: this.id,
      query: JSON.stringify(args),
    })
    const json = JSON.parse(res.body)
    if (json.error) throw json.error
    return JSON.parse(res.body).res
  }
}
