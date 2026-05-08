// HTTP message signature verification for the Worker.
//
// Mirrors hb/src/server-utils.js's `verify(req)` but takes a fetch API
// `Request` instead of an Express req. Body is read once (consuming the
// stream) and returned alongside the verification result, so callers don't
// need to read it again.

import {
  verify as _verify,
  httpsig_from,
  structured_to,
  toAddr,
} from "hbsig"

/**
 * Build a plain-object request shape compatible with hbsig's `_verify`,
 * matching what hb/src/server-utils.js#toMsg produces.
 *
 * @param {Request} req fetch API request
 * @returns {Promise<{headers: Record<string,string>, body: string, method: string, url: string}>}
 */
async function adaptRequest(req) {
  const headers = {}
  for (const [k, v] of req.headers) headers[k.toLowerCase()] = v
  const body =
    req.method !== "GET" && req.method !== "HEAD" ? await req.text() : ""
  return {
    // Express-shape — what hbsig._verify expects.
    headers,
    body,
    method: req.method,
    url: req.url,
    // Flat-shape — what httpsig_from expects (server-utils.js#toMsg shape).
    // header keys at top level + body.
    flat: { ...headers, body },
  }
}

/**
 * Verify a signed request and decode its query.
 * Returns the same shape as hb/src/server-utils.js#verify, plus `body` so
 * callers don't have to re-read the consumed stream.
 *
 * @param {Request} req
 * @returns {Promise<{
 *   valid: boolean,
 *   address: string | null,
 *   query: any,
 *   ts: number,
 *   fields: any,
 *   body: string,
 *   adapted: { headers: Record<string,string>, body: string, method: string, url: string },
 *   err?: boolean,
 * }>}
 */
export async function verify(req) {
  const ts = Date.now()
  const adapted = await adaptRequest(req)
  const fail = (extra = {}) => ({
    valid: false,
    address: null,
    query: null,
    ts,
    fields: null,
    body: adapted.body,
    adapted,
    ...extra,
  })
  try {
    const verifyArg = {
      headers: adapted.headers,
      body: adapted.body,
      method: adapted.method,
      url: adapted.url,
    }
    const result = await _verify(verifyArg)
    if (!result?.valid) return fail()
    const { keyId, decodedSignatureInput } = result
    const address = toAddr(keyId)
    // httpsig_from wants the flat-shape: header keys at the top level plus body.
    const msg = structured_to(httpsig_from(adapted.flat))
    if (msg?.query == null) return fail({ err: true })
    const query = JSON.parse(msg.query)
    return {
      valid: true,
      address,
      query,
      ts,
      fields: decodedSignatureInput?.components ?? null,
      body: adapted.body,
      adapted,
    }
  } catch (e) {
    return fail({ err: true })
  }
}

export { toAddr }
