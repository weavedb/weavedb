import { createPrivateKey } from "node:crypto"
import { httpbis, createSigner } from "http-message-signatures"
import { dir_schema } from "../src/schemas.js"
import { dirs_set } from "../src/rules.js"
import { resolve } from "path"
import server from "../src/server.js"
import server_sql from "../src/server_sql.js"
import server_vec from "../src/server_vec.js"
import { HyperBEAM } from "wao/test"

const bob = { name: "Bob" }
const alice = { name: "Alice" }
const mike = { name: "Mike" }
const beth = { name: "Beth" }
const john = { name: "John" }
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
    this.signer = createSigner(
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

const deployHB = async ({ port = 10001, sport, type = "nosql", as = [] }) => {
  const port2 = 6364
  const hbeam = await new HyperBEAM({
    port,
    gateway: sport,
    as,
  }).ready()
  const hb = `http://localhost:${port}`
  const { pid } = await hbeam.hb.spawn({
    "db-type": "nosql",
    "execution-device": "weavedb-wal@1.0",
    "device-stack": [
      "wdb-normalize@1.0",
      "wdb-verify@1.0",
      "wdb-parse@1.0",
      "wdb-auth@1.0",
      "wdb-write@1.0",
    ],
  })
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
    port: port2,
    gateway: sport,
  })
  return { node, pid, hbeam, jwk, hb }
}

function randomString(minLen, maxLen) {
  const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
    // Add spaces occasionally for readability
    if (i > 0 && i % 15 === 0 && Math.random() > 0.5) {
      result += " "
    }
  }
  return result.trim()
}

function randomWord() {
  const words = [
    "user",
    "admin",
    "member",
    "guest",
    "moderator",
    "developer",
    "manager",
    "analyst",
    "designer",
    "engineer",
    "consultant",
  ]
  return words[Math.floor(Math.random() * words.length)]
}

function randomName() {
  const first = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
  ]
  const last = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
  ]
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomBoolean() {
  return Math.random() > 0.5
}

function randomArray(minItems, maxItems, generator) {
  const len = randomInt(minItems, maxItems)
  return Array.from({ length: len }, generator)
}

function genUser() {
  const userType = Math.random()

  // 40% - Small simple users
  if (userType < 0.4) {
    return {
      name: randomName(),
      age: randomInt(18, 75),
      role: randomWord(),
      id: randomInt(10000, 99999),
    }
  }

  // 35% - Medium users
  if (userType < 0.75) {
    return {
      username: randomString(6, 12),
      name: randomName(),
      email: `${randomString(5, 10)}@example.com`,
      age: randomInt(18, 75),
      active: randomBoolean(),
      score: randomInt(0, 1000),
      role: randomWord(),
      tags: randomArray(1, 3, () => randomWord()),
    }
  }

  // 20% - Larger users with descriptions
  if (userType < 0.95) {
    return {
      id: randomString(15, 25),
      username: randomString(6, 12),
      name: randomName(),
      bio: randomString(50, 120),
      age: randomInt(18, 75),
      role: randomWord(),
      active: randomBoolean(),
      metadata: {
        department: randomWord(),
        level: randomInt(1, 10),
        certified: randomBoolean(),
      },
      preferences: {
        theme: ["dark", "light"][randomInt(0, 1)],
        notifications: randomBoolean(),
        language: ["en", "es", "fr"][randomInt(0, 2)],
      },
      tags: randomArray(2, 4, () => randomWord()),
    }
  }

  // 5% - Large detailed users
  return {
    id: randomString(20, 30),
    username: randomString(8, 15),
    name: randomName(),
    email: `${randomString(5, 10)}@example.com`,
    bio: randomString(80, 150),
    description: randomString(100, 250),
    age: randomInt(18, 75),
    role: randomWord(),
    experience: randomInt(0, 20),
    active: randomBoolean(),
    verified: randomBoolean(),
    metadata: {
      department: randomWord(),
      level: randomInt(1, 10),
      certified: randomBoolean(),
      joined: Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000),
    },
    skills: randomArray(2, 5, () => randomWord()),
    projects: randomArray(1, 3, () => ({
      name: randomString(10, 20),
      status: ["active", "completed", "pending"][randomInt(0, 2)],
      progress: randomInt(0, 100),
    })),
  }
}

export {
  genUser,
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
