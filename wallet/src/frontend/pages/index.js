const { Ed25519KeyIdentity } = require("@dfinity/identity")
import { AuthClient } from "@dfinity/auth-client"
const { generateRegistrationOptions } = require("@simplewebauthn/server")
const enc = new TextEncoder()
const dec = new TextDecoder()
import { startRegistration } from "@simplewebauthn/browser"
const SDK = require("weavedb-client")
const EthCrypto = require("eth-crypto")
import { createHash } from "sha256-uint8array"
const { poseidonConstants, buildEddsa } = require("circomlibjs")
import { EdDSAPoseidon } from "@zk-kit/eddsa-poseidon"
const Scalar = require("ffjavascript").Scalar
import {
  verifySignature,
  derivePublicKey,
  signMessage,
} from "@zk-kit/eddsa-poseidon"
import { Image, Input, Select, Box, Flex } from "@chakra-ui/react"
import dayjs from "dayjs"
import {
  propEq,
  mergeLeft,
  concat,
  assoc,
  last,
  includes,
  map,
  range,
  trim,
  append,
  isNil,
  indexBy,
  prop,
  findIndex,
} from "ramda"
import { useEffect, useState } from "react"
import lf from "localforage"
import {
  KmsKeyType,
  CircuitId,
  CredentialStatusType,
  IIdentityWallet,
  core,
} from "@0xpolygonid/js-sdk"
import { DID } from "@iden3/js-iden3-core"
import { PublicKey } from "@iden3/js-crypto"
import {
  initCircuitStorage,
  initProofService,
  initDataStorageAndWallets,
} from "../lib/walletSetup"
const rhsUrl = "https://rhs-staging.polygonid.me"
const { WarpFactory } = require("warp-contracts")
import {
  getDeviceAES,
  encodeMaster,
  writePasskey,
  createPasskey,
  getMaster,
  getCreateMaster,
  getAES,
  getActors,
  logout,
  login,
  getKey,
} from "../lib/wallet"

