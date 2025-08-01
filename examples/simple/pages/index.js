import { useRef, useEffect, useState } from "react"
import { DB } from "wdb-sdk"

export default function Home() {
  const [posts, setPosts] = useState([])
  const [body, setBody] = useState("")
  const db = useRef()
  const getPosts = async () => {
    setPosts(await db.current.get("posts", ["date", "desc"], 10))
  }
  useEffect(() => {
    void (async () => {
      db.current = new DB({ id: "7fvjopzwphy1lkydcerj9ittwume4fkde33u1yajvcc" })
      await getPosts()
    })()
  }, [])
  return (
    <>
      <textarea value={body} onChange={e => setBody(e.target.value)} />
      <button
        onClick={async () => {
          await db.current.set("add:post", { body }, "posts")
          setBody("")
          await getPosts()
        }}
      >
        Post
      </button>
      {posts.map(v => (
        <article>
          <p>{v.body}</p>
          <footer>
            <time>{new Date(v.date).toLocaleString()}</time> by{" "}
            <address>{v.uid}</address>
          </footer>
        </article>
      ))}
    </>
  )
}
