import assert from "assert"
import { before, after, describe, it } from "node:test"
import db_async from "../../core/src/db_async.js"
import { queue, kv, io } from "../../core/src/index.js"
import { ka, pka, pof, of } from "monade"
describe("Validator", () => {
  it.only("should run async build", async () => {
    const calc = async n => n * 2
    const calc2 = async n => n * 2
    const ar = pka().map(calc).map(calc2)
    console.log(await pof(3).chain(ar.fn()).val())
    const wkv = kv(io())
    const db = db_async(wkv, () => {})
    const q = queue(db)
    //console.log("ans", await db.pwrite(3).val())
    console.log("ans", await q.pwrite(3))
  })
})
