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
import server_vec from "../src/server_vec.js"
import { HyperBEAM } from "wao/test"
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

const set = async (hb, q, nonce, id) => {
  const res = await hb.post(
    {
      path: "/~weavedb@1.0/set",
      query: JSON.stringify(q),
      nonce: Number(nonce).toString(),
      id,
    },
    { path: false },
  )

  return JSON.parse(res.body)
}
const get = async (hb, q, id) => {
  const { body } = await hb.get({
    path: "/~weavedb@1.0/get",
    id,
    query: JSON.stringify(q),
  })
  return JSON.parse(body)
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

const deployHB = async ({ port = 10001, sport, type = "nosql" }) => {
  const port2 = 6363
  const hbeam = await new HyperBEAM({ port, gateway: sport }).ready()
  const hb = `http://localhost:${port}`
  const { pid } = await hbeam.hb.spawn({})
  const signer = hbeam.signer
  const jwk = hbeam.jwk
  console.log("pid", pid)
  const dbpath = genDir()
  const _server =
    type === "nosql" ? server : type === "vec" ? server_vec : server_sql
  const node = await _server({
    dbpath,
    jwk,
    hb,
    pid,
    port: port2,
    gateway: sport,
  })
  return { node, pid, hbeam, jwk, hb }
}

export {
  deployHB,
  sign,
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
