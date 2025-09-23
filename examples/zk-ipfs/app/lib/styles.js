// lib/styles.js

// Modern color palette with subtle retro touch
const colors = {
  // Background - Sleek gradient
  bg: {
    primary: "linear-gradient(135deg, #1a1625 0%, #2d1b69 50%, #3d2a7d 100%)",
    secondary: "#0f0c1a",
    pattern: "#2d1b69",
  },

  // Cards - Clean white
  card: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    hover: "#f1f3f5",
  },

  // Purple accent
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },

  // Text
  text: {
    primary: "#111827",
    secondary: "#4b5563",
    muted: "#9ca3af",
    inverse: "#ffffff",
    inverseSecondary: "#cbd5e1",
  },

  // Borders
  border: {
    light: "#f3f4f6",
    default: "#e5e7eb",
    dark: "#d1d5db",
  },

  // Status
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
}

// Spacing
const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  xxl: "24px",
  xxxl: "32px",
  huge: "48px",
  massive: "64px",
}

// Border radius - Rounder for retro
const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  xxl: "28px",
  full: "9999px",
}

// Typography
const typography = {
  fontFamily: '"Edu VIC WA NT Beginner", cursive',
  fontMono:
    'ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", monospace',

  sizes: {
    xs: "13px",
    sm: "15px",
    base: "17px",
    md: "19px",
    lg: "21px",
    xl: "24px",
    xxl: "28px",
    xxxl: "36px",
    display: "52px",
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeights: {
    tight: 1.3,
    base: 1.6,
    relaxed: 1.8,
  },
}

// Shadows - Subtle and modern
const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  purple: `0 10px 40px -10px ${colors.purple[500]}40`,
  purpleGlow: `0 0 40px -8px ${colors.purple[500]}50`,
}

