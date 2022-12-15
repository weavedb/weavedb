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
        rpc: "http://localhost:8080",
      })
      setPosts(await db.get("wall", ["date", "desc"], 5))
    })()
  }, [])
  return <div>{JSON.stringify(posts)}</div>
}
