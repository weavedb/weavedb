export default function Style() {
  return (
    <style jsx global>{`
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :root {
        /* WeaveDB brand colors from logo */
        --primary: #6366f1;
        --primary-light: #818cf8;
        --primary-dark: #4f46e5;
        --accent: #ec4899;
        --accent-light: #f472b6;
        --warning: #fbbf24;
        --success: #10b981;
        --dark: #000000;
        --dark-secondary: #0a0a0a;
        --text-primary: #ffffff;
        --text-secondary: rgba(255, 255, 255, 0.7);
        --text-muted: rgba(255, 255, 255, 0.4);
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter",
          system-ui, sans-serif;
        background: var(--dark);
        color: var(--text-primary);
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Navigation */
      nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        transition: all 0.3s ease;
      }

      .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 16px 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 22px;
        font-weight: 600;
      }

      .logo-icon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-text {
        background: linear-gradient(
          135deg,
          var(--primary),
          var(--primary-light)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .nav-links {
        display: flex;
        gap: 32px;
        align-items: center;
      }

      .nav-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: color 0.3s ease;
        padding: 8px 0;
        position: relative;
      }

      .nav-link::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 1px;
        background: var(--primary-light);
        transition: width 0.3s ease;
      }

      .nav-link:hover {
        color: var(--primary-light);
      }

      .nav-link:hover::after {
        width: 100%;
      }

      .nav-cta {
        padding: 8px 20px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: var(--primary-light);
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .nav-cta:hover {
        background: rgba(99, 102, 241, 0.2);
        border-color: rgba(99, 102, 241, 0.5);
        transform: translateY(-1px);
      }

      /* Hero Section */
      .hero {
        min-height: 100vh;
        padding: 120px 40px 80px;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(
            ellipse at 70% 40%,
            rgba(124, 58, 237, 0.25) 0%,
            transparent 40%
          ),
          radial-gradient(
            ellipse at 30% 60%,
            rgba(236, 72, 153, 0.15) 0%,
            transparent 40%
          ),
          radial-gradient(ellipse at center, #1a0033 0%, #000000 100%);
      }

      .hero::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image:
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(99, 102, 241, 0.05) 40px,
            rgba(99, 102, 241, 0.05) 41px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            rgba(99, 102, 241, 0.05) 40px,
            rgba(99, 102, 241, 0.05) 41px
          );
        pointer-events: none;
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

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 100px;
        margin-bottom: 24px;
      }

      .badge-dot {
        width: 8px;
        height: 8px;
        background: var(--success);
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.2);
        }
      }

      .hero-badge span {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-light);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      h1 {
        font-size: clamp(48px, 6vw, 80px);
        font-weight: 700;
        line-height: 1;
        margin-bottom: 24px;
        letter-spacing: -2px;
      }

      .gradient-text {
        background: linear-gradient(
          135deg,
          var(--text-primary) 0%,
          var(--primary-light) 50%,
          var(--accent) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
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

      .btn {
        padding: 16px 32px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.3s ease;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn-primary {
        background: linear-gradient(
          135deg,
          var(--primary),
          var(--primary-dark)
        );
        color: white;
        border: none;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
      }

      .btn-secondary {
        background: transparent;
        color: var(--text-primary);
        border: 2px solid rgba(255, 255, 255, 0.1);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.2);
      }

      /* Hero Diagram - ATTACHED DIAGRAM */
      .hero-diagram {
        position: relative;
        width: 600px;
        height: 450px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
      }

      /* Stats */
      .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 40px;
        width: 100%;
        max-width: 1200px;
        margin: 40px auto 0;
        text-align: center;
      }

      .stat {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--primary-light);
      }

      .stat-label {
        font-size: 13px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      /* Backers Section */
      .backers {
        padding: 80px 40px;
        background: var(--dark-secondary);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .backers-container {
        max-width: 1400px;
        margin: 0 auto;
        text-align: center;
      }

      .backers-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 40px;
      }

      .backers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 40px;
        align-items: center;
      }

      .backer-logo {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-secondary);
        transition: opacity 0.3s ease;
      }

      .backer-logo:hover {
        opacity: 1;
      }

      /* Problem Section */
      .problem {
        padding: 120px 40px;
        background: linear-gradient(
          180deg,
          var(--dark) 0%,
          var(--dark-secondary) 100%
        );
      }

      .section-container {
        max-width: 1400px;
        margin: 0 auto;
      }

      .section-header {
        text-align: center;
        margin-bottom: 80px;
      }

      .section-badge {
        display: inline-block;
        padding: 6px 16px;
        background: rgba(236, 72, 153, 0.1);
        border: 1px solid rgba(236, 72, 153, 0.3);
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 16px;
      }

      h2 {
        font-size: clamp(36px, 5vw, 56px);
        font-weight: 700;
        line-height: 1.1;
        margin-bottom: 20px;
        letter-spacing: -1px;
      }

      .section-subtitle {
        font-size: 18px;
        color: var(--text-secondary);
        max-width: 700px;
        margin: 0 auto;
        line-height: 1.6;
      }

      .problem-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 24px;
      }

      .problem-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 32px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .problem-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--accent),
          transparent
        );
        transform: translateX(-100%);
        transition: transform 0.5s ease;
      }

      .problem-card:hover::before {
        transform: translateX(100%);
      }

      .problem-card:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateY(-4px);
      }

      .problem-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(
          135deg,
          rgba(236, 72, 153, 0.2),
          rgba(236, 72, 153, 0.1)
        );
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-bottom: 20px;
      }

      .problem-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .problem-desc {
        font-size: 15px;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      /* Tech Stack Section */
      .tech-stack {
        padding: 120px 40px;
        background: linear-gradient(135deg, #0a0618 0%, #1a0f2e 100%);
      }

      .tech-architecture {
        max-width: 1100px;
        margin: 80px auto;
        background: rgba(10, 6, 24, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 16px;
        padding: 30px;
        position: relative;
      }

      .tech-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
      }

      .tech-column {
        display: flex;
        flex-direction: column;
      }

      .tech-header {
        height: 36px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.05em;
        margin-bottom: 10px;
      }

      .tech-item {
        min-height: 42px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-bottom: 10px;
        position: relative;
        transition: all 0.3s ease;
      }

      .tech-item:hover {
        background: rgba(255, 255, 255, 0.05);
        transform: translateX(2px);
      }

      /* Technical Metrics */
      .tech-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
        margin-top: 80px;
        padding: 40px;
        background: rgba(99, 102, 241, 0.05);
        border-radius: 24px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .tech-metric {
        text-align: center;
      }

      .tech-metric-value {
        font-size: 42px;
        font-weight: 700;
        background: linear-gradient(
          135deg,
          var(--primary-light),
          var(--accent)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 8px;
      }

      .tech-metric-label {
        font-size: 14px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      /* Features Grid */
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 32px;
        margin-top: 80px;
      }

      .feature {
        text-align: center;
      }

      .feature-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 20px;
        background: linear-gradient(
          135deg,
          var(--primary),
          var(--primary-dark)
        );
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
      }

      .feature-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .feature-desc {
        font-size: 15px;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      /* Community Section */
      .community {
        padding: 120px 40px;
        background: linear-gradient(
          180deg,
          var(--dark) 0%,
          var(--dark-secondary) 100%
        );
      }

      /* Economics Section */
      .economics {
        padding: 120px 40px;
        background: linear-gradient(
          180deg,
          var(--dark-secondary) 0%,
          var(--dark) 100%
        );
      }

      /* Economics Grid - Force stacking below 1024px */
      .economics div[style*="grid-template-columns: 1fr 1fr"] {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }

      @media (max-width: 1023px) {
        .economics div[style*="grid-template-columns: 1fr 1fr"] {
          display: flex !important;
          flex-direction: column !important;
          gap: 30px !important;
        }

        .economics div[style*="grid-template-columns: 1fr 1fr"] > div {
          width: 100% !important;
          margin-bottom: 0 !important;
        }
      }

      /* Use Cases */
      .use-cases {
        padding: 120px 40px;
        background: var(--dark-secondary);
      }

      .use-cases-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
        margin-top: 60px;
      }

      .use-case {
        background: linear-gradient(
          135deg,
          rgba(251, 191, 36, 0.03),
          rgba(99, 102, 241, 0.03)
        );
        border: 1px solid rgba(251, 191, 36, 0.1);
        border-radius: 16px;
        padding: 32px;
        transition: all 0.3s ease;
      }

      .use-case:hover {
        transform: translateY(-4px);
        border-color: rgba(251, 191, 36, 0.3);
      }

      /* CTA Section */
      .cta {
        padding: 120px 40px;
        background: radial-gradient(
          ellipse at center,
          rgba(99, 102, 241, 0.2) 0%,
          transparent 60%
        );
        text-align: center;
      }

      .cta-container {
        max-width: 800px;
        margin: 0 auto;
      }

      /* Footer */
      footer {
        padding: 60px 40px 40px;
        background: var(--dark);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }

      /* Responsive - Mobile First Approach */
      @media (max-width: 499px) {
        .section-container {
          padding: 0 8px !important;
        }

        .hero {
          padding: 120px 8px 80px !important;
        }

        .problem {
          padding: 120px 8px !important;
        }

        .tech-stack {
          padding: 120px 8px !important;
        }

        .community {
          padding: 120px 8px !important;
        }

        .economics {
          padding: 120px 8px !important;
        }

        .use-cases {
          padding: 120px 8px !important;
        }

        .cta {
          padding: 120px 8px !important;
        }

        footer {
          padding: 60px 8px 40px !important;
        }
      }

      @media (max-width: 767px) {
        .nav-links {
          display: none;
        }

        h1 {
          font-size: 48px !important;
        }

        .hero-container {
          flex-direction: column;
          gap: 60px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
        }

        .hero-cta {
          justify-content: center;
        }

        .hero-diagram {
          width: 100%;
          max-width: 600px;
          transform: scale(0.8);
          margin: -40px 0;
        }

        .stats {
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .problem-grid {
          grid-template-columns: 1fr;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }

        /* Tech Stack Mobile */
        .tech-grid {
          grid-template-columns: 1fr !important;
          gap: 40px !important;
        }

        .tech-metrics {
          grid-template-columns: 1fr !important;
          gap: 30px !important;
          padding: 30px 20px !important;
        }

        .tech-metric-value {
          font-size: 32px !important;
        }
      }

      @media (min-width: 768px) and (max-width: 1023px) {
        .hero-container {
          flex-direction: column;
          gap: 60px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
        }

        .hero-cta {
          justify-content: center;
        }

        .hero-diagram {
          width: 100%;
          max-width: 600px;
        }

        /* Tech Stack Tablet */
        .tech-grid {
          grid-template-columns: 1fr !important;
          gap: 40px !important;
        }

        .tech-metrics {
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 30px !important;
        }

        .tech-metric-value {
          font-size: 36px !important;
        }
      }

      @media (min-width: 1024px) {
        .hero-container {
          flex-direction: row;
        }

        .tech-grid {
          grid-template-columns: 1fr 1fr 1fr;
        }
      }

      @media (max-width: 1200px) {
        .hero-container {
          flex-direction: column;
          gap: 60px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
        }

        .hero-cta {
          justify-content: center;
        }

        .hero-diagram {
          width: 100%;
          max-width: 600px;
        }
      }
    `}</style>
  )
}
