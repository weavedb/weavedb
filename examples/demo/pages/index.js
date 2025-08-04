import { useRef, useEffect, useState } from "react"
import { DB } from "wdb-sdk"

export default function Home() {
  const [posts, setPosts] = useState([])
  const [slot, setSlot] = useState(null)
  const [body, setBody] = useState("")
  const [proofs, setProofs] = useState({})
  const [generatingProof, setGeneratingProof] = useState({})
  const db = useRef()
  const getPosts = async () => {
    setPosts(await db.current.cget("posts", ["date", "desc"], 10))
  }
  useEffect(() => {
    void (async () => {
      db.current = new DB({
        id: process.env.NEXT_PUBLIC_DB_ID,
        url: process.env.NEXT_PUBLIC_RU_URL,
        hb: process.env.NEXT_PUBLIC_HB_URL,
      })
      await getPosts()
    })()
  }, [])
  return (
    <>
      <header className="app-header">
        <a
          href="https://docs.weavedb.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="docs-link"
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: "500",
            position: "fixed",
            top: "30px",
            right: "40px",
            zIndex: 100,
            transition: "all 0.3s ease",
            borderBottom: "2px solid transparent",
          }}
          onMouseEnter={e => {
            e.target.style.color = "#667eea"
            e.target.style.borderBottom = "2px solid #667eea"
          }}
          onMouseLeave={e => {
            e.target.style.color = "rgba(255, 255, 255, 0.9)"
            e.target.style.borderBottom = "2px solid transparent"
          }}
        >
          Docs →
        </a>
      </header>
      <div className="app-title">
        WeaveDB Zero Knowledge Provable Database Demo
      </div>
      <div className="input-wrapper">
        <textarea
          className="post-input"
          placeholder="Write your post here..."
          value={body}
          onChange={e => {
            if (e.target.value.length <= 280) {
              setBody(e.target.value)
            }
          }}
          maxLength={280}
        />
        <div
          className={`char-counter ${body.length > 250 ? "warning" : ""} ${body.length === 280 ? "limit" : ""}`}
        >
          {body.length}/280
        </div>
      </div>
      <button
        className="post-button"
        disabled={body.trim().length === 0}
        onClick={async () => {
          const { success, result } = await db.current.set(
            "add:post",
            { body },
            "posts",
          )
          if (success) {
            setSlot(result.result.i)
            setBody("")
            await getPosts()
          } else {
            alert("something went wrong!")
          }
        }}
      >
        Post
      </button>
      {slot === null ? null : (
        <div className="transaction-link-wrapper">
          <a
            className="transaction-link"
            target="_blank"
            href={`http://localhost:3000/db/${process.env.NEXT_PUBLIC_DB_ID}/tx/${slot}?url=http://localhost:6364`}
          >
            View Transaction
          </a>
        </div>
      )}

      {posts.map(v => (
        <article key={v.id} className="post-card">
          <p className="post-content">{v.data.body}</p>
          <footer className="post-meta">
            <time className="post-time">
              {new Date(v.data.date).toLocaleString()}
            </time>{" "}
            by <address className="post-author">{v.data.uid}</address>
          </footer>
          <div className="proof-section">
            {proofs[v.id] ? (
              <>
                <textarea
                  className="proof-display"
                  disabled={true}
                  value={`[${proofs[v.id].join(",")}]`}
                />
                <div className="proof-actions">
                  <button
                    className="copy-button"
                    onClick={async e => {
                      const textToCopy = `[${proofs[v.id].join(",")}]`
                      try {
                        // Try modern clipboard API first
                        if (navigator.clipboard && window.isSecureContext) {
                          await navigator.clipboard.writeText(textToCopy)
                        } else {
                          // Fallback method using a temporary textarea
                          const textArea = document.createElement("textarea")
                          textArea.value = textToCopy
                          textArea.style.position = "fixed"
                          textArea.style.left = "-999999px"
                          textArea.style.top = "-999999px"
                          document.body.appendChild(textArea)
                          textArea.focus()
                          textArea.select()

                          try {
                            document.execCommand("copy")
                          } catch (err) {
                            console.error("Fallback copy failed:", err)
                            throw new Error("Copy failed")
                          } finally {
                            textArea.remove()
                          }
                        }

                        // Show success feedback
                        const el = e.target
                        const originalText = el.textContent
                        el.textContent = "Copied!"
                        setTimeout(() => {
                          el.textContent = originalText
                        }, 2000)
                      } catch (err) {
                        console.error("Failed to copy:", err)
                        // Try one more fallback - prompt user to copy manually
                        prompt("Copy this ZK Proof:", textToCopy)
                      }
                    }}
                  >
                    copy
                  </button>
                  <a
                    className="etherscan-link"
                    target="_blank"
                    href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_ETH_CONTRACT}#readContract#F9`}
                  >
                    Paste the ZK Proof to qString on Etherscan
                  </a>
                </div>
              </>
            ) : (
              <button
                className={`generate-button ${generatingProof[v.id] ? "generating" : ""}`}
                disabled={generatingProof[v.id]}
                onClick={async () => {
                  setGeneratingProof({ ...generatingProof, [v.id]: true })
                  try {
                    const { zkp, zkhash, dirid } = await fetch(
                      "http://localhost:6365/zkp",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          dir: "posts",
                          doc: v.id,
                          path: "body",
                        }),
                      },
                    ).then(r => r.json())
                    if (zkp) setProofs({ ...proofs, [v.id]: zkp })
                  } finally {
                    setGeneratingProof({ ...generatingProof, [v.id]: false })
                  }
                }}
              >
                {generatingProof[v.id] ? (
                  <>
                    <span className="loading-spinner"></span>
                    Generating...
                  </>
                ) : (
                  "Generate ZK Proof"
                )}
              </button>
            )}
          </div>
        </article>
      ))}
    </>
  )
}
