const LitJsSdk = require("lit-js-sdk/build/index.node.js")
const { Ed25519KeyIdentity } = require("@dfinity/identity")
const { providers, Wallet, utils } = require("ethers")
const { expect } = require("chai")
const { isNil, range, pick } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const buildEddsa = require("circomlibjs").buildEddsa
const Account = require("intmax").Account
const { readFileSync } = require("fs")
const { resolve } = require("path")
require("dotenv").config({ path: resolve(__dirname, "./.env") })
const EthCrypto = require("eth-crypto")

describe("WeaveDB", function () {
  let wallet, walletAddress, db, arweave_wallet
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
    ;({ arweave_wallet, walletAddress, wallet } = await initBeforeEach())
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  it.only("should relay queries with multisig", async () => {
    const code = readFileSync(
      resolve(__dirname, "../examples/relayer-nft/lit-actions/ownerOf.js"),
      "utf-8"
    )
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" })
    await litNodeClient.connect()
    const authSig = {
      sig: process.env.AUTHSIG_SIG,
      derivedVia: process.env.AUTHSIG_DERIVEDVIA,
      signedMessage: process.env.AUTHSIG_SIGNEDMESSAGE,
      address: process.env.AUTHSIG_ADDRESS,
    }
    const res = await litNodeClient.executeJs({
      code,
      authSig,
      jsParams: {
        jobID: "test",
        lit_ipfsId: "test",
        infura_key: "a2028129b6a7437ea8f0e138f2895f30",
        params: { query: [{ tokenID: 4 }], jobID: "test" },
        publicKey: process.env.LIT_PUBLICKEY1,
        sigName: "sig1",
      },
    })
    console.log(res)
  })
  it("should relay queries with multisig", async () => {
    const code = readFileSync(resolve(__dirname, "litAction.js"), "utf-8")
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" })
    await litNodeClient.connect()
    const authSig = {
      sig: process.env.AUTHSIG_SIG,
      derivedVia: process.env.AUTHSIG_DERIVEDVIA,
      signedMessage: process.env.AUTHSIG_SIGNEDMESSAGE,
      address: process.env.AUTHSIG_ADDRESS,
    }
    const identity = EthCrypto.createIdentity()
    const jobID = "test-job"
    const lit_ipfsId = "test-ipfs"
    const job = {
      relayers: [process.env.LIT_ADDRESS1, process.env.LIT_ADDRESS2],
      multisig: 2,
      multisig_type: "number",
      lit_ipfsId,
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
      lit_ipfsId,
      params,
    }
    const res = await litNodeClient.executeJs({
      code,
      authSig,
      jsParams: {
        data: multisig_data,
        publicKey: process.env.LIT_PUBLICKEY1,
        sigName: "sig1",
      },
    })
    const _sig2 = res.signatures.sig1
    const sig2 = utils.joinSignature({
      r: "0x" + _sig2.r,
      s: "0x" + _sig2.s,
      v: _sig2.recid,
    })
    const res3 = await litNodeClient.executeJs({
      code,
      authSig,
      jsParams: {
        data: multisig_data,
        publicKey: process.env.LIT_PUBLICKEY2,

        sigName: "sig1",
      },
    })
    const _sig3 = res3.signatures.sig1
    const sig3 = utils.joinSignature({
      r: "0x" + _sig3.r,
      s: "0x" + _sig3.s,
      v: _sig3.recid,
    })
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
})
