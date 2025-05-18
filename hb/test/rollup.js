import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { spawn } from "child_process"
import { resolve } from "path"
import { wait } from "./test-utils.js"

const run = async port => {
  const ru = spawn("cargo", ["run", "--", "--port", port], {
    cwd: resolve(import.meta.dirname, "../../rollup"),
  })
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
    const port = 4002
    await run(port)
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
    try {
      await post(port, { op: "close" })
    } catch (e) {
      console.log(e)
    }
  })
})
