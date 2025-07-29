import assert from "assert"
import * as lancedb from "@lancedb/lancedb"
import "@lancedb/lancedb/embedding/transformers"
import { LanceSchema, getRegistry, register } from "@lancedb/lancedb/embedding"
import { createPrivateKey } from "node:crypto"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import vec from "../src/vec.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO, HB } from "wao"
import validate from "../src/validate.js"
import {
  set,
  get,
  init_query,
  wait,
  sign,
  deployHB,
  genDir,
} from "./test-utils.js"
import { open } from "lmdb"
import { Utf8 } from "apache-arrow"
import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"

import kv from "../src/kv_vec.js"

const getKV = async _vec => {
  const rand = Math.floor(Math.random() * 100000)
  const io = open({ path: `.db/kv.${rand}` })
  return kv(io, _vec, c => {})
}
const ibm = "IBM's Watson won Jeopardy! in 2011."
const facts = [
  "The capital of France is Paris.",
  "The Great Wall of China is one of the Seven Wonders of the World.",
  "Python is a popular programming language.",
  "Mount Everest is the highest mountain in the world.",
  "Leonardo da Vinci painted the Mona Lisa.",
  "Shakespeare wrote Hamlet.",
  "The human body has 206 bones.",
  "The speed of light is approximately 299,792 kilometers per second.",
  "Water boils at 100 degrees Celsius.",
  "The Earth orbits the Sun.",
  "The Pyramids of Giza are located in Egypt.",
  "Coffee is one of the most popular beverages in the world.",
  "Tokyo is the capital city of Japan.",
  "Photosynthesis is the process by which plants make their food.",
  "The Pacific Ocean is the largest ocean on Earth.",
  "Mozart was a prolific composer of classical music.",
  "The Internet is a global network of computers.",
  "Basketball is a sport played with a ball and a hoop.",
  "The first computer virus was created in 1983.",
  "Deep learning is a subset of machine learning.",
  ibm,
  "The first computer programmer was Ada Lovelace.",
  "The first chatbot was ELIZA, created in the 1960s.",
].map(text => ({ text }))
const facts2 = [
  { text: "Albert Einstein was a theoretical physicist." },
  { text: "Artificial neural networks are inspired by the human brain." },
]

const setup = async ({ pid, request }) => {
  let nonce = 0
  const json0 = await set(request, ["init", init_query], ++nonce, pid)
  await wait(1000)
  const json = await set(
    request,
    ["createTable", "vectors", facts],
    ++nonce,
    pid,
  )
  await wait(1000)
  const json2 = await set(request, ["add", "vectors", facts2], ++nonce, pid)
  await wait(1000)
  const json3 = await get(request, ["search", "vectors", "who won?", 1], pid)
  assert.deepEqual(json3.res[0].text, ibm)
  return { nonce }
}

const validateDB = async ({ hbeam, pid, hb, jwk }) => {
  const { pid: validate_pid } = await hbeam.spawn({
    "execution-device": "weavedb@1.0",
    db: pid,
  })
  await wait(5000)
  const dbpath2 = genDir()
  await validate({ pid, hb, dbpath: dbpath2, jwk, validate_pid, type: "vec" })
  await wait(5000)
  const { slot } = await hbeam.schedule({
    pid: validate_pid,
    tags: {
      Action: "Query",
      Query: JSON.stringify(["search", "vectors", "who won?", 1]),
    },
  })
  const {
    results: { data },
  } = await hbeam.compute({ pid: validate_pid, slot })
  assert.deepEqual(data[0].text, ibm)
  return { validate_pid, dbpath2 }
}

describe("WeaveVec", () => {
  it("should test LanceDB features", async () => {
    const rand = Math.floor(Math.random() * 100000)
    const db = await lancedb.connect(`.db/vec.${rand}`)
    const func = await getRegistry().get("huggingface")?.create()
    const factsSchema = LanceSchema({
      text: func.sourceField(new Utf8()),
      vector: func.vectorField(),
    })

    const tbl = await db.createTable("facts", facts, {
      mode: "overwrite",
      schema: factsSchema,
    })
    await tbl.add(facts2)
    const q = async txt => (await tbl.search(txt).limit(1).toArray())[0].text
    assert.equal(
      await q("who loves theories and physics?"),
      "Albert Einstein was a theoretical physicist.",
    )
    assert.equal(
      await q("what is bell used for?"),
      "Basketball is a sport played with a ball and a hoop.",
    )
    assert.equal(await q("who won?"), ibm)
  })

  it("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "myvec" })
    const rand = Math.floor(Math.random() * 100000)
    const _vec = await lancedb.connect(`.db/vec.${rand}`)
    const db = await vec(await getKV(_vec))
      .write(await s.sign("init", init_query))
      .pwrite(await s.sign("createTable", "vectors", facts))
      .pwrite(await s.sign("add", "vectors", facts2))
    assert.equal((await db.search("vectors", "who won?", 1).val())[0].text, ibm)
  })

  it("should validate HB WAL", async () => {
    const { node, pid, hbeam, jwk, hb } = await deployHB({
      port: 10005,
      type: "vec",
    })
    const _hb = new HB({ url: "http://localhost:6364", jwk })
    let { nonce } = await setup({ pid, request: _hb })
    const { validate_pid, dbpath2 } = await validateDB({
      hbeam: hbeam.hb,
      pid,
      hb,
      jwk,
    })
    node.stop()
    hbeam.kill()
  })
})
