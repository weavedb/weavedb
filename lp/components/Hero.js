export default function Hero() {
  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes flowHorizontal {
          0% {
            opacity: 0;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(140px);
          }
        }

        @keyframes flowHorizontalReverse {
          0% {
            opacity: 0;
            transform: translateX(140px);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(0);
          }
        }

        @keyframes fadeFlow {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes flowZkp {
          0% {
            opacity: 0;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(30px);
          }
        }

        @keyframes flowZkpContinue {
          0% {
            opacity: 0;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(36px);
          }
        }

        @keyframes flowBranch {
          0% {
            opacity: 0;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(20px);
          }
        }

        .hero-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: row;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          z-index: 2;
          flex: 1;
          max-width: 600px;
        }

        .hero-subtitle {
          font-size: 20px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 540px;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          margin-bottom: 60px;
        }

        .hero-diagram {
          flex-shrink: 0;
          width: 520px;
          max-width: 520px;
        }

        /* Hide diagram on screens below 700px */
        @media (max-width: 699px) {
          .hero-diagram {
            display: none;
          }

          .hero-container {
            flex-direction: column;
            text-align: center;
            gap: 40px;
          }

          .hero-content {
            max-width: 100%;
            text-align: center;
          }

          .hero-subtitle {
            text-align: center;
            margin: 0 auto 40px auto;
          }

          .hero-cta {
            justify-content: center;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .hero-cta button,
          .hero-cta a {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }

        /* Larger mobile screens */
        @media (min-width: 700px) and (max-width: 1199px) {
          .hero-container {
            flex-direction: column;
            gap: 60px;
            text-align: center;
          }

          .hero-content {
            max-width: 800px;
            text-align: center;
          }

          .hero-subtitle {
            text-align: center;
            margin: 0 auto 40px auto;
          }

          .hero-cta {
            justify-content: center;
          }

          .hero-diagram {
            width: 100%;
            max-width: 600px;
          }
        }

        @media (max-width: 767px) {
          .hero-container {
            padding: 0 16px;
          }
        }

        @media (max-width: 499px) {
          .hero-container {
            padding: 0;
            gap: 40px;
          }

          .hero-content {
            padding: 0 16px;
          }

          .stats .stat-value {
            font-size: 20px;
          }

          .stats .stat-label {
            font-size: 11px;
          }
        }
      `}</style>

      <section id="hero" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="badge-dot"></div>
              <span>DB Token Fair Launch Soon</span>
            </div>

            <h1
              style={{
                fontSize: "72px",
                fontWeight: "700",
                lineHeight: "1.1",
                letterSpacing: "-2px",
              }}
            >
              The Layer-0{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #818cf8 50%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                }}
              >
                zkDatabase
              </span>
              <br />
              for the AI-Driven Verifiable Internet
            </h1>

            <p className="hero-subtitle">
              Mathematically-proven database with cloud performance and
              permanent storage. Zero-knowledge proofs enable queries from any
              blockchain. The verifiable data layer AI agents need.
            </p>

            <div className="hero-cta">
              <button
                onClick={() =>
                  window.open("https://ao.arweave.net/#/delegate/", "_blank")
                }
                style={{
                  padding: "12px 24px",
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  color: "var(--primary-light)",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)"
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)"
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(99, 102, 241, 0.2)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)"
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)"
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                Mint DB Token
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateX(2px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateX(0)"
                  }}
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <a
                href="https://docs.weavedb.dev/litepaper"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "500",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                }}
              >
                Read Litepaper
              </a>
            </div>
          </div>

          <div className="hero-diagram">
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "500px",
                height: "400px",
                background:
                  "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%)",
                pointerEvents: "none",
                animation: "pulseGlow 4s ease-in-out infinite",
              }}
            ></div>

            <div
              style={{
                width: "520px",
                height: "420px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "40px",
                  left: "40px",
                  width: "150px",
                  height: "48px",
                  background: "rgba(20, 10, 40, 0.6)",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                  color: "rgba(196, 181, 253, 1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Rollup
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "118px",
                  left: "40px",
                  width: "150px",
                  height: "100px",
                  background:
                    "linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(139, 92, 246, 0.2))",
                  border: "2px solid rgba(124, 58, 237, 0.8)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "24px",
                  fontWeight: "600",
                  boxShadow:
                    "0 0 80px rgba(124, 58, 237, 0.4), 0 10px 40px rgba(124, 58, 237, 0.3)",
                  backdropFilter: "blur(12px)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                zkDB
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "248px",
                  left: "40px",
                  width: "150px",
                  height: "48px",
                  background: "rgba(20, 10, 40, 0.6)",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                  color: "rgba(167, 139, 250, 1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Arweave
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "40px",
                  right: "40px",
                  width: "150px",
                  height: "48px",
                  background: "rgba(20, 10, 40, 0.6)",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                  color: "rgba(233, 213, 255, 1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Query
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "118px",
                  right: "40px",
                  width: "150px",
                  height: "48px",
                  background: "rgba(20, 10, 40, 0.6)",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                  color: "rgba(196, 181, 253, 1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                AO
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "181px",
                  right: "40px",
                  width: "150px",
                  height: "48px",
                  background: "rgba(20, 10, 40, 0.6)",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                  color: "rgba(196, 181, 253, 1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                EVM
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "248px",
                  right: "40px",
                  width: "150px",
                  height: "48px",
                  background: "rgba(20, 10, 40, 0.6)",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                  color: "rgba(196, 181, 253, 1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                Other Chains
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "160px",
                  left: "220px",
                  width: "54px",
                  height: "30px",
                  background:
                    "linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(196, 181, 253, 0.15))",
                  border: "1.5px solid rgba(196, 181, 253, 0.7)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "rgba(233, 213, 255, 1)",
                  fontWeight: "600",
                  letterSpacing: "0.5px",
                  boxShadow: "0 0 30px rgba(196, 181, 253, 0.35)",
                }}
              >
                ZKP
              </div>

              {/* Connection lines */}
              <div
                style={{
                  position: "absolute",
                  top: "64px",
                  left: "190px",
                  width: "140px",
                  height: "1px",
                  background: "rgba(139, 92, 246, 0.4)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "88px",
                  left: "115px",
                  width: "1px",
                  height: "30px",
                  background: "rgba(139, 92, 246, 0.4)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "218px",
                  left: "115px",
                  width: "1px",
                  height: "30px",
                  background: "rgba(139, 92, 246, 0.4)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "142px",
                  left: "190px",
                  width: "140px",
                  height: "1px",
                  background: "rgba(139, 92, 246, 0.5)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "175px",
                  left: "190px",
                  width: "30px",
                  height: "1px",
                  background: "rgba(139, 92, 246, 0.6)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "175px",
                  left: "274px",
                  width: "36px",
                  height: "1px",
                  background: "rgba(196, 181, 253, 0.5)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "175px",
                  left: "310px",
                  width: "1px",
                  height: "97px",
                  background: "rgba(196, 181, 253, 0.5)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "205px",
                  left: "310px",
                  width: "20px",
                  height: "1px",
                  background: "rgba(196, 181, 253, 0.5)",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "272px",
                  left: "310px",
                  width: "20px",
                  height: "1px",
                  background: "rgba(196, 181, 253, 0.5)",
                }}
              ></div>

              {/* Animated flow particles */}
              <div
                style={{
                  position: "absolute",
                  top: "63px",
                  left: "190px",
                  width: "20px",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(233, 213, 255, 1), transparent)",
                  animation: "flowHorizontal 1.2s ease-out infinite",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "63px",
                  left: "190px",
                  width: "20px",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(196, 181, 253, 1), transparent)",
                  animation: "flowHorizontalReverse 1.2s ease-out infinite",
                  animationDelay: "0.6s",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "100px",
                  left: "114px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(233, 213, 255, 0.9)",
                  animation: "fadeFlow 3s ease-in-out infinite",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "233px",
                  left: "114px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(233, 213, 255, 0.9)",
                  animation: "fadeFlow 3s ease-in-out infinite",
                  animationDelay: "1s",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "141px",
                  left: "190px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(233, 213, 255, 0.9)",
                  animation: "flowHorizontal 2s ease-in-out infinite",
                  animationDelay: "0.5s",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "174px",
                  left: "190px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(233, 213, 255, 0.9)",
                  animation: "flowZkp 2s ease-in-out infinite",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "174px",
                  left: "274px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(233, 213, 255, 0.9)",
                  animation: "flowZkpContinue 2s ease-in-out infinite",
                  animationDelay: "0.5s",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "204px",
                  left: "310px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(233, 213, 255, 0.9)",
                  animation: "flowBranch 2s ease-in-out infinite",
                  animationDelay: "0.8s",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "271px",
                  left: "310px",
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  background: "rgba(233, 213, 255, 0.9)",
                  animation: "flowBranch 2s ease-in-out infinite",
                  animationDelay: "1s",
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-value">10ms-200ms</div>
            <div className="stat-label">Query Response</div>
          </div>
          <div className="stat">
            <div className="stat-value">10,000 TPS</div>
            <div className="stat-label">Per Database</div>
          </div>
          <div className="stat">
            <div className="stat-value">1-3 secs</div>
            <div className="stat-label">ZK Proof Generation</div>
          </div>
          <div className="stat">
            <div className="stat-value">Permanent</div>
            <div className="stat-label">Arweave Storage</div>
          </div>
        </div>
      </section>
    </>
  )
}
