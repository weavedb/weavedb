const { Ed25519KeyIdentity } = require("@dfinity/identity")
const { providers, Wallet } = require("ethers")
const { expect } = require("chai")
const { isNil, range, pick } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const buildEddsa = require("circomlibjs").buildEddsa
const Account = require("intmax").Account
const { readFileSync } = require("fs")
const { resolve } = require("path")

describe("WeaveDB", function () {
  let wallet, walletAddress, wallet2, db, intmaxSrcTxId, arweave_wallet
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({ arweave_wallet, intmaxSrcTxId, walletAddress, wallet, wallet2 } =
      await initBeforeEach())
  })

  it("should add & get with Intmax wallet with an EVM account", async () => {
    const intmax_wallet = Wallet.createRandom()
    intmax_wallet._account = { address: intmax_wallet.address }
    const data = { name: "Bob", age: 20 }
    const tx = (await db.add(data, "ppl", { intmax: intmax_wallet }))
      .originalTxId
    const addr = intmax_wallet.address
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(
      addr.toLowerCase()
    )
    return
  })

  it("should link temporarily generated address with Intmax wallet with EVM account", async () => {
    const intmax_wallet = Wallet.createRandom()
    intmax_wallet._account = { address: intmax_wallet.address }
    const addr = intmax_wallet._account.address
    const { identity } = await db.createTempAddressWithIntmax(intmax_wallet)
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr.toLowerCase())
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { intmax: intmax_wallet }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
      overwrite: true,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  /*
  it("should add & get with Intmax wallet", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const data = { name: "Bob", age: 20 }
    const tx = (await db.add(data, "ppl", { intmax: intmax_wallet }))
      .originalTxId
    const addr = intmax_wallet._address
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(addr)
    return
  })
  */
  /*
  it("should link temporarily generated address with Intmax wallet", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const addr = intmax_wallet._address
    const { identity } = await db.createTempAddressWithIntmax(intmax_wallet)
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr)
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { intmax: intmax_wallet }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
      overwrite: true,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  it("should set algorithms", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const data = { name: "Bob", age: 20 }
    const tx = (await db.add(data, "ppl", { intmax: intmax_wallet }))
      .originalTxId
    const addr = intmax_wallet._address
    expect((await db.cget("ppl", (await db.getIds(tx))[0])).setter).to.eql(addr)
    await db.setAlgorithms(["secp256k1", "rsa256"], {
      ar: arweave_wallet,
    })
    const data2 = { name: "Alice", age: 25 }
    await db.set(data2, "ppl", "Alice", { intmax: intmax_wallet })
    expect(await db.get("ppl", "Alice")).to.be.eql(null)
    await db.setAlgorithms(["poseidon", "rsa256"], {
      ar: arweave_wallet,
    })
    await db.set(data2, "ppl", "Alice", { intmax: intmax_wallet })
    expect(await db.get("ppl", "Alice")).to.be.eql(data2)
    return
  })
  */
  /*
  it("should validate Intmax signature", async () => {
    const provider = new providers.JsonRpcProvider("http://localhost/")
    const intmax_wallet = new Account(provider)
    await intmax_wallet.activate()
    const intmax = db.warp
      .pst(intmaxSrcTxId)
      .connect(arweave_wallet)
      .setEvaluationOptions({
        allowBigInt: true,
      })
    const data = { test: 1 }
    const signature = await intmax_wallet.sign(JSON.stringify(data))
    const _publicKey = intmax_wallet._publicKey
    const eddsa = await buildEddsa()
    const packedPublicKey = eddsa.babyJub.packPoint(_publicKey)
    const pubKey = "0x" + Buffer.from(packedPublicKey).toString("hex")
    expect(
      (
        await intmax.viewState({
          function: "verify",
          data,
          signature,
          pubKey,
        })
      ).result.isValid
    ).to.eql(true)
    return
  })
  */
})
