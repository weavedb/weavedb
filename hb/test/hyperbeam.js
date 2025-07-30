import assert from "assert"
import { after, describe, it, before } from "node:test"
import server from "../src/server.js"
import { HyperBEAM } from "wao/test"
import { HB } from "wao"
import { bob, alice, mike, beth, john, wait } from "./test-utils.js"
import { genDir, get, set, init_query, users_query } from "./test-utils.js"

const q1 = users_query
const q2 = ["set:user", bob, "users", "bob"]
const q3 = ["set:user", alice, "users", "alice"]
const qs = [q1, q2]
const port = 6364
describe("HyperBEAM | dev_weavedb", () => {
  it("should spawn a process and compute", async () => {
    const hbeam = await new HyperBEAM({ reset: true }).ready()
    const hb = hbeam.hb
    const { pid } = await hb.spawn({})
    const dbpath = genDir()
    const node = await server({ dbpath, jwk: hbeam.jwk, hb: hbeam.url, port })
    const hb2 = new HB({ url: `http://localhost:${port}`, jwk: hbeam.jwk })
    let nonce = 0
    const json0 = await set(hb2, ["init", init_query], ++nonce, pid)
    const json = await set(hb2, q1, ++nonce, pid)
    const json2 = await set(hb2, q2, ++nonce, pid)
    const json3 = await get(hb2, ["get", "users"], pid)
    assert.deepEqual(json3.res, [bob])
    hbeam.kill()
    node.stop()
  })
  it("should query weavedb NIF device", async () => {
    const hbeam = await new HyperBEAM({ reset: true }).ready()
    const hb = hbeam.hb
    const { out } = await hb.post({ path: "/~weavedb@1.0/query", a: 2, b: 3 })
    assert.equal(out.sum, 5)
    hbeam.kill()
  })
  it.only("should start weavedb with HyperBEAM", async () => {
    const hbeam = await new HyperBEAM({ reset: true, as: ["weavedb"] }).ready()
    await wait(5000)
    const status = await fetch("http://localhost:6364/status").then(r =>
      r.json(),
    )
    assert.equal("WeaveDB", status.name)
    hbeam.kill()
  })
})
