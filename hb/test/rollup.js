import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { spawn } from "child_process"
import { resolve } from "path"
import { wait } from "./test-utils.js"

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
const post = async (port, json) => {
  return await fetch(`http://localhost:${port}/kv`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  }).then(r => r.json())
}
describe("Rollup", () => {
  it.only("should run rollup server", async () => {
    const num = Math.floor(Math.random() * 1000000)
    const port = 4003
    await run(port, num)
    assert.deepEqual(
      await post(port, { op: "put", key: "bob", value: "Bob" }),
      { result: null, message: "ok" },
    )
    assert.deepEqual(await post(port, { op: "get", key: "bob" }), {
      result: "Bob",
      message: "ok",
    })
    assert.deepEqual(await post(port, { op: "del", key: "bob" }), {
      result: null,
      message: "ok",
    })
    assert.deepEqual(await post(port, { op: "get", key: "bob" }), {
      result: null,
      message: "ok",
    })
    assert.deepEqual(
      await post(port, { op: "hello", key: "bob", value: "Bob" }),
      { result: null, message: "ok" },
    )
    await post(port, { op: "close" })
    await wait(2000)
    const port2 = 4005
    await run(port2, num)
    assert.deepEqual(await post(port2, { op: "get", key: "bob" }), {
      result: "Hello, Bob!",
      message: "ok",
    })
    await post(port2, { op: "close" })
  })
})
