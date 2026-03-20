"use client";

import { useEffect, useState } from "react";

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const fadeOut = setTimeout(() => setPhase("out"), 800);
    const done = setTimeout(() => onFinish(), 1100);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(done);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash ${phase === "out" ? "splash--out" : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Shield icon */}
      <div className="splash-icon">
        <svg
          viewBox="0 0 80 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="76"
          style={{ filter: "drop-shadow(0 4px 24px rgba(52,120,246,0.25))" }}
        >
          <defs>
            <linearGradient id="splashShield" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4a4a4e" />
              <stop offset="50%" stopColor="#2c2c2e" />
              <stop offset="100%" stopColor="#1c1c1e" />
            </linearGradient>
          </defs>
          <path
            d="M40 4 L74 16 L74 44 C74 64 60 80 40 92 C20 80 6 64 6 44 L6 16 Z"
            fill="url(#splashShield)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <rect x="29" y="44" width="22" height="16" rx="3.5" fill="rgba(255,255,255,0.9)" />
          <path
            d="M34 44 L34 38 C34 32.5 46 32.5 46 38 L46 44"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="40" cy="52" r="2.5" fill="#34c759" />
        </svg>
      </div>

      {/* Title */}
      <h1
        className="splash-title"
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "#f5f5f7",
          margin: "20px 0 0",
          letterSpacing: "-0.5px",
        }}
      >
        Atlas Secure
      </h1>

      {/* Subtitle */}
      <p
        className="splash-subtitle"
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          margin: "8px 0 0",
          letterSpacing: "0.5px",
        }}
      >
        developed by QoDev
      </p>
    </div>
  );
}
