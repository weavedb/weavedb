import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import validate from "../src/validate.js"
import zkjson from "../src/zkjson.js"
import { spawn } from "child_process"
import { acc, HyperBEAM } from "wao/test"
import { DB } from "../../sdk/src/index.js"
import { mem } from "../../core/src/index.js"
import {
  get,
  set,
  wait,
  genDir,
  init_query,
  users_query,
  deployHB,
} from "./test-utils.js"

import { HB } from "wao"

const q1 = [
  "set:dir",
  {
    schema: {
      type: "object",
      required: ["cid", "json"],
      properties: {
        cid: {
          type: "string",
          pattern:
            "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{46}$",
        },
        json: { type: "object" },
      },
      additionalProperties: false,
    },
    auth: [
      [
        "add:json",
        [
          ["fields()", ["json"]],
          ["=$cid", ["cid()", "$req.json"]],
          ["=$json", ["get()", ["ipfs", ["cid", "==", "$cid"]]]],
          ["=$available", ["isEmpty", "$json"]],
          ["mod()", { cid: "$cid" }],
          ["allowifall()", ["$available"]],
        ],
      ],
    ],
  },
  "_",
  "ipfs",
]

const q2 = ["add:json", { json: { str: "abc" } }, "ipfs"]

const checkZK = async ({ pid, hb }) => {
  const zkp = await zkjson({ pid, hb, dbpath: genDir(), port: 6365, cid: true })
  await wait(5000)
  const proof = await zkp.proof_cid({
    cid: "QmRSubrtLv74R82v4hA86r2tN271YkwkZBJhfLco19NiQb",
    dir: "ipfs",
    doc: "A",
    path: "str",
  })
  console.log(proof)
  console.log("success!")
  await wait(3000)
  return zkp.server
}

const setup = async ({ pid, request }) => {
  let nonce = 0
  const json0 = await set(request, ["init", init_query], ++nonce, pid)
  const json = await set(request, q1, ++nonce, pid)
  const json2 = await set(request, q2, ++nonce, pid)
  return { nonce }
}

const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const { pid: validate_pid } = await hbeam.spawn({
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  await wait(5000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
  await wait(5000)
  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: { Action: "Query", Query: JSON.stringify(["ipfs"]) },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  console.log(data)
  return { validate_pid, dbpath2 }
}

const owner = acc[0]
const actor1 = acc[1]
const actor2 = acc[2]

describe("Validator", () => {
  it.only("should connect with remote nodes", async () => {
    const { q } = mem()
    const db = new DB({ jwk: owner.jwk, mem: q })
    const pid = await db.init({ id: "nft" })
    const a1 = new DB({ jwk: actor1.jwk, id: "nft", mem: q })
    const a2 = new DB({ jwk: actor2.jwk, id: "nft", mem: q })
    const schema = {
      type: "object",
      required: ["cid", "json", "yo"],
      properties: {
        cid: {
          type: "string",
          pattern:
            "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{46}$",
        },
        json: { type: "object" },
      },
      additionalProperties: false,
    }
    const schema2 = {
      type: "object",
      required: ["cid", "json"],
      properties: {
        cid: {
          type: "string",
          pattern:
            "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{46}$",
        },
        json: { type: "object" },
      },
      additionalProperties: false,
    }

    await db.mkdir({
      name: "ipfs",
      schema,
      auth: [
        [
          "add:json",
          [
            ["fields()", ["json"]],
            ["=$cid", ["cid()", "$req.json"]],
            ["=$json", ["get()", ["ipfs", ["cid", "==", "$cid"]]]],
            ["=$available", ["isEmpty", "$json"]],
            ["mod()", { cid: "$cid" }],
            ["allowifall()", ["$available"]],
          ],
        ],
      ],
    })
    const stat = await db.stat("ipfs")
    const auth1 = stat.auth[0][1][4]
    await db.set("add:json", { json: { a: 1 } }, "ipfs")
    await db.set("add:json", { json: { a: 1 } }, "ipfs")
    await db.set("add:json", { json: { a: 1 } }, "ipfs")
    await db.setSchema(schema2, "ipfs")
    await db.set("add:json", { json: { a: 1 } }, "ipfs")
    const stat2 = await db.stat("ipfs")
    const auth2 = stat2.auth[0][1][4]
    assert.equal((await db.cget("ipfs"))[0].id, "A")
  })

  it("should validate HB WAL", async () => {
    const { node, pid, hbeam, jwk, hb } = await deployHB({})
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })

    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: hbeam.hb,
      pid,
      hb,
      jwk,
    })
    await wait(5000)
    const zk_server = await checkZK({ pid: validate_pid, hb })
    zk_server.close()
    node.stop()
    hbeam.kill()
  })
  it("should validate HB WAL", async () => {
    const db = new DB({
      jwk: acc[0].jwk,
      id: "oaucrtbkha-zcw7-j7ctuyfxb_jgdvacbz0dirmnjfw",
    })
    console.log(await db.set("add:json", { json: { str: "abc" } }, "ipfs"))
    console.log(
      await fetch("http://localhost:6365/cid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dir: "ipfs",
          doc: "A",
          path: "str",
          cid: "QmRSubrtLv74R82v4hA86r2tN271YkwkZBJhfLco19NiQb",
        }),
      }).then(r => r.json()),
    )
  })
})
