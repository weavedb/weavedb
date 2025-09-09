// Backers Section Component with Links
export default function Backers() {
  const backers = [
    {
      name: "Permanent Ventures",
      logo: "/images/backers/permanent-ventures.png",
      url: "http://permanent.ventures",
    },
    { name: "IOSG", logo: "/images/backers/iosg.png", url: "https://iosg.vc" },
    {
      name: "Mask Network",
      logo: "/images/backers/mask.svg",
      url: "https://mask.io",
    },
    {
      name: "Forward Research",
      logo: "/images/backers/forward-research.png",
      url: "https://fwd.g8way.io",
    },
    {
      name: "Hansa",
      logo: "/images/backers/hansa.svg",
      url: "https://hansa.capital",
    },
    {
      name: "Next Web Capital",
      logo: "/images/backers/next-web-capital.png",
      url: "https://nextweb.capital",
    },
    {
      name: "CMT Digital",
      logo: "/images/backers/cmtd.png",
      url: "https://cmt.digital",
    },
    {
      name: "Formless Capital",
      logo: "/images/backers/formless-capital.webp",
      url: "https://formless.capital",
    },
    {
      name: "Scott Moore",
      logo: "/images/backers/scott-moore.png",
      url: "https://gitcoin.co",
    },
    {
      name: "Cogitent Ventures",
      logo: "/images/backers/cogitent.png",
      url: "https://cogitent.ventures",
    },
    {
      name: "Hub71",
      logo: "/images/backers/hub71.svg",
      url: "https://hub71.com",
    },
  ]

  return (
    <>
      <section className="backers">
        <div className="backers-container">
          <h2
            style={{
              marginBottom: "60px",
              textAlign: "center",
              fontSize: "2.5rem",
              fontWeight: "600",
              background: "linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              display: "inline-block",
              width: "100%",
            }}
          >
            Backed by Industry Leaders
          </h2>
          <div className="backers-grid">
            {backers.map((backer, index) => (
              <a
                key={index}
                href={backer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="backer-logo"
              >
                <img
                  src={backer.logo}
                  alt={backer.name}
                  className="backer-image"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .backers {
          background-color: #f0f0f2;
          padding: 100px 40px;
          position: relative;
          overflow-x: hidden;
        }

        .backers-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .backers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .backer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 90px;
          padding: 20px;
          transition: transform 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          width: 100%;
        }

        .backer-logo:hover {
          transform: translateY(-5px) scale(1.05);
        }

        .backer-image {
          max-height: 50px;
          max-width: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: none;
          opacity: 1;
        }

        /* Mobile First Approach */
        @media (max-width: 480px) {
          .backers {
            padding: 60px 16px;
            overflow-x: hidden;
          }

          .backers-container {
            max-width: 100%;
            padding: 0;
          }

          .backers-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            max-width: 100%;
            margin: 0;
          }

          .backer-logo {
            height: 70px;
            padding: 12px;
          }

          .backer-image {
            max-height: 40px;
            max-width: 100%;
          }
        }

        /* Small tablets */
        @media (min-width: 481px) and (max-width: 768px) {
          .backers {
            padding: 80px 24px;
          }

          .backers-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .backer-logo {
            height: 80px;
            padding: 16px;
          }
        }

        /* Tablets and small laptops - 4 columns under 1200px */
        @media (min-width: 769px) and (max-width: 1199px) {
          .backers {
            padding: 90px 32px;
          }

          .backers-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }

          .backer-logo {
            height: 85px;
            padding: 18px;
          }
        }

        /* Desktop - 5 columns */
        @media (min-width: 1200px) and (max-width: 1440px) {
          .backers-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 30px;
          }
        }

        /* Large desktop */
        @media (min-width: 1441px) {
          .backers {
            padding: 120px 60px;
          }

          .backers-container {
            max-width: 1600px;
          }

          .backers-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 40px;
          }

          .backer-logo {
            height: 100px;
            padding: 24px;
          }
        }
      `}</style>
    </>
  )
}
