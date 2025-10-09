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
  constructor({ url = `http://localhost:6364`, jwk, id, hb, mem, nonce }) {
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
    this._nonce = nonce ?? 0
    this.count = 0
  }
  isArConnect() {
    return this.jwk?.id || this.jwk?.walletName === "ArConnect"
  }
  async spawn({ query = init_query, version, type = "nosql" } = {}) {
    if (this.id) throw Error("db already exists")
    const { pid: id } = await this.hb.spawn({
      "db-type": type,
      "execution-device": "weavedb-wal@1.0",
      "device-stack": stack[type],
    })
    return await this.init({ query, id, version })
  }
  async init({ id, version, query = init_query }) {
    this.id = id
    if (version) query.version = version
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
  async upgrade(version) {
    const query = ["upgrade", version]
    return await this.set(...query)
  }
  async revert() {
    const query = ["revert"]
    return await this.set(...query)
  }
  async migrate() {
    const query = ["migrate"]
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
  async mkdir({ name, schema = { type: "object" }, auth = [] }) {
    const query = ["set:dir", {}, "_", name]
    let res = await this.set(...query)
    if (res.success) {
      res.schema = await this.setSchema(schema, name)
      res.auth = await this.setAuth(auth, name)
    }
    return res
  }
  async batch(queries) {
    return await this.set("batch", ...queries)
  }
  async sign({
    path = "/~weavedb@1.0/set",
    nonce: _nonce,
    query,
    id: _id,
    parse = false,
  }) {
    const nonce = _nonce ?? ++this._nonce
    const id = _id ?? this.id
    const req = await this.db.sign(
      { path, nonce, id, query: JSON.stringify(query) },
      { path: false },
    )
    return { id, nonce, req: parse ? this.parse(req) : req }
  }
  async parse(msg) {
    const { valid, query, fields, address } = await verify(msg)
    if (typeof msg.body?.text === "function") {
      msg.body = await msg.body.text()
    }
    return { valid, query, msg }
  }
  async set(...query) {
    const { id, req, nonce } = await this.sign({ query })
    let json = null
    if (this.mem) {
      const { valid, query, msg } = await this.parse(req)
      if (valid) {
        try {
          const _res = await this.mem.write(msg)
          if (_res?.success) {
            json = { success: true, id, query, result: _res.result, nonce }
          } else {
            json = {
              success: false,
              id,
              error: _res.err,
              query,
              result: null,
              nonce,
            }
          }
        } catch (e) {
          json = {
            success: false,
            id,
            query,
            error: e.toString(),
            result: null,
            nonce,
          }
        }
      } else {
        json = {
          id,
          nonce,
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
      console.log(".........................go again", query)
      await this.nonce()
      this.count++
      return await this.set(...query)
    } else {
      this.count = 0
      return json
    }
  }
  async admin(...args) {
    const { msg } = await this.sign({
      path: "/~weavedb@1.0/admin",
      query: JSON.stringify(args),
    })
    const res = await this.db.send(msg)
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
    this._nonce = (await this.get("_accounts", this.addr))?.nonce ?? 0
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
