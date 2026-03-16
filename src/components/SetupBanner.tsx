"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "atlas_setup_banner_dismissed";

type SetupBannerProps = {
  onSetup: () => void;
};

export default function SetupBanner({ onSetup }: SetupBannerProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // Small delay so the banner slides in after page loads
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, "1");
    }, 340);
  };

  const handleSetup = () => {
    dismiss();
    // Let the banner start sliding out, then trigger setup
    setTimeout(() => onSetup(), 120);
  };

  if (!visible) return null;

  return (
    <div className={`setup-banner ${leaving ? "setup-banner--leave" : "setup-banner--enter"}`}>
      <div className="setup-banner__content">
        {/* Close button */}
        <button
          type="button"
          className="setup-banner__close"
          onClick={dismiss}
          aria-label={t.close}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Icon */}
        <div className="setup-banner__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
              fill="var(--accent-blue)"
              opacity="0.15"
            />
            <path
              d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
              stroke="var(--accent-blue)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="var(--accent-blue)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Text */}
        <div className="setup-banner__text">
          <p className="setup-banner__title">{t.bannerTitle}</p>
          <p className="setup-banner__desc">{t.bannerDescription}</p>
        </div>

        {/* Action */}
        <button
          type="button"
          className="setup-banner__action"
          onClick={handleSetup}
        >
          {t.bannerAction}
        </button>
      </div>
    </div>
  );
}
