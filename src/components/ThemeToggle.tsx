"use client";

type ThemeToggleProps = {
  dark: boolean;
  onToggle: () => void;
};

export default function ThemeToggle({ dark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <div className="theme-icon-wrap">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <mask id="moon-mask">
              <rect x="0" y="0" width="24" height="24" fill="white" />
              <circle
                cx={dark ? "24" : "17"}
                cy={dark ? "0" : "7"}
                r="7"
                fill="black"
              />
            </mask>
          </defs>

          <circle
            cx="12"
            cy="12"
            r={dark ? "5" : "9"}
            fill="currentColor"
            mask="url(#moon-mask)"
          />

          {dark && (
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </g>
          )}
        </svg>
      </div>
    </button>
  );
}
