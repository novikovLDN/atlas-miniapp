"use client";

export default function ShieldHero() {
  return (
    <div
      className="relative flex w-full flex-shrink-0 items-center justify-center"
      style={{ height: "clamp(100px, 18vh, 150px)", overflow: "hidden" }}
      aria-hidden
    >
      {/* Grid pattern with dots at intersections */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--grid-line)"
              strokeWidth="0.5"
            />
            <circle cx="0" cy="0" r="1.5" fill="var(--grid-dot)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Shield icon */}
      <div style={{ width: "60px", height: "72px", position: "relative", zIndex: 1 }}>
        <svg
          viewBox="0 0 80 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="shieldG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--shield-top)" />
              <stop offset="100%" stopColor="var(--shield-bottom)" />
            </linearGradient>
          </defs>
          <path
            d="M40 4 L74 16 L74 44 C74 64 60 80 40 92 C20 80 6 64 6 44 L6 16 Z"
            fill="url(#shieldG)"
          />
          <rect x="29" y="44" width="22" height="16" rx="3.5" fill="var(--shield-lock)" />
          <path
            d="M34 44 L34 38 C34 32.5 46 32.5 46 38 L46 44"
            fill="none"
            stroke="var(--shield-lock)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="40" cy="52" r="2.5" fill="var(--accent-blue)" />
        </svg>
      </div>
    </div>
  );
}
