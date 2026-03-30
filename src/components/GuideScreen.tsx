"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { DEVICE_ICON_MAP } from "@/components/DeviceIcons";
import { CLIENT_APPS, type ClientApp } from "@/lib/clientApps";
import type { DeviceType } from "@/lib/detectDevice";

type AppTab = "happ" | "v2raytun";

type DeviceGuide = {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number }>;
  apps: ClientApp[];
};

const TvIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DEVICE_GUIDES: { id: DeviceType | "tv"; label: string; iconKey: string }[] = [
  { id: "ios", label: "iPhone / iPad", iconKey: "ios" },
  { id: "android", label: "Android", iconKey: "android" },
  { id: "macos", label: "macOS", iconKey: "macos" },
  { id: "windows", label: "Windows", iconKey: "windows" },
];

function getFilteredDevices(app: AppTab): DeviceGuide[] {
  const result: DeviceGuide[] = [];

  for (const dg of DEVICE_GUIDES) {
    const deviceType = dg.id as DeviceType;
    const deviceApps = CLIENT_APPS[deviceType] || [];
    const matchingApps = deviceApps.filter((a) =>
      app === "happ" ? a.id === "happ" : a.id === "v2raytun"
    );

    if (matchingApps.length > 0) {
      result.push({
        id: dg.id,
        label: dg.label,
        Icon: DEVICE_ICON_MAP[dg.iconKey as keyof typeof DEVICE_ICON_MAP],
        apps: matchingApps,
      });
    }
  }

  // Add TV for V2RayTun only
  if (app === "v2raytun") {
    const androidApps = CLIENT_APPS.android || [];
    const v2raytunApp = androidApps.find((a) => a.id === "v2raytun");
    if (v2raytunApp) {
      result.push({
        id: "tv",
        label: "Android/Google TV",
        Icon: TvIcon,
        apps: [{
          ...v2raytunApp,
          steps: [
            "На телевизоре откройте магазин приложений и найдите «V2RayTun». Установите приложение.",
            "На телефоне установите V2RayTun и добавьте подписку Atlas (скопируйте ссылку подписки и импортируйте).",
            "Откройте V2RayTun на телевизоре и нажмите «Добавить по QR-коду».",
            "На телефоне в V2RayTun нажмите «+» → «Сканировать QR» и отсканируйте код с экрана ТВ.",
            "Подписка добавится автоматически. Выберите сервер и подключитесь.",
          ],
        }],
      });
    }
  }

  return result;
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function AutoSetupIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export default function GuideScreen({
  onSetup,
  subUrl,
}: {
  onSetup?: () => void;
  subUrl?: string;
}) {
  const { t } = useI18n();
  const [activeApp, setActiveApp] = useState<AppTab>("happ");
  const [openDevice, setOpenDevice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const guides = getFilteredDevices(activeApp);

  const toggleDevice = (id: string) => {
    setOpenDevice(openDevice === id ? null : id);
  };

  const handleCopyKey = useCallback(async () => {
    if (!subUrl) return;
    try {
      await navigator.clipboard.writeText(subUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [subUrl]);

  const handleAutoSetup = useCallback(
    (app: ClientApp) => {
      if (!subUrl || !app.deeplink) return;
      const url = app.deeplink(subUrl);
      window.location.href = url;
    },
    [subUrl]
  );

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
          onClick={() => {
            setActiveApp("happ");
            setOpenDevice(null);
          }}
        >
          Happ⚡️
        </button>
        <button
          type="button"
          className={`guide-app-tab ${activeApp === "v2raytun" ? "guide-app-tab--active" : ""}`}
          onClick={() => {
            setActiveApp("v2raytun");
            setOpenDevice(null);
          }}
        >
          V2RayTun
        </button>
      </div>

      {/* Device sections */}
      <div className="guide-sections">
        {guides.map(({ id, label, Icon, apps }) => {
          const app = apps[0];
          return (
            <div
              key={id}
              className={`guide-card ${openDevice === id ? "guide-card--open" : ""}`}
            >
              <button
                type="button"
                className="guide-card__trigger"
                onClick={() => toggleDevice(id)}
              >
                <span className="guide-card__icon">
                  <Icon size={24} />
                </span>
                <span className="guide-card__label">{label}</span>
                <span className="guide-card__chevron">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              <div className="guide-card__body">
                <div>
                  {/* Download button */}
                  <a
                    href={app.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="guide-action-btn guide-action-btn--download"
                  >
                    <DownloadIcon />
                    {t.downloadApp(app.name)} — {app.storeLabel}
                  </a>

                  {/* Steps */}
                  <ol className="guide-steps">
                    {app.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>

                  {/* Auto-setup button (deep link) */}
                  {subUrl && app.deeplink && (
                    <button
                      type="button"
                      className="guide-action-btn guide-action-btn--auto"
                      onClick={() => handleAutoSetup(app)}
                    >
                      <AutoSetupIcon />
                      {t.setupAutomatically}
                    </button>
                  )}

                  {/* Copy key button */}
                  {subUrl && (
                    <button
                      type="button"
                      className="guide-action-btn guide-action-btn--copy"
                      onClick={handleCopyKey}
                    >
                      {copied ? t.copiedCheck : t.copyKeyManually}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