// Global styles
export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Edu+VIC+WA+NT+Beginner:wght@400;500;600;700&family=Roboto:wght@100;300;400;500;700;900&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Edu VIC WA NT Beginner", cursive;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    background: linear-gradient(135deg, #1a1625 0%, #2d1b69 50%, #3d2a7d 100%);
    background-attachment: fixed;
    color: ${colors.text.primary};
    line-height: ${typography.lineHeights.base};
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: 0.3px;
  }

  /* Subtle grid pattern */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      linear-gradient(rgba(168, 85, 247, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(168, 85, 247, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: -2;
  }

  /* Gradient overlay */
  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 0%,
      rgba(168, 85, 247, 0.15) 0%,
      rgba(124, 58, 237, 0.08) 25%,
      transparent 60%
    );
    z-index: -1;
    pointer-events: none;
  }

  /* Select dropdown styling */
  select option {
    background: #2d1b69;
    color: white;
    padding: 8px;
  }

  select:focus {
    border-color: ${colors.purple[400]};
    box-shadow: 0 0 0 3px ${colors.purple[400]}20;
    background: rgba(255, 255, 255, 0.12);
  }

  /* For webkit browsers - style the dropdown */
  select::-webkit-scrollbar {
    width: 10px;
  }

  select::-webkit-scrollbar-track {
    background: #1a1625;
  }

  select::-webkit-scrollbar-thumb {
    background: rgba(168, 85, 247, 0.5);
    border-radius: 5px;
  }

  /* Selection */
  ::selection {
    background: ${colors.purple[200]};
    color: ${colors.purple[900]};
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(168, 85, 247, 0.3);
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(168, 85, 247, 0.5);
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes glow {
    0%, 100% { 
      box-shadow: 0 0 20px ${colors.purple[500]}30;
    }
    50% { 
      box-shadow: 0 0 25px ${colors.purple[500]}50;
    }
  }
`

// Component styles
export const styles = {
  // Layout
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: `${spacing.lg} ${spacing.xl} 0`,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },

  // Header - Sleek
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    animation: "slideDown 0.6s ease",
  },

  headerActions: {
    display: "flex",
    gap: spacing.md,
    alignItems: "center",
  },

  title: {
    fontSize: typography.sizes.xxxl,
    fontFamily: '"Roboto", sans-serif',
    fontOpticalSizing: "auto",
    fontWeight: 700,
    fontStyle: "normal",
    fontVariationSettings: '"wdth" 100',
    letterSpacing: "1.5px",
    margin: "0",
    color: colors.text.inverse,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  // Wallet - Clean design
  walletAddress: {
    padding: `${spacing.xs} ${spacing.lg}`,
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: radius.full,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontMono,
    color: colors.text.inverse,
    fontWeight: typography.weights.medium,
    border: `1px solid rgba(255, 255, 255, 0.2)`,
  },

  // Tabs - Sleek minimal design
  tabContainer: {
    display: "flex",
    gap: spacing.xs,
    marginBottom: spacing.xxxl,
    justifyContent: "center",
  },

  tab: {
    padding: `${spacing.sm} ${spacing.xl}`,
    background: "transparent",
    color: "rgba(255, 255, 255, 0.5)",
    border: "none",
    borderRadius: "0",
    fontSize: typography.sizes.sm,
    fontFamily: '"Roboto", sans-serif',
    fontOpticalSizing: "auto",
    fontWeight: 500,
    fontStyle: "normal",
    fontVariationSettings: '"wdth" 100',
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  tabActive: {
    color: colors.text.inverse,
  },

  tabIndicator: {
    position: "absolute",
    bottom: "-2px",
    left: "50%",
    transform: "translateX(-50%)",
    height: "2px",
    width: "0%",
    background: `linear-gradient(90deg, ${colors.purple[500]}, ${colors.purple[400]})`,
    transition: "width 0.3s ease",
    borderRadius: "1px",
  },

  tabIndicatorActive: {
    width: "80%",
  },

  tabHover: {
    color: "rgba(255, 255, 255, 0.8)",
  },

  // Cards - Glassmorphic style matching about page
  card: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: radius.lg,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    backdropFilter: "blur(20px)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: shadows.xl,
    position: "relative",
    overflow: "hidden",
    animation: "fadeIn 0.5s ease backwards",
    transition: "all 0.2s ease",
  },

  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: shadows.purpleGlow,
    background: "rgba(255, 255, 255, 0.08)",
  },

  cardTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: '"Roboto", sans-serif',
    fontOpticalSizing: "auto",
    fontWeight: 700,
    fontStyle: "normal",
    fontVariationSettings: '"wdth" 100',
    letterSpacing: "0.5px",
    marginBottom: spacing.sm,
    color: colors.text.inverse,
  },

  cardSubtitle: {
    color: colors.text.inverseSecondary,
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeights.base,
  },

  // Buttons - Modern flat design
  button: {
    padding: `${spacing.sm} ${spacing.xl}`,
    background: colors.purple[500],
    color: colors.text.inverse,
    border: "none",
    borderRadius: radius.md,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    boxShadow: shadows.base,
    letterSpacing: "0.5px",
  },

  buttonHover: {
    background: colors.purple[600],
    transform: "translateY(-1px)",
    boxShadow: shadows.md,
  },

  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
  },

  buttonSecondary: {
    padding: `${spacing.xs} ${spacing.lg}`,
    background: "rgba(255, 255, 255, 0.08)",
    color: colors.text.inverse,
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: radius.md,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
  },

  buttonSecondaryHover: {
    background: "rgba(255, 255, 255, 0.12)",
    borderColor: colors.purple[400],
    color: colors.text.inverse,
  },

  buttonFull: {
    width: "100%",
  },

  // Forms - Transparent glassmorphic style
  input: {
    width: "100%",
    padding: `${spacing.md} ${spacing.lg}`,
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: radius.md,
    fontSize: typography.sizes.base,
    color: colors.text.inverse,
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: typography.weights.normal,
  },

  inputFocus: {
    borderColor: colors.purple[400],
    boxShadow: `0 0 0 3px ${colors.purple[400]}20`,
    background: "rgba(255, 255, 255, 0.12)",
  },

  inputError: {
    borderColor: colors.status.error,
    background: "rgba(239, 68, 68, 0.1)",
  },

  select: {
    width: "100%",
    padding: `${spacing.md} ${spacing.xxxl} ${spacing.md} ${spacing.lg}`,
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: radius.md,
    fontSize: typography.sizes.base,
    color: colors.text.inverse,
    outline: "none",
    transition: "all 0.2s ease",
    fontWeight: typography.weights.normal,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "20px",
  },

  textarea: {
    width: "100%",
    padding: `${spacing.md} ${spacing.lg}`,
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: radius.md,
    fontSize: typography.sizes.base,
    color: colors.text.inverse,
    outline: "none",
    resize: "vertical",
    fontFamily: typography.fontMono,
    transition: "all 0.2s ease",
    minHeight: "100px",
  },

  label: {
    display: "block",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
    letterSpacing: "0.01em",
  },

  // Field Builder - Glassmorphic nested items
  fieldItem: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    position: "relative",
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    backdropFilter: "blur(10px)",
    transition: "all 0.2s ease",
  },

  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },

  removeButton: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    width: "32px",
    height: "32px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    borderRadius: radius.md,
    color: colors.text.inverseSecondary,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: typography.sizes.lg,
    transition: "all 0.2s ease",
    fontWeight: typography.weights.medium,
  },

  removeButtonHover: {
    background: "rgba(239, 68, 68, 0.2)",
    borderColor: colors.status.error,
    color: colors.status.error,
  },

  // JSON Preview - Glassmorphic
  jsonPreview: {
    padding: spacing.xl,
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: radius.lg,
    marginTop: spacing.xl,
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    backdropFilter: "blur(10px)",
  },

  jsonPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  jsonPreviewContent: {
    fontFamily: typography.fontMono,
    fontSize: typography.sizes.sm,
    color: colors.text.inverse,
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    background: "rgba(0, 0, 0, 0.3)",
    padding: spacing.lg,
    borderRadius: radius.md,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    maxHeight: "300px",
    overflowY: "auto",
  },

  // NFT Display - Glassmorphic badges
  tokenBadge: {
    padding: `${spacing.xs} ${spacing.md}`,
    background:
      "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(147, 51, 234, 0.3))",
    backdropFilter: "blur(10px)",
    borderRadius: radius.full,
    color: colors.text.inverse,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    display: "inline-block",
    border: `1px solid rgba(168, 85, 247, 0.4)`,
  },

  nftHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
  },

  ownerText: {
    color: colors.text.inverseSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontMono,
  },

  // Metadata Display - Glassmorphic
  metadata: {
    padding: spacing.lg,
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: radius.md,
    fontFamily: typography.fontMono,
    fontSize: typography.sizes.sm,
    color: colors.text.inverse,
    marginBottom: spacing.xl,
    wordBreak: "break-all",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    maxHeight: "200px",
    overflowY: "auto",
    minHeight: "60px",
  },

  // CID Display - Glassmorphic
  cidContainer: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  codeBlock: {
    flex: 1,
    padding: `${spacing.md} ${spacing.lg}`,
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: radius.md,
    fontSize: typography.sizes.xs,
    color: colors.purple[300],
    fontFamily: typography.fontMono,
    border: `1px solid rgba(168, 85, 247, 0.3)`,
    fontWeight: typography.weights.medium,
  },

  // Proof Section - Glassmorphic
  proofSection: {
    paddingTop: spacing.xl,
    borderTop: `1px solid rgba(255, 255, 255, 0.08)`,
  },

  proofContainer: {
    display: "flex",
    gap: spacing.md,
    alignItems: "center",
    width: "100%",
  },

  proofSelector: {
    flex: "1 1 auto",
    minWidth: "200px",
  },

  proofButton: {
    flex: "0 0 auto",
    minWidth: "180px",
    height: "fit-content",
  },

  proofTextarea: {
    width: "100%",
    height: "90px",
    padding: spacing.lg,
    background: "rgba(0, 0, 0, 0.3)",
    border: `1px solid rgba(16, 185, 129, 0.3)`,
    borderRadius: radius.md,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontMono,
    color: "#34d399",
    resize: "none",
    marginBottom: spacing.lg,
  },

  proofActions: {
    display: "flex",
    gap: spacing.md,
    alignItems: "center",
  },

  // Links - Adjusted for dark backgrounds
  link: {
    color: colors.purple[300],
    fontSize: typography.sizes.sm,
    textDecoration: "none",
    transition: "color 0.2s ease",
    fontWeight: typography.weights.medium,
  },

  linkHover: {
    color: colors.purple[200],
    textDecoration: "underline",
  },

  linkMuted: {
    color: colors.text.inverseSecondary,
    fontSize: typography.sizes.base,
    textDecoration: "none",
    transition: "all 0.2s ease",
    fontWeight: typography.weights.medium,
  },

  // Toast
  toastContainer: {
    position: "fixed",
    bottom: spacing.xxl,
    right: spacing.xxl,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },

  toast: {
    padding: `${spacing.lg} ${spacing.xl}`,
    background: colors.card.primary,
    borderRadius: radius.lg,
    boxShadow: shadows.xl,
    display: "flex",
    alignItems: "center",
    gap: spacing.lg,
    minWidth: "320px",
    maxWidth: "420px",
    animation: "slideDown 0.3s ease",
    border: `1px solid ${colors.border.light}`,
  },

  toastSuccess: {
    borderLeft: `4px solid ${colors.status.success}`,
  },

  toastError: {
    borderLeft: `4px solid ${colors.status.error}`,
  },

  toastInfo: {
    borderLeft: `4px solid ${colors.purple[500]}`,
  },

  toastMessage: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    lineHeight: typography.lineHeights.relaxed,
  },

  toastClose: {
    background: "transparent",
    border: "none",
    color: colors.text.muted,
    cursor: "pointer",
    fontSize: typography.sizes.xl,
    transition: "color 0.2s ease",
    padding: spacing.xs,
  },

  // Empty State - Glassmorphic
  emptyState: {
    textAlign: "center",
    padding: spacing.massive,
    color: colors.text.inverseSecondary,
    fontSize: typography.sizes.md,
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(10px)",
    borderRadius: radius.xl,
    border: `2px dashed rgba(255, 255, 255, 0.1)`,
  },

  // Loading states
  loadingSpinner: {
    width: "16px",
    height: "16px",
    border: `2px solid rgba(255, 255, 255, 0.2)`,
    borderTopColor: colors.purple[500],
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },

  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.massive,
    color: colors.text.inverseSecondary,
  },

  metadataLoading: {
    padding: spacing.lg,
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: radius.md,
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    marginBottom: spacing.xl,
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.text.inverseSecondary,
  },

  // Search Bar
  searchContainer: {
    display: "flex",
    gap: spacing.md,
  },

  searchInput: {
    flex: 1,
  },

  // Transaction Link
  transactionLink: {
    textAlign: "center",
    margin: `${spacing.xl} 0`,
  },

  // Error Text
  errorText: {
    color: colors.status.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
    fontWeight: typography.weights.medium,
  },

  // About Page - Sleek glassmorphism
  aboutContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  aboutSection: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: radius.lg,
    padding: `${spacing.xl} ${spacing.xxl}`,
    backdropFilter: "blur(20px)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: shadows.xl,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  aboutTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: '"Roboto", sans-serif',
    fontOpticalSizing: "auto",
    fontWeight: 700,
    fontStyle: "normal",
    fontVariationSettings: '"wdth" 100',
    letterSpacing: "0.5px",
    lineHeight: "1.3",
    marginBottom: spacing.md,
    color: colors.text.inverse,
    textAlign: "center",
  },

  aboutSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.inverseSecondary,
    lineHeight: typography.lineHeights.base,
    textAlign: "center",
    marginBottom: spacing.lg,
  },

  cidShowcase: {
    background: colors.card.primary,
    borderRadius: radius.md,
    padding: `${spacing.sm} ${spacing.lg}`,
    margin: `0 auto ${spacing.xxxl}`,
    maxWidth: "700px",
    boxShadow: shadows.md,
    transition: "all 0.2s ease",
    border: `1px solid ${colors.border.light}`,
  },

  cidCode: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontMono,
    color: colors.purple[700],
    fontWeight: typography.weights.semibold,
    wordBreak: "break-all",
  },

  // Info Boxes for zkCID, zkIPFS, zkNFT
  infoBoxContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: spacing.xl,
    marginBottom: spacing.lg,
    padding: "0 25px",
  },

  infoBox: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: radius.lg,
    padding: spacing.xxl,
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
  },

  infoBoxHover: {
    transform: "translateY(-4px)",
    background: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(168, 85, 247, 0.3)",
    boxShadow: `0 10px 30px -10px rgba(168, 85, 247, 0.3)`,
  },

  infoBoxIcon: {
    fontSize: "32px",
    marginBottom: spacing.md,
    display: "block",
    textAlign: "center",
  },

  infoBoxTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: '"Roboto", sans-serif',
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: colors.purple[400],
    marginBottom: spacing.md,
    marginLeft: "-25px",
    textAlign: "center",
  },

  infoBoxDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.inverseSecondary,
    lineHeight: typography.lineHeights.relaxed,
    textAlign: "center",
  },

  diagramContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  // Footer - Minimal
  footer: {
    marginTop: "auto",
    padding: `${spacing.lg} ${spacing.xl}`,
    textAlign: "center",
  },

  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    fontSize: typography.sizes.sm,
    color: "rgba(255, 255, 255, 0.6)",
  },

  footerLink: {
    color: colors.text.inverse,
    textDecoration: "none",
    fontWeight: typography.weights.semibold,
    transition: "opacity 0.2s ease",
    opacity: 0.9,
  },

  // Section Title
  sectionTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: '"Roboto", sans-serif',
    fontOpticalSizing: "auto",
    fontWeight: 700,
    fontStyle: "normal",
    fontVariationSettings: '"wdth" 100',
    letterSpacing: "0.5px",
    marginBottom: spacing.xxxl,
    textAlign: "center",
    color: colors.text.inverse,
  },
}

// Helper function to merge styles
export const mergeStyles = (...styles) => {
  return Object.assign({}, ...styles)
}

// Helper function for conditional styles
export const conditionalStyle = (condition, trueStyle, falseStyle = {}) => {
  return condition ? trueStyle : falseStyle
}

// Export all
export default {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  globalStyles,
  styles,
  mergeStyles,
  conditionalStyle,
}
