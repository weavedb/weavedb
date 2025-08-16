import {
  httpbis,
  createSigner as createHttpSigner,
} from "http-message-signatures"
import { createPrivateKey } from "node:crypto"

function parseOp(ctx) {
  const { state } = ctx
  state.op = state.query[0]
  state.opcode = state.op.split(":")[0]
  state.operand = state.op.split(":")[1] ?? null
  return arguments[0]
}

const signer = ({ jwk, id, nonce = 0 }) => {
  const signer = createHttpSigner(
    createPrivateKey({ key: jwk, format: "jwk" }),
    "rsa-pss-sha512",
    jwk.n,
  )
  return async (...query) =>
    await httpbis.signMessage(
      { key: signer, fields: ["query", "nonce", "id"] },
      {
        headers: {
          query: JSON.stringify(query),
          nonce: Number(++nonce).toString(),
          id,
        },
      },
    )
}

function initDB({ state: { query, signer, id: _id }, msg, env: { kv, id } }) {
  if (id) throw Error("already initialized")
  kv.put("_", "_", { ...query[0], index: 0 })
  kv.put("_", "_config", {
    index: 1,
    schema: { type: "object", additionalProperties: false },
    auth: [],
  })
  kv.put("_", "__indexes__", {
    index: 2,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_", "__accounts__", {
    index: 3,
    schema: { type: "object" },
    auth: [],
  })
  kv.put("_config", "info", {
    id: _id,
    owner: signer,
    last_dir_id: 3,
  })
  kv.put("_config", "config", { max_doc_id: 168, max_dir_id: 8 })
  return arguments[0]
}

export { parseOp, initDB, signer }
