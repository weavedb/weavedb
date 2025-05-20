import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { resolve } from "path"
import { readFileSync } from "fs"
import { map, mergeLeft } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { createSigner as createHttpSigner } from "http-message-signatures"
import server from "../src/server.js"
import {
  wait,
  genDir,
  devices,
  bob,
  alice,
  mike,
  beth,
  john,
  get,
  set,
  devmap,
  init_query,
  users_query,
  HB,
} from "./test-utils.js"

const env = {
  //DIAGNOSTIC: "1",
  CMAKE_POLICY_VERSION_MINIMUM: "3.5",
  CC: "gcc-12",
  CXX: "g++-12",
}

const q1 = users_query
const q2 = ["set:user", bob, "users", "bob"]
const q3 = ["set:user", alice, "users", "alice"]
let qs = [q1, q2]

describe("HyperBEAM | dev_weavedb", () => {
  it("should spawn a process and compute", async () => {
    const port = 10002
    const hb = new HB({ cwd: "../../HyperBEAM", env, port })
    await wait(5000)
    const { process: pid } = await hb.spawn({})
    const dbpath = genDir()
    const node = await server({
      dbpath,
      jwk: hb.jwk,
      hb: `http://localhost:${port}`,
      port: 6363,
    })
    const { request } = connect({
      MODE: "mainnet",
      URL: "http://localhost:6363",
      device: "",
      signer: hb.signer,
    })
    let nonce = 0
    const json0 = await set(request, ["init", init_query], ++nonce, pid)
    const json = await set(request, q1, ++nonce, pid)
    const json2 = await set(request, q2, ++nonce, pid)
    const json3 = await get(request, ["users"], pid)
    console.log(json3)
    assert.deepEqual(json3.res, [bob])
    //const { slot } = await hb.message({ pid, tags: { plus: "3" } })
    //console.log(await hb.now(pid))
    //console.log(await hb.compute(pid, 0))
    hb.stop()
    node.stop()
  })
  it.only("should query weavedb NIF device", async () => {
    const port = 10005
    const hb = new HB({ cwd: "../../HyperBEAM", env, port })
    await wait(5000)
    assert.equal(
      (await hb.req({ path: "/~weavedb@1.0/query", tags: { a: 2, b: 3 } })).sum,
      "5",
    )
    hb.stop()
  })
})
