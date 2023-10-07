const pako = require("pako")
const md5 = require("md5")
const {
  last,
  keys,
  isNil,
  is,
  pluck,
  map,
  includes,
  path: _path,
} = require("ramda")
const DB = require("weavedb-offchain")
const Warp = require("weavedb-sdk-node")
const { open } = require("lmdb")
const path = require("path")
const EthCrypto = require("eth-crypto")

class Rollup {
  constructor({
    txid,
    rollup = false,
    owner,
    secure,
    dbname = "weavedb",
    dir,
    plugins = {},
    tick = null,
    admin = null,
    initial_state = {},
    bundler,
    contractTxId,
  }) {
    this.height = 0
    this.contractTxId = contractTxId
    this.initial_state = initial_state
    this.admin = admin
    this.bundler = bundler
    this.tick = tick
    this.last = 0
    this.secure = secure
    this.owner = owner
    this.rollup = rollup
    this.txid = txid
    this.txs = []
    this.tx_count = 0
    this.bundling = null
    this.kvs = {}
    this.kvs_wal = {}
    this.error_count = 0
    this.dir = path.resolve(
      dir ?? path.resolve(__dirname, "cache"),
      dbname,
      this.txid
    )
    this.plugins = plugins
    console.log(`Bundler: ${this.bundler.address}`)
  }

  async init() {
    await this.initDB()
    if (this.rollup) this.bundle()
  }

  measureSizes(bundles) {
    let sizes = 0
    let b = [{ bundles: [], t: [], size: 0 }]
    let i = 0
    for (let v of bundles) {
      if (isNil(v.data?.input)) continue
      const len = JSON.stringify(v.data.input).length
      if (sizes + len > 3000) {
        i += 1
        sizes = 0
        b[i] = { bundles: [], t: [], size: 0 }
      }
      b[i].bundles.push(v)
      b[i].t.push(v.data.tx_ts)
      sizes += len
      b[i].size += len
    }
    return b
  }
  async commit(bundles, t, height) {
    console.log(
      `[${height}],commiting to Warp...${map(_path(["data", "id"]))(
        bundles
      )} : ${height}`
    )
    const res = await this.warp.bundle(map(_path(["data", "input"]))(bundles), {
      t,
      h: height,
      parallel: true,
    })
    console.log(`bundle tx result: ${res.success}: ${res.originalTxId}`)
    if (res.success === true) {
      let batch = map(
        v => [
          "update",
          {
            commit: true,
            warp: res.originalTxId,
            block: height,
          },
          "txs",
          v.id,
        ],
        bundles
      )
      batch.push([
        "set",
        {
          height: height,
          txs: map(_path(["data", "txid"]))(bundles),
          date: res.bundlerResonse?.timestamp ?? Date.now(),
          txid: res.originalTxId,
        },
        "blocks",
        `${height}`,
      ])
      await this.wal.batch(batch)
      return { success: true, height }
    } else {
      return { success: false, height }
    }
  }
  async _bundle() {
    return new Promise(async _res => {
      try {
        const bundling = await this.wal.cget(
          "txs",
          ["commit"],
          ["id"],
          ["commit", "==", false]
        )
        const b = this.measureSizes(bundling)
        let done = 0
        if (b[0].t.length > 0) {
          let height = this.height
          let results = []
          for (let v of b) {
            const { bundles, t } = v
            height++
            console.log(
              `[${height}],commiting to Warp...${map(_path(["data", "id"]))(
                bundles
              )} : ${height}`
            )
            const res = await this.warp.bundle(
              map(_path(["data", "input"]))(bundles),
              {
                t,
                h: height,
                parallel: true,
              }
            )
            console.log(`committed`, res?.tx?.originalTxId, res?.duration)
            if (isNil(res?.tx?.originalTxId)) break
            results.push({
              height,
              tx: res.tx,
              items: v,
              duration: res.duration,
            })
          }
          const valids =
            (await this.warp.db.readState())?.cachedValue?.validity ?? {}
          for (let v of results) {
            const valid = valids[v.tx.originalTxId]
            if (valid !== true) break
            console.log(`valid [${v.height}] : ${v.tx.originalTxId}`)
            this.height = v.height
            let batch = map(
              v2 => [
                "update",
                {
                  commit: true,
                  warp: v.tx.originalTxId,
                  block: v.height,
                },
                "txs",
                v2.id,
              ],
              v.items.bundles
            )
            batch.push([
              "set",
              {
                height: v.height,
                txs: map(_path(["data", "txid"]))(v.items.bundles),
                date: v.tx.bundlerResonse?.timestamp ?? Date.now(),
                txid: v.tx.originalTxId,
              },
              "blocks",
              `${v.height}`,
            ])
            await this.wal.batch(batch)
          }
          _res({ success: true, err: null, len: b.length })
        } else {
          _res({ err: null, len: 0, success: null })
        }
      } catch (e) {
        console.log(e)
        _res({ err: true, success: false, len: 0 })
      }
    })
  }
  async bundle() {
    const { err, success, len } = await this._bundle()
    if (success) this.error_count = 0
    if (err) this.error_count += 1
    if (this.error_count < 2) {
      setTimeout(() => this.bundle(), success === true ? 0 : 3000)
    }
  }

