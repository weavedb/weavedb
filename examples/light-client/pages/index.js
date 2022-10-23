import client from "weavedb-client"
import { useEffect, useState } from "react"

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    ;(async () => {
      const db = new client({
        name: "weavedb",
        version: "1",
        contractTxId: "2ohyMxM2Z2exV4dVLgRNa9jMnEY09H_I-5WkkZBR0Ns",
        rpc: "https://grpc.asteroid.ac",
      })
      setPosts(await db.get("wall", 5, ["date", "desc"]))
    })()
  }, [])

  return <div>{JSON.stringify(posts)}</div>
}
