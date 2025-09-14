// Blog Section Component
export default function Blog() {
  const articles = [
    {
      url: "https://medium.com/weavedb/introducing-wao-the-fastest-way-to-build-and-test-on-ao-d73c372c61de",
      category: "Product Launch",
      categoryColor: "var(--warning)",
      image: "/images/articles/wao.webp",
      title: "Introducing WAO: The Fastest Way to Build and Test on AO",
      excerpt:
        "WAO provides developers with powerful tools to rapidly prototype and deploy applications on the AO computer...",
      date: "Feb 7, 2025",
    },
    {
      url: "https://medium.com/weavedb/introducing-zkjson-bridging-the-gap-between-web3-and-web2-2fff73c66cfb",
      category: "Technical Deep Dive",
      categoryColor: "var(--primary-light)",
      image: "/images/articles/zkjson.webp",
      title: "Introducing zkJSON: Bridging the Gap Between Web3 and Web2",
      excerpt:
        "Revolutionary zkJSON technology enables seamless integration between traditional web applications and blockchain infrastructure...",
      date: "Jan 24, 2024",
    },
    {
      url: "https://medium.com/weavedb/weavedb-raises-900k-pre-seed-round-ee2d3b35b5e7",
      category: "Announcement",
      categoryColor: "var(--success)",
      image: "/images/articles/fundraise.webp",
      title: "WeaveDB Raises $900K Pre-Seed Round",
      excerpt:
        "WeaveDB secures funding from leading Web3 investors to build the future of decentralized databases on Arweave...",
      date: "Jan 17, 2023",
    },
  ]

  return (
    <>
      <style jsx>{`
        .blog {
          padding: 120px 40px;
          background: var(--dark-secondary);
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
          margin-top: 60px;
        }

        .blog-article {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          padding-bottom: 20px;
        }

        .blog-article:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .blog-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
          overflow: hidden;
        }

        .blog-content {
          padding: 20px;
        }

        .blog-category {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .blog-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .blog-excerpt {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .blog-date {
          font-size: 13px;
          color: var(--text-muted);
        }

        .blog-read-btn {
          position: absolute;
          bottom: 16px;
          right: 20px;
          padding: 6px 14px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: var(--primary-light);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.3s ease;
        }

        .blog-read-btn:hover {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateX(2px);
        }

        .blog-view-all {
          text-align: center;
          margin-top: 60px;
        }

        /* Tablet styles */
        @media (max-width: 1024px) {
          .blog {
            padding: 80px 32px;
          }

          .blog-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-top: 48px;
          }
        }

        /* Mobile landscape */
        @media (max-width: 768px) {
          .blog {
            padding: 60px 24px;
          }

          .blog-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            margin-top: 40px;
          }

          .blog-view-all {
            margin-top: 40px;
          }
        }

        /* Mobile portrait */
        @media (max-width: 480px) {
          .blog {
            padding: 40px 16px;
          }

          .blog-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-top: 32px;
          }

          .blog-image {
            height: 160px;
          }

          .blog-content {
            padding: 16px;
          }

          .blog-title {
            font-size: 16px;
          }

          .blog-excerpt {
            font-size: 13px;
          }

          .blog-read-btn {
            bottom: 12px;
            right: 16px;
            padding: 5px 12px;
            font-size: 11px;
          }

          .blog-view-all {
            margin-top: 32px;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          .blog {
            padding: 32px 12px;
          }

          .blog-content {
            padding: 12px;
          }

          .blog-image {
            height: 140px;
          }
        }
      `}</style>

      <section className="blog" id="blog">
        <div className="section-container">
          <div className="section-header">
            <div
              className="section-badge"
              style={{
                background: "rgba(99, 102, 241, 0.1)",
                borderColor: "rgba(99, 102, 241, 0.3)",
                color: "var(--primary-light)",
              }}
            >
              Blog
            </div>
            <h2>Latest Updates & Research</h2>
            <p className="section-subtitle">
              Deep dives into our technology, ecosystem updates, and industry
              insights
            </p>
          </div>

          <div className="blog-grid">
            {articles.map((article, index) => (
              <article
                key={index}
                className="blog-article"
                onClick={() => window.open(article.url, "_blank")}
              >
                <div
                  className="blog-image"
                  style={{
                    backgroundImage: `url(${article.image})`,
                  }}
                ></div>
                <div className="blog-content">
                  <div
                    className="blog-category"
                    style={{ color: article.categoryColor }}
                  >
                    {article.category}
                  </div>
                  <h3 className="blog-title">{article.title}</h3>
                  <p className="blog-excerpt">{article.excerpt}</p>
                  <div>
                    <span className="blog-date">{article.date}</span>
                  </div>
                </div>

                <div className="blog-read-btn">
                  Read
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
                </div>
              </article>
            ))}
          </div>

          <div className="blog-view-all">
            <button
              className="btn btn-secondary"
              onClick={() =>
                window.open("https://medium.com/weavedb", "_blank")
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              View All Posts
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
