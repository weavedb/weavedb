import { HB } from "wao"
export default class WDB {
  constructor({ port, jwk, id }) {
    this.id = id
    this.port = port
    this.hb = new HB({ url: `http://localhost:${port}`, jwk })
    this.nonce = 0
  }
  async set(...args) {
    const res = await this.hb.send({
      path: "/~weavedb@1.0/set",
      nonce: ++this.nonce,
      id: this.id,
      query: JSON.stringify(args),
    })
    return JSON.parse(res.body).success
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
