import { useEffect } from "react"

// Tech Stack Section Component
export default function TechStack() {
  useEffect(() => {
    // Animation function
    function animateDataFlow() {
      // Define the flow paths with better timing
      const flows = [
        // Rollup pipeline - slower, smoother timing
        ["query", "parser", "#8b5cf6", 0],
        ["parser", "auth", "#8b5cf6", 300],
        ["auth", "planner", "#8b5cf6", 600],
        ["planner", "index", "#8b5cf6", 900],
        ["index", "trees", "#8b5cf6", 1200],
        ["trees", "kv", "#8b5cf6", 1500],
        ["kv", "disk", "#8b5cf6", 1800],

        // Query to WAL (parallel to Rollup)
        ["query", "wal", "#ef4444", 200],

        // HyperBEAM pipeline
        ["wal", "arjson", "#ef4444", 700],
        ["arjson", "zkdb", "#ef4444", 1000],
        ["zkdb", "validators", "#ef4444", 1300],
        ["validators", "arweave", "#ef4444", 1600],

        // zkDB to zkJSON
        ["zkdb", "zkjson", "#10b981", 1400],

        // zkJSON to both chains simultaneously
        ["zkjson", "evm", "#10b981", 1700],
        ["zkjson", "other", "#10b981", 1700],

        // SSTable (in Arweave) to AO
        ["arweave", "ao", "#f87171", 1900],

        // DApps receive from multiple sources
        ["disk", "dapps", "#8b5cf6", 2100], // From Rollup
        ["evm", "dapps", "#10b981", 2000], // From EVM
        ["other", "dapps", "#10b981", 2000], // From Other chains
      ]

      flows.forEach(([startId, endId, color, delay]) => {
        setTimeout(() => {
          const start = document.getElementById(startId)
          const end = document.getElementById(endId)
          if (!start || !end) return

          const packet = document.createElement("div")
          packet.className = "flow-packet"
          packet.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            background: ${color};
            box-shadow: 0 0 10px ${color};
          `
          document.body.appendChild(packet)

          const startRect = start.getBoundingClientRect()
          const endRect = end.getBoundingClientRect()

          packet.style.left = startRect.left + startRect.width / 2 - 3 + "px"
          packet.style.top = startRect.top + startRect.height / 2 - 3 + "px"

          packet.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"

          setTimeout(() => {
            packet.style.left = endRect.left + endRect.width / 2 - 3 + "px"
            packet.style.top = endRect.top + endRect.height / 2 - 3 + "px"
          }, 10)

          setTimeout(() => packet.remove(), 700)
        }, delay)
      })
    }

    // Run animation on mount and repeat
    animateDataFlow()
    const interval = setInterval(animateDataFlow, 4000)

    // Cleanup
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <section id="tech-stack" className="tech-stack">
        <div className="section-container">
          <div className="section-header">
            <div
              className="section-badge"
              style={{
                background: "rgba(99, 102, 241, 0.1)",
                borderColor: "rgba(99, 102, 241, 0.3)",
                color: "#818cf8",
              }}
            >
              Technical Architecture
            </div>
            <h2>Decentralized LSM Storage Engine</h2>
            <p className="section-subtitle">
              Modern Database Engine Elegantly Emulated on a Decentralized Tech
              Stack
            </p>
          </div>

          {/* Full Technical Architecture Diagram */}
          <div className="tech-architecture" id="tech-architecture">
            <div className="tech-grid">
              {/* Column 1: Rollup */}
              <div className="tech-column">
                <div className="tech-header" style={{ color: "#a78bfa" }}>
                  ROLLUP ( MemTable )
                </div>

                <div
                  className="tech-item"
                  style={{
                    background: "rgba(251, 191, 36, 0.1)",
                    borderColor: "rgba(251, 191, 36, 0.3)",
                  }}
                  id="query"
                >
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Query
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    HTTP Message • 10ms-200ms • 10,000 TPS
                  </div>
                </div>

                <div
                  style={{
                    height: "32px",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    color: "#a78bfa",
                    marginBottom: "10px",
                  }}
                >
                  Monadic Data Pipeline
                </div>

                <div className="tech-item" id="parser">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Query Parser
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    NoSQL, Relational, Vector
                  </div>
                </div>

                <div className="tech-item" id="auth">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Authentication
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    FPJSON / JSONSchema
                  </div>
                </div>

                <div className="tech-item" id="planner">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Query Planner
                  </div>
                </div>

                <div className="tech-item" id="index">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Index Manager
                  </div>
                </div>

                <div className="tech-item" id="trees">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Search Trees
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    B+ Trees
                  </div>
                </div>

                <div className="tech-item" id="kv">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    KV Adaptor
                  </div>
                </div>

                <div style={{ flex: 1 }}></div>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(139, 92, 246, 0.4)",
                    background: "rgba(139, 92, 246, 0.05)",
                    textAlign: "center",
                  }}
                  id="disk"
                >
                  <div style={{ fontWeight: "600", fontSize: "14px" }}>
                    DISK
                  </div>
                  <div style={{ fontSize: "11px", opacity: "0.7" }}>
                    KV Store
                  </div>
                </div>
              </div>

              {/* Column 2: HyperBEAM */}
              <div className="tech-column">
                <div className="tech-header" style={{ color: "#ef4444" }}>
                  HYPERBEAM ( AO-CORE )
                </div>

                <div className="tech-item" id="wal">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>WAL</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    Write Ahead Log
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#f87171",
                      textAlign: "center",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "10px",
                    }}
                  >
                    COMPACTION
                  </div>
                  <div
                    className="tech-item"
                    id="arjson"
                    style={{ marginBottom: "10px" }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "600" }}>
                      ARJSON
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(255, 255, 255, 0.5)",
                        marginTop: "2px",
                      }}
                    >
                      Bit-level Encoding
                    </div>
                  </div>
                  <div
                    className="tech-item"
                    id="zkdb"
                    style={{ marginBottom: 0 }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "600" }}>
                      zkDB
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(255, 255, 255, 0.5)",
                        marginTop: "2px",
                      }}
                    >
                      Nested Sparse Merkle Trees
                    </div>
                  </div>
                </div>

                <div className="tech-item" id="validators">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Validators
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    TEE / Restaking
                  </div>
                </div>

                <div style={{ flex: 1 }}></div>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(239, 68, 68, 0.4)",
                    background:
                      "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(139, 92, 246, 0.05))",
                    textAlign: "center",
                  }}
                  id="arweave"
                >
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#f87171",
                    }}
                  >
                    ARWEAVE
                  </div>
                  <div
                    className="tech-item"
                    style={{
                      margin: "8px 0",
                      background: "rgba(239, 68, 68, 0.1)",
                      width: "100%",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "600" }}>
                      SSTable
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(255, 255, 255, 0.5)",
                        marginTop: "2px",
                      }}
                    >
                      Sorted String Tables
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", opacity: "0.7" }}>
                    Permanent Storage
                  </div>
                </div>
              </div>

              {/* Column 3: Multi-Chain */}
              <div className="tech-column">
                <div className="tech-header" style={{ color: "#10b981" }}>
                  MULTI-CHAIN ACCESS
                </div>

                <div
                  style={{
                    height: "20px",
                    fontSize: "11px",
                    color: "#34d399",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  AO PROCESSES / AOS
                </div>

                <div className="tech-item" id="ao">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>AO</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    Native Access
                  </div>
                </div>

                <div
                  style={{
                    height: "20px",
                    fontSize: "11px",
                    color: "#34d399",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  BLOCKCHAINS
                </div>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid rgba(16, 185, 129, 0.4)",
                    background: "rgba(16, 185, 129, 0.1)",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                  id="zkjson"
                >
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#34d399",
                    }}
                  >
                    zkJSON
                  </div>
                  <div style={{ fontSize: "11px", opacity: "0.7" }}>
                    Zero-Knowledge Proofs
                  </div>
                </div>

                <div className="tech-item" id="evm">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>EVM</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    Ethereum
                  </div>
                </div>

                <div className="tech-item" id="other">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    Other Chains
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                      marginTop: "2px",
                    }}
                  >
                    SVM, L2s, App Chains
                  </div>
                </div>

                <div style={{ flex: 1 }}></div>

                <div
                  style={{
                    height: "20px",
                    fontSize: "11px",
                    color: "#34d399",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  DAPPS
                </div>

                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.05)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                  id="dapps"
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        height: "24px",
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                      }}
                    >
                      DeFi
                    </div>
                    <div
                      style={{
                        height: "24px",
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                      }}
                    >
                      Social
                    </div>
                    <div
                      style={{
                        height: "24px",
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                      }}
                    >
                      Gaming
                    </div>
                    <div
                      style={{
                        height: "24px",
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                      }}
                    >
                      Identity
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 Architecture Metrics */}
          <div className="tech-metrics">
            <div className="tech-metric">
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #818cf8, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "8px",
                }}
              >
                DB Rollups
              </div>
              <div className="tech-metric-label">Cloud Performance</div>
            </div>
            <div className="tech-metric">
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #818cf8, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "8px",
                }}
              >
                HyperBEAM
              </div>
              <div className="tech-metric-label">Data Provenance</div>
            </div>
            <div className="tech-metric">
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #818cf8, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "8px",
                }}
              >
                Blockchains
              </div>
              <div className="tech-metric-label">ZK Proofs</div>
            </div>
          </div>

          {/* 4 Explanation Items */}
          <div
            className="features-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <div className="feature">
              <div
                className="feature-icon"
                style={{ background: "rgba(139, 92, 246, 0.1)" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="feature-title">In-Memory Rollup</div>
              <div className="feature-desc">
                Query goes through in-memory rollup giving cloud performance
                with 10-200ms latency and 10,000 TPS throughput
              </div>
            </div>

            <div className="feature">
              <div
                className="feature-icon"
                style={{ background: "rgba(239, 68, 68, 0.1)" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="feature-title">WAL on HyperBEAM</div>
              <div className="feature-desc">
                WAL is stored in HyperBEAM process ensuring durability and
                recoverability coordinating between memory and permanent storage
              </div>
            </div>

            <div className="feature">
              <div
                className="feature-icon"
                style={{ background: "rgba(251, 191, 36, 0.1)" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                >
                  <path d="M9 11H3v2h6m1-2v2m4-2h8v2h-8m-1-2v2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M3.54 18.46l4.24-4.24" />
                </svg>
              </div>
              <div className="feature-title">Validator Network</div>
              <div className="feature-desc">
                Validators validate ARJSON compacted bits and merkle root hashes
                for zk-proofs using TEE before permanent finality on Arweave
              </div>
            </div>

            <div className="feature">
              <div
                className="feature-icon"
                style={{ background: "rgba(16, 185, 129, 0.1)" }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="feature-title">Cross-Chain Queries</div>
              <div className="feature-desc">
                zkJSON allows other chains to query with cryptographic proofs
                generated in 1-3 seconds on consumer hardware
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* 360px - Minimum mobile */
        @media (max-width: 767px) {
          .section-container {
            padding: 0 16px !important;
          }

          .tech-architecture {
            padding: 20px !important;
            margin: 60px auto !important;
          }

          .tech-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }

          .tech-metrics {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
            padding: 30px 20px !important;
          }

          .tech-metric-value {
            font-size: 32px !important;
          }

          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }

        /* 480px - Large mobile phones */
        @media (min-width: 480px) and (max-width: 767px) {
          .section-container {
            padding: 0 20px !important;
          }

          .tech-architecture {
            padding: 24px !important;
          }
        }

        /* 768px - Tablets portrait */
        @media (min-width: 768px) and (max-width: 1023px) {
          .section-container {
            padding: 0 32px !important;
          }

          .tech-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }

          .tech-metrics {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 30px !important;
          }

          .tech-metric-value {
            font-size: 28px !important;
          }

          /* Specifically target the metric titles */
          .tech-metric div:first-child {
            font-size: 24px !important;
          }

          /* Fix metric subtitles/labels */
          .tech-metric-label {
            font-size: 12px !important;
          }

          /* Fix section subtitle */
          .section-subtitle {
            font-size: 16px !important;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          /* Fix font sizes for tech items */
          .tech-item {
            font-size: 12px !important;
          }

          .tech-item div:first-child {
            font-size: 12px !important;
          }

          .tech-item div:last-child {
            font-size: 10px !important;
          }

          .tech-header {
            font-size: 11px !important;
          }
        }

        /* 1024px - Tablets landscape / small laptops */
        @media (min-width: 1024px) and (max-width: 1279px) {
          .section-container {
            padding: 0 40px !important;
          }

          .tech-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 20px !important;
          }
        }

        /* 1280px - Desktop */
        @media (min-width: 1280px) and (max-width: 1439px) {
          .section-container {
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 0 40px !important;
          }
        }

        /* 1440px - Large desktop */
        @media (min-width: 1440px) and (max-width: 1919px) {
          .section-container {
            max-width: 1360px !important;
            margin: 0 auto !important;
            padding: 0 40px !important;
          }
        }

        /* 1920px - Extra large screens */
        @media (min-width: 1920px) {
          .section-container {
            max-width: 1600px !important;
            margin: 0 auto !important;
            padding: 0 60px !important;
          }
        }
      `}</style>
    </>
  )
}
