import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { of, pof, ka, pka, dev, pdev, opt, popt } from "../src/monade.js"
import { flow, pflow } from "../src/flow.js"
const wait = ms => new Promise(res => setTimeout(() => res(true), ms))

describe("Monade Test Suite", () => {
  it.only("should compose dev", () => {
    const add = (ctx, num, num2) => (ctx + num) * num2
    const mydev = dev({ add })
    assert.equal(mydev().add(3, 5).k(4).val(), 35)
    assert.equal(mydev().add(3, 4).k(4).val(), 28)
  })

  it("should branch flow", async () => {
    const inc = async n => n + 1
    const ka1 = pka()
    const ka2 = ka1.map(inc)
    const ka3 = ka1.map(inc)
    const ka4 = ka1.map(inc).chain(ka2.k)
    console.log(await ka2.k(1).val())
    console.log(await ka3.k(1).val())
    console.log(await ka4.k(1).val())
  })
  it("should branch flow", async () => {
    const inc = async n => n + 1
    const inc10 = n => n + 10
    const ka1 = ka().map(inc)
    const ka10 = ka().map(inc10)
    const pred = (mod, devs) => (Math.random() > 0.5 ? devs.main : devs.sub)
    const flw = await pflow(
      [
        ka1,
        {
          main: [ka1, ka1],
          sub: [
            ka1,
            ka1,
            ka1,
            { $pred: (k, devs) => devs.sub, main: [ka1, ka1], sub: [ka1] },
          ],
        },
        ka10,
      ],
      pred,
    )
    console.log(await flw.k(3).val())
  })

  it("should handle pka", async () => {
    const pdouble = async n => n * 2
    const arr = pka().map(pdouble)
    assert.equal(await arr.k(3).val(), 6)
  })
  it("should compose dev", () => {
    const add = (ctx, num, num2) => {
      return (ctx + num) * num2
    }
    const mydev = dev({ add })
    const calc = mydev().add(3, 5)
    assert.equal(calc.k(4).val(), 35)
  })
  it("should handle monad", () => {
    const calc = dev({
      add: (n, n2) => n + n2,
      mul: (n, n2) => n * n2,
      sum: (n, ...nums) => nums.reduce((acc, n2) => acc + n2, n),
    })
    assert.equal(calc().add(2).mul(3).sum(1, 2, 3).k(3).val(), 21)
  })

  it("should handle async monad", async () => {
    const inc = async n => (await wait(100)) && n + 1
    const double = n => n * 2
    const square = async n => (await wait(100)) && n * n
    const calc = pof(3).map(inc).map(double).map(square)
    const val = await calc.val() // => 64
    const ka = pka().map(inc).map(double).map(square)
    const val2 = await pof(3).chain(ka.k).val() // => 64
    const calc2 = pdev({
      add: async (ctx, n2) => (await wait(100)) && ctx + n2,
      mul: (ctx, n2) => ctx * n2,
      sum: async (ctx, ...nums) =>
        (await wait(100)) && nums.reduce((acc, n2) => acc + n2, ctx),
    })
    const val3 = await calc2().add(2).mul(3).sum(1, 2, 3).k(3).val() // => 21
  })
})
