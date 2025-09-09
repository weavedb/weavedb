// CTA Section Component

export default function CTA() {
  return (
    <section className="cta">
      <div className="cta-container">
        <h2
          style={{
            fontSize: "clamp(48px, 6vw, 72px)",
            fontWeight: "700",
            marginBottom: "24px",
            lineHeight: "1.1",
            letterSpacing: "-1px",
            background:
              "linear-gradient(135deg, #ffffff 0%, #818cf8 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            display: "inline-block",
          }}
        >
          Join the Data Revolution
        </h2>
        <p
          style={{
            fontSize: "20px",
            color: "var(--text-secondary)",
            marginBottom: "48px",
            lineHeight: "1.6",
          }}
        >
          Delegate AO yield to mint $DB token
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() =>
              window.open("https://ao.arweave.net/#/delegate/", "_blank")
            }
            style={{
              padding: "14px 28px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "var(--primary-light)",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)"
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)"
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow =
                "0 15px 40px rgba(99, 102, 241, 0.25)"
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
              width="16"
              height="16"
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
              padding: "14px 28px",
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              fontSize: "16px",
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
    </section>
  )
}
