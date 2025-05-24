import assert from "assert"
import * as lancedb from "@lancedb/lancedb"
import "@lancedb/lancedb/embedding/transformers"
import { LanceSchema, getRegistry, register } from "@lancedb/lancedb/embedding"
import { createPrivateKey } from "node:crypto"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import vec from "../src/vec.js"
import { last, init, clone, map, pluck, prop, slice } from "ramda"
import { connect, createSigner } from "@permaweb/aoconnect"
import { AO } from "wao"
import { init_query, wait, sign } from "./test-utils.js"
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
  "IBM's Watson won Jeopardy! in 2011.",
  "The first computer programmer was Ada Lovelace.",
  "The first chatbot was ELIZA, created in the 1960s.",
].map(text => ({ text }))
const facts2 = [
  { text: "Albert Einstein was a theoretical physicist." },
  { text: "Artificial neural networks are inspired by the human brain." },
]
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
    assert.equal(await q("who won?"), "IBM's Watson won Jeopardy! in 2011.")
  })

  it.only("should init", async () => {
    const { jwk, addr } = await new AO().ar.gen()
    const s = new sign({ jwk, id: "myvec" })
    const rand = Math.floor(Math.random() * 100000)
    const _vec = await lancedb.connect(`.db/vec.${rand}`)
    const db = await vec(await getKV(_vec))
      .write(await s.sign("init", init_query))
      .pwrite(await s.sign("createTable", "vectors", facts))
      .pwrite(await s.sign("add", "vectors", facts2))
    assert.equal(
      (await db.search("vectors", "who won?", 1))[0].text,
      "IBM's Watson won Jeopardy! in 2011.",
    )
    //console.log(await db.vectorSearch("vectors", [0.1, 0.3], 2))
    //console.log(await db.query("vectors", "price <= 10"))
  })
})
