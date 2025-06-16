import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { spawn } from "child_process"
import { resolve } from "path"
import { wait } from "./test-utils.js"
import { parseSI } from "../src/server-utils.js"
import { connect, createSigner } from "@permaweb/aoconnect"
import { acc } from "wao/test"
import { HB } from "wao"
import { readFileSync } from "fs"

class WDB {
  constructor({ port, jwk, id }) {
    this.id = id
    this.hb = new HB({ url: `http://localhost:${port}`, jwk })
    this.nonce = 0
  }
  async set(...args) {
    const res = await this.hb.send({
      path: "/~weavedb@1.0/set",
      nonce: ++this.nonce,
      id: this.id,
      query: JSON.stringify(args),
    })
    return JSON.parse(res.body).success
  }
  async get(...args) {
    const res = await this.hb.send({
      method: "GET",
      path: "/~weavedb@1.0/get",
      nonce: ++this.nonce,
      id: this.id,
      query: JSON.stringify(args),
    })
    return JSON.parse(res.body).res.state.read_result
  }
}
const run = async (port, num) => {
  const ru = spawn(
    "cargo",
    ["run", "--", "server", "--port", port, "--db-path", `.db/${num}`],
    {
      cwd: resolve(import.meta.dirname, "../../rollup"),
    },
  )
  ru.stdout.on("data", chunk => console.log(`stdout: ${chunk}`))
  ru.stderr.on("data", err => console.error(`stderr: ${err}`))
  ru.on("error", err => console.error(`failed to start process: ${err}`))
  ru.on("close", code => console.log(`child process exited with code ${code}`))
  await wait(2000)
  return ru
}

describe("Rollup", () => {
  it.only("should run rollup server", async () => {
    const id = "test"
    const num = Math.floor(Math.random() * 1000000)
    const port = 4000
    const ru = await run(port, num)
    const wdb = new WDB({ port: 4000, jwk: acc[0].jwk, id: "test" })
    await wdb.set("init", "_", { id, owner: acc[0].addr })
    let i = 0
    while (i < 10) {
      await wdb.set("set", { name: "Bob" + i, age: i }, "users", "bob" + i)
      i++
    }
    assert.deepEqual(await wdb.get("get", "users", "bob1"), {
      name: "Bob1",
      age: 1,
    })
    ru.kill()
  })
})
