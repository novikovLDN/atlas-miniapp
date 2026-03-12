"use client";

export default function ShieldHero() {
  return (
    <div
      className="relative flex w-full flex-shrink-0 items-center justify-center"
      style={{ height: "200px", overflow: "hidden" }}
      aria-hidden
    >
      {/* Soft glow behind shield */}
      <div
        className="absolute"
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52,120,246,0.12) 0%, transparent 70%)",
          animation: "shieldPulse 4s ease-in-out infinite",
        }}
      />

      {/* Dashed ring (like reference decorative elements) */}
      <svg
        className="absolute"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        style={{ animation: "ringRotate 30s linear infinite" }}
      >
        <circle
          cx="90"
          cy="90"
          r="85"
          fill="none"
          stroke="rgba(28,28,30,0.06)"
          strokeWidth="1"
          strokeDasharray="6 8"
        />
      </svg>

      {/* Shield icon */}
      <div
        style={{
          width: "80px",
          height: "96px",
          position: "relative",
          animation: "shieldFloat 4s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 80 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          style={{ filter: "drop-shadow(0 4px 12px rgba(28,28,30,0.15))" }}
        >
          <defs>
            <linearGradient id="shieldG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3d3d40" />
              <stop offset="50%" stopColor="#1c1c1e" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>
          <path
            d="M40 4 L74 16 L74 44 C74 64 60 80 40 92 C20 80 6 64 6 44 L6 16 Z"
            fill="url(#shieldG)"
          />
          {/* Lock body */}
          <rect x="29" y="44" width="22" height="16" rx="3.5" fill="rgba(255,255,255,0.9)" />
          {/* Lock shackle */}
          <path
            d="M34 44 L34 38 C34 32.5 46 32.5 46 38 L46 44"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Green dot (active indicator, like reference) */}
          <circle cx="40" cy="52" r="2.5" fill="#34c759" />
        </svg>
      </div>
    </div>
  );
}
