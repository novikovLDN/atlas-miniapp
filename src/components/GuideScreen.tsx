"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type Section = "tv" | "pc" | "phone";

export default function GuideScreen() {
  const { t } = useI18n();
  const [open, setOpen] = useState<Section | null>(null);

  const toggle = (s: Section) => setOpen(open === s ? null : s);

  return (
    <div className="guide-screen page-enter">
      {/* Header */}
      <div className="guide-header">
        <h1 className="guide-header__title">{t.guideTitle}</h1>
        <p className="guide-header__subtitle">{t.guideSubtitle}</p>
      </div>

      <div className="guide-sections">
        {/* TV */}
        <div className={`guide-card ${open === "tv" ? "guide-card--open" : ""}`}>
          <button type="button" className="guide-card__trigger" onClick={() => toggle("tv")}>
            <span className="guide-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="guide-card__label">{t.guideTvTitle}</span>
            <span className="guide-card__chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <div className="guide-card__body">
            <div>
              <ol className="guide-steps">
                <li>{t.guideTvStep1}</li>
                <li>{t.guideTvStep2}</li>
                <li>{t.guideTvStep3}</li>
                <li>{t.guideTvStep4}</li>
                <li>{t.guideTvStep5}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* PC */}
        <div className={`guide-card ${open === "pc" ? "guide-card--open" : ""}`}>
          <button type="button" className="guide-card__trigger" onClick={() => toggle("pc")}>
            <span className="guide-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 20h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="guide-card__label">{t.guidePcTitle}</span>
            <span className="guide-card__chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <div className="guide-card__body">
            <div>
              <p className="guide-option-title">{t.guidePcOption1Title}</p>
              <ol className="guide-steps">
                <li>{t.guidePcOption1Step1}</li>
                <li>{t.guidePcOption1Step2}</li>
                <li>{t.guidePcOption1Step3}</li>
              </ol>
              <p className="guide-option-title guide-option-title--spaced">{t.guidePcOption2Title}</p>
              <ol className="guide-steps">
                <li>{t.guidePcOption2Step1}</li>
                <li>{t.guidePcOption2Step2}</li>
                <li>{t.guidePcOption2Step3}</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Second phone */}
        <div className={`guide-card ${open === "phone" ? "guide-card--open" : ""}`}>
          <button type="button" className="guide-card__trigger" onClick={() => toggle("phone")}>
            <span className="guide-card__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="2" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="guide-card__label">{t.guidePhoneTitle}</span>
            <span className="guide-card__chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <div className="guide-card__body">
            <div>
              <ol className="guide-steps">
                <li>{t.guidePhoneStep1}</li>
                <li>{t.guidePhoneStep2}</li>
                <li>{t.guidePhoneStep3}</li>
                <li>{t.guidePhoneStep4}</li>
                <li>{t.guidePhoneStep5}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
