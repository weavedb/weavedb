import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import server from "../src/server.js"
import validate from "../src/validate.js"
import bundler from "../src/bundler.js"
import { HyperBEAM } from "wao/test"
import {
  get,
  set,
  bob,
  alice,
  mike,
  beth,
  john,
  wait,
  genDir,
  init_query,
  users_query,
  sign,
} from "./test-utils.js"
import { HB } from "wao"

const q1 = users_query
const q2 = ["set:user", bob, "users", "bob"]
const q3 = ["set:user", alice, "users", "alice"]
let qs = [q1, q2]

const setup = async ({ pid, request }) => {
  let nonce = 0
  const json0 = await set(request, ["init", init_query], ++nonce, pid)
  const json = await set(request, q1, ++nonce, pid)
  const json2 = await set(request, q2, ++nonce, pid)
  const json3 = await get(request, ["get", "users"], pid)
  assert.deepEqual(json3.res, [bob])
  return { nonce }
}

const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const { pid: validate_pid } = await hbeam.spawn({
    "Data-Protocol": "ao",
    Variant: "ao.WDB.1",
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  console.log("validator PID:", validate_pid)
  await wait(5000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
  await wait(5000)

  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: {
      "Data-Protocol": "ao",
      Variant: "ao.WDB.1",
      Action: "Query",
      Query: JSON.stringify(["users"]),
    },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  assert.deepEqual(data, [bob])

  return { validate_pid, dbpath2 }
}

const deployHB = async ({ port = 10001 }) => {
  const hbeam = new HyperBEAM({
    bundler_ans104: false,
    bundler_httpsig: "http://localhost:4001",
  })
  const _bundler = bundler({ jwk: hbeam.jwk })
  await hbeam.ready()
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
  const node = await server({
    dbpath,
    jwk,
    hb,
    pid,
  })
  return { node, pid, hbeam, jwk, hb, bundler: _bundler }
}

describe("Validator", () => {
  it("should validate HB WAL", async () => {
    const { node, pid, hbeam, jwk, hb, bundler } = await deployHB({})
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })
    const _hbeam = new HB({ jwk, format: "ans104" })
    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: _hbeam,
      pid,
      hb,
      jwk,
    })
    /*
    const json4 = await set(_hb, q3, ++nonce, pid)
    await wait(10000)
    await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
    await wait(5000)
    const { res } = await hbeam.hb.message({
      pid: validate_pid,
      tags: { Action: "Query", Query: JSON.stringify(["users"]) },
    })
    assert.deepEqual(res.results.data, [alice, bob])
    */
    await wait(5000)
    bundler.close()
    node.stop()
    hbeam.kill()
  })
})
