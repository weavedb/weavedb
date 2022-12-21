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
const ethSigUtil = require("@metamask/eth-sig-util")

describe("Ethereum", function () {
  const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "verifyingContract", type: "string" },
  ]

  let eth, ethereumSrcTxId, domain, arweave_wallet, db, data
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({ arweave_wallet, ethereumSrcTxId } = await initBeforeEach())
    domain = {
      name: "weavedb",
      version: "1",
      verifyingContract: ethereumSrcTxId,
    }
    eth = db.warp
      .contract(ethereumSrcTxId)
      .connect(arweave_wallet)
      .setEvaluationOptions({
        allowBigInt: true,
        useVM2: true,
      })
    const func = "test"
    const query = { test: 3 }
    const message = {
      nonce: 1,
      query: JSON.stringify({ func, query }),
    }
    data = {
      types: {
        EIP712Domain,
        Query: [
          { name: "query", type: "string" },
          { name: "nonce", type: "uint256" },
        ],
      },
      domain,
      primaryType: "Query",
      message,
    }
  })

  afterEach(async () => {
    try {
      clearInterval(db.interval)
    } catch (e) {}
  })

  it("should verify personal signatures", async () => {
    const identity = EthCrypto.createIdentity()
    const signature = ethSigUtil.personalSign({
      privateKey: Buffer.from(identity.privateKey.replace(/^0x/, ""), "hex"),
      data: JSON.stringify(data),
    })
    expect(
      (
        await eth.viewState({
          function: "verify",
          data,
          signature,
        })
      ).result.signer
    ).to.equal(identity.address.toLowerCase())
  })

  it("should verify typed signatures", async () => {
    const identity = EthCrypto.createIdentity()
    const pkey =
      "0x46cd24eb01d9a6a230b66bf5ab86b54ab0af52fd19d7d2130bf2c7538e56d712"
    const signature = ethSigUtil.signTypedData({
      privateKey: Buffer.from(identity.privateKey.replace(/^0x/, ""), "hex"),
      data,
      version: "V4",
    })
    expect(
      (
        await eth.viewState({
          function: "verify712",
          data,
          signature,
        })
      ).result.signer
    ).to.equal(identity.address.toLowerCase())
  })
})
