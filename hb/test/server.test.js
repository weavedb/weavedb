import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { of, pof } from "monade"
import { queue, kv, db as wdb } from "../../core/src/index.js"
import { DB } from "../../sdk/src/index.js"
import { open } from "lmdb"
import { resolve } from "path"
import BPT from "../../core/src/bpt.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import server from "../src/server.js"
import recover from "../src/recover.js"
import validate from "../src/validate.js"
import zkjson from "../src/zkjson.js"
import { spawn } from "child_process"
import { readFileSync } from "fs"
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
import {
  put,
  mod,
  del,
  addIndex,
  getIndexes,
  removeIndex,
} from "../../core/src/indexer.js"

import parseQuery from "../../core/src/parser.js"

import {
  range,
  get as planner_get,
  ranges,
  pranges,
  doc,
} from "../../core/src/planner.js"

import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"
import { Server, mu, toAddr } from "wao/test"

describe("Server", () => {
  it.only("should run a server", async () => {
    const hbeam = await new HyperBEAM({}).ready()
    await wait(5000)
    const dbpath = genDir()
    const jwk = hbeam.jwk
    const node = await server({ dbpath, jwk })
    const db = new DB({ jwk })
    const pid = await db.spawn()
    const status = await fetch("http://localhost:6364/status").then(r =>
      r.json(),
    )
    assert.deepEqual(status.processes, [pid])
    await db.admin("remove_db", { id: pid })
    const status2 = await fetch("http://localhost:6364/status").then(r =>
      r.json(),
    )
    assert.deepEqual(status2.processes, [])
    await wait(5000)
    node.stop()
    hbeam.kill()
  })
})
