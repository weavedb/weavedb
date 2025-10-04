import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import server from "../src/server.js"
import { Validator } from "../src/validate.js"
import bundler from "../src/bundler.js"
import { HyperBEAM } from "wao/test"
import { open } from "lmdb"
import { range } from "ramda"
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
  const getVal = () =>
    new Promise(async res => {
      const { pid: validate_pid } = await hbeam.spawn({
        "Data-Protocol": "ao",
        Variant: "ao.TN.1",
        "execution-device": "weavedb@1.0",
        db: pid,
      })
      res(validate_pid)
    })
  let vid = null
  let attempt = 0
  while (!vid && attempt < 5) {
    vid = await getVal()
    attempt += 1
    await wait(3000)
  }
  return { validate_pid: vid }
}

const deployHB = async ({ port = 10001 }) => {
  const hbeam = new HyperBEAM({
    bundler_ans104: false,
    //bundler_httpsig: "http://localhost:4001",
  })
  const _bundler = bundler({ jwk: hbeam.jwk })
  await hbeam.ready()
  const hb = `http://localhost:${port}`
  const signer = hbeam.signer
  const jwk = hbeam.jwk
  const dbpath = genDir()
  const node = await server({ dbpath, jwk, hb })
  return { node, hbeam, jwk, hb, bundler: _bundler }
}

describe("Validator", () => {
  let pids = []
  it("should validate HB WAL", async () => {
    const { node, hbeam, jwk, hb, bundler } = await deployHB({})
    const runDB = async () =>
      new Promise(async res => {
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
        console.log("pid", pid)
        const _hb = new HB({ url: "http://localhost:6364", jwk })
        let { nonce } = await setup({ pid, request: _hb })
        const _hbeam = new HB({ jwk, format: "ans104" })
        const { validate_pid: vid, dbpath2 } = await validateDB({
          hbeam: _hbeam,
          pid,
          hb,
          jwk,
        })
        pids.push({ hb: _hbeam, vid })
        await wait(5000)
        const dbpath = genDir()
        const val = await new Validator({
          max_msgs: 23,
          pid,
          jwk,
          dbpath,
          hb,
          vid,
        }).init()
        console.log("length", await get(_hb, ["get", "users"], pid))
        console.log(await val.get())
        console.log(await val.write())
        for (let i of range(0, 100)) {
          await set(
            _hb,
            ["add:user", { name: `Bob-${nonce}` }, "users"],
            ++nonce,
            pid,
          )
        }
        console.log("length", await get(_hb, ["get", "users"], pid))
        await wait(3000)
        console.log(await val.get())
        console.log(await val.write())
        console.log(await val.commit())
        for (let i of range(100, 200)) {
          await set(
            _hb,
            ["add:user", { name: `Bob-${nonce}` }, "users"],
            ++nonce,
            pid,
          )
        }
        console.log("length", await get(_hb, ["get", "users"], pid))
        await wait(3000)
        console.log(await val.get())
        console.log(await val.write())
        console.log(await val.commit())
        res()
      })

    await Promise.all([runDB(), runDB(), runDB()])
    for (let v of pids) {
      const { slot } = await v.hb.schedule({
        pid: v.vid,
        tags: {
          "Data-Protocol": "ao",
          Variant: "ao.TN.1",
          Action: "Query",
          Query: JSON.stringify(["users", 3]),
        },
      })
      const {
        results: { data },
      } = await v.hb.compute({ pid: v.vid, slot })
      assert.deepEqual(data, [
        { name: "Bob-65" },
        { name: "Bob-55" },
        { name: "Bob-56" },
      ])
    }
    await wait(3000)
    //bundler.close()
    node.stop()
    hbeam.kill()
    process.exit()
  })
})
