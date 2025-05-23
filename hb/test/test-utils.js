import { map, mergeLeft } from "ramda"
import { spawn } from "child_process"
import { readFileSync } from "fs"
import { createPrivateKey } from "node:crypto"
import { connect, createSigner } from "@permaweb/aoconnect"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"

const bob = { name: "Bob" }
const alice = { name: "Alice" }
const mike = { name: "Mike" }
const beth = { name: "Beth" }
const john = { name: "John" }
import server from "../src/server.js"
import server_sql from "../src/server_sql.js"
let devices = [
  "ans104",
  "compute",
  "cache",
  "cacheviz",
  "cron",
  "dedup",
  "delegated-compute",
  "faff",
  "genesis-wasm",
  "greenzone",
  "hyperbuddy",
  "json",
  "json-iface",
  "local-name",
  "lookup",
  "lua",
  "manifest",
  "message",
  "monitor",
  "multipass",
  "name",
  "node-process",
  "p4",
  "patch",
  "poda",
  "process",
  "push",
  "relay",
  "router",
  "scheduler",
  "simple-pay",
  "snp",
  "stack",
  "test-device",
  "volume",
  "wasi",
  "wasm-64",
  "httpsig",
  "meta",
  "flat",
  "structured",
]
const devmap = {
  flat: { dev: "codec_flat" },
  structured: { dev: "codec_structured" },
  json: { dev: "codec_json" },
  httpsig: { dev: "codec_httpsig" },
  greenzone: { dev: "green_zone" },
  "local-name": { dev: "local_name" },
  "genesis-wasm": { dev: "genesis_wasm" },
  "json-iface": { dev: "json_iface" },
  "node-process": { dev: "node_process" },
  "simple-pay": { dev: "simple_pay" },
  "delegated-compute": { dev: "delegated_compute" },
  "test-device": { dev: "test" },
  "wasm-64": { dev: "wasm" },
  lua: { ver: "5.3a" },
  ans104: { dev: "codec_ans104" },
}

import { resolve } from "path"
const genDir = () =>
  resolve(
    import.meta.dirname,
    `.db/mydb-${Math.floor(Math.random() * 1000000000)}`,
  )
const wait = ms => new Promise(res => setTimeout(() => res(), ms))

const set = async (req, q, nonce, id) => {
  const res = await req({
    method: "POST",
    path: "/~weavedb@1.0/set",
    query: JSON.stringify(q),
    nonce: Number(nonce).toString(),
    id,
  })
  return JSON.parse(res.body)
}
const get = async (req, q, id) => {
  const res = await req({
    method: "GET",
    path: "/~weavedb@1.0/get",
    query: JSON.stringify(q),
    id,
  })
  return JSON.parse(res.body)
}
import { dir_schema } from "../src/schemas.js"
import { dirs_set } from "../src/rules.js"
const init_query = { schema: dir_schema, auth: [dirs_set] }
const users_query = [
  "set:dir",
  {
    schema: { type: "object", required: ["name"] },
    auth: [
      ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
    ],
  },
  "_",
  "users",
]

