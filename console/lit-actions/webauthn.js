function to8(base64) {
  var binary_string = atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes
}

const to64 = v => btoa(String.fromCharCode(...new Uint8Array(v)))

function base64URLStringToBuffer(base64URLString) {
  const base64 = base64URLString.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (base64.length % 4)) % 4
  const padded = base64.padEnd(base64.length + padLength, "=")
  const binary = atob(padded)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return buffer
}

const decodeBase64 = function (s) {
  var e = {},
    i,
    b = 0,
    c,
    x,
    l = 0,
    a,
    r = "",
    w = String.fromCharCode,
    L = s.length
  var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  for (i = 0; i < 64; i++) {
    e[A.charAt(i)] = i
  }
  for (x = 0; x < L; x++) {
    c = e[s.charAt(x)]
    b = (b << 6) + c
    l += 6
    while (l >= 8) {
      ;((a = (b >>> (l -= 8)) & 0xff) || x < L - 2) && (r += w(a))
    }
  }
  return r
}

const go = async () => {
  const {
    contractTxId,
    pub,
    clientDataJSON,
    authenticatorData,
    signature,
    nonce,
  } = data
  let _signature = null
  const sig = new Uint8Array(base64URLStringToBuffer(signature))
  const _authenticatorData = new Uint8Array(
    base64URLStringToBuffer(authenticatorData)
  )
  const clientDataHash = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      base64URLStringToBuffer(clientDataJSON)
    )
  )
  let signedData = new Uint8Array(
    _authenticatorData.length + clientDataHash.length
  )
  signedData.set(_authenticatorData)
  signedData.set(clientDataHash, _authenticatorData.length)
  const rStart = sig[4] === 0 ? 5 : 4
  const rEnd = rStart + 32
  const sStart = sig[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2
  const r = sig.slice(rStart, rEnd)
  const s = sig.slice(sStart)
  const _data = to64(signedData.buffer)
  const psig = new Uint8Array([...r, ...s])
  const curve = {
    name: "ECDSA",
    namedCurve: "P-256",
    hash: { name: "SHA-256" },
  }
  const isValid = await crypto.subtle.verify(
    curve,
    await crypto.subtle.importKey(
      "spki",
      new Uint8Array(base64URLStringToBuffer(pub)),
      curve,
      true,
      ["verify"]
    ),
    psig,
    to8(_data)
  )
  if (
    isValid &&
    JSON.parse(decodeBase64(clientDataJSON)).challenge.toLowerCase() ===
      param.caller.toLowerCase().slice(2)
  ) {
    const EIP712Domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "verifyingContract", type: "string" },
    ]
    const query = {
      func: "relay",
      query: [
        typeof jobID === "undefined" ? "auth:webauthn" : jobID,
        param,
        { linkTo: "webauthn:" + pub },
      ],
    }
    const message = {
      nonce,
      query: JSON.stringify(query),
    }
    const data_to_sign = {
      types: {
        EIP712Domain,
        Query: [
          { name: "query", type: "string" },
          { name: "nonce", type: "uint256" },
        ],
      },
      domain: {
        name: typeof name === "undefined" ? "weavedb" : name,
        version: typeof version === "undefined" ? "1" : version,
        verifyingContract: contractTxId,
      },
      primaryType: "Query",
      message,
    }
    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
      message: JSON.stringify(data_to_sign),
      publicKey,
      sigName: "sig1",
    })
  }
}
go()
