// Problem Section Component (zkDatabase)
export default function Problem() {
  const technologies = [
    {
      title: "FPJSON",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      color: "#fbbf24",
      description:
        "Functional programming code as JSON with 250+ composable functions. Build complex access control and data transformations without writing smart contracts.",
      docLink: "https://docs.weavedb.dev/tech/fpjson",
    },
    {
      title: "zkJSON",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
          <path d="M12 22V2" />
          <path d="M2 7h20" />
        </svg>
      ),
      color: "#818cf8",
      description:
        "Zero-knowledge JSON proofs with domain-specific lightweight zk circuits. The Solidity query contracts are optimized with Yul assembly language.",
      docLink: "https://docs.weavedb.dev/tech/zkjson",
    },
    {
      title: "zkDB",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 3v18" />
          <circle cx="15" cy="15" r="2" fill="currentColor" />
        </svg>
      ),
      color: "#ec4899",
      description:
        "Optimistic ZK rollup database combining zkJSON proofs with nested sparse merkle trees. Query any offchain data directly from Solidity contracts with zkJSON.",
      docLink: "https://docs.weavedb.dev/tech/zkdb",
    },
    {
      title: "HyperBEAM WAL",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      color: "#10b981",
      description:
        "Write-Ahead Log on AO's HyperBEAM for durability and recoverability. In-memory DB rollups and HyperBEAM WAL emulates modern high performance LSM storage engines.",
      docLink: "https://docs.wao.eco",
    },
    {
      title: "ARJSON",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
          <circle cx="9" cy="9" r="2" />
          <circle cx="15" cy="15" r="2" />
        </svg>
      ),
      color: "#f472b6",
      description:
        "Bit-level encoding for append-only permanent storage such as Arweave. Absolute minimum compressed bits drastically reduce decentralized storage costs.",
      docLink: "https://docs.weavedb.dev/tech/arjson",
    },
    {
      title: "Monadic Pipeline",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="5" cy="12" r="3" />
          <circle cx="19" cy="12" r="3" />
          <path d="M8 12h8" />
          <path d="M13 9l3 3-3 3" />
        </svg>
      ),
      color: "#a78bfa",
      description:
        "Monad-based data transformations with Kleisli composition, which makes the data pipleline hyper-modular and allows multi-paradigm DBs such as NoSQL, SQL and vector.",
      docLink: "https://docs.weavedb.dev/tech/monade",
    },
  ]

  return (
    <section id="problem" className="problem">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge">zkDatabase</div>
          <h2>Novel Encoding and Primitives</h2>
          <p className="section-subtitle">
            Composable Low-Level Primitives Unified Through Mathematical Rigor
          </p>
        </div>

        <div className="problem-grid">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="problem-card"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                paddingBottom: "60px",
              }}
            >
              <div className="problem-icon" style={{ color: tech.color }}>
                {tech.icon}
              </div>
              <div className="problem-title">{tech.title}</div>
              <div className="problem-desc">{tech.description}</div>
              <div
                style={{ position: "absolute", bottom: "24px", right: "24px" }}
              >
                <a
                  href={tech.docLink}
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
                  Learn More
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
          ))}
        </div>
      </div>
    </section>
  )
}
