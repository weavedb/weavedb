import client from "weavedb-client"
import { useEffect, useState } from "react"

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    ;(async () => {
      const db = new client({
        name: "weavedb",
        version: "1",
        contractTxId: "7VqqosbKTwK7A1oeb4BNu2Aou--o5csFn4uzzN9fMz0",
        rpc: "https://grpc.asteroid.ac",
      })
      setPosts(await db.get("wall", ["date", "desc"], 5))
    })()
  }, [])
  return <div>{JSON.stringify(posts)}</div>
}
