import assert from "assert"
import { repeat } from "ramda"
import { describe, it } from "node:test"
import server from "../src/server.js"
import { Validator } from "../src/validate.js"
import CU from "../src/cu.js"
import { HyperBEAM } from "wao/test"
//import { DB } from "wdb-sdk"
import { DB } from "../../sdk/src/index.js"
import { wait, genDir } from "./test-utils.js"
import { HB } from "wao"

const vspawn = async ({ pid: db, jwk }) => {
  const vhb = new HB({ jwk, format: "ans104" })
  let vid = null
  let i = 0
  do vid = (await vhb.spawn({ "execution-device": "weavedb@1.0", db })).pid
  while (!vid && ++i < 5 && (await wait(3000)))
  return { vhb, vid }
}

const vget = async (vhb, pid, q) => {
  const tags = { Action: "Query", Query: JSON.stringify(q) }
  return (await vhb.message({ pid, tags })).res.results.data
}

describe("Validator", () => {
  it("should validate HB WAL", async () => {
    const os = await new HyperBEAM({ bundler_ans104: false }).ready()
    const jwk = os.jwk
    const node = await server({ dbpath: genDir(), jwk })
    const db = new DB({ jwk })
    const pid = await db.spawn()
    await db.mkdir({
      name: "users",
      auth: [["add:user,update:user,del:user", [["allow()"]]]],
    })
    await db.set("add:user", { name: "Bob", age: 23 }, "users")
    await db.set("add:user", { name: "Alice", age: 30 }, "users")
    // Example usage:
    for (let i = 0; i < 1000; i++) {
      const user = generateRandomUser()
      await db.set("add:user", user, "users")
    }
    const { vhb, vid } = await vspawn({ pid, jwk })
    const val = await new Validator({ pid, jwk, dbpath: genDir(), vid }).init()
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    await db.set("update:user", { age: 35 }, "users", "A")
    await db.set("update:user", { age: { _$: "del" } }, "users", "B")
    await db.addIndex([["name"], ["age"]], "users")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    await db.set("del:user", "users", "B")
    ;(await wait(3000), await val.get(), await val.write())
    ;(await wait(3000), await val.commit())
    const cu = await CU({ pid: vid, dbpath: genDir(), jwk })
    await wait(5000)
    console.log("vid", await vget(vhb, vid, ["users", 10]))
    ;(node.stop(), os.kill(), cu.server.close(), process.exit())
  })
})

function randomString(minLen, maxLen) {
  const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
    // Add spaces occasionally for readability
    if (i > 0 && i % 15 === 0 && Math.random() > 0.5) {
      result += " "
    }
  }
  return result.trim()
}

function randomWord() {
  const words = [
    "user",
    "admin",
    "member",
    "guest",
    "moderator",
    "developer",
    "manager",
    "analyst",
    "designer",
    "engineer",
    "consultant",
  ]
  return words[Math.floor(Math.random() * words.length)]
}

function randomName() {
  const first = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
  ]
  const last = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
  ]
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomBoolean() {
  return Math.random() > 0.5
}

function randomArray(minItems, maxItems, generator) {
  const len = randomInt(minItems, maxItems)
  return Array.from({ length: len }, generator)
}

function generateRandomUser() {
  const userType = Math.random()

  // 40% - Small simple users
  if (userType < 0.4) {
    return {
      name: randomName(),
      age: randomInt(18, 75),
      role: randomWord(),
      id: randomInt(10000, 99999),
    }
  }

  // 35% - Medium users
  if (userType < 0.75) {
    return {
      username: randomString(6, 12),
      name: randomName(),
      email: `${randomString(5, 10)}@example.com`,
      age: randomInt(18, 75),
      active: randomBoolean(),
      score: randomInt(0, 1000),
      role: randomWord(),
      tags: randomArray(1, 3, () => randomWord()),
    }
  }

  // 20% - Larger users with descriptions
  if (userType < 0.95) {
    return {
      id: randomString(15, 25),
      username: randomString(6, 12),
      name: randomName(),
      bio: randomString(50, 120),
      age: randomInt(18, 75),
      role: randomWord(),
      active: randomBoolean(),
      metadata: {
        department: randomWord(),
        level: randomInt(1, 10),
        certified: randomBoolean(),
      },
      preferences: {
        theme: ["dark", "light"][randomInt(0, 1)],
        notifications: randomBoolean(),
        language: ["en", "es", "fr"][randomInt(0, 2)],
      },
      tags: randomArray(2, 4, () => randomWord()),
    }
  }

  // 5% - Large detailed users
  return {
    id: randomString(20, 30),
    username: randomString(8, 15),
    name: randomName(),
    email: `${randomString(5, 10)}@example.com`,
    bio: randomString(80, 150),
    description: randomString(100, 250),
    age: randomInt(18, 75),
    role: randomWord(),
    experience: randomInt(0, 20),
    active: randomBoolean(),
    verified: randomBoolean(),
    metadata: {
      department: randomWord(),
      level: randomInt(1, 10),
      certified: randomBoolean(),
      joined: Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000),
    },
    skills: randomArray(2, 5, () => randomWord()),
    projects: randomArray(1, 3, () => ({
      name: randomString(10, 20),
      status: ["active", "completed", "pending"][randomInt(0, 2)],
      progress: randomInt(0, 100),
    })),
  }
}
