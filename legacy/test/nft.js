const { expect } = require("chai")
const { init, stop, initBeforeEach } = require("./util")
const EthCrypto = require("eth-crypto")
const { pick } = require("ramda")

describe("WeaveDB with cross-chain NFT authentication", function () {
  let wallet, walletAddress, db, arweave_wallet

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

  const setRules2 = async relayer => {
    const schema = {
      type: "object",
      required: ["tokenIDs", "date", "lit", "owner"],
      properties: {
        owner: {
          type: "string",
        },
        tokenIDs: {
          type: "array",
          items: {
            type: "number",
          },
        },
        lit: {
          encryptedData: { type: "string" },
          encryptedSymmetricKey: { type: "array", items: { type: "number" } },
          evmContractConditions: { type: "object" },
        },
        date: {
          type: "number",
        },
      },
    }
    await db.setSchema(schema, "lit", { ar: arweave_wallet })

    const job = {
      relayers: [relayer.address],
      schema: {
        type: "object",
        required: ["tokenIDs", "lit", "isOwner"],
        properties: {
          tokenIDs: {
            type: "array",
            items: {
              type: "number",
            },
          },
          lit: {
            encryptedData: { type: "string" },
            encryptedSymmetricKey: { type: "array", items: { type: "number" } },
            evmContractConditions: { type: "object" },
          },
          isOwner: {
            type: "boolean",
          },
        },
      },
    }
    await db.addRelayerJob("lit", job, {
      ar: arweave_wallet,
    })
    expect(await db.getRelayerJob("lit")).to.eql(job)
    const rules = {
      let: {
        "resource.newData.tokenIDs": { var: "request.auth.extra.tokenIDs" },
        "resource.newData.lit": { var: "request.auth.extra.lit" },
        "resource.newData.owner": { var: "request.auth.signer" },
      },
      "allow create": {
        and: [
          { "==": [{ var: "request.auth.extra.isOwner" }, true] },
          {
            "==": [
              { var: "request.block.timestamp" },
              { var: "resource.newData.date" },
            ],
          },
        ],
      },
    }
    await db.setRules(rules, "lit", {
      ar: arweave_wallet,
    })
    expect(await db.getRules("lit")).to.eql(rules)
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
  const lit = {
    encryptedData: "xyz",
    encryptedSymmetricKey: [1, 2, 3],
    evmContractConditions: {},
  }
  const relay2 = async (relayer, signer, query, tokenIDs) => {
    const param = await db.sign(...query, {
      jobID: "lit",
      privateKey: signer.privateKey,
      wallet: signer.address,
    })

    await db.relay(
      "lit",
      param,
      { lit, isOwner: true, tokenIDs },
      {
        privateKey: relayer.privateKey,
        wallet: relayer.address,
      }
    )
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

  it("should relay encrypted data with lit protocol", async () => {
    const relayer = EthCrypto.createIdentity()
    const owner = EthCrypto.createIdentity()
    await setRules2(relayer)
    const data = { date: db.ts() }
    const tokenIDs = [1, 2, 3]
    const data_extra = {
      lit,
      tokenIDs,
      owner: owner.address.toLowerCase(),
    }
    await relay2(relayer, owner, ["set", data, "lit", "Bob"], tokenIDs)
    expect(
      pick(["lit", "tokenIDs", "owner"])(await db.get("lit", "Bob"))
    ).to.eql(data_extra)

    const data2 = { date: db.ts() }
    const tokenIDs2 = [2, 3, 4]
    const data2_extra = {
      lit,
      tokenIDs: tokenIDs2,
      owner: owner.address.toLowerCase(),
    }
    await relay2(relayer, owner, ["set", data2, "lit", "Alice"], tokenIDs2)
    expect(
      pick(["lit", "tokenIDs", "owner"])(await db.get("lit", "Alice"))
    ).to.eql(data2_extra)
    return
  })
})
