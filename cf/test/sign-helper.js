// Test signer + fixtures for Miniflare integration tests.
//
// Mirrors hb/test/test-utils.js's `sign` class, plus inline copies of
// dir_schema / dirs_set / init_query (originally in hb/src/server-utils.js).
// Copying — not importing — to avoid pulling lmdb/Arweave/aoconnect into
// the test process.
//
// Tests run in Node, so node:crypto and 4096-bit RSA generation are fine.

import { generateKeyPairSync, createPrivateKey } from "node:crypto"
import { httpbis, createSigner } from "http-message-signatures"

/**
 * Generate a fresh RSA JWK for a test signer.
 * Default 4096 bits to match Arweave; expensive (~1s), so callers should
 * generate once and reuse across multiple signed calls.
 */
export function genJWK(modulusLength = 4096) {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength })
  return privateKey.export({ format: "jwk" })
}

/**
 * Signer that produces RFC 9421-shaped messages compatible with
 * hbsig.verify. The Worker's auth.js calls hbsig.verify, which reads the
 * signature/signature-input headers and the named fields from the signed
 * envelope. Signed fields here = ["query", "nonce", "id"], same as
 * hb/test/test-utils.js#sign.
 */
export class TestSigner {
  constructor({ jwk, id }) {
    this.jwk = jwk
    this.id = id
    this.nonce = 0
    this.signer = createSigner(
      createPrivateKey({ key: jwk, format: "jwk" }),
      "rsa-pss-sha512",
      jwk.n,
    )
  }

  /**
   * Sign a query and return { headers } ready to put on a fetch Request.
   * Body is not signed; the Worker reads the query from the signed `query`
   * header per server-utils.js#verify.
   */
  async sign(...query) {
    const signed = await httpbis.signMessage(
      { key: this.signer, fields: ["query", "nonce", "id"] },
      {
        headers: {
          query: JSON.stringify(query),
          nonce: Number(++this.nonce).toString(),
          id: this.id,
        },
      },
    )
    return signed
  }
}

// dir_schema — JSON Schema for the _config dir entry. Permissive variant
// (no $ref to draft-07) for tests, since we can't resolve external $refs
// without bundling the draft_07 spec. hb/src/server-utils.js's version
// adds `definitions: { draft_07 }` to make the $ref resolvable.
export const dir_schema = {
  type: "object",
  required: ["index", "schema", "auth"],
  properties: {
    index: { type: "number" },
    schema: { type: "object" },
    docs: { type: "object" },
    auth: { type: "array" },
  },
}

// dirs_set — auth rule for `set:dir` that lets the owner create new
// collections. Copied from hb/src/server-utils.js.
export const dirs_set = [
  "set:dir",
  [
    ["=$isOwner", ["equals", "$signer", "$owner"]],
    ["=$dir", ["get()", ["_config", "info"]]],
    ["=$dirid", ["inc", "$dir.last_dir_id"]],
    ["mod()", { index: "$dirid" }],
    ["update()", [{ last_dir_id: "$dirid" }, "_config", "info"]],
    ["allowif()", "$isOwner"],
  ],
]

export const init_query = { schema: dir_schema, auth: [dirs_set] }

// Auth rules for a "users" collection that allows any signer to write.
// Same shape as hb/test/test-utils.js's users_query.
export const users_query = [
  "set:dir",
  {
    schema: { type: "object", required: ["name"] },
    auth: [
      ["set:user,add:user,update:user,upsert:user,del:user", [["allow()"]]],
    ],
  },
  "_",
  "users",
]
