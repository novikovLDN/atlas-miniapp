"use client";

export default function ShieldHero() {
  return (
    <div
      className="relative flex w-full flex-shrink-0 flex-col"
      style={{ height: "clamp(170px, 30vh, 240px)", overflow: "hidden" }}
    >
      {/* Grid pattern with dots at intersections */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--grid-line)"
              strokeWidth="0.5"
            />
            <circle cx="0" cy="0" r="1.8" fill="var(--grid-dot)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Top-left: Atlas Secure + Spectrum */}
      <div style={{ position: "relative", zIndex: 1, padding: "16px 20px 0" }}>
        <div
          style={{
            fontSize: "clamp(18px, 4.5vw, 22px)",
            fontWeight: 800,
            letterSpacing: "-0.3px",
            color: "var(--text-primary)",
            lineHeight: 1.2,
            fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Atlas Secure
        </div>
        <div
          style={{
            fontSize: "clamp(11px, 2.5vw, 13px)",
            fontWeight: 500,
            letterSpacing: "0.5px",
            color: "var(--text-muted)",
            marginTop: "1px",
          }}
        >
          Spectrum
        </div>
      </div>

      {/* Center: animated logo */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="hero-logo-pulse">
          <div className="hero-logo-icon">
            <svg
              width="clamp(32px, 7vw, 40px)"
              height="clamp(32px, 7vw, 40px)"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M3 10V3h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3l5.5 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 3h7v7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 3l-5.5 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14v7h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 21l5.5-5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 21h7v-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21l-5.5-5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
