import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { resolve } from "path"
import { readFileSync } from "fs"
import { spawn } from "child_process"
import { map, mergeLeft } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { createSigner as createHttpSigner } from "http-message-signatures"

const wait = ms => new Promise(res => setTimeout(() => res(), ms))

const env = {
  //DIAGNOSTIC: "1",
  CMAKE_POLICY_VERSION_MINIMUM: "3.5",
  CC: "gcc-12",
  CXX: "g++-12",
}

const devmap = {
  flat: { dev: "codec_flat" },
  structured: { dev: "codec_structured" },
  json: { dev: "codec_json" },
  httpsig: { dev: "codec_httpsig" },
  greenzone: { dev: "green_zone" },
  "local-name": { dev: "local_name" },
  "genesis-wasm": { dev: "genesis_wasm" },
  "json-iface": { dev: "json_iface" },
  "node-process": { dev: "node_process" },
  "simple-pay": { dev: "simple_pay" },
  "delegated-compute": { dev: "delegated_compute" },
  "test-device": { dev: "test" },
  "wasm-64": { dev: "wasm" },
  lua: { ver: "5.3a" },
  ans104: { dev: "codec_ans104" },
}

class HB {
  constructor({
    env,
    port = 10001,
    devs,
    cwd = "../../HyperBEAM",
    wallet = ".wallet.json",
  }) {
    this.port = port
    const _eval = !devs
      ? `hb:start_mainnet(#{ port => ${port}, priv_key_location => <<"${wallet}">>}).`
      : `hb:start_mainnet(#{ port => ${port}, priv_key_location => <<"${wallet}">>, preloaded_devices => [${map(
          v => {
            return `#{<<"name">> => <<"${v}@${devmap[v]?.ver ?? "1.0"}">>, <<"module">> => dev_${devmap[v]?.dev ?? v}}`
          },
        )(devs).join(", ")}] }).`
    this.hb = spawn("rebar3", ["shell", "--eval", _eval], {
      env: {
        ...process.env,
        ...env,
      },
      cwd: resolve(import.meta.dirname, cwd),
    })
    this.hb.stdout.on("data", chunk => console.log(`stdout: ${chunk}`))
    this.hb.stderr.on("data", err => console.error(`stderr: ${err}`))
    this.hb.on("error", err => console.error(`failed to start process: ${err}`))
    this.hb.on("close", code =>
      console.log(`child process exited with code ${code}`),
    )
    const jwk = JSON.parse(
      readFileSync(resolve(import.meta.dirname, cwd, wallet), "utf8"),
    )
    const signer = createSigner(jwk)
    const { request } = connect({
      MODE: "mainnet",
      URL: `http://localhost:${port}`,
      device: "",
      signer,
    })
    this.request = request
  }
  async info() {
    const _info = await this.fetch("/~meta@1.0/info")
    this.address = _info.address
    return _info
  }
  async spawn({ tags = {} }) {
    if (!this.address) await this.info()
    const _tags = mergeLeft(tags, {
      method: "POST",
      path: "/~process@1.0/schedule",
      scheduler: this.address,
      "random-seed": Math.random().toString(),
      "execution-device": "weavedb@1.0",
    })
    return await this.request(_tags)
  }
  async message({ pid, tags = {} }) {
    if (!this.address) await this.info()
    const _tags = mergeLeft(tags, {
      method: "POST",
      path: `/${pid}/schedule`,
      scheduler: this.address,
    })
    console.log(_tags)
    return await this.request(_tags)
  }
  async fetch(path, { json = true, params = "" } = {}) {
    return await fetch(
      `http://localhost:${this.port}${path}${json ? "/serialize~json@1.0" : ""}${params}`,
    ).then(r => r[json ? "json" : "text"]())
  }
  async now(pid) {
    return await this.fetch(`/${pid}~process@1.0/now`)
  }
  async compute(pid, slot) {
    return await this.fetch(`/${pid}~process@1.0/compute`, {
      params: `?slot=${slot}`,
    })
  }
  stop() {
    this.hb.kill("SIGINT")
  }
}
let devices = [
  "ans104",
  "compute",
  "cache",
  "cacheviz",
  "cron",
  "dedup",
  "delegated-compute",
  "faff",
  "genesis-wasm",
  "greenzone",
  "hyperbuddy",
  "json",
  "json-iface",
  "local-name",
  "lookup",
  "lua",
  "manifest",
  "message",
  "monitor",
  "multipass",
  "name",
  "node-process",
  "p4",
  "patch",
  "poda",
  "process",
  "push",
  "relay",
  "router",
  "scheduler",
  "simple-pay",
  "snp",
  "stack",
  "test-device",
  "volume",
  "wasi",
  "wasm-64",
  "httpsig",
  "meta",
  "flat",
  "structured",
]

describe("HyperBEAM | dev_weavedb", () => {
  it.only("should spawn a process and compute", async () => {
    const hb = new HB({
      cwd: "../../HyperBEAM",
      env,
      port: 10002,
    })
    await wait(5000)
    const { process: pid } = await hb.spawn({ tags: { plus: "2" } })
    const { slot } = await hb.message({ pid, tags: { plus: "3" } })
    console.log(await hb.now(pid))
    console.log(await hb.compute(pid, 0))
    hb.stop()
  })
})
