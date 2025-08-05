import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { of, pof, ka, pka, dev, pdev, opt, popt } from "../src/monade.js"

const wait = ms => new Promise(res => setTimeout(() => res(true), ms))

describe("Monade Test Suite", () => {
  it("should handle monad", () => {
    const calc = dev({
      add: (n, n2) => n + n2,
      mul: (n, n2) => n * n2,
      sum: (n, ...nums) => nums.reduce((acc, n2) => acc + n2, n),
    })
    assert.equal(calc(3).add(2).mul(3).sum(1, 2, 3).val(), 21)
  })

  it("should handle async monad", async () => {
    const inc = async n => (await wait(100)) && n + 1
    const double = n => n * 2
    const square = async n => (await wait(100)) && n * n
    const calc = pof(3).map(inc).map(double).map(square)
    const val = await calc.val() // => 64

    const ka = pka().map(inc).map(double).map(square)
    const val2 = await pof(3).chain(ka.fn()).val() // => 64

    const calc2 = pdev({
      add: async (ctx, n2) => (await wait(100)) && ctx + n2,
      mul: (ctx, n2) => ctx * n2,
      sum: async (ctx, ...nums) =>
        (await wait(100)) && nums.reduce((acc, n2) => acc + n2, ctx),
    })
    const val3 = await calc2(3).add(2).mul(3).sum(1, 2, 3).val() // => 21
  })
})
