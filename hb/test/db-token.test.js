import assert from "assert"
import { afterEach, after, describe, it, before, beforeEach } from "node:test"
import { wait, HyperBEAM } from "wao/test"
import { HB, AO } from "wao"

const src_data = `
local count = 2
Handlers.add("Inc2", "Inc2", function (msg)
  msg.reply({ Data = tostring(count) })
end)

Handlers.add("Inc", "Inc", function (msg)
  local data = Send({ Target = ao.id, Action = "Inc2" }).receive().Data
  count = count + tonumber(data)
  msg.reply({ Data = "Count: "..tostring(count) })
end)

Handlers.add("Get", "Get", function (msg)
  msg.reply({ Data = "Count: "..tostring(count) })
end)`

describe("HyperBEAM", () => {
  let hbeam = null
  let hb = null
  before(async () => {
    hbeam = new HyperBEAM({
      reset: true,
      faff: [HyperBEAM.OPERATOR],
      bundler_ans104: false,
      //bundler_httpsig: "http://localhost:4001",
    })
    await hbeam.ready()
    hb = hbeam.hb
  })
  after(async () => hbeam.kill())

  it.only("should run lagacynet CU", async () => {
    const ao = await new AO({ hb: "ans104" }).init(hbeam.jwk)
    const { pid, p } = await ao.deploy({ src_data })
    await p.msg("Inc")
    const { out } = await p.msg("Get")
    console.log(out)
  })
})
