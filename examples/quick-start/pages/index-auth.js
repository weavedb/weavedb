import { useState, useEffect } from "react"
import SDK from "weavedb-sdk"
import lf from "localforage" // to store user in indexedDB for persistence

let db
export default function Home() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    ;(async () => {
      // check if an authenticated user exists
      setUser((await lf.getItem("identity")) || null)

      // initialize SDK
      const _db = await new SDK({
        contractTxId: "0wAWl_HKnHjjHAN4UMYSmj-dGhlzs28p4armjsgsTN0",
      })
      await _db.initializeWithoutWallet()

      // fetch all users
      setUsers(await _db.get("users"))

      db = _db
    })()
  }, [])

  // on creating a disposal key pair
  const regUser = async ({ tx, identity }) => {
    if (!tx.success) return
    // set user
    setUser(identity)

    // store user for persistence between page reload
    await lf.setItem("identity", identity)

    // also save user to WeaveDB, the access control rules fill user address
    await db.set(
      { type: identity.type },
      "users",
      identity.linkedAccount,
      identity
    )
  }
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {user === null ? (
        <>
          <button onClick={async () => regUser(await db.createTempAddress())}>
            Login with Metamask
          </button>
          <button
            onClick={async () => regUser(await db.createTempAddressWithAR())}
          >
            Login with Arweave
          </button>
          <button
            onClick={async () => regUser(await db.createTempAddressWithLens())}
          >
            Login with Lens Profile
          </button>
        </>
      ) : (
        <button
          onClick={async () => {
            // unset user
            setUser(null)

            // remove locally stored user
            await lf.removeItem("identity")
          }}
        >
          Logout ({user.linkedAccount})
        </button>
      )}
      <hr />
      {users.map(v => {
        // render all users
        return (
          <div>
            {v.type}: {v.user}
          </div>
        )
      })}
    </div>
  )
}
