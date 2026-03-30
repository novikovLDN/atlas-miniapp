"use client";

export default function ShieldHero() {
  return (
    <div
      className="relative flex w-full flex-shrink-0 flex-col items-center justify-center"
      style={{ height: "clamp(140px, 26vh, 200px)", overflow: "hidden" }}
      aria-hidden
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

      {/* Logo icon — 4 arrows expanding outward */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: "10px" }}>
        <div
          style={{
            width: "clamp(56px, 12vw, 72px)",
            height: "clamp(56px, 12vw, 72px)",
            borderRadius: "clamp(14px, 3vw, 18px)",
            background: "linear-gradient(145deg, #2a2d5e, #1a1d3e)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <svg
            width="clamp(28px, 6vw, 36px)"
            height="clamp(28px, 6vw, 36px)"
            viewBox="0 0 24 24"
            fill="none"
          >
            {/* Top-left arrow */}
            <path d="M3 10V3h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3l5.5 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Top-right arrow */}
            <path d="M14 3h7v7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 3l-5.5 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Bottom-left arrow */}
            <path d="M3 14v7h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21l5.5-5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Bottom-right arrow */}
            <path d="M14 21h7v-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 21l-5.5-5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "clamp(22px, 5vw, 30px)",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: "var(--text-primary)",
          fontFamily:
            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Atlas Secure
      </span>
      <a
        href="https://www.cloudflare.com/application-services/products/cloudflare-spectrum/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "clamp(13px, 3vw, 16px)",
          fontWeight: 500,
          letterSpacing: "0.5px",
          color: "var(--text-muted)",
          marginTop: "2px",
          textDecoration: "none",
          fontFamily:
            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Spectrum
      </a>
    </div>
  );
}
