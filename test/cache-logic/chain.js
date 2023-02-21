const { Chain } = require("../../sdk/sdk-node/chain")
const { nanoid } = require("nanoid")
describe("WeaveDB chain", function () {
  this.timeout(0)
  let id = 0
  const handle = (state, action) => {
    state.count[action.input.signer] ||= 0
    state.count[action.input.signer] += 1
    return { state }
  }
  const sdk = {
    db: {
      readState: async () => ({ cachedValue: { state: { count: {} } } }),
      dryWrite: async param => {
        return { type: "ok" }
      },
      bundleInteraction: async param => {
        return {
          originalTxId: await nanoid(),
        }
      },
    },
  }
  const str = "abcde".split("")
  const txtypes = ["virtual", "drywrite", "warp"]
  let nonces = {}
  const signer = () => str[Math.floor(Math.random() * str.length)]
  const txtype = () => txtypes[Math.floor(Math.random() * txtypes.length)]
  const nonce = signer => {
    nonces[signer] ||= 0
    return ++nonces[signer]
  }
  it("should instantiate chain", async () => {
    const validate = param => param.signer
    const chain = new Chain({ cid: "testid", validate, handle })
    await chain.init(sdk)
    for (let i = 0; i < 10; i++) {
      const _signer = signer()
      await chain.push({
        param: {
          signer: _signer,
          nonce: nonce(_signer),
          signature: `tx-${++id}`,
        },
        type: txtype(),
      })
    }
  })
})
