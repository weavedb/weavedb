import { keccak256 } from "./keccak.js"
import { map, is } from "ramda"
function base64urlToBytes(str) {
  const padded = str + "===".slice((str.length + 3) % 4)
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/")
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  let result = []

  for (let i = 0; i < base64.length; i += 4) {
    const encoded = base64.slice(i, i + 4)
    let bits = 0
    let validBits = 0

    for (let j = 0; j < encoded.length; j++) {
      if (encoded[j] !== "=") {
        bits = (bits << 6) | chars.indexOf(encoded[j])
        validBits += 6
      }
    }

    while (validBits >= 8) {
      validBits -= 8
      result.push((bits >> validBits) & 0xff)
    }
  }

  return new Uint8Array(result)
}

function bytesToBase64url(bytes) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let result = ""

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0

    const combined = (a << 16) | (b << 8) | c

    result += chars[(combined >> 18) & 0x3f]
    result += chars[(combined >> 12) & 0x3f]
    if (i + 1 < bytes.length) result += chars[(combined >> 6) & 0x3f]
    if (i + 2 < bytes.length) result += chars[combined & 0x3f]
  }

  return result
}

function wdb23(addr) {
  if (!addr || typeof addr !== "string") {
    throw new Error("Invalid Arweave address: must be a non-empty string")
  }
  addr = addr.trim()
  if (addr.length !== 43) {
    throw new Error(
      `Invalid Arweave address length: expected 43 characters, got ${addr.length}`,
    )
  }
  const base64urlPattern = /^[A-Za-z0-9\-_]+$/
  if (!base64urlPattern.test(addr)) {
    throw new Error("Invalid Arweave address: contains invalid characters")
  }

  try {
    const bytes = base64urlToBytes(addr)
    if (bytes.length !== 32) {
      throw new Error(
        `Invalid Arweave address: decoded to ${bytes.length} bytes, expected 32`,
      )
    }
    const wdb23Bytes = new Uint8Array(23)
    wdb23Bytes[0] = 0x61
    wdb23Bytes[1] = 0x72
    wdb23Bytes[2] = 0x2d
    wdb23Bytes.set(bytes.slice(0, 20), 3)
    const addressPart = bytesToBase64url(bytes.slice(0, 20))
    return `ar--${addressPart}`
  } catch (error) {
    throw new Error(`Failed to convert Arweave address: ${error.message}`)
  }
}

function wdb160(bufs) {
  let _bufs = map(v => {
    let type = "utf8"
    let val = v

    if (is(Array, v)) {
      val = v[0]
      type = v[1] ?? "utf8"
    }

    // Convert any data type to string first
    if (typeof val !== "string") {
      if (val === null || val === undefined) {
        val = String(val)
      } else if (typeof val === "object") {
        val = JSON.stringify(val)
      } else {
        val = String(val)
      }
    }

    // Auto-detect base64url for WDB23 addresses (31 chars = 23 bytes)
    if (type === "utf8" && val.length === 31 && isBase64url(val)) {
      type = "base64url"
    }

    // Handle hex strings
    if (type === "hex" && val.startsWith("0x")) {
      val = val.slice(2)
    }

    // Handle base64url by converting to base64
    if (type === "base64url") {
      val = val.replace(/-/g, "+").replace(/_/g, "/")
      while (val.length % 4) {
        val += "="
      }
      type = "base64"
    }

    return Buffer.from(val, type)
  })(bufs)

  return to64(keccak256(Buffer.concat(_bufs)))
}

function isBase64url(str) {
  // Base64url character set: A-Z, a-z, 0-9, -, _
  const base64urlRegex = /^[A-Za-z0-9_-]+$/
  return base64urlRegex.test(str)
}

function to64(from) {
  return Buffer.from(from)
    .slice(0, 20)
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=/g, "")
}

export { wdb23, wdb160 }
