const { expect } = require("chai")
const { init, stop, initBeforeEach } = require("./util")

describe("WeaveDB", function () {
  let db

  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => await stop())

  beforeEach(async () => await initBeforeEach(false, true))

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  it("should subscribe to state changes with on", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", height: 160 }
    const check = () =>
      new Promise(async res => {
        let count = 0
        const off = await db.on("ppl", async ppl => {
          if (count === 1) {
            expect(await db.get("ppl", "Bob")).to.eql(data)
            await db.set(data2, "ppl", "Bob")
          } else if (count === 2) {
            expect(await db.get("ppl", "Bob")).to.eql(data2)
            res()
          }
          count++
        })
        await db.set(data, "ppl", "Bob")
      })
    await check()
  })

  it("should subscribe to state changes with con", async () => {
    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Alice", height: 160 }
    const check = () =>
      new Promise(async res => {
        let count = 0
        const off = await db.con("ppl", async ppl => {
          if (count === 1) {
            expect(ppl[0].data).to.eql(data)
            await db.set(data2, "ppl", "Bob")
          } else if (count === 2) {
            expect(ppl[0].data).to.eql(data2)
            res()
          }
          count++
        })
        await db.set(data, "ppl", "Bob")
      })
    await check()
  })

  it("should get/cget from cached state", async () => {
    const data = { name: "Bob", age: 20 }
    await db.set(data, "ppl", "Bob")
    const check = () =>
      new Promise(async res => {
        setTimeout(async () => {
          expect(await db.getCache("ppl", "Bob")).to.eql(data)
          expect((await db.cgetCache("ppl", "Bob")).data).to.eql(data)
          res()
        }, 1000)
      })
    expect(await db.get("ppl", "Bob")).to.eql(data)
    await check()
  })
})