  async initDB() {
    console.log(`Owner Account: ${this.owner}`)
    await this.initWAL()
    await this.initOffchain()
    await this.initWarp()
    await this.initPlugins()
  }

  async initPlugins() {
    for (let k in this.plugins) {
      const Plugin = require(`./plugins/${k}`)
      this.plugins[k].db = new Plugin({
        owner: this.plugins[k].owner ?? this.owner,
        dir: this.plugins[k].dir ?? this.dir,
        db: this.db,
        txid: this.txid,
      })
      await this.plugins[k].db.pdb.initialize()
      console.log(`plugin initialized: ${k}`)
      const last_wal =
        (await this.plugins[k].db.pdb.get("conf", k))?.last_wal ?? null
      console.log(JSON.stringify(last_wal))
      console.log(`last WAL: ${last_wal}`)
      await this.getWAL(last_wal, this.plugins[k].db)
    }
  }

  async initWAL() {
    this.wal = new DB({
      type: 3,
      noauth: true,
      cache: {
        initialize: async obj => {
          obj.lmdb_wal = open({
            path: path.resolve(this.dir, "wal"),
          })
          let saved_state = await obj.lmdb_wal.get("state")
          if (!isNil(saved_state)) obj.state = saved_state
        },
        onWrite: async (tx, obj, param) => {
          let prs = [obj.lmdb_wal.put("state", tx.state)]
          for (const k in tx.result.kvs) {
            this.kvs_wal[k] = tx.result.kvs[k]
            prs.push(obj.lmdb_wal.put(k, tx.result.kvs[k]))
          }
          Promise.all(prs).then(() => {})
        },
        get: async (key, obj) => {
          let val = this.kvs_wal[key]
          if (typeof val === "undefined") val = await obj.lmdb_wal.get(key)
          return val
        },
      },
      state: { owner: this.owner, secure: false },
    })
    await this.wal.initialize()
    await this.wal.addIndex([["commit"], ["id"]], "txs")
    await this.wal.addIndex([["input.caller"], ["id", "desc"]], "txs")
    await this.wal.addIndex([["block"], ["id", "desc"]], "txs")
    this.tx_count = (await this.wal.get("txs", ["id", "desc"], 1))[0]?.id ?? 0
    this.height =
      (await this.wal.get("blocks", ["height", "desc"], 1))[0]?.height ?? 0
    console.log(
      `${this.tx_count} txs has been cached: ${this.height} blocks commited`
    )
  }

  async initOffchain() {
    const state = {
      ...{ owner: this.owner, secure: this.secure ?? true },
      ...this.initial_state,
    }
    this.db = new DB({
      contractTxId: this.txid,
      type: 3,
      cache: {
        initialize: async obj => {
          obj.lmdb = open({
            path: path.resolve(this.dir, "rollup"),
          })
          let saved_state = await obj.lmdb.get("state")
          if (!isNil(saved_state)) obj.state = saved_state
          console.log(`DB initialized!`)
          console.log(obj.state)
        },
        onWrite: async (tx, obj, param) => {
          let prs = [obj.lmdb.put("state", tx.state)]
          for (const k in tx.result.kvs) {
            //this.kvs[k] = tx.result.kvs[k]
            prs.push(obj.lmdb.put(k, tx.result.kvs[k]))
          }
          Promise.all(prs).then(() => {})
          const t = {
            id: ++this.tx_count,
            txid: tx.result.transaction.id,
            commit: false,
            tx_ts: tx.result.transaction.timestamp,
            input: param,
            docID: tx.result.docID,
            doc: tx.result.doc,
          }
          await this.wal.set(t, "txs", `${t.id}`)
          this.last = Date.now()
          for (let k in this.plugins) {
            this.plugins[k].db
              .exec({ id: t.id, data: t })
              .catch(e => console.log("err", e))
          }
        },
        get: async (key, obj) => {
          //let val = this.kvs[key]
          let val
          if (typeof val === "undefined") val = await obj.lmdb.get(key)
          return val
        },
      },
      state,
    })
    await this.db.initialize()
    if (!isNil(this.tick)) {
      setInterval(async () => {
        if (Date.now() - this.last > this.tick) {
          await this.db.tick({ privateKey: this.admin })
        }
      }, this.tick)
    }
  }

