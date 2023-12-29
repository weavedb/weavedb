import lf from "localforage"
import { makeBackendActor, makeHelloActor } from "../ui/service/actor-locator"
import { AuthClient } from "@dfinity/auth-client"
import * as vetkd from "ic-vetkd-utils"
const enc = new TextEncoder()
const dec = new TextDecoder()
let authClient = null
const hex_decode = hexString =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

const hex_encode = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")

export const getActors = async () => {
  authClient ??= await AuthClient.create()
  const identity = authClient.getIdentity()
  const principal = identity.getPrincipal()
  const helloActor = makeHelloActor(identity)
  const backendActor = makeBackendActor(identity)
  return { identity, principal, helloActor, backendActor, authClient }
}

export const logout = async () => {
  authClient ??= await AuthClient.create()
  await authClient.logout()
}

export const login = async () => {
  authClient ??= await AuthClient.create()
  await new Promise(resolve => {
    authClient.login({
      identityProvider: `http://127.0.0.1:4943/?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}`,
      onSuccess: resolve,
    })
  })
  const { identity, helloActor, principal } = await getActors()
  const list = await helloActor.listKeys(principal.toString())
  return { principal, list }
}

export const getAES = async () => {
  const { principal, backendActor } = await getActors()
  const seed = window.crypto.getRandomValues(new Uint8Array(32))
  const tsk = new vetkd.TransportSecretKey(seed)
  const ek_bytes_hex = await backendActor.encrypted_symmetric_key_for_caller(
    tsk.public_key()
  )
  const pk_bytes_hex = await backendActor.symmetric_key_verification_key()
  const rawKey = tsk.decrypt_and_hash(
    hex_decode(ek_bytes_hex),
    hex_decode(pk_bytes_hex),
    principal.toUint8Array(),
    32,
    enc.encode("aes-256-gcm")
  )
  return await window.crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ])
}
export const getKey = async passkey => {
  const { principal: pr, helloActor } = await getActors()
  const exKey = await helloActor.getKey(pr.toString(), passkey)
  if (exKey.length === 0) {
    return null
  } else {
    const mkey_encoded = JSON.parse(dec.decode(exKey[0]))
    return {
      nonce: new Uint8Array(mkey_encoded.nonce),
      key: new Uint8Array(mkey_encoded.key).buffer,
    }
  }
}
export const getMaster = async (key, mkey) => {
  const _master = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: mkey.nonce },
    key,
    mkey.key
  )
  return await window.crypto.subtle.importKey("raw", _master, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ])
}

export const encodeMaster = async (master, key, passkey) => {
  const { helloActor } = await getActors()
  const rawKeyMaster = await crypto.subtle.exportKey("raw", master)
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const eMaster = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    rawKeyMaster
  )
  const mkey_icp = {
    nonce: Array.from(iv),
    key: Array.from(new Uint8Array(eMaster)),
  }
  const mkey_encoded = Array.from(enc.encode(JSON.stringify(mkey_icp)))
  await helloActor.setKey(passkey, mkey_encoded)
}

export const getCreateMaster = async (key, passkey) => {
  const { principal: pr, helloActor } = await getActors()
  const principal = pr.toString()
  const exKey = await helloActor.getKey(principal, passkey)
  const mkey = await getKey(passkey)
  let master = null
  if (mkey) {
    master = await getMaster(key, mkey)
  } else {
    master = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    )
    await encodeMaster(master, key, principal)
  }
  return master
}

export const createPasskey = async createName => {
  const reg = await navigator.credentials.create({
    publicKey: {
      challenge: enc.encode("Weave Wallet"),
      rp: {
        name: "Weave Wallet",
        id: location.host.split(":")[0],
      },
      user: {
        id: enc.encode(createName),
        name: createName,
        displayName: createName,
      },
      pubKeyCredParams: [
        { alg: -8, type: "public-key" },
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      extensions: {
        largeBlob: {
          support: "preferred",
        },
      },
    },
  })
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
  const rawKey = await crypto.subtle.exportKey("raw", key)
  return { key, rawKey, reg }
}

export const getDeviceAES = async id => {
  let publicKey = {
    challenge: enc.encode("Weave Wallet"),
    rpId: location.host.split(":")[0],
    extensions: {
      largeBlob: {
        read: true,
      },
    },
  }
  if (id) {
    publicKey.allowCredentials = [{ id, type: "public-key" }]
  }
  const reg = await navigator.credentials.get({
    publicKey,
  })
  let rawKey = null
  if (!reg.getClientExtensionResults().largeBlob?.blob) {
    rawKey = await lf.getItem(`${reg.id}.device_key`)
    //alert("This device is not compatible.")
    //return null
  } else {
    rawKey = reg.getClientExtensionResults().largeBlob.blob
  }
  const key = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  )
  return { key, reg }
}

export const writePasskey = async (id, rawKey) => {
  const publicKey = {
    challenge: enc.encode("Weave Wallet"),
    rpId: location.host.split(":")[0],
    allowCredentials: [
      {
        id,
        type: "public-key",
      },
    ],
    extensions: {
      largeBlob: {
        write: rawKey,
      },
    },
  }
  await navigator.credentials.get({
    publicKey,
  })
}
