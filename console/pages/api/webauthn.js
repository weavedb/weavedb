const { isNil } = require("ramda")
const crypto = require("crypto")
const privateKey =
  "b27f20c58d36d9db05c23b85f066f50eefe8e5fd7548f9f0a317957c6a1b6276"
function to8(base64) {
  var binary_string = atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes
}

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

export default async (req, res) => {
  const { r, s, pub, data } = req.body
  const psig = new Uint8Array([...to8(r), ...to8(s)])
  const curve = {
    name: "ECDSA",
    namedCurve: "P-256",
    hash: { name: "SHA-256" },
  }
  console.log(
    await crypto.subtle.verify(
      curve,
      await crypto.subtle.importKey(
        "spki",
        new Uint8Array(base64URLStringToBuffer(pub)),
        curve,
        true,
        ["verify"]
      ),
      psig,
      to8(data)
    )
  )
  res.status(200).json(req.body)
}
