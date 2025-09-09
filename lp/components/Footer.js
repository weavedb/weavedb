// Footer Section Component
export default function Footer() {
  return (
    <>
      <footer
        style={{
          padding: "80px 40px 40px",
          background: "linear-gradient(180deg, #0a0a0a 0%, #14101a 100%)", // Purple gradient
          borderTop: "1px solid rgba(139, 92, 246, 0.15)", // Purple border like nav
        }}
      >
        <div className="footer-container">
          <div className="footer-grid">
            {/* Logo and Description */}
            <div className="footer-brand">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <img
                  style={{ marginLeft: "-15px" }}
                  src="/images/weavedb.png"
                  height="32px"
                />
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                  marginBottom: "24px",
                }}
              >
                The Layer-0 zkDatabase for the AI-Driven Verifiable Internet.
                Cloud performance with zk proof on every data.
              </p>
              {/* Social Links */}
              <div style={{ display: "flex", gap: "16px" }}>
                <a
                  href="https://x.com/weave_db"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)"
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.4)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.2)"
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://discord.com/invite/YMe3eqf69M"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)"
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.4)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.2)"
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
                <a
                  href="https://github.com/weavedb/weavedb"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)"
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.4)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.2)"
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "20px",
                }}
              >
                Products
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://docs.weavedb.dev/api/wdb-sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    WDB SDK
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    DB Console (Soon)
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://scan.weavedb.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    WeaveDB Scan
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://docs.wao.eco/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    WAO / HyperBEAM
                  </a>
                </li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "20px",
                }}
              >
                Developers
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://docs.weavedb.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    Documentation
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://github.com/weavedb"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    GitHub
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://docs.weavedb.dev/build/quick-start"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    Quick Start
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://docs.weavedb.dev/api/wdb-sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "20px",
                }}
              >
                Resources
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://docs.weavedb.dev/litepaper"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    Litepaper
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://docs.weavedb.dev/tokenomics/tokenomics"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    Tokenomics
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://medium.com/weavedb"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "20px",
                }}
              >
                Community
              </h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://x.com/weave_db"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    X
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="https://discord.com/invite/YMe3eqf69M"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.color = "var(--primary-light)")
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.color = "var(--text-secondary)")
                    }
                  >
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="footer-bottom">
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              © 2025 WeaveDB Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Base container styles */
        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .footer-bottom {
          padding-top: 32px;
          border-top: 1px solid rgba(139, 92, 246, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* 360px - Minimum mobile */
        @media (max-width: 767px) {
          footer {
            padding: 60px 16px 40px !important;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 30px !important;
            margin-bottom: 40px !important;
          }

          .footer-brand {
            grid-column: 1 / -1 !important;
            margin-bottom: 20px !important;
          }

          .footer-bottom {
            text-align: center !important;
            padding-top: 24px !important;
          }
        }

        /* 480px - Large mobile phones */
        @media (min-width: 480px) and (max-width: 767px) {
          footer {
            padding: 60px 20px 40px !important;
          }
        }

        /* 768px - Tablets portrait */
        @media (min-width: 768px) and (max-width: 1023px) {
          footer {
            padding: 70px 32px 40px !important;
          }

          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
          }

          .footer-brand {
            grid-column: 1 / -1 !important;
          }
        }

        /* 1024px - Tablets landscape / small laptops */
        @media (min-width: 1024px) and (max-width: 1279px) {
          footer {
            padding: 80px 40px 40px !important;
          }

          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr !important;
            gap: 50px !important;
          }
        }

        /* 1280px - Desktop */
        @media (min-width: 1280px) and (max-width: 1439px) {
          .footer-container {
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 0 40px !important;
          }
        }

        /* 1440px - Large desktop */
        @media (min-width: 1440px) and (max-width: 1919px) {
          .footer-container {
            max-width: 1360px !important;
            margin: 0 auto !important;
            padding: 0 40px !important;
          }
        }

        /* 1920px - Extra large screens */
        @media (min-width: 1920px) {
          .footer-container {
            max-width: 1600px !important;
            margin: 0 auto !important;
            padding: 0 60px !important;
          }
        }
      `}</style>
    </>
  )
}
