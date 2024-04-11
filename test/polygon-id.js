const { providers, Wallet } = require("ethers")
const { expect } = require("chai")
const { isNil, range, pick } = require("ramda")
const { init, stop, initBeforeEach, addFunds } = require("./util")
const { readFileSync } = require("fs")
const { resolve } = require("path")

const {
  initInMemoryDataStorageAndWallets,
  initCircuitStorage,
  initProofService,
} = require("./walletSetup")

const {
  AuthV2PubSignals,
  PROTOCOL_CONSTANTS,
  CircuitId,
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

function createReq(credentialRequest, subject) {
  return {
    id: 1,
    circuitId: CircuitId.AtomicQuerySigV2,
    optional: false,
    query: {
      allowedIssuers: ["*"],
      type: credentialRequest.type,
      context:
        "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld",
      credentialSubject: subject,
    },
  }
}

function createCred(subject) {
  return {
    credentialSchema:
      "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
    type: "KYCAgeCredential",
    credentialSubject: subject,
    expiration: 12345678888,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: rhsUrl,
    },
  }
}

describe("WeaveDB", function () {
  let wallet,
    walletAddress,
    wallet2,
    db,
    intmaxTxId,
    arweave_wallet,
    polygonIDTxId
  this.timeout(0)

  before(async () => {
    db = await init()
  })

  after(async () => await stop())

  beforeEach(async () => {
    ;({
      arweave_wallet,
      polygonIDTxId,
      intmaxTxId,
      walletAddress,
      wallet,
      wallet2,
    } = await initBeforeEach())
  })

  it("should verify zkp", async () => {
    let dataStorage, credentialWallet, identityWallet
    ;({ dataStorage, credentialWallet, identityWallet } =
      await initInMemoryDataStorageAndWallets())
    const circuitStorage = await initCircuitStorage()
    const proofService = await initProofService(
      identityWallet,
      credentialWallet,
      dataStorage.states,
      circuitStorage
    )
    const { did: userDID, credential: authBJJCredentialUser } =
      await createIdentity(identityWallet)
    const { did: issuerDID, credential: issuerAuthBJJCredential } =
      await createIdentity(identityWallet)
    const prove = async ({ data, req }) => {
      console.log(data)
      const credentialRequest = createCred(data)
      const credential = await identityWallet.issueCredential(
        issuerDID,
        credentialRequest
      )

      await dataStorage.credential.saveCredential(credential)
      const proofReqSig = createReq(credentialRequest, req)
      const { proof, pub_signals } = await proofService.generateProof(
        proofReqSig,
        userDID
      )
      const pid = db.warp
        .pst(polygonIDTxId)
        .connect(arweave_wallet)
        .setEvaluationOptions({
          allowBigInt: true,
          sequencerUrl: 'https://gw.warp.cc/',
        })
      expect(
        (
          await pid.viewState({
            function: "verify",
            proof,
            pub_signals,
          })
        ).result.valid
      ).to.equal(true)
    }
    const id = userDID.string()
    const data = {
      id,
      birthday: 19960424,
      documentType: 5,
    }
    const cond = [
      {
        data,
        req: {
          documentType: {
            $lt: 6,
          },
        },
      },
      {
        data,
        req: {
          documentType: {
            $in: [3, 4, 5],
          },
        },
      },
      {
        data,
        req: {
          documentType: {
            $eq: 5,
          },
        },
      },
      {
        data,
        req: {
          documentType: {
            $nin: [1, 7, 100],
          },
        },
      },
      {
        data,
        req: {
          birthday: {},
        },
      },
    ]
    for (let v of cond) await prove(v)
  })
})
