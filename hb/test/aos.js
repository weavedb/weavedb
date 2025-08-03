import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { open } from "lmdb"
import BPT from "../src/bpt.js"
import server from "../src/server.js"
import recover from "../src/recover.js"
import validate from "../src/validate.js"
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
  deployHB,
} from "./test-utils.js"

import { AO, HB } from "wao"
import { Server, mu, toAddr } from "wao/test"

const q1 = users_query
const q2 = ["set:user", bob, "users", "bob"]
const q3 = ["set:user", alice, "users", "alice"]
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
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  await wait(5000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
  await wait(5000)
  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: { Action: "Query", Query: JSON.stringify(["users"]) },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  assert.deepEqual(data, [bob])
  return { validate_pid, dbpath2 }
}

describe("AOS", () => {
  it.only("should serve HyperBEAM AOS", async () => {
    const src_data = `
Handlers.add("Query", "Query", function (msg)
  local data = Send({ Target = msg.DB, Action = "Query", Query = msg.Query }).receive().Data
  msg.reply({ Data = data })
end)
`
    const { node, pid, hbeam, jwk, hb } = await deployHB({
      as: ["genesis-wasm", "weavedb"],
    })
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })
    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: hbeam.hb,
      pid,
      hb,
      jwk,
    })
    const json4 = await set(_hb, q3, ++nonce, pid)
    await wait(10000)
    await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid })
    await wait(5000)
    const { res } = await hbeam.hb.message({
      pid: validate_pid,
      tags: { Action: "Query", Query: JSON.stringify(["users"]) },
    })
    assert.deepEqual(res.results.data, [alice, bob])
    const ao = await new AO({ module_type: "mainnet", hb: _hb }).init(jwk)
    const { pid: pid2, p } = await ao.deploy({ src_data })
    const { out } = await p.msg("Query", {
      DB: validate_pid,
      Query: JSON.stringify(["users"]),
    })
    assert.deepEqual(JSON.parse(out), [alice, bob])
    node.stop()
    hbeam.kill()
  })
})
