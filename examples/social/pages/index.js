import { useRef, useEffect, useState } from "react"
import { DB } from "wdb-sdk"

export default function Home() {
  const [notes, setNotes] = useState([])
  const [likes, setLikes] = useState([])
  const [slot, setSlot] = useState(null)
  const [body, setBody] = useState("")
  const [likingNotes, setLikingNotes] = useState({})
  const [showToast, setShowToast] = useState(false)
  const db = useRef()

  const getNotes = async () => {
    const _notes = await db.current.cget("notes", ["published", "desc"], 10)
    const ids = _notes.map(v => v.id)
    const _likes = await db.current.get("likes", ["object", "in", ids])
    setNotes(_notes)
    setLikes(_likes.map(v => v.object))
  }

  const handleLike = async post => {
    if (likingNotes[post.id]) return
    setLikingNotes(prev => ({ ...prev, [post.id]: true }))

    try {
      if (window.arweaveWallet) {
        await window.arweaveWallet.connect([
          "ACCESS_ADDRESS",
          "SIGN_TRANSACTION",
        ])
      }
      const res = await db.current.set(
        "add:like",
        { object: post.data.id },
        "likes",
      )
      const { success, result } = res
      if (success) {
        setSlot(result.result.i)
        await getNotes()
      } else {
        alert("Failed to like post!")
      }
    } catch (error) {
      console.error("Error liking post:", error)
      alert("Something went wrong!")
    } finally {
      setLikingNotes(prev => ({ ...prev, [post.id]: false }))
    }
  }

  const handlePost = async () => {
    if (body.length <= 140 && body.trim().length > 0) {
      try {
        if (window.arweaveWallet) {
          await window.arweaveWallet.connect([
            "ACCESS_ADDRESS",
            "SIGN_TRANSACTION",
          ])
        }
        const res = await db.current.set("add:note", { content: body }, "notes")
        const { success, result } = res
        if (success) {
          setSlot(result.result.i)
          setShowToast(true)
          setBody("")
          await getNotes()
          // Auto-close removed - manual close only
        } else {
          alert("something went wrong!")
        }
      } catch (error) {
        console.error("Error posting:", error)
        alert("Something went wrong!")
      }
    }
  }

  const formatTime = date => {
    const now = new Date()
    const posted = new Date(date)
    const diffInMinutes = Math.floor((now - posted) / (1000 * 60))
    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const truncateAddress = address => {
    if (!address) return "Unknown"
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  useEffect(() => {
    void (async () => {
      db.current = new DB({
        id: process.env.NEXT_PUBLIC_DB_ID,
        url: process.env.NEXT_PUBLIC_RU_URL,
      })
      await getNotes()
    })()
  }, [])

  return (
    <>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo">W</div>
          <a
            href={`${process.env.NEXT_PUBLIC_SCAN_URL}/db/${process.env.NEXT_PUBLIC_DB_ID}?url=${process.env.NEXT_PUBLIC_RU_URL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="scan-link"
          >
            Scan
          </a>
        </header>

        {/* Composer */}
        <div className="composer">
          <div className="composer-avatar">
            <div className="avatar">WDB</div>
          </div>
          <div className="composer-main">
            <textarea
              className="composer-input"
              placeholder="What's happening?"
              value={body}
              onChange={e => {
                if (e.target.value.length <= 140) {
                  setBody(e.target.value)
                }
              }}
              maxLength={140}
            />
            <div className="composer-footer">
              <span
                className={`char-count ${body.length > 120 ? "warning" : ""} ${body.length === 140 ? "danger" : ""}`}
              >
                {140 - body.length}
              </span>
              <button
                className="post-btn"
                disabled={body.trim().length === 0}
                onClick={handlePost}
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="feed">
          {notes.map(post => (
            <article key={post.id} className="post">
              <div className="post-avatar">
                <div className="avatar">
                  {post.data.actor?.slice(0, 2).toUpperCase() || "??"}
                </div>
              </div>
              <div className="post-main">
                <div className="post-header">
                  <span className="post-author">{post.data.actor}</span>
                  <span className="post-time">
                    {formatTime(post.data.published)}
                  </span>
                </div>
                <div className="post-content">{post.data.content}</div>
                <div className="post-actions">
                  <button
                    className={`like-btn ${likes.includes(post.id) ? "liked" : ""} ${likingNotes[post.id] ? "loading" : ""}`}
                    onClick={() => handleLike(post)}
                    disabled={likingNotes[post.id]}
                  >
                    <svg viewBox="0 0 24 24" className="heart">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{post.data.likes || ""}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            Built by{" "}
            <a
              href="https://weavedb.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-brand"
            >
              WeaveDB
            </a>
          </div>
        </footer>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="toast-overlay">
          <div className="toast-card">
            <div className="toast-icon">✓</div>
            <div className="toast-content">
              <div className="toast-title">Post successful!</div>
              <a
                href={`${process.env.NEXT_PUBLIC_SCAN_URL}/db/${process.env.NEXT_PUBLIC_DB_ID}/tx/${slot}?url=${process.env.NEXT_PUBLIC_RU_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="toast-link"
              >
                View transaction
              </a>
            </div>
            <button className="toast-close" onClick={() => setShowToast(false)}>
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
