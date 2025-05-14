import { useState, useEffect } from "react"
import SDK from "weavedb-sdk"
let db

export default function Home() {
  const [user, setUser] = useState(null)
  const [txid, setTxId] = useState(null)

  useEffect(() => {
    ;(async () => {
      db = await new SDK({
        contractTxId: "YOUR_CONTRACT_TX_ID",
      })
      await db.initializeWithoutWallet()
      try {
        console.log(await db.db.readState())
        console.log(await db.getNonce("abc"))
      } catch (e) {}
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
      {user === null ? ( // show Login button if user doesn't exist
        <button
          onClick={async () => {
            // generate a disposal address
            const { identity } = await db.createTempAddress()
            // and set the identity to user
            setUser(identity)
          }}
        >
          Login
        </button>
      ) : txid === null ? (
        <button
          onClick={async () => {
            // WeaveDB will immediately return the result using virtual state
            const tx = await db.set(
              { name: "Beth", age: 50 },
              "people",
              "Beth",
              {
                ...user,
                onDryWrite: {
                  read: [
                    // you can execute instant read queries right after dryWrite
                    ["get", "people", "Beth"],
                    ["get", "people"],
                  ],
                },
              }
            )
            // the dryWrite result will be returned instantly (10-20ms)
            console.log(tx)

            // to get the actual tx result, use getResult. This will take 3 secs.
            const result = await tx.getResult()
            console.log(result)
            // set the transaction id to txid
            setTxId(result.originalTxId)
          }}
        >
          Add Beth
        </button>
      ) : (
        // show a link to the transaction record
        <a
          href={`https://sonar.warp.cc/#/app/interaction/${txid}`}
          target="_blank"
        >
          {txid}
        </a>
      )}
    </div>
  )
}
