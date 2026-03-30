"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { DEVICE_ICON_MAP } from "@/components/DeviceIcons";

type AppTab = "happ" | "v2raytun";

type DeviceGuide = {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number }>;
  steps: string[];
};

const TvIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function getGuides(app: AppTab, t: ReturnType<typeof import("@/lib/i18n").useI18n>["t"]): DeviceGuide[] {
  if (app === "happ") {
    return [
      {
        id: "ios",
        label: "iPhone / iPad",
        Icon: DEVICE_ICON_MAP.ios,
        steps: [
          t.guideHappIosStep1,
          t.guideHappIosStep2,
          t.guideHappIosStep3,
          t.guideHappIosStep4,
        ],
      },
      {
        id: "android",
        label: "Android",
        Icon: DEVICE_ICON_MAP.android,
        steps: [
          t.guideHappAndroidStep1,
          t.guideHappAndroidStep2,
          t.guideHappAndroidStep3,
          t.guideHappAndroidStep4,
        ],
      },
      {
        id: "macos",
        label: "macOS",
        Icon: DEVICE_ICON_MAP.macos,
        steps: [
          t.guideHappMacStep1,
          t.guideHappMacStep2,
          t.guideHappMacStep3,
          t.guideHappMacStep4,
        ],
      },
      {
        id: "windows",
        label: "Windows",
        Icon: DEVICE_ICON_MAP.windows,
        steps: [
          t.guideHappWinStep1,
          t.guideHappWinStep2,
          t.guideHappWinStep3,
          t.guideHappWinStep4,
        ],
      },
    ];
  }

  // V2RayTun
  return [
    {
      id: "ios",
      label: "iPhone / iPad",
      Icon: DEVICE_ICON_MAP.ios,
      steps: [
        t.guideV2IosStep1,
        t.guideV2IosStep2,
        t.guideV2IosStep3,
        t.guideV2IosStep4,
      ],
    },
    {
      id: "android",
      label: "Android",
      Icon: DEVICE_ICON_MAP.android,
      steps: [
        t.guideV2AndroidStep1,
        t.guideV2AndroidStep2,
        t.guideV2AndroidStep3,
        t.guideV2AndroidStep4,
      ],
    },
    {
      id: "macos",
      label: "macOS",
      Icon: DEVICE_ICON_MAP.macos,
      steps: [
        t.guideV2MacStep1,
        t.guideV2MacStep2,
        t.guideV2MacStep3,
        t.guideV2MacStep4,
      ],
    },
    {
      id: "windows",
      label: "Windows",
      Icon: DEVICE_ICON_MAP.windows,
      steps: [
        t.guideV2WinStep1,
        t.guideV2WinStep2,
        t.guideV2WinStep3,
        t.guideV2WinStep4,
      ],
    },
    {
      id: "tv",
      label: "Android/Google TV",
      Icon: TvIcon,
      steps: [
        t.guideV2TvStep1,
        t.guideV2TvStep2,
        t.guideV2TvStep3,
        t.guideV2TvStep4,
      ],
    },
  ];
}

export default function GuideScreen({ onSetup }: { onSetup?: () => void }) {
  const { t } = useI18n();
  const [activeApp, setActiveApp] = useState<AppTab>("happ");
  const [openDevice, setOpenDevice] = useState<string | null>(null);

  const guides = getGuides(activeApp, t);

  const toggleDevice = (id: string) => {
    setOpenDevice(openDevice === id ? null : id);
  };

  return (
    <div className="guide-screen page-enter">
      {/* Header */}
      <div className="guide-header">
        <p className="guide-header__label">
          <span className="guide-header__accent" />
          {t.guideLabel}
        </p>
        <h1 className="guide-header__title">{t.guideTitle}</h1>
        <p className="guide-header__subtitle">{t.guideSubtitle}</p>
      </div>

      {/* App tabs */}
      <div className="guide-app-tabs">
        <button
          type="button"
          className={`guide-app-tab ${activeApp === "happ" ? "guide-app-tab--active" : ""}`}
          onClick={() => { setActiveApp("happ"); setOpenDevice(null); }}
        >
          Happ⚡️
        </button>
        <button
          type="button"
          className={`guide-app-tab ${activeApp === "v2raytun" ? "guide-app-tab--active" : ""}`}
          onClick={() => { setActiveApp("v2raytun"); setOpenDevice(null); }}
        >
          V2RayTun
        </button>
      </div>

      {/* Device sections */}
      <div className="guide-sections">
        {guides.map(({ id, label, Icon, steps }) => (
          <div key={id} className={`guide-card ${openDevice === id ? "guide-card--open" : ""}`}>
            <button type="button" className="guide-card__trigger" onClick={() => toggleDevice(id)}>
              <span className="guide-card__icon">
                <Icon size={24} />
              </span>
              <span className="guide-card__label">{label}</span>
              <span className="guide-card__chevron">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            <div className="guide-card__body">
              <div>
                <ol className="guide-steps">
                  {steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Setup button */}
      {onSetup && (
        <div className="guide-support">
          <button
            type="button"
            className="glass-button"
            style={{ width: "100%" }}
            onClick={onSetup}
          >
            {t.startSetupThisDevice}
          </button>
        </div>
      )}
    </div>
  );
}
