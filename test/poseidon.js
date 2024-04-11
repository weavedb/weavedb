const { providers, Wallet } = require("ethers")
const { createHash } = require("sha256-uint8array")
const Scalar = require("ffjavascript").Scalar
const {
  initInMemoryDataStorageAndWallets,
  initCircuitStorage,
  initProofService,
} = require("./walletSetup")

const { expect } = require("chai")
const { isNil, range, pick } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const { poseidonConstants, buildEddsa } = require("circomlibjs")
const Account = require("intmax").Account
const {
  KmsKeyType,
  CredentialStatusType,
  core,
} = require("@0xpolygonid/js-sdk")
const rhsUrl = "https://rhs-staging.polygonid.me"

async function createIdentity(identityWallet) {
  const { did, credential } = await identityWallet.createIdentity({
    method: core.DidMethod.polygonId,
    blockchain: core.Blockchain.Polygon,
    networkId: core.NetworkId.Mumbai,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: rhsUrl,
    },
  })

  return {
    did,
    credential,
  }
}

describe("WeaveDB", function () {
  let wallet, walletAddress, wallet2, db, intmaxTxId, arweave_wallet
  let dataStorage, credentialWallet, identityWallet, eddsa
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({ arweave_wallet, intmaxTxId, walletAddress, wallet, wallet2 } =
      await initBeforeEach())
    eddsa = await buildEddsa(poseidonConstants)
  })
  const genID = async () => {
    ;({ dataStorage, credentialWallet, identityWallet } =
      await initInMemoryDataStorageAndWallets())
    const circuitStorage = await initCircuitStorage()
    const proofService = await initProofService(
      identityWallet,
      credentialWallet,
      dataStorage.states,
      circuitStorage
    )
    const { credential } = await createIdentity(identityWallet)
    const keyKMSId = identityWallet.getKMSIdByAuthCredential(credential)
    const keyProvider = identityWallet._kms._registry.get(KmsKeyType.BabyJubJub)
    const prvKey = (await keyProvider.privateKey(keyKMSId)).sk
    const pubKey = eddsa.prv2pub(prvKey)
    return { prvKey, pubKey }
  }

  it("should verify signature with Polygon DID", async () => {
    const { prvKey, pubKey } = await genID()
    const data = { name: "Bob", age: 20 }
    const msg = JSON.stringify(data)
    const hash = createHash().update(msg).digest("hex")
    const msgHashed = Buffer.from(hash, "hex")
    const signature = eddsa.signPoseidon(prvKey, msgHashed)
    const valid = eddsa.verifyPoseidon(msgHashed, signature, pubKey)
    expect(valid).to.equal(true)
    const sig =
      "0x" + Buffer.from(eddsa.packSignature(signature)).toString("hex")
    const pub =
      "0x" + Buffer.from(eddsa.babyJub.packPoint(pubKey)).toString("hex")
    const intmax = db.warp
      .pst(intmaxTxId)
      .connect(arweave_wallet)
      .setEvaluationOptions({
        sequencerUrl: 'https://gw.warp.cc/',
        allowBigInt: true,
      })
    expect(
      (
        await intmax.viewState({
          function: "verify",
          data,
          signature: sig,
          pubKey: pub,
        })
      ).result.isValid
    ).to.eql(true)
  })
})