  async initWarp() {
    if (this.rollup && !isNil(this.contractTxId)) {
      console.log(`contractTxId: ${this.contractTxId}`)
      this.warp = new Warp({
        lmdb: { dir: path.resolve(this.dir, "warp") },
        type: 3,
        contractTxId: this.contractTxId,
        remoteStateSyncEnabled: false,
        nocache: true,
        progress: async input => {
          console.log(
            `loading ${this.txid} [${input.currentInteraction}/${input.allInteractions}]`
          )
        },
      })
      await this.warp.init({ wallet: this.bundler })
      const _state = await this.warp.readState()
      let len = 0
      try {
        len = keys(_state.cachedValue.validity).length
      } catch (e) {}
      if (this.tx_count === 0 && len > 0) {
        console.log("recovering WAL...")
        const txs = await this.warp.warp.interactionsLoader.load(
          this.contractTxId
        )
        for (let v of txs) {
          for (const tag of v.tags || []) {
            if (tag.name === "Input") {
              const input = JSON.parse(tag.value)
              if (input.function === "bundle") {
                const compressed = new Uint8Array(
                  Buffer.from(input.query, "base64")
                    .toString("binary")
                    .split("")
                    .map(function (c) {
                      return c.charCodeAt(0)
                    })
                )
                for (const input of JSON.parse(
                  pako.inflate(compressed, { to: "string" })
                )) {
                  let t = {
                    id: ++this.tx_count,
                    warp: v.id,
                    commit: true,
                    txid: md5(
                      JSON.stringify({ contractTxId: this.contractTxId, input })
                    ),
                    input,
                    blk_ts: v.block.timestamp,
                    /* add docID and doc */
                  }
                  console.log(`saving... [${this.tx_count}] ${t.txid}`)
                  await this.wal.set(t, "txs", `${t.id}`)
                }
                break
              }
            }
          }
        }
      }
    }
  }

  async getWAL(next = null, pdb) {
    const limit = 10
    let params = ["txs", ["id"]]
    if (!isNil(next)) params.push(["startAfter", next])
    let cache = {}
    const txs = await this.wal.cget(...params, limit)
    for (let v of txs) await pdb.exec(v, cache)
    if (txs.length === limit) this.getWAL(last(txs), pdb)
  }

  async execUser(parsed) {
    const { type, res, nocache, txid, func, query } = parsed
    if (type === "log" && !includes(func)(["get", "cget"])) {
      res("only get/cget is allowed with log", null)
      return
    }
    const _query = JSON.parse(query)
    const key = DB.getKeyInfo(
      type,
      !isNil(_query.query) ? _query : { function: func, query: _query }
    )
    let data = null
    let result, err, dryWrite
    ;({ result, err, dryWrite } = await this.sendQuery(parsed, key))
    //if (!dryWrite) res(err, result)
    res(err, result)
  }

  async sendQuery({ type, func, txid, nocache, query, res }, key) {
    let result = null
    let err = null
    let dryWrite = false
    let _onDryWrite = null
    const db =
      type === "log"
        ? this.wal
        : type === "offchain"
        ? this.db
        : this.plugins[type]?.db?.pdb
    if (isNil(db)) res("DB not found", null)
    try {
      let _query = query === `""` ? [] : JSON.parse(query)
      if (is(Object, _query) && is(Object, _query.dryWrite)) {
        _onDryWrite = _query.dryWrite
        delete _query.dryWirte
      }
      if (func === "getNonce") {
        result = await db.getNonce(..._query)
      } else if (key.func === "cget") {
        if (nocache) {
          result = await db.cget(..._query, true)
        } else {
          result = await db.cget(..._query)
        }
        if (key.type === "collection") {
          if (func === "get") result = pluck("data", result)
        } else {
          if (func === "get") result = isNil(result) ? null : result.data
        }
      } else if (includes(func)(db.reads)) {
        if (includes(func)(["getVersion"]) || nocache) {
          try {
            _query.push(true)
          } catch (e) {
            console.log(e)
          }
        }
        result = await db[key.func](..._query)
      } else {
        dryWrite = !nocache
        let virtual_txid = null
        const cache = _onDryWrite?.cache || true
        const onDryWrite = nocache
          ? null
          : {
              cb: _res => {
                delete _res.state
                res(null, _res)
                virtual_txid = _res?.result?.transaction?.id || null
              },
              cache,
              read: _onDryWrite?.read || null,
            }
        result = await db.write(key.func, _query, true, true, false, onDryWrite)
        //if (!isNil(virtual_txid)) this.results[virtual_txid] = result
      }
    } catch (e) {
      console.log(e)
      err =
        typeof e === "string"
          ? e
          : typeof e.message === "string"
          ? e.message
          : "unknown error"
    }
    return { result, err, dryWrite }
  }
}

let rollup
process.on("message", async msg => {
  const { op, id } = msg
  if (op === "new") {
    rollup = new Rollup(msg.params)
  } else if (op === "init") {
    await rollup.init()
    process.send({ err: null, result: null, op, id })
  } else if (op === "execUser") {
    rollup.execUser({
      ...msg.params,
      res: (err, result) => process.send({ err, result, op, id }),
    })
  } else if (op === "deploy_contract") {
    rollup.contractTxId = msg.contractTxId
    rollup.rollup = true
    await rollup.initWarp()
    rollup.bundle()
    process.send({ op, id })
  } else {
    process.send({ op, id })
  }
})
