const { Ed25519KeyIdentity } = require("@dfinity/identity")
const { providers, Wallet, utils } = require("ethers")
const { expect } = require("chai")
const { isNil, range, pick } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const buildEddsa = require("circomlibjs").buildEddsa
const Account = require("intmax").Account
const { readFileSync } = require("fs")
const { resolve } = require("path")
const EthCrypto = require("eth-crypto")
const EthWallet = require("ethereumjs-wallet").default
describe("WeaveDB", function () {
  let wallet, walletAddress, wallet2, db, arweave_wallet
  const _ii = [
    "302a300506032b6570032100ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
    "010925abb4cf8ccb7accbcfcbf0a6adf1bbdca12644694bb47afc7182a4ade66ccd1d1f725fc35a681d8ef5d563a3c347829bf3f0fe822b4a4b004ee0224fc0d",
  ]

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

  it("should link temporarily generated address with Arweave wallet", async () => {
    const arweave_wallet = await db.arweave.wallets.generate()
    let addr = await db.arweave.wallets.jwkToAddress(arweave_wallet)
    const { identity } = await db.createTempAddressWithAR(arweave_wallet)
    await db.set({ name: "Beth", age: 10 }, "ppl", "Beth", {
      wallet: addr,
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Beth")).setter).to.eql(addr)
    await db.removeAddressLink(
      {
        address: identity.address,
      },
      { ar: arweave_wallet }
    )
    await db.set({ name: "Bob", age: 20 }, "ppl", "Bob", {
      privateKey: identity.privateKey,
    })
    expect((await db.cget("ppl", "Bob")).setter).to.eql(
      identity.address.toLowerCase()
    )
  })

  it("should relay queries", async () => {
    const identity = EthCrypto.createIdentity()
    const job = {
      relayers: [identity.address],
      schema: {
        type: "object",
        required: ["height"],
        properties: {
          height: {
            type: "number",
          },
        },
      },
    }
    await db.addRelayerJob("test-job", job, {
      ar: arweave_wallet,
    })
    expect(await db.getRelayerJob("test-job")).to.eql(job)
    const rules = {
      let: {
        "resource.newData.height": { var: "request.auth.extra.height" },
      },
      "allow write": true,
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })

    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Bob", age: 20, height: 182 }
    const param = await db.sign("set", data, "ppl", "Bob", {
      jobID: "test-job",
    })
    await db.relay(
      "test-job",
      param,
      { height: 182 },
      {
        privateKey: identity.privateKey,
        wallet: identity.address,
      }
    )
    const addr = wallet.getAddressString()
    const doc = await db.cget("ppl", "Bob")
    expect(doc.setter).to.equal(addr)
    expect(doc.data).to.eql(data2)
    await db.removeRelayerJob("test-job", { ar: arweave_wallet })
    expect(await db.getRelayerJob("test-job")).to.eql(null)
    return
  })

  it("should relay queries with multisig", async () => {
    const identity = EthCrypto.createIdentity()
    const identity2 = EthCrypto.createIdentity()
    const identity3 = EthCrypto.createIdentity()
    const wallet2 = new Wallet(identity2.privateKey)
    const wallet3 = new Wallet(identity3.privateKey)
    const jobID = "test-job"
    const job = {
      relayers: [identity.address],
      signers: [identity.address, identity2.address, identity3.address],
      multisig: 50,
      multisig_type: "percent",
      schema: {
        type: "object",
        required: ["height"],
        properties: {
          height: {
            type: "number",
          },
        },
      },
    }

    await db.addRelayerJob("test-job", job, {
      ar: arweave_wallet,
    })
    expect(await db.getRelayerJob("test-job")).to.eql(job)

    const rules = {
      let: {
        "resource.newData.height": { var: "request.auth.extra.height" },
      },
      "allow write": true,
    }
    await db.setRules(rules, "ppl", {
      ar: arweave_wallet,
    })

    const data = { name: "Bob", age: 20 }
    const data2 = { name: "Bob", age: 20, height: 182 }
    const params = await db.sign("set", data, "ppl", "Bob", {
      jobID,
    })
    const extra = { height: 182 }
    const multisig_data = {
      extra,
      jobID,
      params,
    }
    const sig2 = await wallet2.signMessage(JSON.stringify(multisig_data))
    const sig3 = await wallet3.signMessage(JSON.stringify(multisig_data))
    await db.relay("test-job", params, extra, {
      privateKey: identity.privateKey,
      wallet: identity.address,
      multisigs: [sig2, sig3],
    })
    const addr = wallet.getAddressString()
    const doc = await db.cget("ppl", "Bob")
    expect(doc.setter).to.equal(addr)
    expect(doc.data).to.eql(data2)
    await db.removeRelayerJob("test-job", { ar: arweave_wallet })
    expect(await db.getRelayerJob("test-job")).to.eql(null)
    return
  })

  it("should overwrite the temporary_address", async () => {
    const original_account = EthWallet.generate()
    const { identity: temp_account } = await db.createTempAddress(
      original_account
    )
    const preset_addr = wallet.getAddressString() // this was set when initializing SDK with EthWallet
    const original_addr = original_account.getAddressString()
    const temp_addr = temp_account.address.toLowerCase()

    // sign with the original_account (default)
    await db.set({ signer: db.signer() }, "signers", "s1", {
      wallet: original_account,
    })
    expect((await db.get("signers", "s1")).signer).to.equal(original_addr)
    // sign with the temp_account linked to the original_account
    await db.set({ signer: db.signer() }, "signers", "s2", {
      wallet: original_addr,
      privateKey: temp_account.privateKey,
    })
    expect((await db.get("signers", "s2")).signer).to.equal(original_addr)

    // sign with the temp_account but as itself
    await db.set({ signer: db.signer() }, "signers", "s3", {
      privateKey: temp_account.privateKey,
    })
    expect((await db.get("signers", "s3")).signer).to.equal(temp_addr)

    // sign with the preset wallet
    await db.set({ signer: db.signer() }, "signers", "s4")
    expect((await db.get("signers", "s4")).signer).to.equal(preset_addr)
  })
})
