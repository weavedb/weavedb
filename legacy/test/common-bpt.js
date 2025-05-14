const DB = require("../sdk/offchain")
const { Wallet } = require("ethers")
const {
  AuthV2PubSignals,
  PROTOCOL_CONSTANTS,
  CircuitId,
  CredentialStatusType,
  core,
} = require("@0xpolygonid/js-sdk")
const rhsUrl = "https://rhs-staging.polygonid.me"
const {
  initInMemoryDataStorageAndWallets,
  initCircuitStorage,
  initProofService,
  initPackageManager,
} = require("./walletSetup")

const { expect } = require("chai")
const { readFileSync } = require("fs")
const { resolve } = require("path")
const { range, mergeLeft, pluck, map, last } = require("ramda")
const EthCrypto = require("eth-crypto")
let arweave = require("arweave")
const {
  getSignature,
  getEventHash,
  generatePrivateKey,
  getPublicKey,
  finishEvent,
} = require("nostr-tools")

const tests = {
  "should change method name in access control rules.skip": async ({
    db,
    arweave_wallet,
  }) => {
    const rules = [
      ["create", [["=$request.method", "Bob"], ["allow()"]]],
      ["Bob", [["allow()"]]],
    ]

    await db.setRules(rules, "ppl", { ar: arweave_wallet })
    await db.set({ name: "Bob" }, "ppl", "Bob", { ar: arweave_wallet })
    expect((await db.get("ppl", "Bob")).name).to.eql("Bob")
    await db.set({ name: "Alice" }, "ppl", "Alice", { ar: arweave_wallet })
    expect(await db.get("ppl", "Alice")).to.eql(null)
  },
  "should process nostr events.skip": async ({ db, arweave_wallet }) => {
    const rule = [
      [
        "set:nostr_events",
        [
          ["=$event", ["get()", ["nostr_events", "$id"]]],
          ["if", "o$event", ["deny()"]],
          ["allow()"],
        ],
      ],
    ]
    await db.setRules(rule, "nostr_events", { ar: arweave_wallet })
    const trigger = {
      key: "nostr_events",
      on: "create",
      version: 2,
      func: [
        [
          "if",
          ["equals", 1, "$data.after.kind"],
          [
            "set()",
            [
              {
                id: "$data.id",
                owner: "$data.after.pubkey",
                type: "status",
                description: "$data.after.content",
                date: "$data.after.created_at",
                repost: "",
                reply_to: "",
                reply: false,
                quote: false,
                parents: [],
                hashes: [],
                mentions: [],
                repost: 0,
                quotes: 0,
                comments: 0,
              },
              "posts",
              "$data.id",
            ],
          ],
        ],
        [
          "if",
          ["equals", 0, "$data.after.kind"],
          [
            "[]",
            ["=$profile", ["parse()", "$data.after.content"]],
            [
              "set()",
              [
                {
                  name: "$profile.name",
                  address: "$data.after.pubkey",
                  followers: 0,
                  following: 0,
                },
                "users",
                "$data.after.pubkey",
              ],
            ],
          ],
        ],
      ],
    }
    await db.addTrigger(trigger, "nostr_events", { ar: arweave_wallet })

    let sk = generatePrivateKey()
    let pubkey = getPublicKey(sk)

    let event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: "hello",
      pubkey,
    }
    event.id = getEventHash(event)
    event.sig = getSignature(event, sk)
    await db.nostr(event)
    await db.nostr(event)
    let event2 = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: "hello2",
      pubkey,
    }
    event2.id = getEventHash(event2)
    event2.sig = getSignature(event2, sk)
    await db.nostr(event2)
    let event3 = {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({
        name: "user",
        about: "test user",
        picture: "https://example.com/avatar.png",
      }),
      pubkey,
    }
    event3.id = getEventHash(event3)
    event3.sig = getSignature(event3, sk)
    await db.nostr(event3)
  },
  "should record nostr users.skip": async ({ db, arweave_wallet }) => {
    const schema = {
      type: "object",
      required: ["address"],
      properties: {
        address: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        invited_by: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        name: { type: "string", minLength: 1, maxLength: 50 },
        handle: { type: "string", minLength: 3, maxLength: 15 },
        image: { type: "string" },
        cover: { type: "string" },
        description: { type: "string", maxLength: 280 },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        followers: { type: "number", multipleOf: 1 },
        following: { type: "number", multipleOf: 1 },
        invites: { type: "number", multipleOf: 1 },
        invited: { type: "number", multipleOf: 1 },
      },
    }
    await db.setSchema(schema, "users", { ar: arweave_wallet })
    const func = [
      [
        "if",
        ["equals", 0, "$data.after.kind"],
        [
          "[]",
          ["=$profile", ["parse()", "$data.after.content"]],
          ["=$old_profile", ["get()", ["users", "$data.id"]]],
          ["=$new_profile", { address: "$data.after.pubkey" }],
          [
            "if",
            "x$old_profile",
            [
              "[]",
              ["=$new_profile.followers", 0],
              ["=$new_profile.following", 0],
            ],
          ],
          ["if", "o$profile.name", ["=$new_profile.name", "$profile.name"]],
          ["=$new_profile.description", ["defaultTo", "", "$profile.about"]],
          [
            "if",
            "o$profile.picture",
            ["=$new_profile.image", "$profile.picture"],
          ],
          [
            "if",
            "o$profile.banner",
            ["=$new_profile.cover", "$profile.banner"],
          ],
          ["upsert()", ["$new_profile", "users", "$data.after.pubkey"]],
        ],
      ],
    ]

    const trigger = { key: "nostr_events", on: "create", version: 2, func }
    await db.addTrigger(trigger, "nostr_events", { ar: arweave_wallet })
    let sk = generatePrivateKey()
    let pubkey = getPublicKey(sk)

    let event = {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({ name: "user", about: "test user" }),
      pubkey,
    }
    event.id = getEventHash(event)
    event.sig = getSignature(event, sk)
    await db.nostr(event)
  },
  "should record nostr posts.skip": async ({ db, arweave_wallet }) => {
    const schema = {
      type: "object",
      required: ["owner", "id"],
      properties: {
        id: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        owner: { type: "string", pattern: "^[0-9a-z]{64,64}$" },
        date: { type: "number", multipleOf: 1 },
        updated: { type: "number", multipleOf: 1 },
        description: { type: "string", maxLength: 280 },
        title: { type: "string", minLength: 1, maxLength: 100 },
        type: { type: "string" },
        reply_to: { type: "string" },
        repost: { type: "string" },
        reply: { type: "boolean" },
        quote: { type: "boolean" },
        parents: {
          type: "array",
          items: { type: "string", pattern: "^[0-9a-zA-Z]{64,64}$" },
        },
        hashes: { type: "array", items: { type: "string" } },
        mentions: { type: "array", items: { type: "string" } },
        pt: { type: "number" },
        ptts: { type: "number", multipleOf: 1 },
        last_like: { type: "number", multipleOf: 1 },
        likes: { type: "number", multipleOf: 1 },
        reposts: { type: "number", multipleOf: 1 },
        quotes: { type: "number", multipleOf: 1 },
        comments: { type: "number", multipleOf: 1 },
      },
    }
    await db.setSchema(schema, "posts", { ar: arweave_wallet })

    let sk = generatePrivateKey()
    let pubkey = getPublicKey(sk)

    const func = [
      [
        "if",
        ["equals", 1, "$data.after.kind"],
        [
          "[]",
          ["=$tags", ["defaultTo", [], "$data.after.tags"]],
          [
            "=$mentions",
            [
              [
                "pipe",
                ["filter", ["propSatisfies", ["equals", "p"], 0]],
                ["map", ["nth", 1]],
              ],
              "$tags",
            ],
          ],
          [
            "=$etags",
            [["filter", ["propSatisfies", ["equals", "e"], 0]], "$tags"],
          ],
          [
            "=$quote_tags",
            [
              [
                "pipe",
                ["filter", ["propSatisfies", ["equals", "mention"], 3]],
                ["map", ["nth", 1]],
              ],
              "$etags",
            ],
          ],
          [
            "=$repost",
            [
              "if",
              ["isEmpty", "$quote_tags"],
              "",
              "else",
              ["head", "$quote_tags"],
            ],
          ],
          ["=$no_quote", ["isEmpty", "$repost"]],
          ["=$quote", "!$no_quote"],

          [
            "=$reply_tags",
            [
              [
                "pipe",
                ["filter", ["propSatisfies", ["equals", "reply"], 3]],
                ["map", ["nth", 1]],
              ],
              "$etags",
            ],
          ],
          [
            "=$reply_to",
            [
              "if",
              ["isEmpty", "$reply_tags"],
              "",
              "else",
              ["last", "$reply_tags"],
            ],
          ],
          ["=$no_reply", ["isEmpty", "$reply_to"]],
          ["=$is_mark", "!$no_reply"],
          [
            "if",
            "$no_reply",
            [
              "[]",
              [
                "=$reply_tags",
                [
                  [
                    "pipe",
                    ["filter", ["propSatisfies", ["equals", "root"], 3]],
                    ["map", ["nth", 1]],
                  ],
                  "$etags",
                ],
              ],
              [
                "=$reply_to",
                [
                  "if",
                  ["isEmpty", "$reply_tags"],
                  "",
                  "else",
                  ["last", "$reply_tags"],
                ],
              ],
            ],
          ],
          ["=$no_reply", ["isEmpty", "$reply_to"]],
          ["=$is_mark", "!$no_reply"],
          [
            "if",
            "$no_reply",
            [
              "[]",
              [
                "=$reply_tags",
                [
                  [
                    "pipe",
                    [
                      "filter",
                      [
                        "propSatisfies",
                        ["either", ["equals", ""], ["isNil"]],
                        3,
                      ],
                    ],
                    ["map", ["nth", 1]],
                  ],
                  "$etags",
                ],
              ],
              [
                "=$reply_to",
                [
                  "if",
                  ["isEmpty", "$reply_tags"],
                  "",
                  "else",
                  ["last", "$reply_tags"],
                ],
              ],
            ],
          ],
          ["=$no_reply", ["isEmpty", "$reply_to"]],
          ["=$reply", "!$no_reply"],
          ["=$parents", []],
          [
            "if",
            "$is_mark",
            [
              "=$parents",
              [
                [
                  "pipe",
                  [
                    "filter",
                    [
                      "propSatisfies",
                      ["includes", ["__"], ["[]", "root", "reply"]],
                      3,
                    ],
                  ],
                  ["map", ["nth", 1]],
                ],
                "$etags",
              ],
            ],
            "elif",
            "$reply",
            [
              "=$parents",
              [
                [
                  "pipe",
                  [
                    "filter",
                    ["propSatisfies", ["either", ["equals", ""], ["isNil"]], 3],
                  ],
                  ["map", ["nth", 1]],
                ],
                "$etags",
              ],
            ],
          ],
          [
            "set()",
            [
              {
                id: "$data.id",
                owner: "$data.after.pubkey",
                type: "status",
                description: "$data.after.content",
                date: "$data.after.created_at",
                repost: "$repost",
                reply_to: "$reply_to",
                reply: "$reply",
                quote: "$quote",
                parents: "$parents",
                hashes: [],
                mentions: "$mentions",
                likes: 0,
                reposts: 0,
                quotes: 0,
                comments: 0,
              },
              "posts",
              "$data.id",
            ],
          ],
        ],
      ],
    ]

    const trigger2 = { key: "nostr_events", on: "create", version: 2, func }
    await db.addTrigger(trigger2, "nostr_events", { ar: arweave_wallet })

    const trigger = {
      key: "inc_reposts",
      version: 2,
      on: "create",
      func: [
        [
          [
            "unless",
            ["pathEq", ["after", "repost"], ""],
            [
              "toBatch",
              ["update", { reposts: db.inc(1) }, "posts", "$data.after.repost"],
            ],
            "$data",
          ],
          [
            "when",
            [
              "both",
              [["complement", ["pathEq"]], ["after", "repost"], ""],
              [
                ["complement", ["pathSatisfies"]],
                ["isNil"],
                ["after", "description"],
              ],
            ],
            [
              "toBatch",
              ["update", { quotes: db.inc(1) }, "posts", "$data.after.repost"],
            ],
            "$data",
          ],
        ],
      ],
    }
    await db.addTrigger(trigger, "posts", { ar: arweave_wallet })
    let event = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      content: "what the hell",
      pubkey,
      tags: [],
    }
    event = finishEvent(event, sk)
    await db.nostr(event)

    let event2 = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["p", sk],
        ["e", event.id, "", "mention"],
      ],
      content: "what the hell #2",
      pubkey,
    }
    event2 = finishEvent(event2, sk)
    await db.nostr(event)
    await db.nostr(event2)

    // one, two, multi, reply, root
    let event3 = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["p", sk],
        ["e", event.id, "root"],
        ["e", event.id],
      ],
      content: "what the hell #2",
      pubkey,
    }
    event3 = finishEvent(event3, sk)
    await db.nostr(event3)
  },

  "should verify zkp.skip": async ({ db, arweave_wallet }) => {
    let dataStorage, credentialWallet, identityWallet
    ;({ dataStorage, credentialWallet, identityWallet } =
      await initInMemoryDataStorageAndWallets())
    const circuitStorage = await initCircuitStorage()
    const proofService = await initProofService(
      identityWallet,
      credentialWallet,
      dataStorage.states,
      circuitStorage,
    )
    const { did: userDID, credential: authBJJCredentialUser } =
      await createIdentity(identityWallet)
    const { did: issuerDID, credential: issuerAuthBJJCredential } =
      await createIdentity(identityWallet)
    const id = userDID.string()
    const data = {
      id,
      birthday: 19960424,
      documentType: 5,
    }
    const req = {
      documentType: {
        $lt: 6,
      },
    }
    const credentialRequest = createCred(data)
    const credential = await identityWallet.issueCredential(
      issuerDID,
      credentialRequest,
    )

    await dataStorage.credential.saveCredential(credential)
    const proofReqSig = createReq(credentialRequest, req)
    const { proof, pub_signals } = await proofService.generateProof(
      proofReqSig,
      userDID,
    )

    await db.add({ test: db.zkp(proof, pub_signals) }, "ppl")
    expect((await db.get("ppl"))[0].test.pub_signals.userID).to.eql(id)
  },
  "should link did.skip": async ({ db, arweave_wallet, wallet }) => {
    let dataStorage, credentialWallet, identityWallet
    ;({ dataStorage, credentialWallet, identityWallet } =
      await initInMemoryDataStorageAndWallets())
    const circuitStorage = await initCircuitStorage()
    const proofService = await initProofService(
      identityWallet,
      credentialWallet,
      dataStorage.states,
      circuitStorage,
    )
    const { did: userDID, credential: authBJJCredentialUser } =
      await createIdentity(identityWallet)
    const { did: issuerDID, credential: issuerAuthBJJCredential } =
      await createIdentity(identityWallet)
    const id = userDID.string()
    const tempAddr = EthCrypto.createIdentity()
    const addr = tempAddr.address
    const num = BigInt(addr).toString().slice(0, 15) * 1
    const num2 = BigInt(addr).toString().slice(15, 30) * 1
    const credentialRequest = createCred({
      id,
      birthday: num,
      documentType: num2,
    })
    const credential = await identityWallet.issueCredential(
      issuerDID,
      credentialRequest,
    )
    await dataStorage.credential.saveCredential(credential)
    const proofReqSig = createReq(credentialRequest, {
      birthday: {
        $eq: num,
      },
    })
    const { proof, pub_signals } = await proofService.generateProof(
      proofReqSig,
      userDID,
    )
    const { identity } = await db.createTempAddressWithPolygonID(tempAddr, {
      proof,
      pub_signals,
      did: userDID.string(),
    })
    expect(await db.getAddressLink(identity.address.toLowerCase())).to.eql({
      address: userDID.string(),
      expiry: 0,
    })
  },
}

async function createIdentity(identityWallet) {
  const { did, credential } = await identityWallet.createIdentity({
    method: core.DidMethod.Iden3,
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

module.exports = { tests }