class HB {
  constructor({
    env,
    port = 10001,
    sport = 4000,
    devs,
    cwd = "../../HyperBEAM",
    wallet = ".wallet.json",
  }) {
    this.port = port
    const _eval = !devs
      ? `hb:start_mainnet(#{ port => ${port}, gateway => <<"http://localhost:${sport}">>, priv_key_location => <<"${wallet}">>}).`
      : `hb:start_mainnet(#{ port => ${port}, , gateway => <<"http://localhost:${sport}">>, priv_key_location => <<"${wallet}">>, preloaded_devices => [${map(
          v => {
            return `#{<<"name">> => <<"${v}@${devmap[v]?.ver ?? "1.0"}">>, <<"module">> => dev_${devmap[v]?.dev ?? v}}`
          },
        )(devs).join(", ")}] }).`
    this.hb = spawn("rebar3", ["shell", "--eval", _eval], {
      env: {
        ...process.env,
        ...env,
      },
      cwd: resolve(import.meta.dirname, cwd),
    })
    this.hb.stdout.on("data", chunk => console.log(`stdout: ${chunk}`))
    this.hb.stderr.on("data", err => console.error(`stderr: ${err}`))
    this.hb.on("error", err => console.error(`failed to start process: ${err}`))
    this.hb.on("close", code =>
      console.log(`child process exited with code ${code}`),
    )
    this.jwk = JSON.parse(
      readFileSync(resolve(import.meta.dirname, cwd, wallet), "utf8"),
    )
    this.signer = createSigner(this.jwk)
    const { request } = connect({
      MODE: "mainnet",
      URL: `http://localhost:${port}`,
      device: "",
      signer: this.signer,
    })
    this.request = request
  }
  async info() {
    const _info = await this.fetch("/~meta@1.0/info")
    this.address = _info.address
    return _info
  }
  async spawn({ tags = {} }) {
    if (!this.address) await this.info()
    const _tags = mergeLeft(tags, {
      method: "POST",
      path: "/~process@1.0/schedule",
      scheduler: this.address,
      "random-seed": Math.random().toString(),
      "execution-device": "weavedb@1.0",
    })
    return await this.request(_tags)
  }
  async message({ pid, tags = {} }) {
    if (!this.address) await this.info()
    const _tags = mergeLeft(tags, {
      method: "POST",
      path: `/${pid}/schedule`,
      scheduler: this.address,
    })
    return await this.request(_tags)
  }
  async req({ path, tags = {} }) {
    const _tags = mergeLeft(tags, { method: "POST", path })
    return await this.request(_tags)
  }
  async fetch(path, { json = true, params = "" } = {}) {
    return await fetch(
      `http://localhost:${this.port}${path}${json ? "/serialize~json@1.0" : ""}${params ? "?" + params : ""}`,
    ).then(r => r[json ? "json" : "text"]())
  }
  async now(pid) {
    return await this.fetch(`/${pid}~process@1.0/now`)
  }
  async compute(pid, slot) {
    return await this.fetch(`/${pid}~process@1.0/compute`, {
      params: `slot=${slot}`,
    })
  }
  stop() {
    this.hb.kill("SIGINT")
  }
}
class sign {
  constructor({ jwk, id }) {
    this.jwk = jwk
    this.id = id
    this.nonce = 0
    this.signer = createHttpSigner(
      createPrivateKey({ key: jwk, format: "jwk" }),
      "rsa-pss-sha512",
      jwk.n,
    )
  }
  async sign(...query) {
    return await httpbis.signMessage(
      { key: this.signer, fields: ["query", "nonce", "id"] },
      {
        headers: {
          query: JSON.stringify(query),
          nonce: Number(++this.nonce).toString(),
          id: this.id,
        },
      },
    )
  }
}

const runHB = (port, sport) => {
  const env = {
    //DIAGNOSTIC: "1",
    CMAKE_POLICY_VERSION_MINIMUM: "3.5",
    CC: "gcc-12",
    CXX: "g++-12",
  }
  return new HB({ cwd: "../../HyperBEAM", env, port, sport })
}

const deployHB = async ({ port, sport, type = "nosql" }) => {
  const port2 = 6363
  const hbeam = runHB(port, sport)
  await wait(5000)
  const hb = `http://localhost:${port}`
  const URL = `http://localhost:${port2}`
  const { process: pid } = await hbeam.spawn({})
  const signer = hbeam.signer
  const jwk = hbeam.jwk
  console.log("pid", pid)
  const dbpath = genDir()
  const _server = type === "nosql" ? server : server_sql
  const node = await _server({
    dbpath,
    jwk,
    hb,
    pid,
    port: port2,
    gateway: sport,
  })
  const { request } = connect({ MODE: "mainnet", URL, device: "", signer })
  return { node, pid, request, hbeam, jwk, hb }
}

export {
  runHB,
  deployHB,
  sign,
  HB,
  bob,
  alice,
  mike,
  beth,
  john,
  devices,
  genDir,
  wait,
  get,
  set,
  devmap,
  init_query,
  users_query,
}
