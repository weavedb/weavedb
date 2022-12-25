const { Ed25519KeyIdentity } = require("@dfinity/identity")
const { providers, Wallet } = require("ethers")
const { expect } = require("chai")
const { isNil, range, pick } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const buildEddsa = require("circomlibjs").buildEddsa
const Account = require("intmax").Account
const { readFileSync } = require("fs")
const { resolve } = require("path")
const EthCrypto = require("eth-crypto")

describe("WeaveDB with cross-chain NFT authentication", function () {
  let wallet, walletAddress, wallet2, db, arweave_wallet

  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({ arweave_wallet, walletAddress, wallet, wallet2 } =
      await initBeforeEach())
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  const setRules = async relayer => {
    const job = {
      relayers: [relayer.address],
      schema: {
        type: "string",
      },
    }
    await db.addRelayerJob("nft", job, {
      ar: arweave_wallet,
    })
    expect(await db.getRelayerJob("nft")).to.eql(job)
    const rules = {
      let: {
        owner: ["toLower", { var: "request.auth.extra" }],
        "resource.newData.owner": { var: "owner" },
      },
      "allow write": {
        "==": [{ var: "request.auth.signer" }, { var: "owner" }],
      },
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })
    expect(await db.getRules("ppl")).to.eql(rules)
  }

  const relay = async (relayer, nft_owner, signer, query) => {
    const param = await db.sign(...query, {
      jobID: "nft",
      privateKey: signer.privateKey,
      wallet: signer.address,
    })

    // relayer will return the NFT owner address as an extra data
    await db.relay("nft", param, nft_owner.address, {
      privateKey: relayer.privateKey,
      wallet: relayer.address,
    })
  }

  it("should allow only NFT owner to write", async () => {
    const relayer = EthCrypto.createIdentity()
    const owner = EthCrypto.createIdentity()
    const owner2 = EthCrypto.createIdentity()
    await setRules(relayer)

    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Bob", age: 20, owner: owner.address.toLowerCase() }
    const data3 = { name: "Bob", age: 32, owner: owner2.address.toLowerCase() }

    // owner has the NFT, so he/she can write
    await relay(relayer, owner, owner, ["set", data, "ppl", "Bob"])
    expect(await db.get("ppl", "Bob")).to.eql(data2)

    // assume the NFT has been transferred to owner2

    // now owner cannot update
    await relay(relayer, owner2, owner, ["update", { age: 32 }, "ppl", "Bob"])
    expect(await db.get("ppl", "Bob")).to.eql(data2)

    // but owner2 can update
    await relay(relayer, owner2, owner2, ["update", { age: 32 }, "ppl", "Bob"])
    expect(await db.get("ppl", "Bob")).to.eql(data3)

    return
  })
})
