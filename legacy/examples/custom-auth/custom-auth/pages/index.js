import SDK from "weavedb-sdk"
import { useEffect, useState } from "react"
import { Signature, BrowserProvider } from "ethers"
import * as LitJsSdk from "@lit-protocol/lit-node-client"

const contractTxId = process.env.NEXT_PUBLIC_CONTRACT_TX_ID
const pkp_address = process.env.NEXT_PUBLIC_PKP_ADDRESS
const publicKey = process.env.NEXT_PUBLIC_PKP_PUBLIC_KEY
const ipfsId = process.env.NEXT_PUBLIC_IPFS_ID
const auth_name = process.env.NEXT_PUBLIC_AUTH_NAME

let db
export default function Home() {
  const [user, setUser] = useState(null)
  const [tokenID, setTokenID] = useState("")

  useEffect(() => {
    ;(async () => {
      db = new SDK({ contractTxId })
      await db.initializeWithoutWallet()
    })()
  }, [])

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {user === null ? (
        <>
          <input
            placeholder="Lens Profile TokenID"
            value={tokenID}
            onChange={(e) => setTokenID(e.target.value)}
          />
          <button
            onClick={async () => {
              const provider = new BrowserProvider(window.ethereum)
              const signer = await provider.getSigner()
              let { identity, tx: params } = await db._createTempAddress(
                (await signer.getAddress()).toLowerCase(),
                null,
                `${auth_name}:${tokenID}`,
                {
                  evm: signer,
                  relay: true,
                  jobID: `auth:${auth_name}`,
                },
                "custom"
              )
              const litNodeClient = new LitJsSdk.LitNodeClient({
                litNetwork: "serrano",
              })
              await litNodeClient.connect()
              const authSig = await LitJsSdk.checkAndSignAuthMessage({
                chain: "ethereum",
              })
              const nonce = 1
              let _res
              try {
                _res = await litNodeClient.executeJs({
                  ipfsId,
                  authSig,
                  jsParams: {
                    nonce,
                    params,
                    authSig,
                    contractTxId,
                    publicKey,
                  },
                })
              } catch (e) {
                console.error("safasdfsdf", e)
              }

              const _sig = _res.signatures.sig1
              if (typeof _sig === "undefined") {
                alert("The wrong Lens Profile TokenID")
              } else {
                const signature = Signature.from({
                  r: "0x" + _sig.r,
                  s: "0x" + _sig.s,
                  v: _sig.recid,
                }).serialized
                const relay_params = {
                  function: "relay",
                  query: [
                    `auth:${auth_name}`,
                    params,
                    { linkTo: params.query.linkTo },
                  ],
                  signature,
                  nonce,
                  caller: pkp_address,
                  type: "secp256k1-2",
                }
                const tx = await db.write("relay", relay_params)
                setUser(identity)
              }
            }}
          >
            Login
          </button>
        </>
      ) : (
        user.linkedAccount
      )}
    </div>
  )
}
