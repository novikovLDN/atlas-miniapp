"use client";

export default function ShieldHero() {
  return (
    <div
      className="relative flex w-full flex-shrink-0 items-center justify-center"
      style={{ height: "clamp(80px, 14vh, 120px)", overflow: "hidden" }}
      aria-hidden
    >
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "clamp(26px, 5.5vw, 34px)",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: "var(--text-primary)",
          fontFamily:
            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Atlas Secure
      </span>
    </div>
  );
}
