// Use Cases Section Component
export default function UseCases() {
  return (
    <section id="use-cases" className="use-cases">
      <div className="section-container">
        <div className="section-header">
          <div
            className="section-badge"
            style={{
              background: "rgba(251, 191, 36, 0.1)",
              borderColor: "rgba(251, 191, 36, 0.3)",
              color: "#fbbf24",
            }}
          >
            Use Cases
          </div>
          <h2>Build Without Limits</h2>
          <p className="section-subtitle">
            Applications impossible with traditional infrastructure become
            trivial
          </p>
        </div>

        <div className="use-cases-grid">
          {/* Decentralized Social Networks */}
          <div
            className="use-case"
            style={{ position: "relative", paddingBottom: "60px" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                marginBottom: "20px",
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1))",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fbbf24",
              }}
            >
              Decentralized Social Networks
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              Twitter/Reddit clones with JSON configuration. User-owned data, no
              servers, runs forever autonomously.
            </div>
            <div
              style={{ position: "absolute", bottom: "24px", right: "24px" }}
            >
              <a
                href="https://github.com/weavedb/jots"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 14px",
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  color: "#fbbf24",
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
                  e.currentTarget.style.background = "rgba(251, 191, 36, 0.15)"
                  e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.3)"
                  e.currentTarget.style.transform = "translateX(2px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(251, 191, 36, 0.1)"
                  e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.2)"
                  e.currentTarget.style.transform = "translateX(0)"
                }}
              >
                Demo
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

          {/* Universal zkOracles */}
          <div
            className="use-case"
            style={{ position: "relative", paddingBottom: "60px" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                marginBottom: "20px",
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1))",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fbbf24",
              }}
            >
              Universal zkOracles
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              Smart contracts query any data with cryptographic proof. Weather,
              prices, sports results—all verifiable.
            </div>
            <div
              style={{ position: "absolute", bottom: "24px", right: "24px" }}
            >
              <a
                href="https://zkdb-demo.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 14px",
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  color: "#fbbf24",
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
                  e.currentTarget.style.background = "rgba(251, 191, 36, 0.15)"
                  e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.3)"
                  e.currentTarget.style.transform = "translateX(2px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(251, 191, 36, 0.1)"
                  e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.2)"
                  e.currentTarget.style.transform = "translateX(0)"
                }}
              >
                Demo
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

          {/* Autonomous Data Markets */}
          <div
            className="use-case"
            style={{ position: "relative", paddingBottom: "60px" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                marginBottom: "20px",
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1))",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fbbf24",
              }}
            >
              Autonomous Data Markets
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              Self-governing databases with bonding curves. AI agents optimize
              tokenomics autonomously.
            </div>
            <div
              style={{ position: "absolute", bottom: "24px", right: "24px" }}
            >
              <span
                style={{
                  padding: "6px 14px",
                  background: "rgba(251, 191, 36, 0.05)",
                  border: "1px solid rgba(251, 191, 36, 0.1)",
                  color: "rgba(251, 191, 36, 0.5)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "not-allowed",
                }}
              >
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
