// Roadmap Section Component
export default function Roadmap() {
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

        .roadmap {
          padding: 120px 40px;
          background: linear-gradient(
            180deg,
            var(--dark-secondary) 0%,
            var(--dark) 100%
          );
        }

        .roadmap-timeline {
          position: relative;
          max-width: 1000px;
          margin: 80px auto;
        }

        .roadmap-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, var(--primary), var(--accent));
          transform: translateX(-50%);
        }

        .roadmap-item {
          display: flex;
          align-items: center;
          margin-bottom: 80px;
          position: relative;
        }

        .roadmap-item:last-child {
          margin-bottom: 0;
        }

        .roadmap-left {
          flex: 1;
          text-align: right;
          padding-right: 60px;
        }

        .roadmap-right {
          flex: 1;
          padding-left: 60px;
          text-align: left;
        }

        .roadmap-dot {
          position: relative;
          width: 24px;
          height: 24px;
          background: var(--warning);
          border-radius: 50%;
          border: 4px solid var(--dark);
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
          z-index: 2;
          flex-shrink: 0;
        }

        .roadmap-dot-inactive {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 4px solid var(--dark);
          box-shadow: none;
        }

        .roadmap-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 2px solid var(--warning);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .roadmap-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .roadmap-title-inactive {
          opacity: 0.7;
        }

        .roadmap-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .roadmap-description-inactive {
          color: var(--text-muted);
        }

        .roadmap-date {
          font-size: 14px;
          color: var(--warning);
          font-weight: 600;
        }

        .roadmap-date-inactive {
          color: var(--text-muted);
        }

        .mobile-only {
          display: none;
        }

        /* Mobile - single sided */
        @media (max-width: 768px) {
          .roadmap {
            padding: 80px 20px;
          }

          .roadmap-timeline {
            margin: 60px auto;
            padding-left: 40px;
          }

          .roadmap-line {
            left: 20px;
            transform: none;
          }

          .roadmap-item {
            align-items: flex-start;
            margin-bottom: 60px;
          }

          .roadmap-left {
            display: none;
          }

          .roadmap-right {
            flex: 1;
            padding-left: 40px;
            text-align: left;
          }

          .roadmap-dot,
          .roadmap-dot-inactive {
            position: absolute;
            left: 11px;
            top: 8px;
          }

          .roadmap-title {
            font-size: 20px;
            margin-bottom: 8px;
          }

          .roadmap-description {
            font-size: 13px;
            margin-bottom: 8px;
          }

          .roadmap-date {
            font-size: 13px;
            display: block;
            margin-bottom: 8px;
          }

          .mobile-only {
            display: block;
          }
        }

        /* Very small screens */
        @media (max-width: 480px) {
          .roadmap {
            padding: 60px 16px;
          }

          .roadmap-timeline {
            padding-left: 32px;
          }

          .roadmap-right {
            padding-left: 32px;
          }

          .roadmap-dot,
          .roadmap-dot-inactive {
            left: 7px;
            width: 16px;
            height: 16px;
          }

          .roadmap-title {
            font-size: 18px;
          }

          .roadmap-description {
            font-size: 12px;
          }
        }
      `}</style>

      <section className="roadmap">
        <div className="section-container">
          <div className="section-header">
            <div
              className="section-badge"
              style={{
                background: "rgba(251, 191, 36, 0.1)",
                borderColor: "rgba(251, 191, 36, 0.3)",
                color: "var(--warning)",
              }}
            >
              Roadmap
            </div>
            <h2>Building the Verifiable Internet</h2>
            <p className="section-subtitle">
              Our journey to make the internet verifiable
            </p>
          </div>

          <div className="roadmap-timeline">
            <div className="roadmap-line"></div>

            {/* Token Genesis - Q3 2025 */}
            <div className="roadmap-item">
              <div className="roadmap-left">
                <h3 className="roadmap-title">Token Genesis</h3>
                <p className="roadmap-description">
                  $DB Token Fair Launch, Litepaper.
                </p>
              </div>
              <div className="roadmap-dot">
                <div className="roadmap-pulse"></div>
              </div>
              <div className="roadmap-right">
                <span className="roadmap-date">Q3 2025</span>
                <h3 className="roadmap-title mobile-only">Token Genesis</h3>
                <p className="roadmap-description mobile-only">
                  $DB Token Fair Launch, Litepaper.
                </p>
              </div>
            </div>

            {/* Developer Preview - Q4 2025 */}
            <div className="roadmap-item">
              <div className="roadmap-left">
                <span className="roadmap-date-inactive">Q4 2025</span>
              </div>
              <div className="roadmap-dot roadmap-dot-inactive"></div>
              <div className="roadmap-right">
                <span className="roadmap-date-inactive mobile-only">
                  Q4 2025
                </span>
                <h3 className="roadmap-title roadmap-title-inactive">
                  Developer Preview
                </h3>
                <p className="roadmap-description roadmap-description-inactive">
                  Rollup Node, HyperBEAM Node, WDB SDK, NoSQL DB.
                </p>
              </div>
            </div>

            {/* Testnet Alpha - Q1 2026 */}
            <div className="roadmap-item">
              <div className="roadmap-left">
                <h3 className="roadmap-title roadmap-title-inactive">
                  Testnet Alpha
                </h3>
                <p className="roadmap-description roadmap-description-inactive">
                  Rust Devices, DBaaS, ZK Prover, Social dbapp.
                </p>
              </div>
              <div className="roadmap-dot roadmap-dot-inactive"></div>
              <div className="roadmap-right">
                <span className="roadmap-date-inactive">Q1 2026</span>
                <h3 className="roadmap-title roadmap-title-inactive mobile-only">
                  Testnet Alpha
                </h3>
                <p className="roadmap-description roadmap-description-inactive mobile-only">
                  Rust Devices, DBaaS, ZK Prover, Social dbapp.
                </p>
              </div>
            </div>

            {/* Testnet Beta - Q2 2026 */}
            <div className="roadmap-item">
              <div className="roadmap-left">
                <span className="roadmap-date-inactive">Q2 2026</span>
              </div>
              <div className="roadmap-dot roadmap-dot-inactive"></div>
              <div className="roadmap-right">
                <span className="roadmap-date-inactive mobile-only">
                  Q2 2026
                </span>
                <h3 className="roadmap-title roadmap-title-inactive">
                  Testnet Beta
                </h3>
                <p className="roadmap-description roadmap-description-inactive">
                  DBTGE, SQL, VectorDB, Validator Network.
                </p>
              </div>
            </div>

            {/* Mainnet - Q3 2026 */}
            <div className="roadmap-item">
              <div className="roadmap-left">
                <h3 className="roadmap-title roadmap-title-inactive">
                  Mainnet
                </h3>
                <p className="roadmap-description roadmap-description-inactive">
                  TGE, Validator Network Live on Mainnet.
                </p>
              </div>
              <div className="roadmap-dot roadmap-dot-inactive"></div>
              <div className="roadmap-right">
                <span className="roadmap-date-inactive">Q3 2026</span>
                <h3 className="roadmap-title roadmap-title-inactive mobile-only">
                  Mainnet
                </h3>
                <p className="roadmap-description roadmap-description-inactive mobile-only">
                  TGE, Validator Network Live on Mainnet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
