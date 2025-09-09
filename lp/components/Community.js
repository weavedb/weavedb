// Community Section Component
export default function Community() {
  return (
    <>
      <section id="community" className="community">
        <div className="section-container">
          <div className="section-header">
            <div
              className="section-badge"
              style={{
                background: "rgba(236, 72, 153, 0.1)",
                borderColor: "rgba(236, 72, 153, 0.3)",
                color: "var(--accent)",
              }}
            >
              Community
            </div>
            <h2>Join Our Global Network</h2>
            <p className="section-subtitle">
              Builders, researchers, and innovators working together on the
              future of data
            </p>
          </div>

          {/* Media Grid - Photos Left, Video Right */}
          <div className="media-grid">
            {/* Left: 4 Photos in 2x2 Grid */}
            <div className="photos-grid">
              <div className="photo-item">
                <img
                  src="/images/community/photo-2.jpeg"
                  alt="WeaveDB Community"
                />
              </div>

              <div className="photo-item">
                <img
                  src="/images/community/photo-3.jpeg"
                  alt="WeaveDB Hackathon"
                />
              </div>

              <div className="photo-item">
                <img
                  src="/images/community/photo-4.jpeg"
                  alt="WeaveDB Conference"
                />
              </div>

              <div className="photo-item">
                <img src="/images/community/photo-1.png" alt="WeaveDB Team" />
              </div>
            </div>

            {/* Right: Video */}
            <div className="video-container">
              <video
                src="/images/community/video-1.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="community-video"
              />
              {/* Optional: Play button overlay */}
              <div className="play-button">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ marginLeft: "2px" }}
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="community-stats">
            <div className="stat-item">
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  background:
                    "linear-gradient(135deg, #818cf8 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }}
              >
                23K+
              </div>
              <div className="stat-label">Discord Members</div>
            </div>
            <div className="stat-item">
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  background:
                    "linear-gradient(135deg, #818cf8 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }}
              >
                28K+
              </div>
              <div className="stat-label">X Followers</div>
            </div>
            <div className="stat-item">
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  lineHeight: "1.2",
                  background:
                    "linear-gradient(135deg, #818cf8 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                }}
              >
                30+
              </div>
              <div className="stat-label">Ambassadors</div>
            </div>
          </div>

          {/* Join Community CTAs */}
          <div className="community-cta">
            <button
              onClick={() =>
                window.open("https://discord.com/invite/YMe3eqf69M", "_blank")
              }
              className="cta-button discord-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
              </svg>
              Join Discord
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>

            <button
              onClick={() => window.open("https://x.com/weave_db", "_blank")}
              className="cta-button x-btn"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Follow on X
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .community {
          overflow-x: hidden;
          width: 100%;
        }

        .media-grid {
          display: flex;
          gap: 24px;
          max-width: 1200px;
          margin: 60px auto;
          align-items: stretch;
          width: 100%;
        }

        .photos-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 16px;
          min-height: 500px;
          width: 100%;
        }

        .photo-item {
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
        }

        .photo-item:hover {
          transform: scale(1.02);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15);
        }

        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-container {
          flex: 1;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
          min-height: 500px;
          transition: all 0.3s ease;
          width: 100%;
        }

        .video-container:hover {
          border-color: rgba(236, 72, 153, 0.3);
          box-shadow: 0 20px 50px rgba(236, 72, 153, 0.2);
        }

        .community-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .play-button {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          background: rgba(236, 72, 153, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .play-button:hover {
          transform: scale(1.1);
        }

        .community-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          max-width: 600px;
          margin: 80px auto;
          width: 100%;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 8px;
        }

        .community-cta {
          text-align: center;
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          width: 100%;
        }

        .cta-button {
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .discord-btn {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          border: 1px solid rgba(236, 72, 153, 0.3);
        }

        .discord-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.15),
            rgba(236, 72, 153, 0.15)
          );
          border-color: rgba(236, 72, 153, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(236, 72, 153, 0.2);
        }

        .x-btn {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .x-btn:hover {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.15),
            rgba(236, 72, 153, 0.15)
          );
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
        }

        /* Mobile First Responsive Design */
        @media (max-width: 480px) {
          .community {
            padding: 0;
          }

          .section-container {
            padding: 0 16px;
            width: 100%;
            box-sizing: border-box;
          }

          .media-grid {
            flex-direction: column;
            gap: 16px;
            margin: 32px 0;
            width: 100%;
          }

          .photos-grid {
            grid-template-columns: 1fr 1fr;
            min-height: 200px;
            gap: 8px;
            width: 100%;
          }

          .video-container {
            min-height: 200px;
            width: 100%;
          }

          .community-stats {
            grid-template-columns: 1fr;
            gap: 24px;
            margin: 40px 0;
            width: 100%;
          }

          .community-cta {
            flex-direction: column;
            align-items: center;
            gap: 12px;
            width: 100%;
          }

          .cta-button {
            padding: 12px 20px;
            font-size: 14px;
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }

        @media (min-width: 481px) and (max-width: 767px) {
          .section-container {
            padding: 0 20px;
          }

          .media-grid {
            flex-direction: column;
            gap: 20px;
            margin: 40px 0;
          }

          .photos-grid {
            min-height: 250px;
            gap: 10px;
          }

          .video-container {
            min-height: 250px;
          }

          .community-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin: 50px 0;
          }

          .community-cta {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px !important;
            justify-content: center !important;
          }

          .cta-button {
            width: 100% !important;
            max-width: 300px !important;
            justify-content: center !important;
            margin: 0 auto !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .section-container {
            padding: 0 32px;
          }

          .media-grid {
            flex-direction: column;
            gap: 24px;
          }

          .photos-grid {
            min-height: 350px;
          }

          .video-container {
            min-height: 350px;
          }

          .community-stats {
            gap: 30px;
          }
        }

        @media (min-width: 1024px) {
          .section-container {
            padding: 0 40px;
          }

          .media-grid {
            flex-direction: row;
            gap: 24px;
          }
        }
      `}</style>
    </>
  )
}
