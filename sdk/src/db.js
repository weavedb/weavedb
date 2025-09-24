import { HB } from "wao"
import { toAddr } from "wao/utils"
import { dir_schema } from "./schemas.js"
import { dirs_set } from "./rules.js"
import { includes, filter } from "ramda"
const init_query = { schema: dir_schema, auth: [dirs_set] }
const wait = ms => new Promise(res => setTimeout(() => res(), ms))
import { verify as _verify, httpsig_from, structured_to } from "hbsig"
const toMsg = async req => {
  let req2 = {}
  for (const k in req?.headers ?? {}) req2[k] = req.headers[k]
  if (typeof req.body?.text === "function") {
    req2.body = await req.body.text()
  } else if (req.body) req2.body = req.body
  return req2
}

const verify = async req => {
  let valid = false
  let address = null
  let query = null
  let ts = Date.now()
  try {
    const {
      valid,
      keyId,
      decodedSignatureInput: { components },
    } = await _verify(req)
    address = toAddr(keyId)
    const msg = structured_to(httpsig_from(await toMsg(req)))
    query = JSON.parse(msg.query)
    return { valid, address, query, ts, fields: components }
  } catch (e) {
    console.log(e)
    return { err: true, valid, address, query, ts, fields: null }
  }
}

const stack = {
  nosql: [
    "wdb-normalize@1.0",
    "wdb-verify@1.0",
    "wdb-parse@1.0",
    "wdb-auth@1.0",
    "wdb-write@1.0",
  ],
  sql: [
    "wdb-normalize@1.0",
    "wdb-verify@1.0",
    "wdb-parse-sql@1.0",
    "wdb-write-sql@1.0",
  ],
  vec: [
    "wdb-normalize@1.0",
    "wdb-verify@1.0",
    "wdb-parse-vec@1.0",
    "wdb-write-vec@1.0",
  ],
}
export default class DB {
  constructor({ url = `http://localhost:6364`, jwk, id, hb, mem }) {
    let _hb = null
    if (mem) {
      this.mem = mem
    } else {
      _hb = hb ?? `http://localhost:10001`
    }
    if (!jwk && typeof window === "object") jwk = window.arweaveWallet
    this.jwk = jwk
    if (this.jwk && !this.isArConnect()) this.addr = toAddr(jwk.n)
    this.id = id
    this.url = url

    if (_hb) this.hb = new HB({ url: _hb, jwk: this.jwk })
    this.db = new HB({ url, jwk: this.jwk })
    this._nonce = 0
    this.count = 0
  }
  isArConnect() {
    return this.jwk?.id || this.jwk?.walletName === "ArConnect"
  }
  async spawn({ query = init_query, type = "nosql" } = {}) {
    if (this.id) throw Error("db already exists")
    const { pid: id } = await this.hb.spawn({
      "db-type": type,
      "execution-device": "weavedb-wal@1.0",
      "device-stack": stack[type],
    })
    return await this.init({ query, id })
  }
  async init({ id, query = init_query }) {
    this.id = id
    await this.set("init", query)
    return this.id
  }
  async status() {
    try {
      const { body } = await this.db.get({ path: "/status" })
      const json = JSON.parse(body)
      if (json.status === "ok") return true
    } catch (e) {}
    return false
  }
  ready(start = false) {
    return new Promise(async req => {
      if (start) {
        try {
          const { body } = await this.hb.get({ path: "/~weavedb@1.0/start" })
          const json = JSON.parse(body)
          if (json.status !== true) throw Error("HyperBEAM not found")
        } catch (e) {}
      }
      try {
        let i = 0
        while (!(await this.status())) {
          await wait(500)
          i++
          if (i > 10) throw Error("server not found")
        }
        req(this)
      } catch (e) {
        throw Error("server not found")
      }
    })
  }
  async setSchema(schema, dir) {
    const query = ["setSchema", schema, dir]
    return await this.set(...query)
  }
  async setAuth(rules, dir) {
    const query = ["setAuth", rules, dir]
    return await this.set(...query)
  }
  async addIndex(index, dir) {
    const query = ["addIndex", index, dir]
    return await this.set(...query)
  }
  async removeIndex(dir) {
    const query = ["removeIndex", dir]
    return await this.set(...query)
  }
  async addTrigger(trigger, dir) {
    const query = ["addTrigger", trigger, dir]
    return await this.set(...query)
  }
  async removeTrigger(dir, key) {
    const query = ["removeTrigger", dir, key]
    return await this.set(...query)
  }
  async mkdir({ name, schema, auth }) {
    const query = ["set:dir", { schema, auth }, "_", name]
    return await this.set(...query)
  }
  async batch(queries) {
    return await this.set("batch", ...queries)
  }
  async set(...args) {
    const req = await this.db.sign(
      {
        path: "/~weavedb@1.0/set",
        nonce: ++this._nonce,
        id: this.id,
        query: JSON.stringify(args),
      },
      { path: false },
    )
    let json = null
    if (this.mem) {
      const { valid, query, fields, address } = await verify(req)
      if (valid) {
        try {
          if (typeof req.body?.text === "function") {
            req.body = await req.body.text()
          }
          const _res = await this.mem.write(req)
          if (_res?.success) {
            json = { success: true, query, result: _res.result }
          } else {
            json = { success: false, error: _res.err, query, result: null }
          }
        } catch (e) {
          json = { success: false, query, error: e.toString(), result: null }
        }
      } else {
        json = {
          success: false,
          error: "invalid signature",
          query,
          result: null,
        }
      }
    } else {
      const res = await this.db.send(req)
      json = JSON.parse(res.body)
    }
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
  async admin(...args) {
    const req = await this.db.sign(
      {
        path: "/~weavedb@1.0/admin",
        query: JSON.stringify(args),
      },
      { path: false },
    )
    const res = await this.db.send(req)
    console.log(res)
    return JSON.parse(res.body)
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
    return this._nonce
  }
  async stat(dir) {
    return await this.get("_", dir)
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
    await wait(0)
    let json = null
    let res = null
    if (this.mem) {
      const query = args
      try {
        res = await this.mem[query[0]](...query.slice(1)).val()
        json = { success: true, query, res }
      } catch (e) {
        console.log(e)
        json = { success: false, query, error: e.toString() }
      }
    } else {
      const _res = await this.db.get({
        path: "/~weavedb@1.0/get",
        id: this.id,
        query: JSON.stringify(args),
      })
      json = JSON.parse(_res.body)
    }
    if (json.error) throw json.error
    return json.res
  }
}
