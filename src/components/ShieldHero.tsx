"use client";

export default function ShieldHero() {
  return (
    <div className="relative flex h-[55vh] min-h-[280px] items-center justify-center">
      <div
        className="ring-rotate absolute h-[200px] w-[200px] rounded-full border-2 border-[var(--border-card)]"
        style={{
          borderTopColor: "var(--accent)",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        }}
        aria-hidden
      />
      <div
        className="ring-rotate absolute h-[160px] w-[160px] rounded-full border border-[var(--border-card)]"
        style={{
          borderTopColor: "var(--accent)",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        }}
        aria-hidden
      />
      <div
        className="ring-pulse absolute h-[140px] w-[140px] rounded-full border-2 border-[var(--accent)]"
        aria-hidden
      />
      <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
        <svg
          width="56"
          height="64"
          viewBox="0 0 56 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[var(--accent)]"
          aria-hidden
        >
          <path
            d="M28 0L56 16V32C56 50 44 58 28 64C12 58 0 50 0 32V16L28 0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
