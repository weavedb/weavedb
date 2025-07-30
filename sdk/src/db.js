import { HB } from "wao"
import { toAddr } from "wao/test"
import { dir_schema } from "./schemas.js"
import { dirs_set } from "./rules.js"
const init_query = { schema: dir_schema, auth: [dirs_set] }

export default class DB {
  constructor({
    url = `http://localhost:6364`,
    jwk,
    id,
    hb = `http://localhost:10000`,
  }) {
    this.addr = toAddr(jwk.n)
    this.id = id
    this.url = url
    this.hb = new HB({ url: hb, jwk })
    this.db = new HB({ url, jwk })
    this._nonce = 0
    this.count = 0
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
  async mkdir({ name, schema, auth }) {
    console.log("mkdir....", schema)
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
    this._nonce = (await this.get("__accounts__", this.addr))?.nonce ?? 0
  }
  async get(...args) {
    return await this._get("get", ...args)
  }
  async cget(...args) {
    return await this._get("cget", ...args)
  }

  async _get(...args) {
    const res = await this.db.get({
      path: "/~weavedb@1.0/get",
      id: this.id,
      query: JSON.stringify(args),
    })
    return JSON.parse(res.body).res
  }
}
