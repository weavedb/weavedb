import {
  extractPubKey,
  rsaid,
  hmacid,
  id,
  hashpath,
  httpsig_from,
  structured_to,
} from "hbsig/nocrypto"

import { of, ka } from "monade"
import { toAddr, parseOp, wdb23 } from "./utils.js"
import { includes, isNil } from "ramda"
import version from "./version.js"
import normalize_httpsig from "./dev_normalize_httpsig.js"

function commit(msg) {
  let body = {}
  const inlineBodyKey = msg.headers["inline-body-key"]
  for (const v of msg.fields) {
    const key = v === "@path" ? "path" : v
    body[key] = msg.headers[key]
  }
  if (msg.body) {
    let bodyContent = msg.body
    if (inlineBodyKey === "data") body.data = bodyContent
    else body.body = bodyContent
  }
  delete body["inline-body-key"]
  const hmacId = hmacid(msg.headers)
  const rsaId = rsaid(msg.headers)
  const pub = extractPubKey(msg.headers)
  const committer = toAddr(pub.toString("base64"))
  const meta = { alg: "rsa-pss-sha512", "commitment-device": "httpsig@1.0" }
  const meta2 = { alg: "hmac-sha256", "commitment-device": "httpsig@1.0" }
  const sigs = {
    signature: msg.headers.signature,
    "signature-input": msg.headers["signature-input"],
  }
  const committed = {
    commitments: {
      [rsaId]: { ...meta, committer, ...sigs },
      [hmacId]: { ...meta2, ...sigs },
    },
    ...body,
  }
  return committed
}

function setTS64({ state, msg, env }) {
  state.ts = env.info.ts
  let ts_count = env.kv.get("__ts__", "latest") ?? {
    count: -1,
    ts: env.info.ts,
  }
  if (ts_count.ts === env.info.ts) ts_count.count += 1
  else ((ts_count.count = 0), (ts_count.ts = env.info.ts))
  env.kv.put("__ts__", "latest", ts_count)
  state.ts64 = env.info.ts * 1000 + ts_count.count
  return arguments[0]
}

function setMeta({ state, msg, env }) {
  if (!isNil(msg.headers.nonce)) state.nonce = msg.headers.nonce
  if (env.info.branch) state.branch = env.info.branch
  state.id = msg.headers.id
  state.nonce = msg.headers.nonce
  state.signer = toAddr(msg.keyid)
  state.signer23 = wdb23(state.signer)
  state.query = JSON.parse(msg.headers.query)
  return arguments[0]
}

const setState = ka().map(setMeta).map(setTS64).map(parseOp)

function setHashpath({ state, msg, env }) {
  const committed = commit(msg)
  env.info.hashpath = !env.info.hashpath
    ? `${msg.headers.id}/${id(committed)}`
    : hashpath(env.info.hashpath, committed)
  return arguments[0]
}

function setEnv({ state, msg, env }) {
  if (!msg) return arguments[0]
  env.info = env.kv.get("_config", "info") ?? { i: -1 }
  env.module_version = version
  of(arguments[0]).map(setHashpath)
  env.info.i++
  env.info.ts = msg.ts ?? Date.now()
  env.kv.put("_config", "info", env.info)
  return arguments[0]
}

export default ka().chain(normalize_httpsig.k).map(setEnv).chain(setState.k)
