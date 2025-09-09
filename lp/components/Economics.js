import { useState, useEffect } from "react"

// Enhanced Economics Section Component
export default function Economics() {
  return (
    <>
      <section id="economics" className="economics">
        <div className="section-container">
          <div className="section-header">
            <div
              className="section-badge"
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                borderColor: "rgba(16, 185, 129, 0.3)",
                color: "#10b981",
              }}
            >
              Tokenomics
            </div>
            <h2>Self-Sustaining Economic Model</h2>
            <p className="section-subtitle">
              Dual-token system aligning incentives across developers,
              validators, and users
            </p>
          </div>

          {/* Token Distribution */}
          <div className="economics-token-grid">
            {/* $DB Token */}
            <div
              style={{
                background: "rgba(99, 102, 241, 0.05)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "16px",
                padding: "40px",
                position: "relative",
                paddingBottom: "80px",
              }}
            >
              <h3
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "var(--primary-light)",
                  marginBottom: "24px",
                }}
              >
                $DB Token
              </h3>
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  marginBottom: "32px",
                }}
              >
                The foundational asset of the verifiable data economy. $DB
                secures the protocol, fuels query settlement, and aligns
                long-term incentives across the ecosystem.
              </p>

              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                  }}
                >
                  Distribution Model
                </h4>

                {/* Fixed Donut Chart */}
                <div
                  style={{
                    position: "relative",
                    width: "200px",
                    height: "200px",
                    margin: "0 auto 24px",
                  }}
                >
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {(() => {
                      const r = 80
                      const center = { cx: 100, cy: 100 }
                      const slices = [
                        { pct: 30, color: "#6366F1" }, // Fair Launch
                        { pct: 20, color: "#8B5CF6" }, // DEX Reserve
                        { pct: 20, color: "#EC4899" }, // Contributors
                        { pct: 10, color: "#06B6D4" }, // Foundation
                        { pct: 10, color: "#10B981" }, // Growth
                        { pct: 10, color: "#F97316" }, // Team
                      ]
                      let start = 0
                      return (
                        <>
                          {slices.map((s, i) => {
                            const el = (
                              <circle
                                key={i}
                                {...center}
                                r={r}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="40"
                                strokeLinecap="butt"
                                pathLength="100"
                                strokeDasharray={`${s.pct} ${100 - s.pct}`}
                                strokeDashoffset={-start}
                                transform="rotate(-90 100 100)"
                                opacity="0.9"
                              />
                            )
                            start += s.pct
                            return el
                          })}
                          {/* Center circle */}
                          <circle cx="100" cy="100" r="60" fill="#0a0a0a" />

                          {/* Center text */}
                          <text
                            x="100"
                            y="90"
                            textAnchor="middle"
                            fontSize="20"
                            fontWeight="600"
                            fill="#6366F1"
                          >
                            $DB
                          </text>
                          <text
                            x="100"
                            y="110"
                            textAnchor="middle"
                            fontSize="11"
                            fill="#666"
                          >
                            1B Supply
                          </text>
                          <text
                            x="100"
                            y="125"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#666"
                          >
                            Fair Launch
                          </text>
                        </>
                      )
                    })()}
                  </svg>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--text-muted)",
                    marginBottom: "16px",
                  }}
                >
                  Core Utilities
                </h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>✓</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Settlement currency for queries across all operators
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>✓</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Collateral for database bonding curves (DBTGE)
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>✓</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Validator staking and delegation rewards
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>✓</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Access to DEX Reserve yield and governance
                    </span>
                  </li>
                </ul>
              </div>

              {/* Button */}
              <div
                style={{ position: "absolute", bottom: "24px", right: "24px" }}
              >
                <a
                  href="https://ao.arweave.net/#/delegate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 14px",
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    color: "var(--primary-light)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background =
                      "rgba(99, 102, 241, 0.15)"
                    e.currentTarget.style.borderColor =
                      "rgba(99, 102, 241, 0.3)"
                    e.currentTarget.style.transform = "translateX(2px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"
                    e.currentTarget.style.borderColor =
                      "rgba(99, 102, 241, 0.2)"
                    e.currentTarget.style.transform = "translateX(0)"
                  }}
                >
                  Mint $DB Token
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
            </div>

            {/* App-Specific $dbTokens */}
            <div
              style={{
                background: "rgba(236, 72, 153, 0.05)",
                border: "1px solid rgba(236, 72, 153, 0.2)",
                borderRadius: "16px",
                padding: "40px",
                position: "relative",
                paddingBottom: "80px",
              }}
            >
              <h3
                style={{
                  fontSize: "28px",
                  fontWeight: "600",
                  color: "var(--accent)",
                  marginBottom: "24px",
                }}
              >
                App-Specific $dbTokens
              </h3>
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--text-secondary)",
                  marginBottom: "32px",
                }}
              >
                Application-specific tokens emitted by each database with a
                bonding curve, backed by $DB. They enable app-specific local
                economies that capture value from usage.
              </p>

              <div style={{ marginBottom: "32px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--text-muted)",
                    marginBottom: "16px",
                  }}
                >
                  DBTGE Bonding Curve with veDB Boost
                </h4>
                <div
                  style={{
                    height: "240px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 300 200"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="curveGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#ec4899", stopOpacity: 1 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#f472b6", stopOpacity: 1 }}
                        />
                      </linearGradient>
                      <linearGradient
                        id="fillGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style={{ stopColor: "#ec4899", stopOpacity: 0.3 }}
                        />
                        <stop
                          offset="100%"
                          style={{ stopColor: "#ec4899", stopOpacity: 0.1 }}
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 30 180 Q 90 150, 150 100 Q 210 60, 270 40"
                      stroke="url(#curveGradient)"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      d="M 30 180 Q 90 150, 150 100 Q 210 60, 270 40 L 270 180 L 30 180 Z"
                      fill="url(#fillGradient)"
                    />
                    <circle cx="30" cy="180" r="3" fill="#ec4899" />
                    <text x="10" y="195" fontSize="10" fill="#ec4899">
                      3m
                    </text>
                    <text x="10" y="175" fontSize="9" fill="#666">
                      1.0x
                    </text>
                    <circle cx="150" cy="100" r="3" fill="#ec4899" />
                    <text x="135" y="115" fontSize="10" fill="#ec4899">
                      1y
                    </text>
                    <text x="135" y="95" fontSize="9" fill="#666">
                      1.5x
                    </text>
                    <circle cx="270" cy="40" r="3" fill="#ec4899" />
                    <text x="245" y="30" fontSize="10" fill="#ec4899">
                      4y
                    </text>
                    <text x="245" y="60" fontSize="9" fill="#666">
                      2.5x
                    </text>
                  </svg>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      position: "absolute",
                      bottom: "55px",
                      left: "15px",
                    }}
                  >
                    Lock Duration
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      position: "absolute",
                      top: "8px",
                      right: "15px",
                    }}
                  >
                    veDB Boost
                  </span>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "var(--text-muted)",
                    marginBottom: "16px",
                  }}
                >
                  DBTGE Mechanism
                </h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>•</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Deposit $DB to mint app-specific $dbTokens
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>•</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Lock periods from 3 months to 4 years with veToken
                      multipliers
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>•</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      $dbTokens minted 1:1 with $DB yield for liquidity
                      provision
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "var(--accent)" }}>•</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      $DB yield covers infrastructure costs for autonomous
                      sustainability
                    </span>
                  </li>
                </ul>
              </div>

              {/* Button */}
              <div
                style={{ position: "absolute", bottom: "24px", right: "24px" }}
              >
                <a
                  href="https://docs.weavedb.dev/tokenomics/allocation"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 14px",
                    background: "rgba(236, 72, 153, 0.1)",
                    border: "1px solid rgba(236, 72, 153, 0.2)",
                    color: "var(--accent)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background =
                      "rgba(236, 72, 153, 0.15)"
                    e.currentTarget.style.borderColor =
                      "rgba(236, 72, 153, 0.3)"
                    e.currentTarget.style.transform = "translateX(2px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(236, 72, 153, 0.1)"
                    e.currentTarget.style.borderColor =
                      "rgba(236, 72, 153, 0.2)"
                    e.currentTarget.style.transform = "translateX(0)"
                  }}
                >
                  Tokenomics
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Base styles - mobile first */
        .economics-token-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
          max-width: 1200px;
          margin: 60px auto;
        }

        /* 1024px and above - side by side */
        @media (min-width: 1024px) {
          .economics-token-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        /* Mobile adjustments */
        @media (max-width: 479px) {
          .section-container {
            padding: 0 16px !important;
          }

          .economics-token-grid {
            gap: 30px !important;
            margin: 40px auto !important;
          }
        }

        @media (min-width: 480px) and (max-width: 767px) {
          .section-container {
            padding: 0 20px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .section-container {
            padding: 0 32px !important;
          }
        }
      `}</style>
    </>
  )
}
