import { HB } from "wao"
import { toAddr } from "wao/test"
export default class WDB {
  constructor({ port, jwk, id }) {
    this.addr = toAddr(jwk.n)
    this.id = id
    this.port = port
    this.hb = new HB({ url: `http://localhost:${port}`, jwk })
    this._nonce = 0
    this.count = 0
  }
  async set(...args) {
    const res = await this.hb.send({
      path: "/~weavedb@1.0/set",
      nonce: ++this._nonce,
      id: this.id,
      query: JSON.stringify(args),
    })
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
      return json.success
    }
  }
  async nonce(...args) {
    this._nonce = (await this.get("__accounts__", this.addr))?.nonce ?? 0
  }
  async get(...args) {
    const res = await this.hb.send({
      method: "GET",
      path: "/~weavedb@1.0/get",
      id: this.id,
      query: JSON.stringify(args),
    })
    return JSON.parse(res.body).res
  }
}
