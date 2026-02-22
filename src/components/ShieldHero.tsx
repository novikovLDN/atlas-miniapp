"use client";

import { useMemo } from "react";

const PARTICLE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#ffffff", "#a78bfa"];

export default function ShieldHero() {
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 2 + Math.random() * 4,
        color: PARTICLE_COLORS[i % 5],
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    []
  );

  return (
    <div
      className="relative flex h-[50vh] min-h-[240px] w-full flex-shrink-0 items-center justify-center overflow-hidden"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)",
          animation: "liquidOrb1 8s ease-in-out infinite",
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)",
          animation: "liquidOrb2 6s ease-in-out infinite",
          filter: "blur(15px)",
          top: "20%",
          right: "15%",
        }}
      />

      {/* Rotating rings */}
      <svg
        style={{ position: "absolute", animation: "spin 20s linear infinite" }}
        width={260}
        height={260}
        viewBox="0 0 260 260"
        aria-hidden
      >
        <circle
          cx={130}
          cy={130}
          r={120}
          fill="none"
          stroke="rgba(59,130,246,0.2)"
          strokeWidth={1}
          strokeDasharray="8 12"
        />
      </svg>
      <svg
        style={{ position: "absolute", animation: "spinReverse 15s linear infinite" }}
        width={200}
        height={200}
        viewBox="0 0 200 200"
        aria-hidden
      >
        <circle
          cx={100}
          cy={100}
          r={90}
          fill="none"
          stroke="rgba(139,92,246,0.15)"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
      </svg>

      {/* Glass shield */}
      <div
        style={{
          width: "110px",
          height: "130px",
          position: "relative",
          filter: "drop-shadow(0 0 30px rgba(59,130,246,0.6))",
          animation: "shieldPulse 3s ease-in-out infinite",
        }}
      >
        <svg viewBox="0 0 110 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(147,197,253,0.9)" />
              <stop offset="40%" stopColor="rgba(59,130,246,0.8)" />
              <stop offset="100%" stopColor="rgba(29,78,216,0.9)" />
            </linearGradient>
            <linearGradient id="shieldHighlight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="shieldGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M55 5 L100 22 L100 60 C100 88 80 110 55 125 C30 110 10 88 10 60 L10 22 Z"
            fill="url(#shieldGrad)"
            filter="url(#shieldGlow)"
          />
          <path
            d="M55 8 L95 23 L95 58 C95 84 77 105 55 119"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
          <path
            d="M55 12 L90 26 L90 56 C90 78 74 97 55 110 C36 97 20 78 20 56 L20 26 Z"
            fill="url(#shieldHighlight)"
            opacity={0.3}
          />
          <rect x={42} y={58} width={26} height={20} rx={4} fill="rgba(255,255,255,0.9)" />
          <path
            d="M47 58 L47 52 C47 45 63 45 63 52 L63 58"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <circle cx={55} cy={68} r={3} fill="rgba(59,130,246,0.8)" />
        </svg>
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: p.color,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `float${i % 3} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.7,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            pointerEvents: "none",
          }}
          aria-hidden
        />
      ))}
    </div>
  );
}
