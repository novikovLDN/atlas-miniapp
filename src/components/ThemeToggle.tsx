"use client";

import { useRef } from "react";

type ThemeToggleProps = {
  dark: boolean;
  onToggle: () => void;
};

/**
 * Animated sun↔moon toggle.
 * The sun/moon morph is achieved by rotating the icon container
 * and scaling rays in/out. Pure CSS transitions on GPU-only props.
 */
export default function ThemeToggle({ dark, onToggle }: ThemeToggleProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    // Ripple-out circle animation from the toggle button
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(window.innerWidth - x, y),
        Math.hypot(x, window.innerHeight - y),
        Math.hypot(window.innerWidth - x, window.innerHeight - y),
      );

      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:99;pointer-events:none;
        background:${dark ? "#ffffff" : "#0a0a0a"};
        clip-path:circle(0px at ${x}px ${y}px);
        transition:clip-path 0.28s cubic-bezier(0.4,0,0.2,1);
      `;
      document.body.appendChild(overlay);

      // Force reflow then expand
      overlay.offsetHeight;
      overlay.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;

      // Apply theme quickly
      setTimeout(() => {
        onToggle();
      }, 60);

      // Remove overlay after animation
      setTimeout(() => {
        overlay.remove();
      }, 300);
    } else {
      onToggle();
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      className="theme-toggle"
      onClick={handleClick}
      aria-label="Toggle theme"
    >
      <div
        className="theme-icon-wrap"
        style={{
          transform: dark ? "rotate(0deg)" : "rotate(180deg)",
        }}
      >
        {/* Sun center / Moon body — shared circle that morphs */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{ overflow: "visible" }}
        >
          {/* Moon mask — clips the circle to crescent when light mode */}
          <defs>
            <mask id="moon-mask">
              <rect x="0" y="0" width="24" height="24" fill="white" />
              <circle
                cx={dark ? "24" : "17"}
                cy={dark ? "0" : "7"}
                r="7"
                fill="black"
                style={{
                  transition: "cx 0.5s cubic-bezier(0.4,0,0.2,1), cy 0.5s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </mask>
          </defs>

          {/* Main body */}
          <circle
            cx="12"
            cy="12"
            r={dark ? "5" : "9"}
            fill="currentColor"
            mask="url(#moon-mask)"
            style={{
              transition: "r 0.45s cubic-bezier(0.4,0,0.2,1)",
            }}
          />

          {/* Sun rays — scale out when dark (sun), scale in when light (moon) */}
          <g
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              opacity: dark ? 1 : 0,
              transform: dark ? "scale(1)" : "scale(0)",
              transformOrigin: "center",
              transition: "opacity 0.3s ease, transform 0.45s cubic-bezier(0.25,1.5,0.5,1)",
            }}
          >
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      </div>
    </button>
  );
}