BigInt.prototype.toJSON = function () {
  return this.toString()
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
let dataStorage, credentialWallet, identityWallet, proofService, db
async function createIdentity(identityWallet) {
  const { did, credential } = await identityWallet.createIdentity({
    method: core.DidMethod.polygonId,
    blockchain: core.Blockchain.Polygon,
    networkId: core.NetworkId.Mumbai,
    revocationOpts: {
      type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      id: rhsUrl,
    },
  })
  return { did, credential }
}

import { Principal } from "@dfinity/principal"
import { makeBackendActor, makeHelloActor } from "../ui/service/actor-locator"
import { HttpAgent, Actor } from "@dfinity/agent"
import Head from "next/head"
import { GreetingSection } from "../ui/components/GreetingSection"
import { ImageSection } from "../ui/components/ImageSection"

let _principal = null

export default function Home() {
  const [principal, setPrincipal] = useState(null)
  useEffect(() => {
    ;(async () => {
      const { principal: pr, helloActor } = await getActors()
      const pr_str = pr.toString()
      if (pr_str.length > 20) {
        setPrincipal(pr_str)
        _principal = pr
        setKeylist(await helloActor.listKeys(_principal.toString()))
      }
    })()
  }, [])
  const _points = {
    WDB: {
      name: "WeaveChain Testnet Token",
      symbol: "WDB",
      logo: "/wdb.png",
    },
  }
  const [backup, setBackup] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [create, setCreate] = useState(false)
  const [balances, setBalances] = useState([])
  const [identities, setIdentities] = useState([])
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [allCreds, setAllCreds] = useState({})
  const [proofs, setProofs] = useState([])
  const [issuer, setIssuer] = useState(null)
  const [cred, setCred] = useState(null)
  const [creds, setCreds] = useState([])
  const [proof, setProof] = useState(null)
  const [valids, setValids] = useState({})
  const [docType, setDocType] = useState(1)
  const [birthday, setBirthday] = useState(19900101)
  const [field, setField] = useState("birthday")
  const [issueP, setIssueP] = useState(false)
  const [pointName, setPointName] = useState("")
  const [pointSym, setPointSym] = useState("")
  const [val, setVal] = useState(19900101)
  const [arr, setArr] = useState("1, 2, 3")
  const [op, setOp] = useState("$eq")
  const [res, setRes] = useState(null)
  const [tab, setTab] = useState("DIDs")
  const [action, setAction] = useState(null)
  const [issue, setIssue] = useState(false)
  const [loading, setLoading] = useState({})
  const [point, setPoint] = useState({ symbol: "WDB", balance: 0 })
  const [points, setPoints] = useState(_points)
  const [mint, setMint] = useState(0)
  const [send, setSend] = useState(0)
  const [createName, setCreateName] = useState("")
  const [to, setTo] = useState("")
  const [aes, setAES] = useState(null)
  const [aid, setAID] = useState(null)
  const [logging, setLogging] = useState(false)
  const [keylist, setKeylist] = useState([])
  useEffect(() => {
    ;(async () => {
      db = new SDK({
        rpc: "http://localhost:8080",
        contractTxId: "weave_point",
      })
      setAccounts((await lf.getItem("passkeys")) ?? [])
    })()
  }, [])
  useEffect(() => {
    ;(async () => {
      if (aid) {
        ;({ dataStorage, credentialWallet, identityWallet } =
          await initDataStorageAndWallets(aid, aes))
        let _issuer = await lf.getItem(`${aid.id}.issuer`)
        if (!_issuer) {
          const issuer = await createIdentity(identityWallet)
          const { did: issuerDID, credential: issuerAuthBJJCredential } = issuer
          await lf.setItem(`${aid.id}.issuer`, issuerDID.string())
          setIssuer(issuer)
        } else {
          setIssuer({ did: DID.parse(_issuer) })
        }
        const circuitStorage = await initCircuitStorage()
        proofService = await initProofService(
          identityWallet,
          credentialWallet,
          dataStorage.states,
          circuitStorage
        )
        let _users = (await lf.getItem(`${aid.id}.users`)) ?? []
        let __users = []
        for (const v of _users) {
          __users.push({
            credential: { id: v.split("-").slice(1).join("-") },
            did: DID.parse(v.split("-")[0]),
          })
        }
        setUsers(__users)
      }
    })()
  }, [aid])

  useEffect(() => {
    ;(async () => {
      if (user) {
        const did = user.did.string()
        let _ids = (await lf.getItem(`${aid.id}.identities-${did}`)) ?? []
        setIdentities(_ids)
        let _creds = ((await lf.getItem(`${aid.id}.creds`)) ?? {})[did] ?? []
        let __creds = []
        const store = dataStorage.credential._dataSource
        for (const v of _creds) {
          const c = await store.get(v, "id")
          if (c) {
            let req = {
              credentialSchema: c.credentialSchema.id,
              credentialSubject: c.credentialSubject,
              expiration: dayjs(c.expirationDate).unix(),
              subjectPosition: "index",
              type: c.type[1],
            }
            __creds.push({ request: req, credential: { id: v } })
          }
        }
        setCreds(__creds)

        let _proofs = ((await lf.getItem(`${aid.id}.proofs`)) ?? {})[did] ?? []
        let __proofs = []
        for (const v of _proofs) {
          const c = await lf.getItem(`${aid.id}.proofs-${v}`)
          if (c) __proofs.push(c)
        }
        setProofs(__proofs)
        setBalances(
          concat(
            [{ symbol: "WDB", balance: 0, address: did }],
            await db.get("balances", ["address", "==", did])
          )
        )
      }
    })()
  }, [user])

  useEffect(() => {
    ;(async () => {
      let pts = []
      for (let v of balances) {
        if (isNil(points[v.symbol])) {
          pts.push(v.symbol)
        }
      }
      if (pts.length > 0) {
        setPoints(
          mergeLeft(
            points,
            indexBy(
              prop("symbol"),
              await db.get("points", ["symbol", "in", pts])
            )
          )
        )
      }
    })()
  }, [balances])

  let tempID = null
  for (let v of identities) {
    if (v.rpc === "http://localhost:3000") tempID = v
  }

  return (
    <Flex
      style={{ display: "flex" }}
      align="center"
      direction="column"
      bg="radial-gradient(at center top, rgb(255, 255, 255), rgb(156, 137, 246))"
      minH="100%"
      h="auto"
    >
      <style jsx global>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
      <>
        <Flex
          justify="center"
          align="center"
          fontSize="25px"
          color="#5137C5"
          p={4}
          style={{ maxWidth: "750px", width: "100%" }}
        >
          <Flex align="center">
            <Image src="/logo.png" h="25px" mr={4} />
            <Box>Weave Wallet</Box>
          </Flex>
          {!principal ? null : (
            <>
              <Flex flex={1} />
              <Flex
                sx={{
                  cursor: "pointer",
                  ":hover": { opacity: 0.75 },
                }}
                fontSize="14px"
                onClick={async () => {
                  await logout()
                  setAID(null)
                  setAES(null)
                  setPrincipal(null)
                  _principal = null
                }}
              >
                Sign Out ({principal.split("-")[0]})
              </Flex>
            </>
          )}
        </Flex>
        <Box flex={1} style={{ maxWidth: "750px", width: "100%" }}>
          <Box
            mx={2}
            mb={2}
            bg="white"
            sx={{
              borderRadius: "5px",
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
            }}
          >
            {!aes ? (
              !principal ? (
                <Flex minH="250px" justify="center" align="center">
                  <Flex
                    p={3}
                    w="300px"
                    bg="#5137C5"
                    color="white"
                    justify="center"
                    sx={{
                      borderRadius: "5px",
                      cursor: logging ? "default" : "pointer",
                      ":hover": { opacity: 0.75 },
                    }}
                    onClick={async () => {
                      if (logging) return
                      setLogging(true)
                      try {
                        const { list, principal: _pr } = await login()
                        _principal = _pr
                        setPrincipal(_pr.toString())
                        setKeylist(list)
                      } catch (e) {
                        console.log(e)
                      }
                      setLogging(false)
                    }}
                  >
                    {logging ? (
                      <Flex align="center">
                        <Box as="i" className="fa fa-spin fa-sync" mr={3} />
                        Signing In...
                      </Flex>
                    ) : (
                      "Sign In"
                    )}
                  </Flex>
                </Flex>
              ) : create ? (
                <Flex minH="250px" justify="center" align="center">
                  <Box>
                    <Box fontSize="12px" mb={2} as="label">
                      Device Name
                    </Box>
                    <Input
                      display="block"
                      width="300px"
                      mb={4}
                      bg="white"
                      value={createName}
                      onChange={e => setCreateName(e.target.value)}
                      sx={{ border: "1px solid #5137C5" }}
                    />
                    <Flex
                      p={3}
                      w="300px"
                      bg="#5137C5"
                      color="white"
                      justify="center"
                      sx={{
                        borderRadius: "5px",
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={async () => {
                        if (/^\s*$/.test(createName)) {
                          alert("Enter Account Name")
                          return
                        }
                        let master = null
                        if (keylist === 0) {
                          master = await window.crypto.subtle.generateKey(
                            {
                              name: "AES-GCM",
                              length: 256,
                            },
                            true,
                            ["encrypt", "decrypt"]
                          )
                        } else {
                          if (principal !== keylist[0]) {
                            alert("master key cannot be recovered")
                            return
                          }
                          const mkey = await getKey(principal)
                          if (!mkey) {
                            alert("master key cannot be recovered")
                            return
                          }
                          const aes_key = await getAES()
                          master = await getMaster(aes_key, mkey)
                        }

                        const { reg, key, rawKey } = await createPasskey(
                          createName
                        )
                        if (
                          !reg.getClientExtensionResults().largeBlob?.supported
                        ) {
                          //alert("This device is not compatible")
                          await lf.setItem(`${reg.id}.device_key`, rawKey)
                        } else {
                          await writePasskey(reg.rawId, rawKey)
                        }
                        await encodeMaster(master, key, reg.id)
                        const ac = {
                          name: createName,
                          rawId: reg.rawId,
                          id: reg.id,
                        }
                        setAccounts(append(ac, accounts))
                        setCreate(false)
                        setAES(master)
                        setAID(ac)
                        let passkeys = (await lf.getItem("passkeys")) ?? []
                        await lf.setItem("passkeys", append(ac, passkeys))
                      }}
                    >
                      Add Device
                    </Flex>
                    <Flex
                      mt={2}
                      w="300px"
                      color="#5137C5"
                      justify="center"
                      sx={{
                        borderRadius: "5px",
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={() => setCreate(false)}
                    >
                      Use Existing Passkey
                    </Flex>
                  </Box>
                </Flex>
              ) : (
                <Flex minH="300px" justify="center" align="center" p={10}>
                  <Box>
                    {map(v => {
                      return (
                        <Flex
                          p={2}
                          w="300px"
                          color="#5137C5"
                          justify="center"
                          mb={3}
                          sx={{
                            border: "1px solid #5137C5",
                            borderRadius: "5px",
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                          onClick={async () => {
                            const { key } = await getDeviceAES(v.rawId)
                            const mkey = await getKey(v.id)
                            if (!mkey) {
                              alert("device key cannot be recovered")
                              return
                            }
                            const master = await getMaster(key, mkey)
                            setAES(master)
                            setAID(v)
                          }}
                        >
                          Decrypt with {v.name}
                        </Flex>
                      )
                    })(accounts)}
                    {accounts.length === 0 ? null : <Box as="hr" my={4} />}
                    <Flex
                      p={3}
                      w="300px"
                      bg="#28292D"
                      color="white"
                      justify="center"
                      sx={{
                        borderRadius: "5px",
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={async () => {
                        if (logging) return
                        setLogging(true)
                        try {
                          const key = await getAES()
                          setCreate(false)
                          const master = await getCreateMaster(key, principal)
                          const ac = {
                            id: principal,
                            name: "Internet Computer",
                          }
                          setAES(master)
                          setAID(ac)
                        } catch (e) {
                          console.log(e)
                        }
                        setLogging(false)
                      }}
                    >
                      <Flex align="center">
                        {logging ? (
                          <Box as="i" className="fa fa-spin fa-sync" mr={5} />
                        ) : (
                          <Image src="/dfinity.png" boxSize="24px" mr={3} />
                        )}
                        <Box>Use ICP VETKey</Box>
                      </Flex>
                    </Flex>
                    <Flex
                      mt={3}
                      p={3}
                      w="300px"
                      bg="#5137C5"
                      color="white"
                      justify="center"
                      sx={{
                        borderRadius: "5px",
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={async () => {
                        const { reg, key } = await getDeviceAES()
                        if (!key) return
                        setAES(key)
                        let exists = false
                        for (const v of accounts) {
                          if (v.id === reg.id) exists = true
                        }
                        if (!exists) setAccounts(append(ac, accounts))

                        const ac = {
                          name: dec.decode(reg.response.userHandle),
                          rawId: reg.rawId,
                          id: reg.id,
                        }
                        setAID(ac)
                      }}
                    >
                      Use Existing Passkey
                    </Flex>
                    <Flex
                      mt={2}
                      w="300px"
                      color="#5137C5"
                      justify="center"
                      sx={{
                        borderRadius: "5px",
                        cursor: "pointer",
                        ":hover": { opacity: 0.75 },
                      }}
                      onClick={() => setCreate(true)}
                    >
                      Add Passkey
                    </Flex>
                  </Box>
                </Flex>
              )
            ) : (
              <>
                <Flex
                  h="60px"
                  color="#5137C5"
                  fontWeight="bold"
                  fontSize="14px"
                  justify="center"
                  align="center"
                  sx={{ borderBottom: "1px solid #ddd" }}
                >
                  <Flex flex={1}>
                    <Flex
                      px={4}
                      py={1}
                      fontSize="12px"
                      bg="#EBE7FD"
                      sx={{ borderRadius: "15px" }}
                      mx={4}
                    >
                      Mumbai
                    </Flex>
                  </Flex>
                  <Flex flex={1} justify="center">
                    <Box
                      sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                      onClick={() => setTab("DIDs")}
                    >
                      {user
                        ? last(user.did.string().split(":")).slice(0, 15)
                        : "No Account Selected"}
                      <Box ml={2} as="i" className="fas fa-chevron-down" />
                    </Box>
                  </Flex>
                  <Flex
                    w="50px"
                    sx={{ cursor: "pointer", ":hover": { opacity: 0.75 } }}
                    flex={1}
                    justify="flex-end"
                    fontSize="20px"
                    onClick={async () => {
                      const eddsa = await buildEddsa(poseidonConstants)
                      const credential =
                        await dataStorage.credential._dataSource.get(
                          user.credential.id
                        )
                      const keyKMSId =
                        identityWallet.getKMSIdByAuthCredential(credential)
                      const keyProvider = identityWallet._kms._registry.get(
                        KmsKeyType.BabyJubJub
                      )
                      console.log(
                        (await keyProvider.privateKey(keyKMSId)).hex()
                      )
                      return
                    }}
                  >
                    <Box mr={6} as="i" className="fas fa-ellipsis-v" />
                  </Flex>
                </Flex>
                {tab === "DIDs" ? (
                  <>
                    {map(v => {
                      return (
                        <Flex
                          align="center"
                          p={4}
                          fontSize="14px"
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                            borderLeft:
                              user && v.did.string() === user.did.string()
                                ? "5px solid #5137C5"
                                : "5px solid white",
                          }}
                          onClick={() => {
                            setUser(v)
                            setTab("Points")
                          }}
                        >
                          <Flex
                            mr={4}
                            align="center"
                            justify="center"
                            bg=""
                            color="#5137C5"
                            bg="#EBE7FD"
                            boxSize="35px"
                            sx={{ borderRadius: "50%" }}
                          >
                            <Box as="i" className="far fa-id-card" />
                          </Flex>
                          <Box flex={1} fontSize="12px">
                            <Box fontSize="14px" fontWeight="bold">
                              {last(v.did.string().split(":")).slice(0, 15)}
                            </Box>
                            <Box>{v.did.string()}</Box>
                          </Box>
                          <Box>0.00 WDB</Box>
                        </Flex>
                      )
                    })(users)}
                    <Box py={2}>
                      <Box
                        fontSize="14px"
                        fontWeight="bold"
                        color="#5137C5"
                        py={2}
                        px={8}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                        onClick={async () => {
                          const user = await createIdentity(identityWallet)
                          setUser(user)
                          setUsers(append(user)(users))
                          const {
                            did: userDID,
                            credential: authBJJCredentialUser,
                          } = user
                          console.log(authBJJCredentialUser)
                          let _users =
                            (await lf.getItem(`${aid.id}.users`)) ?? []
                          _users.push(
                            `${userDID.string()}-${authBJJCredentialUser.id}`
                          )
                          await lf.setItem(`${aid.id}.users`, _users)
                          const keyKMSId =
                            identityWallet.getKMSIdByAuthCredential(
                              authBJJCredentialUser
                            )
                          const keyProvider = identityWallet._kms._registry.get(
                            KmsKeyType.BabyJubJub
                          )
                          console.log(keyProvider)
                          console.log(
                            (await keyProvider.privateKey(keyKMSId)).hex()
                          )
                          console.log(
                            (await keyProvider.privateKey(keyKMSId))
                              .public()
                              .hex()
                          )
                        }}
                      >
                        <Box as="i" className="fas fa-plus" mr={2} />
                        Create DID
                      </Box>
                      <Box
                        fontSize="14px"
                        fontWeight="bold"
                        color="#5137C5"
                        py={2}
                        px={8}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                        onClick={async () => {
                          let stores = {
                            identity: dataStorage.identity._identityDataSource,
                            profile: dataStorage.identity._profileDataSource,
                            credential: dataStorage.credential._dataSource,
                            mt: dataStorage.mt,
                            proof: dataStorage.proof._dataSource,
                            privaeKey: identityWallet._kms._registry.get(
                              KmsKeyType.BabyJubJub
                            ).keyStore,
                          }
                          let backups = {}
                          for (let k in stores) {
                            backups[k] = {
                              list: await stores[k].list(),
                              data: {},
                            }
                            for (let k2 in backups[k].list) {
                              backups[k].data[k2] = await stores[k].get(k2)
                            }
                          }
                          const msg = enc.encode(JSON.stringify(backups))
                          const iv = window.crypto.getRandomValues(
                            new Uint8Array(12)
                          )
                          const val = await crypto.subtle.encrypt(
                            { name: "AES-GCM", iv },
                            aes,
                            msg
                          )
                          const mkey_icp = {
                            iv: Array.from(iv),
                            val: Array.from(new Uint8Array(val)),
                            date: Date.now(),
                          }
                          const mkey_encoded = Array.from(
                            enc.encode(JSON.stringify(mkey_icp))
                          )
                          let authClient = await AuthClient.create()
                          const identity = authClient.getIdentity()
                          const backendActor = makeBackendActor(identity)
                          const helloActor = makeHelloActor(identity)
                          await helloActor.save(mkey_encoded)
                          setBackup(mkey_icp.date)
                        }}
                      >
                        <Box as="i" className="fas fa-server" mr={2} />
                        Backup{" "}
                        {isNil(backup)
                          ? null
                          : `(${dayjs(backup).format("YYYY/MM/DD HH:mm")})`}
                      </Box>
                      <Box
                        fontSize="14px"
                        fontWeight="bold"
                        color="#5137C5"
                        py={2}
                        px={8}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                        onClick={async () => {
                          let authClient = await AuthClient.create()
                          const identity = authClient.getIdentity()
                          const helloActor = makeHelloActor(identity)
                          const exKey = await helloActor.get(principal)
                          if (exKey.length !== 0) {
                            const mkey_encoded = JSON.parse(
                              dec.decode(exKey[0])
                            )
                            const mkey = {
                              iv: new Uint8Array(mkey_encoded.iv),
                              val: new Uint8Array(mkey_encoded.val).buffer,
                              date: mkey_encoded.date,
                            }
                            const raw = await crypto.subtle.decrypt(
                              { name: "AES-GCM", iv: mkey.iv },
                              aes,
                              mkey.val
                            )
                            let stores = {
                              identity:
                                dataStorage.identity._identityDataSource,
                              profile: dataStorage.identity._profileDataSource,
                              credential: dataStorage.credential._dataSource,
                              mt: dataStorage.mt,
                              proof: dataStorage.proof._dataSource,
                              privaeKey: identityWallet._kms._registry.get(
                                KmsKeyType.BabyJubJub
                              ).keyStore,
                            }
                            const backup = JSON.parse(dec.decode(raw))
                            for (let k in backup) {
                              for (let k2 in backup[k].list) {
                                await stores[k]._set(k2, backup[k].data[k2])
                              }
                            }
                          }
                        }}
                      >
                        <Box as="i" className="fas fa-download" mr={2} />
                        Recover
                      </Box>
                      <Box
                        fontSize="14px"
                        fontWeight="bold"
                        color="#5137C5"
                        py={2}
                        px={8}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                        onClick={async () => {
                          setAID(null)
                          setAES(null)
                          setUsers([])
                          setIdentities([])
                          setProofs([])
                          setCreds([])
                          setPoints([])
                        }}
                      >
                        <Box as="i" className="fas fa-retweet" mr={2} />
                        Change Device ({aid.name})
                      </Box>
                    </Box>
                  </>
                ) : (
                  <>
                    <Flex
                      direction="column"
                      h="200px"
                      color="#5137C5"
                      fontSize="14px"
                      justify="center"
                      align="center"
                    >
                      <Flex mt={4}>
                        <Flex
                          px={4}
                          py={1}
                          fontSize="11px"
                          bg="#EBE7FD"
                          sx={{ borderRadius: "15px" }}
                        >
                          {user
                            ? user.did.string().slice(0, 10)
                            : "No Account Selected"}
                          ...
                          {user
                            ? user.did.string().slice(-10)
                            : "No Account Selected"}
                        </Flex>
                      </Flex>
                      <Flex align="center" flex={1} fontSize="30px">
                        <Box textAlign="center">
                          <Box>
                            {point.balance} {point.symbol}
                          </Box>
                          <Box fontSize="16px" color="#333">
                            $1,000.05 USD
                          </Box>
                        </Box>
                      </Flex>
                      <Flex fontSize="12px">
                        {user.did.string() !==
                        points[point.symbol]?.owner ? null : (
                          <Flex mx={2} w="50px" justify="center" align="center">
                            <Flex
                              direction="column"
                              justify="center"
                              align="center"
                            >
                              <Flex
                                onClick={() =>
                                  setAction(action === "mint" ? null : "mint")
                                }
                                bg={action === "mint" ? "#5137C5" : "#EBE7FD"}
                                color={
                                  action !== "mint" ? "#5137C5" : "#EBE7FD"
                                }
                                mb={2}
                                justify="center"
                                align="center"
                                boxSize="35px"
                                sx={{
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  ":hover": { opacity: 0.75 },
                                }}
                              >
                                <Box as="i" className="fas fa-money-check" />
                              </Flex>
                              <Box>Mint</Box>
                            </Flex>
                          </Flex>
                        )}
                        <Flex mx={2} w="50px" justify="center" align="center">
                          <Flex
                            direction="column"
                            justify="center"
                            align="center"
                          >
                            <Flex
                              onClick={() =>
                                setAction(action === "send" ? null : "send")
                              }
                              bg={action === "send" ? "#5137C5" : "#EBE7FD"}
                              color={action !== "send" ? "#5137C5" : "#EBE7FD"}
                              mb={2}
                              justify="center"
                              align="center"
                              boxSize="35px"
                              sx={{
                                borderRadius: "50%",
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                              }}
                            >
                              <Box as="i" className="fas fa-paper-plane" />
                            </Flex>
                            <Box>Send</Box>
                          </Flex>
                        </Flex>
                        <Flex
                          mx={2}
                          w="50px"
                          direction="column"
                          justify="center"
                          align="center"
                        >
                          <Flex
                            sx={{
                              borderRadius: "50%",
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                            mb={2}
                            justify="center"
                            align="center"
                            boxSize="35px"
                            bg="#EBE7FD"
                            onClick={() => alert("coming soon")}
                          >
                            <Box as="i" className="fas fa-flag" />
                          </Flex>
                          <Box>Stake</Box>
                        </Flex>
                      </Flex>
                    </Flex>
                    {action === "mint" ? (
                      <>
                        <Flex
                          mt={4}
                          pt={4}
                          px={4}
                          bg="#EBE7FD"
                          pb={6}
                          sx={{ borderRadius: "0 0 5px 5px" }}
                        >
                          <Box flex={1} mx={2}>
                            <Box as="label" fontSize="12px" mb={2}>
                              Amount
                            </Box>
                            <Input
                              bg="white"
                              display="block"
                              value={mint}
                              onChange={e => {
                                if (!Number.isNaN(e.target.value * 1))
                                  setMint(e.target.value * 1)
                              }}
                            />
                          </Box>
                          <Box pt="14px" px={2}>
                            <Flex
                              h="40px"
                              align="center"
                              justify="center"
                              sx={{
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                                textAlign: "center",
                                width: "200px",
                                borderRadius: "5px",
                                padding: "10px 40px",
                                background: "#5137C5",
                                cursor: "pointer",
                                color: "white",
                                marginTop: "10px",
                              }}
                              onClick={async () => {
                                if (mint > 0) {
                                  try {
                                    const tx = await db.query(
                                      "add:mint",
                                      {
                                        to: user.did.string(),
                                        symbol: point.symbol,
                                        amount: mint,
                                      },
                                      "events",
                                      tempID.identity
                                    )
                                    setBalances(
                                      concat(
                                        [
                                          {
                                            symbol: "WDB",
                                            balance: 0,
                                            address:
                                              tempID.identity.linkedAccount,
                                          },
                                        ],
                                        await db.get("balances", [
                                          "address",
                                          "==",
                                          tempID.identity.linkedAccount,
                                        ])
                                      )
                                    )
                                    if (tx.success) {
                                      setPoint(
                                        assoc("balance", point.balance + mint)
                                      )
                                    }
                                  } catch (e) {
                                    console.log(e)
                                  }
                                }
                              }}
                            >
                              Mint
                            </Flex>
                          </Box>
                        </Flex>
                      </>
                    ) : null}
                    {action === "send" ? (
                      <>
                        <Box
                          mt={4}
                          pt={4}
                          px={4}
                          bg="#EBE7FD"
                          pb={6}
                          sx={{ borderRadius: "0 0 5px 5px" }}
                        >
                          <Flex w="100%" mb={4}>
                            <Box flex={1} mx={2}>
                              <Box as="label" fontSize="12px" mb={2}>
                                To
                              </Box>
                              <Input
                                bg="white"
                                display="block"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                              />
                            </Box>
                          </Flex>
                          <Flex w="100%">
                            <Box flex={1} mx={2}>
                              <Box as="label" fontSize="12px" mb={2}>
                                Amount
                              </Box>
                              <Input
                                bg="white"
                                display="block"
                                value={send}
                                onChange={e => {
                                  if (!Number.isNaN(e.target.value * 1))
                                    setSend(e.target.value * 1)
                                }}
                              />
                            </Box>
                            <Box pt="14px" px={2}>
                              <Flex
                                h="40px"
                                align="center"
                                justify="center"
                                sx={{
                                  cursor: "pointer",
                                  ":hover": { opacity: 0.75 },
                                  textAlign: "center",
                                  width: "200px",
                                  borderRadius: "5px",
                                  padding: "10px 40px",
                                  background: "#5137C5",
                                  cursor: "pointer",
                                  color: "white",
                                  marginTop: "10px",
                                }}
                                onClick={async () => {
                                  if (send > 0) {
                                    try {
                                      const tx = await db.query(
                                        "add:transfer",
                                        {
                                          to,
                                          symbol: point.symbol,
                                          amount: send,
                                        },
                                        "events",
                                        tempID.identity
                                      )
                                      setBalances(
                                        concat(
                                          [
                                            {
                                              symbol: "WDB",
                                              balance: 0,
                                              address:
                                                tempID.identity.linkedAccount,
                                            },
                                          ],
                                          await db.get("balances", [
                                            "address",
                                            "==",
                                            tempID.identity.linkedAccount,
                                          ])
                                        )
                                      )
                                      if (tx.success) {
                                        setPoint(
                                          assoc("balance", point.balance - send)
                                        )
                                      }
                                    } catch (e) {
                                      console.log(e)
                                    }
                                  }
                                }}
                              >
                                Send
                              </Flex>
                            </Box>
                          </Flex>
                        </Box>
                      </>
                    ) : null}
                    {action !== null ? null : (
                      <Flex px={2} pt={2}>
                        {map(v => (
                          <Flex
                            m={2}
                            py={3}
                            justify="center"
                            flex={1}
                            color={tab === v ? "#5137C5" : "#666"}
                            fontWeight="bold"
                            onClick={() => setTab(v)}
                            sx={{
                              borderBottom:
                                tab === v ? "2px solid #5137C5" : "",
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            {v}
                          </Flex>
                        ))(["Points", "VCs", "ZKPs", "Activity"])}
                      </Flex>
                    )}
                  </>
                )}

                {action !== null || tab === "DIDs" ? null : tab === "ZKPs" ? (
                  map(v => {
                    const sub = v.request.query.credentialSubject
                    let query = ""
                    for (const k in sub) {
                      for (const k2 in sub[k]) {
                        query = `${k} : ${k2} : ${sub[k][k2]}`
                      }
                    }
                    return (
                      <>
                        <Flex
                          align="center"
                          p={4}
                          fontSize="14px"
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                            borderLeft:
                              !isNil(proof) && v.id === proof.id
                                ? "5px solid #5137C5"
                                : "5px solid white",
                          }}
                          onClick={() =>
                            setProof(proof?.id === v.id ? null : v)
                          }
                        >
                          <Flex
                            mr={4}
                            align="center"
                            justify="center"
                            color="#5137C5"
                            bg="#EBE7FD"
                            boxSize="35px"
                            sx={{
                              borderRadius: "50%",
                            }}
                          >
                            <Box as="i" className="fas fa-ribbon" />
                          </Flex>
                          <Box flex={1}>
                            <Box fontSize="14px" fontWeight="bold">
                              {v.request.query.type} : {v.cred?.id}
                            </Box>
                            <Box>{query}</Box>
                          </Box>
                          <Flex justify="flex-end" color="#5137C5">
                            <Flex
                              align="center"
                              justify="center"
                              color="#5137C5"
                              boxSize="35px"
                              sx={{
                                borderRadius: "50%",
                                cursor: "pointer",
                                ":hover": { bg: "#EBE7FD" },
                              }}
                              onClick={() => {}}
                            >
                              <Box as="i" className="fas fa-ellipsis-v" />
                            </Flex>
                          </Flex>
                        </Flex>
                        {!isNil(proof) && proof.id === v.id ? (
                          <Box
                            py={2}
                            sx={{
                              borderLeft: "5px solid #5137C5",

                              bg: "#EBE7FD",
                            }}
                          >
                            <Flex
                              fontSize="14px"
                              fontWeight="bold"
                              color="#5137C5"
                              py={2}
                              px={8}
                              sx={{
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                              }}
                              onClick={async () => {
                                setLoading(assoc("verify", true, loading))
                                const warp = WarpFactory.forMainnet()
                                const verifier = warp
                                  .contract(
                                    "Lmu_BUdDuzja4X_egjPeOPdrQH6SQ5HgW7tKUpX37Gc"
                                  )
                                  .setEvaluationOptions({allowBigInt: true, sequencerUrl: 'https://gw.warp.cc/'})
                                const { valid, pub_signals: ps } = (
                                  await verifier.viewState({
                                    function: "verify",
                                    proof: proof.proof,
                                    pub_signals: proof.pub_signals,
                                  })
                                ).result
                                setRes(ps)
                                setValids(assoc(v.id, valid, valids))
                                setLoading(assoc("verify", false, loading))
                              }}
                              align="center"
                            >
                              <Box
                                as="i"
                                className={"fas fa-check-double"}
                                mr={2}
                              />
                              <Box flex={1}>Verify ZK-Proof Onchain</Box>
                              <Flex w="45px" justify="center">
                                {loading["verify"] ? (
                                  <Box as="i" className="fa fa-spin fa-sync" />
                                ) : valids[v.id] ? (
                                  "Valid"
                                ) : valids[v.id] === false ? (
                                  "Invalid"
                                ) : (
                                  ""
                                )}
                              </Flex>
                            </Flex>
                          </Box>
                        ) : null}
                      </>
                    )
                  })(proofs)
                ) : tab === "VCs" ? (
                  <>
                    {map(v => {
                      const sub = v.request.credentialSubject
                      return (
                        <>
                          <Flex
                            align="center"
                            p={4}
                            fontSize="14px"
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                              borderLeft:
                                !isNil(cred) &&
                                v.credential.id === cred.credential.id
                                  ? "5px solid #5137C5"
                                  : "5px solid white",
                            }}
                            onClick={() =>
                              setCred(
                                cred?.credential.id === v.credential.id
                                  ? null
                                  : v
                              )
                            }
                          >
                            <Flex
                              mr={4}
                              align="center"
                              justify="center"
                              color="#5137C5"
                              bg="#EBE7FD"
                              boxSize="35px"
                              sx={{
                                borderRadius: "50%",
                              }}
                            >
                              <Box as="i" className="fas fa-certificate" />
                            </Flex>
                            <Box flex={1}>
                              <Box fontSize="14px" fontWeight="bold">
                                {v.request.type} : {v.credential.id}
                              </Box>
                              <Box>
                                documentType: {sub.documentType}, birthday:{" "}
                                {sub.birthday}
                              </Box>
                            </Box>
                            <Flex justify="flex-end" color="#5137C5">
                              <Flex
                                align="center"
                                justify="center"
                                color="#5137C5"
                                boxSize="35px"
                                sx={{
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  ":hover": { bg: "#EBE7FD" },
                                }}
                                onClick={() => {
                                  console.log(v, user)
                                }}
                              >
                                <Box as="i" className="fas fa-ellipsis-v" />
                              </Flex>
                            </Flex>
                          </Flex>
                          {!isNil(cred) &&
                          cred.credential.id === v.credential.id ? (
                            <Box
                              sx={{
                                borderLeft: "5px solid #5137C5",
                              }}
                            >
                              <Box
                                bg="#EBE7FD"
                                pt={6}
                                pb={2}
                                px={6}
                                fontWeight="bold"
                                color="#5137C5"
                              >
                                Generate ZK Proof
                              </Box>
                              <Flex
                                px={4}
                                bg="#EBE7FD"
                                pb={6}
                                sx={{ borderRadius: "0 0 5px 5px" }}
                              >
                                <Box flex={1} mx={2}>
                                  <Box as="label" fontSize="12px" mb={2}>
                                    Field
                                  </Box>
                                  <Select
                                    bg="white"
                                    value={field}
                                    onChange={e => {
                                      setField(e.target.value)
                                    }}
                                  >
                                    {map(v => <option value={v}>{v}</option>)([
                                      "documentType",
                                      "birthday",
                                    ])}
                                  </Select>
                                </Box>
                                <Box flex={1} mx={2}>
                                  <Box as="label" fontSize="12px" mb={2}>
                                    Query
                                  </Box>
                                  <Select
                                    bg="white"
                                    value={op}
                                    onChange={e => {
                                      setOp(e.target.value)
                                    }}
                                  >
                                    {map(v => <option value={v}>{v}</option>)([
                                      "$eq",
                                      "$gt",
                                      "$lt",
                                      "$in",
                                      "$nin",
                                      "$ne",
                                      "select",
                                    ])}
                                  </Select>
                                </Box>
                                {includes(op)(["$in", "$nin"]) ? (
                                  <Box flex={1} mx={2}>
                                    <Box as="label" fontSize="12px" mb={2}>
                                      Value (e.g. 1, 2, 3)
                                    </Box>
                                    <Input
                                      bg="white"
                                      display="block"
                                      value={arr}
                                      onChange={e => {
                                        setArr(e.target.value)
                                      }}
                                    />
                                  </Box>
                                ) : op !== "select" ? (
                                  <Box flex={1} mx={2}>
                                    <Box as="label" fontSize="12px" mb={2}>
                                      Value
                                    </Box>
                                    <Input
                                      bg="white"
                                      display="block"
                                      value={val}
                                      onChange={e => {
                                        if (!Number.isNaN(e.target.value * 1))
                                          setVal(e.target.value * 1)
                                      }}
                                    />
                                  </Box>
                                ) : null}
                                <Box pt="14px" px={2} w="150px">
                                  <Flex
                                    h="40px"
                                    align="center"
                                    justify="center"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": { opacity: 0.75 },
                                      textAlign: "center",
                                      borderRadius: "5px",
                                      padding: "10px 40px",
                                      background: "#5137C5",
                                      cursor: "pointer",
                                      color: "white",
                                      marginTop: "10px",
                                    }}
                                    onClick={async () => {
                                      setLoading(
                                        assoc("proof-gen", true, loading)
                                      )
                                      let _val = val
                                      let query = {}
                                      if (op === "select") {
                                        query = {}
                                      } else if (
                                        includes(op)(["$in", "$nin"])
                                      ) {
                                        _val = map(v => trim(v) * 1)(
                                          arr.split(",")
                                        )
                                      } else {
                                        query = { [op]: _val }
                                      }
                                      const req = { [field]: query }
                                      const proofReqSig = createReq(
                                        cred.request,
                                        req
                                      )
                                      let _proof =
                                        await proofService.generateProof(
                                          proofReqSig,
                                          user.did
                                        )
                                      _proof.request = proofReqSig
                                      _proof.id =
                                        cred.credential.id + "-" + Date.now()
                                      let _proofs =
                                        (await lf.getItem(
                                          `${aid.id}.proofs`
                                        )) ?? {}
                                      _proofs[user.did.string()] ??= []
                                      _proofs[user.did.string()].push(_proof.id)
                                      await lf.setItem(
                                        `${aid.id}.proofs`,
                                        _proofs
                                      )
                                      await lf.setItem(
                                        `${aid.id}.proofs-${_proof.id}`,
                                        _proof
                                      )

                                      const { proof, pub_signals } = _proof
                                      setProofs(append(_proof, proofs))
                                      setProof(_proof)
                                      setTab("ZKPs")
                                      setLoading(
                                        assoc("proof-gen", false, loading)
                                      )
                                    }}
                                  >
                                    {loading["proof-gen"] ? (
                                      <Box
                                        as="i"
                                        className="fa fa-spin fa-sync"
                                      />
                                    ) : (
                                      "Generate"
                                    )}
                                  </Flex>
                                </Box>
                              </Flex>
                            </Box>
                          ) : null}
                        </>
                      )
                    })(creds)}
                    <Box py={2}>
                      <Box
                        fontSize="14px"
                        fontWeight="bold"
                        color="#5137C5"
                        py={2}
                        px={8}
                        sx={{
                          cursor: "pointer",
                          ":hover": { opacity: 0.75 },
                        }}
                        onClick={async () => setIssue(!issue)}
                      >
                        <Box
                          as="i"
                          className={
                            issue ? "fas fa-chevron-up" : "fas fa-plus"
                          }
                          mr={2}
                        />
                        Issue Verificable Credential
                      </Box>
                    </Box>
                    {issue ? (
                      <>
                        <Flex align="center" p={4} fontSize="14px" bg="#EBE7FD">
                          <Flex
                            mr={4}
                            align="center"
                            justify="center"
                            bg="#5137C5"
                            color="#EBE7FD"
                            boxSize="35px"
                            sx={{ borderRadius: "50%" }}
                          >
                            <Box as="i" className="fas fa-university" />
                          </Flex>
                          <Box flex={1} fontSize="12px">
                            <Box fontSize="14px" fontWeight="bold">
                              Issuer : Local Test
                            </Box>
                            <Box>{issuer.did.string()}</Box>
                          </Box>
                        </Flex>
                        <Box
                          bg="#EBE7FD"
                          pb={2}
                          px={6}
                          fontWeight="bold"
                          color="#5137C5"
                        >
                          KYCAgeCredential
                        </Box>
                        <Flex
                          px={4}
                          bg="#EBE7FD"
                          pb={6}
                          sx={{ borderRadius: "0 0 5px 5px" }}
                        >
                          <Box flex={1} mx={2}>
                            <Box as="label" fontSize="12px" mb={2}>
                              Document Type
                            </Box>
                            <Select
                              bg="white"
                              value={docType}
                              onChange={e => {
                                setDocType(e.target.value * 1)
                              }}
                            >
                              {map(v => <option value={v}>{v}</option>)(
                                range(1, 10)
                              )}
                            </Select>
                          </Box>
                          <Box flex={1} mx={2}>
                            <Box as="label" fontSize="12px" mb={2}>
                              Birthday (e.g. 19901231)
                            </Box>
                            <Input
                              bg="white"
                              display="block"
                              value={birthday}
                              onChange={e => {
                                if (!Number.isNaN(e.target.value * 1))
                                  setBirthday(e.target.value * 1)
                              }}
                            />
                          </Box>
                          <Box pt="14px" px={2}>
                            <Flex
                              h="40px"
                              align="center"
                              justify="center"
                              sx={{
                                cursor: "pointer",
                                ":hover": { opacity: 0.75 },
                                textAlign: "center",
                                width: "200px",
                                borderRadius: "5px",
                                padding: "10px 40px",
                                background: "#5137C5",
                                cursor: "pointer",
                                color: "white",
                                marginTop: "10px",
                              }}
                              onClick={async () => {
                                setLoading(assoc("cred", true, loading))
                                const data = {
                                  id: user.did.string(),
                                  birthday: birthday,
                                  documentType: docType,
                                }
                                const credentialRequest = createCred(data)
                                const credential =
                                  await identityWallet.issueCredential(
                                    issuer.did,
                                    credentialRequest
                                  )
                                await dataStorage.credential.saveCredential(
                                  credential
                                )
                                const _cred = {
                                  request: credentialRequest,
                                  credential: credential,
                                }
                                let _creds =
                                  (await lf.getItem(`${aid.id}.creds`)) ?? {}
                                _creds[user.did.string()] ??= []
                                _creds[user.did.string()].push(credential.id)
                                await lf.setItem(`${aid.id}.creds`, _creds)
                                setCreds(append(_cred, creds))
                                setLoading(assoc("cred", false, loading))
                              }}
                            >
                              {loading.cred ? (
                                <Box as="i" className="fa fa-spin fa-sync" />
                              ) : (
                                "Issue"
                              )}
                            </Flex>
                          </Box>
                        </Flex>
                      </>
                    ) : null}
                  </>
                ) : tab === "Points" ? (
                  <>
                    {map(v => {
                      const token = points[v.symbol]
                      if (!token) return null
                      return (
                        <Flex
                          py={4}
                          px={8}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                            borderLeft:
                              v.symbol === point.symbol
                                ? "5px solid #5137C5"
                                : "5px solid white",
                          }}
                          onClick={() => setPoint(v)}
                        >
                          {token.logo ? (
                            <Image
                              src={token.logo}
                              boxSize="35px"
                              mr={4}
                              sx={{ borderRadius: "50%" }}
                            />
                          ) : (
                            <Flex
                              boxSize="35px"
                              align="center"
                              justify="center"
                              bg="#5137C5"
                              mr={4}
                              color="white"
                              sx={{ borderRadius: "50%" }}
                            >
                              <Box
                                fontSize="14px"
                                as="i"
                                className="fas fa-coins"
                              />
                            </Flex>
                          )}
                          <Box flex={1} fontSize="16px">
                            <Box fontWeight="bold">{token.name}</Box>
                            <Box>
                              {v.balance} {v.symbol}
                            </Box>
                          </Box>
                          <Box fontSize="14px" fontWeight="bold" color="#333">
                            $10.33 USD
                          </Box>
                        </Flex>
                      )
                    })(balances)}
                    <Box pb={2}>
                      {isNil(tempID) ? (
                        <Box
                          fontSize="14px"
                          fontWeight="bold"
                          color="#5137C5"
                          py={3}
                          px={8}
                          sx={{
                            cursor: "pointer",
                            ":hover": { opacity: 0.75 },
                          }}
                          onClick={async () => {
                            setLoading(assoc("login", true, loading))
                            const id = user.did.string()
                            const tempAddr = EthCrypto.createIdentity()
                            const addr = tempAddr.address
                            const num = BigInt(addr).toString().slice(0, 15) * 1
                            const num2 =
                              BigInt(addr).toString().slice(15, 30) * 1
                            const credentialRequest = createCred({
                              id,
                              birthday: num,
                              documentType: num2,
                            })
                            console.log("issue proof....")
                            const credential =
                              await identityWallet.issueCredential(
                                issuer.did,
                                credentialRequest
                              )
                            await dataStorage.credential.saveCredential(
                              credential
                            )
                            const proofReqSig = createReq(credentialRequest, {
                              birthday: {
                                $eq: num,
                              },
                            })
                            console.log("generate proof....")
                            const { proof, pub_signals } =
                              await proofService.generateProof(
                                proofReqSig,
                                user.did
                              )
                            console.log(proof)
                            console.log("sign in....")
                            const { identity } =
                              await db.createTempAddressWithPolygonID(
                                tempAddr,
                                {
                                  proof,
                                  pub_signals,
                                  did: user.did.string(),
                                }
                              )
                            if (identity) {
                              const _newIDs = append(
                                { identity, rpc: "http://localhost:3000" },
                                identities
                              )
                              setIdentities(_newIDs)
                              await lf.setItem(
                                `${aid.id}.identities-${id}`,
                                _newIDs
                              )
                            }
                            setLoading(assoc("login", false, loading))
                          }}
                        >
                          <Box
                            as="i"
                            className={
                              loading.login
                                ? "fa fa-spin fa-sync"
                                : "fas fa-sign-in-alt"
                            }
                            mr={2}
                          />
                          Connect with Exchange
                        </Box>
                      ) : (
                        <>
                          <Box
                            fontSize="14px"
                            fontWeight="bold"
                            color="#5137C5"
                            py={3}
                            px={8}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                          >
                            <Box as="i" className="fas fa-plus" mr={2} />
                            Import Points
                          </Box>
                          <Box
                            fontSize="14px"
                            fontWeight="bold"
                            color="#5137C5"
                            py={3}
                            px={8}
                            sx={{
                              cursor: "pointer",
                              ":hover": { opacity: 0.75 },
                            }}
                            onClick={() => setIssueP(!issueP)}
                          >
                            <Box as="i" className="fas fa-coins" mr={2} />
                            Issue Points
                          </Box>
                          {issueP ? (
                            <>
                              <Flex
                                px={4}
                                pt={4}
                                bg="#EBE7FD"
                                pb={6}
                                sx={{ borderRadius: "0 0 5px 5px" }}
                              >
                                <Box flex={1} mx={2}>
                                  <Box as="label" fontSize="12px" mb={2}>
                                    Point Name
                                  </Box>
                                  <Input
                                    bg="white"
                                    display="block"
                                    value={pointName}
                                    onChange={e => setPointName(e.target.value)}
                                  />
                                </Box>
                                <Box flex={1} mx={2}>
                                  <Box as="label" fontSize="12px" mb={2}>
                                    Point Symbol (uppercase)
                                  </Box>
                                  <Input
                                    bg="white"
                                    display="block"
                                    value={pointSym}
                                    onChange={e =>
                                      setPointSym(e.target.value.toUpperCase())
                                    }
                                  />
                                </Box>
                                <Box pt="14px" px={2}>
                                  <Flex
                                    h="40px"
                                    align="center"
                                    justify="center"
                                    sx={{
                                      cursor: "pointer",
                                      ":hover": { opacity: 0.75 },
                                      textAlign: "center",
                                      width: "200px",
                                      borderRadius: "5px",
                                      padding: "10px 40px",
                                      background: "#5137C5",
                                      cursor: "pointer",
                                      color: "white",
                                      marginTop: "10px",
                                    }}
                                    onClick={async () => {
                                      if (
                                        !/^\s*$/.test(pointName) &&
                                        !/^\s*$/.test(pointSym)
                                      ) {
                                        try {
                                          const tx = await db.query(
                                            "set:issue",
                                            {
                                              name: pointName,
                                            },
                                            "points",
                                            pointSym,
                                            tempID.identity
                                          )
                                          setBalances(
                                            concat(
                                              [
                                                {
                                                  symbol: "WDB",
                                                  balance: 0,
                                                  address:
                                                    tempID.identity
                                                      .linkedAccount,
                                                },
                                              ],
                                              await db.get("balances", [
                                                "address",
                                                "==",
                                                tempID.identity.linkedAccount,
                                              ])
                                            )
                                          )
                                        } catch (e) {
                                          console.log(e)
                                        }
                                      }
                                    }}
                                  >
                                    {loading.cred ? (
                                      <Box
                                        as="i"
                                        className="fa fa-spin fa-sync"
                                      />
                                    ) : (
                                      "Issue"
                                    )}
                                  </Flex>
                                </Box>
                              </Flex>
                            </>
                          ) : null}
                        </>
                      )}
                    </Box>
                  </>
                ) : null}
              </>
            )}
          </Box>
          <Flex justify="center" fontSize="12px" my={4} color="#5137C5">
            powered by PolygonID, Internet Computer, and WeaveDB
          </Flex>
        </Box>
      </>
    </Flex>
  )
}
