// monade.test.js - Comprehensive test suite using node:test
import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { of, pof, ka, pka, dev, pdev, opt, popt } from "../src/monade.js"

describe("Monade Test Suite", () => {
  describe("Core Monads", () => {
    describe("of (sync monad)", () => {
      it("should wrap a value", () => {
        const m = of(5)
        assert.equal(m.val(), 5)
        assert.equal(m.__monad__, true)
      })

      it("should map values", () => {
        const result = of(5)
          .map(x => x * 2)
          .val()
        assert.equal(result, 10)
      })

      it("should chain map operations", () => {
        const result = of(5)
          .map(x => x * 2)
          .map(x => x + 3)
          .map(x => x / 2)
          .val()
        assert.equal(result, 6.5)
      })

      it("should handle tap without changing value", () => {
        let sideEffect = 0
        const result = of(5)
          .tap(x => {
            sideEffect = x * 2
          })
          .map(x => x + 1)
          .val()
        assert.equal(result, 6)
        assert.equal(sideEffect, 10)
      })

      it("should chain monadic functions", () => {
        const double = x => of(x * 2)
        const addTen = x => of(x + 10)

        const result = of(5).chain(double).chain(addTen).val()
        assert.equal(result, 20)
      })

      it("should extract with to()", () => {
        const result = of(5)
          .map(x => x * 2)
          .to(x => `Result: ${x}`)
        assert.equal(result, "Result: 10")
      })

      it("should work with objects", () => {
        const result = of({ name: "John", age: 30 })
          .map(user => ({ ...user, age: user.age + 1 }))
          .map(user => ({ ...user, name: user.name.toUpperCase() }))
          .val()
        assert.deepEqual(result, { name: "JOHN", age: 31 })
      })

      it("should work with arrays", () => {
        const result = of([1, 2, 3])
          .map(arr => arr.map(x => x * 2))
          .map(arr => arr.filter(x => x > 2))
          .val()
        assert.deepEqual(result, [4, 6])
      })

      it("should throw on invalid chain", () => {
        assert.throws(() => of(5).chain(x => x * 2), /fn must return monad/)
      })
    })

    describe("pof (async monad)", () => {
      it("should wrap a value in promise", async () => {
        const m = pof(5)
        assert.equal(await m.val(), 5)
        assert.equal(m.__monad__, true)
      })

      it("should wrap an existing promise", async () => {
        const promise = Promise.resolve(5)
        const m = pof(promise)
        assert.equal(await m.val(), 5)
      })

      it("should map async values", async () => {
        const result = await pof(5)
          .map(x => x * 2)
          .val()
        assert.equal(result, 10)
      })

      it("should chain async operations", async () => {
        const result = await pof(5)
          .map(x => x * 2)
          .map(x => x + 3)
          .val()
        assert.equal(result, 13)
      })

      it("should handle async tap", async () => {
        let sideEffect = 0
        const result = await pof(5)
          .tap(x => {
            sideEffect = x * 2
          })
          .map(x => x + 1)
          .val()
        assert.equal(result, 6)
        assert.equal(sideEffect, 10)
      })

      it("should chain async monadic functions", async () => {
        const fetchDouble = x => pof(x * 2)
        const fetchAddTen = x => pof(x + 10)

        const result = await pof(5).chain(fetchDouble).chain(fetchAddTen).val()
        assert.equal(result, 20)
      })

      it("should extract with async to()", async () => {
        const result = await pof(5)
          .map(x => x * 2)
          .to(x => `Result: ${x}`)
        assert.equal(result, "Result: 10")
      })

      it("should handle async functions in map", async () => {
        const result = await pof(5)
          .map(async x => x * 2)
          .map(async x => x + 3)
          .val()
        assert.equal(result, 13)
      })

      it("should handle promise rejection", async () => {
        const m = pof(Promise.reject(new Error("Test error")))
        await assert.rejects(m.val(), /Test error/)
      })
    })
  })

  describe("Kleisli Arrows", () => {
    describe("ka (sync arrows)", () => {
      it("should create identity arrow", () => {
        const arrow = ka()
        const result = arrow(5).val()
        assert.equal(result, 5)
      })

      it("should build function pipeline", () => {
        const arrow = ka()
          .map(x => x * 2)
          .map(x => x + 10)

        const result = arrow(5).val()
        assert.equal(result, 20)
      })

      it("should convert to function with fn()", () => {
        const arrow = ka().map(x => x * 2)
        const fn = arrow.fn()

        assert.equal(typeof fn, "function")
        assert.equal(fn(5).val(), 10)
      })

      it("should handle tap in arrow", () => {
        let sideEffect = 0
        const arrow = ka()
          .tap(x => {
            sideEffect = x
          })
          .map(x => x * 2)

        const result = arrow(5).val()
        assert.equal(result, 10)
        assert.equal(sideEffect, 5)
      })

      it("should chain other arrows", () => {
        const double = ka().map(x => x * 2)
        const addTen = ka().map(x => x + 10)

        const combined = double.chain(addTen)
        const result = combined(5).val()
        assert.equal(result, 20)
      })

      it("should chain monadic functions in arrow", () => {
        const arrow = ka()
          .chain(x => of(x * 2))
          .chain(x => of(x + 10))

        const result = arrow(5).val()
        assert.equal(result, 20)
      })

      it("should be reusable", () => {
        const arrow = ka().map(x => x * 2)

        assert.equal(arrow(5).val(), 10)
        assert.equal(arrow(10).val(), 20)
        assert.equal(arrow(15).val(), 30)
      })

      it("should work with of().chain()", () => {
        const arrow = ka()
          .map(x => x * 2)
          .fn()
        const result = of(5).chain(arrow).val()
        assert.equal(result, 10)
      })

      it("should prevent direct chaining without fn()", () => {
        const arrow = ka().map(x => x * 2)
        assert.throws(() => of(5).chain(arrow), /Cannot chain arrow directly/)
      })
    })

    describe("pka (async arrows)", () => {
      it("should create async identity arrow", async () => {
        const arrow = pka()
        const result = await arrow(5).val()
        assert.equal(result, 5)
      })

      it("should build async function pipeline", async () => {
        const arrow = pka()
          .map(x => x * 2)
          .map(x => x + 10)

        const result = await arrow(5).val()
        assert.equal(result, 20)
      })

      it("should handle async operations", async () => {
        const arrow = pka()
          .chain(x => pof(x * 2))
          .map(x => x + 10)

        const result = await arrow(5).val()
        assert.equal(result, 20)
      })

      it("should chain other async arrows", async () => {
        const fetchDouble = pka().chain(x => pof(x * 2))
        const fetchAddTen = pka().chain(x => pof(x + 10))

        const combined = fetchDouble.chain(fetchAddTen)
        const result = await combined(5).val()
        assert.equal(result, 20)
      })

      it("should work with pof().chain()", async () => {
        const arrow = pka()
          .map(x => x * 2)
          .fn()
        const result = await pof(5).chain(arrow).val()
        assert.equal(result, 10)
      })
    })
  })

  describe("Devices", () => {
    describe("dev (sync device)", () => {
      it("should create device with custom methods", () => {
        const mathDev = dev({
          double: x => x * 2,
          square: x => x * x,
        })

        const device = mathDev(5)
        assert.equal(device.val(), 5)
        assert.equal(device.__device__, true)
      })

      it("should use custom methods", () => {
        const mathDev = dev({
          double: x => x * 2,
          square: x => x * x,
        })

        const result = mathDev(5).double().square().val()
        assert.equal(result, 100)
      })

      it("should pass extra parameters to methods", () => {
        const mathDev = dev({
          add: (x, n) => x + n,
          multiply: (x, n) => x * n,
        })

        const result = mathDev(5).add(10).multiply(3).val()
        assert.equal(result, 45)
      })

      it("should mix custom methods with monad operations", () => {
        const mathDev = dev({
          double: x => x * 2,
        })

        const result = mathDev(5)
          .double()
          .map(x => x + 5)
          .double()
          .val()
        assert.equal(result, 30)
      })

      it("should handle tap", () => {
        let sideEffect = 0
        const mathDev = dev({
          double: x => x * 2,
        })

        const result = mathDev(5)
          .tap(x => {
            sideEffect = x
          })
          .double()
          .val()

        assert.equal(result, 10)
        assert.equal(sideEffect, 5)
      })

      it("should chain monadic functions", () => {
        const userDev = dev({
          capitalize: u => ({ ...u, name: u.name.toUpperCase() }),
        })

        const addAge = u => of({ ...u, age: 30 })

        const result = userDev({ name: "john" })
          .capitalize()
          .chain(addAge)
          .val()

        assert.deepEqual(result, { name: "JOHN", age: 30 })
      })

      it("should convert to monad", () => {
        const mathDev = dev({ double: x => x * 2 })
        const monad = mathDev(5).double().monad()

        assert.equal(monad.__monad__, true)
        assert.equal(monad.val(), 10)
      })

      it("should extract with to()", () => {
        const mathDev = dev({ double: x => x * 2 })
        const result = mathDev(5)
          .double()
          .to(x => `Result: ${x}`)
        assert.equal(result, "Result: 10")
      })

      it("should prevent chaining arrows directly", () => {
        const mathDev = dev({})
        const arrow = ka().map(x => x * 2)

        assert.throws(
          () => mathDev(5).chain(arrow),
          /Cannot chain arrow directly/,
        )
      })

      it("should be reusable", () => {
        const mathDev = dev({
          double: x => x * 2,
          square: x => x * x,
        })

        assert.equal(mathDev(5).double().val(), 10)
        assert.equal(mathDev(3).square().val(), 9)
        assert.equal(mathDev(4).double().square().val(), 64)
      })
    })

    describe("pdev (async device)", () => {
      it("should create async device", async () => {
        const apiDev = pdev({
          withPath: (cfg, path) => ({ ...cfg, path }),
        })

        const result = await apiDev({
          baseUrl: "https://api.example.com",
        }).val()
        assert.deepEqual(result, { baseUrl: "https://api.example.com" })
      })

      it("should handle async custom methods", async () => {
        const apiDev = pdev({
          fetchDouble: async x => x * 2,
          fetchSquare: async x => x * x,
        })

        const result = await apiDev(5).fetchDouble().fetchSquare().val()

        assert.equal(result, 100)
      })

      it("should pass parameters to async methods", async () => {
        const apiDev = pdev({
          fetchAdd: async (x, n) => x + n,
          delay: async (x, ms) => {
            await new Promise(r => setTimeout(r, ms))
            return x
          },
        })

        const result = await apiDev(10).fetchAdd(5).delay(10).val()

        assert.equal(result, 15)
      })

      it("should mix with async monad operations", async () => {
        const apiDev = pdev({
          fetchDouble: async x => x * 2,
        })

        const result = await apiDev(5)
          .fetchDouble()
          .map(x => x + 10)
          .val()

        assert.equal(result, 20)
      })

      it("should chain async monadic functions", async () => {
        const apiDev = pdev({
          fetchDouble: async x => x * 2,
        })

        const fetchTriple = x => pof(x * 3)

        const result = await apiDev(5).fetchDouble().chain(fetchTriple).val()

        assert.equal(result, 30)
      })

      it("should convert to async monad", async () => {
        const apiDev = pdev({ fetchDouble: async x => x * 2 })
        const monad = apiDev(5).fetchDouble().monad()

        assert.equal(monad.__monad__, true)
        assert.equal(await monad.val(), 10)
      })

      it("should be reusable", async () => {
        const apiDev = pdev({
          fetchDouble: async x => x * 2,
          fetchSquare: async x => x * x,
        })

        assert.equal(await apiDev(5).fetchDouble().val(), 10)
        assert.equal(await apiDev(3).fetchSquare().val(), 9)
        assert.equal(await apiDev(4).fetchDouble().fetchSquare().val(), 64)
      })
    })
  })

  describe("Option Handling", () => {
    describe("opt", () => {
      it("should return monad on success", () => {
        const m = of(5)
        const result = opt(m)
        assert.equal(result.val(), 5)
      })

      it("should return of(null) on error", () => {
        const m = {
          __monad__: true,
          val: () => {
            throw new Error("Test error")
          },
        }
        const result = opt(m)
        assert.equal(result.val(), null)
      })
    })

    describe("popt", () => {
      it("should return monad on success", async () => {
        const m = pof(5)
        const result = await popt(m)
        assert.equal(await result.val(), 5)
      })

      it("should return pof(null) on error", async () => {
        const m = pof(Promise.reject(new Error("Test error")))
        const result = await popt(m)
        assert.equal(await result.val(), null)
      })
    })
  })

  describe("Complex Scenarios", () => {
    it("should handle nested monads correctly", () => {
      const result = of(5)
        .chain(x => of(x * 2))
        .chain(x => of(x + 10))
        .chain(x => of(x / 2))
        .val()

      assert.equal(result, 10)
    })

    it("should compose multiple arrows", () => {
      const validate = ka().map(x => {
        if (x < 0) throw new Error("Negative")
        return x
      })

      const double = ka().map(x => x * 2)
      const format = ka().map(x => `Result: ${x}`)

      const pipeline = validate.chain(double.fn()).chain(format.fn())

      const result = pipeline(5).val()
      assert.equal(result, "Result: 10")
    })

    it("should handle async error propagation", async () => {
      const pipeline = pka()
        .chain(x => pof(x))
        .map(x => {
          if (x === 0) throw new Error("Zero not allowed")
          return x
        })
        .map(x => 100 / x)

      const result = await pipeline(5).val()
      assert.equal(result, 20)

      await assert.rejects(pipeline(0).val(), /Zero not allowed/)
    })

    it("should handle device method chaining with state", () => {
      const stateDev = dev({
        increment: s => ({
          count: s.count + 1,
          history: [...s.history, s.count + 1],
        }),
        double: s => ({
          count: s.count * 2,
          history: [...s.history, s.count * 2],
        }),
      })

      const result = stateDev({ count: 0, history: [] })
        .increment()
        .increment()
        .double()
        .val()

      assert.deepEqual(result, {
        count: 4,
        history: [1, 2, 4],
      })
    })

    it("should handle mixed sync/async operations", async () => {
      const syncTransform = ka().map(x => x * 2)
      const asyncFetch = x => pof(x + 10)

      const result = await pof(5)
        .chain(syncTransform.fn())
        .chain(asyncFetch)
        .val()

      assert.equal(result, 20)
    })
  })

  describe("Performance", () => {
    it("should handle long chains efficiently", () => {
      let m = of(1)
      for (let i = 0; i < 1000; i++) {
        m = m.map(x => x + 1)
      }
      assert.equal(m.val(), 1001)
    })

    it("should handle long arrow chains efficiently", () => {
      let arrow = ka()
      for (let i = 0; i < 1000; i++) {
        arrow = arrow.map(x => x + 1)
      }
      assert.equal(arrow(1).val(), 1001)
    })
  })

  describe("Edge Cases", () => {
    it("should handle null values", () => {
      const result = of(null)
        .map(x => x ?? "default")
        .val()
      assert.equal(result, "default")
    })

    it("should handle undefined values", () => {
      const result = of(undefined)
        .map(x => x ?? "default")
        .val()
      assert.equal(result, "default")
    })

    it("should handle empty arrays", () => {
      const result = of([])
        .map(arr => arr.length)
        .val()
      assert.equal(result, 0)
    })

    it("should handle circular references", () => {
      const obj = { a: 1 }
      obj.self = obj

      const result = of(obj)
        .map(o => ({ ...o, a: o.a + 1 }))
        .val()

      assert.equal(result.a, 2)
    })
  })
})
