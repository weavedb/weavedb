import { useState } from "react"

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav>
        <div className="nav-container">
          <a href="#hero">
            <img src="/images/weavedb.png" height="28px" />
          </a>
          {/* Desktop Navigation */}
          <div className="nav-links desktop-nav">
            <a href="#problem" className="nav-link">
              zkDatabase
            </a>
            <a href="#tech-stack" className="nav-link">
              Architecture
            </a>
            <a href="#economics" className="nav-link">
              Tokenomics
            </a>
            <a href="#blog" className="nav-link">
              Blog
            </a>
            <button
              className="nav-cta"
              onClick={() => window.open("https://docs.weavedb.dev/", "_blank")}
            >
              Docs
            </button>
            <button
              className="nav-cta"
              onClick={() => window.open("https://scan.weavedb.dev", "_blank")}
            >
              Scan
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "4px",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "none"
            }}
          >
            {isMenuOpen ? (
              // Close icon
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              // Hamburger icon
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className="mobile-menu"
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            background: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            transform: isMenuOpen ? "translateY(0)" : "translateY(-100%)",
            opacity: isMenuOpen ? 1 : 0,
            visibility: isMenuOpen ? "visible" : "hidden",
            transition: "all 0.3s ease",
            zIndex: 1000,
            display: "none",
          }}
        >
          <div style={{ padding: "20px" }}>
            <a
              href="#problem"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: "#fff",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
            >
              zkDatabase
            </a>
            <a
              href="#tech-stack"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: "#fff",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
            >
              Architecture
            </a>
            <a
              href="#economics"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: "#fff",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
            >
              Tokenomics
            </a>
            <a
              href="#community"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: "#fff",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "500",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
              onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
            >
              Community
            </a>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                onClick={() => {
                  window.open("https://docs.weavedb.dev/", "_blank")
                  setIsMenuOpen(false)
                }}
                style={{
                  flex: 1,
                  padding: "8px 20px",
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "8px",
                  color: "#818cf8",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)"
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)"
                  e.currentTarget.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                Docs
              </button>
              <button
                onClick={() => {
                  window.open("https://scan.weavedb.dev", "_blank")
                  setIsMenuOpen(false)
                }}
                style={{
                  flex: 1,
                  padding: "8px 20px",
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "8px",
                  color: "#818cf8",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)"
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)"
                  e.currentTarget.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                Scan
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        nav {
          padding: 0;
          margin: 0;
          width: 100%;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          width: 100%;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        /* Desktop large screens */
        @media (min-width: 1441px) {
          .nav-container {
            max-width: 1600px;
            padding: 16px 60px;
          }
        }

        /* Desktop medium screens */
        @media (min-width: 1200px) and (max-width: 1440px) {
          .nav-container {
            max-width: 1200px;
            padding: 16px 40px;
          }
        }

        /* Small desktop/laptop */
        @media (min-width: 1024px) and (max-width: 1199px) {
          .nav-container {
            padding: 16px 32px;
          }
        }

        /* Tablet */
        @media (min-width: 769px) and (max-width: 1023px) {
          .nav-container {
            padding: 16px 24px;
          }

          .nav-links {
            gap: 24px;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .nav-container {
            padding: 16px 24px;
            min-width: 0;
          }

          .logo {
            min-width: 100px;
          }

          .nav-links {
            display: none;
          }

          .mobile-menu-btn {
            display: block !important;
            flex-shrink: 0;
          }

          .mobile-menu {
            display: block !important;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 16px 16px;
          }

          .logo {
            min-width: 80px;
          }
        }

        @media (max-width: 360px) {
          .nav-container {
            padding: 16px 12px;
          }

          .logo {
            min-width: 60px;
          }
        }

        @media (max-width: 320px) {
          .nav-container {
            padding: 16px 8px;
          }

          .logo {
            min-width: 50px;
          }

          .logo-icon img {
            height: 24px;
          }
        }
      `}</style>
    </>
  )
}
