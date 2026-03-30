"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { DEVICE_ICON_MAP } from "@/components/DeviceIcons";
import { CLIENT_APPS, type ClientApp, getHappCryptoLink } from "@/lib/clientApps";
import type { DeviceType } from "@/lib/detectDevice";

type AppTab = "v2raytun" | "happ" | "hiddify" | "streisand";

const APP_TABS: { id: AppTab; label: string }[] = [
  { id: "v2raytun", label: "V2RayTun" },
  { id: "happ", label: "Happ\u26A1\uFE0F" },
  { id: "hiddify", label: "Hiddify" },
  { id: "streisand", label: "Streisand" },
];

type DeviceGuide = {
  id: string;
  label: string;
  Icon: React.FC<{ size?: number }>;
  app: ClientApp;
};

const TvIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DEVICE_LIST: { id: DeviceType | "tv"; label: string; iconKey: string }[] = [
  { id: "ios", label: "iPhone / iPad", iconKey: "ios" },
  { id: "android", label: "Android", iconKey: "android" },
  { id: "macos", label: "macOS", iconKey: "macos" },
  { id: "windows", label: "Windows", iconKey: "windows" },
];

function getFilteredDevices(appId: AppTab): DeviceGuide[] {
  const result: DeviceGuide[] = [];

  for (const dg of DEVICE_LIST) {
    const deviceType = dg.id as DeviceType;
    const deviceApps = CLIENT_APPS[deviceType] || [];
    const match = deviceApps.find((a) => a.id === appId);

    if (match) {
      result.push({
        id: dg.id,
        label: dg.label,
        Icon: dg.id === "tv"
          ? TvIcon
          : DEVICE_ICON_MAP[dg.iconKey as keyof typeof DEVICE_ICON_MAP],
        app: match,
      });
    }
  }

  // TV — only for V2RayTun and Hiddify
  if (appId === "v2raytun" || appId === "hiddify") {
    const androidApps = CLIENT_APPS.android || [];
    const tvApp = androidApps.find((a) => a.id === appId);
    if (tvApp) {
      const tvSteps =
        appId === "v2raytun"
          ? [
              "На телевизоре откройте магазин приложений и найдите «V2RayTun». Установите приложение.",
              "На телефоне установите V2RayTun и добавьте подписку Atlas (скопируйте ссылку подписки и импортируйте).",
              "Откройте V2RayTun на телевизоре и нажмите «Добавить по QR-коду».",
              "На телефоне в V2RayTun нажмите «+» → «Сканировать QR» и отсканируйте код с экрана ТВ.",
              "Подписка добавится автоматически. Выберите сервер и подключитесь.",
            ]
          : [
              "На телевизоре откройте магазин приложений и найдите «Hiddify». Установите приложение.",
              "На телефоне установите Hiddify и добавьте подписку Atlas (скопируйте ссылку подписки и импортируйте).",
              "На телевизоре откройте Hiddify и создайте QR-код для импорта.",
              "На телефоне отсканируйте QR-код с экрана ТВ — подписка добавится автоматически.",
              "Выберите сервер и нажмите круглую кнопку подключения.",
            ];
      result.push({
        id: "tv",
        label: "Android/Google TV",
        Icon: TvIcon,
        app: { ...tvApp, steps: tvSteps },
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
  const [activeApp, setActiveApp] = useState<AppTab>("v2raytun");
  const [openDevice, setOpenDevice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoSetupLoading, setAutoSetupLoading] = useState<string | null>(null);

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
    async (app: ClientApp, deviceId: string) => {
      if (!subUrl) return;

      if (app.asyncDeeplink) {
        setAutoSetupLoading(deviceId);
        const link = await getHappCryptoLink(subUrl);
        setAutoSetupLoading(null);
        if (link) {
          window.location.href = link;
        }
        return;
      }

      if (app.deeplink) {
        window.location.href = app.deeplink(subUrl);
      }
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
        {APP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`guide-app-tab ${activeApp === tab.id ? "guide-app-tab--active" : ""}`}
            onClick={() => {
              setActiveApp(tab.id);
              setOpenDevice(null);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Device sections */}
      <div className="guide-sections">
        {guides.map(({ id, label, Icon, app }) => (
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

                {/* Auto-setup button */}
                {subUrl && (app.deeplink || app.asyncDeeplink) && (
                  <button
                    type="button"
                    className="guide-action-btn guide-action-btn--auto"
                    onClick={() => handleAutoSetup(app, id)}
                    disabled={autoSetupLoading === id}
                  >
                    {autoSetupLoading === id ? (
                      <span className="animate-pulse">{"\u23F3"}</span>
                    ) : (
                      <AutoSetupIcon />
                    )}
                    {autoSetupLoading === id ? "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." : t.setupAutomatically}
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
