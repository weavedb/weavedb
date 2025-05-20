import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { spawn } from "child_process"
import { resolve } from "path"
import { wait } from "./test-utils.js"
import { parseSI } from "../src/server-utils.js"
import { connect, createSigner } from "@permaweb/aoconnect"
import { acc } from "wao/test"
import { readFileSync } from "fs"

const run = async (port, num) => {
  const ru = spawn(
    "cargo",
    ["run", "--", "--port", port, "--db", `.db/${num}`],
    {
      cwd: resolve(import.meta.dirname, "../../rollup"),
    },
  )
  ru.stdout.on("data", chunk => console.log(`stdout: ${chunk}`))
  ru.stderr.on("data", err => console.error(`stderr: ${err}`))
  ru.on("error", err => console.error(`failed to start process: ${err}`))
  ru.on("close", code => console.log(`child process exited with code ${code}`))
  await wait(2000)
}
const get = async (port, json) => {
  return await fetch(`http://localhost:${port}/kv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  }).then(r => r.json())
}
const post = async (port, json) => {
  const signer = createSigner(acc[0].jwk)
  const { request } = connect({
    MODE: "mainnet",
    URL: `http://localhost:${port}`,
    device: "",
    signer,
  })
  const res = await request({
    method: "POST",
    path: "/query",
    query: JSON.stringify(json),
  })
  return JSON.parse(res.body)
}
describe("Rollup", () => {
  it.only("should run rollup server", async () => {
    const num = Math.floor(Math.random() * 1000000)
    const port = 4011
    await run(port, num)
    assert.deepEqual(
      await post(port, { op: "put", key: "bob", value: "Bob" }),
      { result: null, message: "ok" },
    )
    assert.deepEqual(await get(port, { op: "get", key: "bob" }), {
      result: "Bob",
      message: "ok",
    })
    assert.deepEqual(await post(port, { op: "del", key: "bob" }), {
      result: null,
      message: "ok",
    })
    assert.deepEqual(await get(port, { op: "get", key: "bob" }), {
      result: null,
      message: "ok",
    })
    assert.deepEqual(
      await post(port, { op: "hello", key: "bob", value: "Bob" }),
      { result: null, message: "ok" },
    )
    await get(port, { op: "close" })
    await wait(2000)
    const port2 = 4005
    await run(port2, num)
    assert.deepEqual(await get(port2, { op: "get", key: "bob" }), {
      result: "Hello, Bob!",
      message: "ok",
    })
    await get(port2, { op: "close" })
  })

  it.only("should verify http message signatures", async () => {
    const num = Math.floor(Math.random() * 1000000)
    const port = 5000
    await run(port, num)
    const signer = createSigner(acc[0].jwk)
    const { request } = connect({
      MODE: "mainnet",
      URL: `http://localhost:${port}`,
      device: "",
      signer,
    })
    const res = await request({
      method: "POST",
      path: "/query",
      query: JSON.stringify({ op: "verify" }),
    })
    assert.equal(JSON.parse(res.body).result, "signature verified")
    await post(port, { op: "close" })
  })
})
