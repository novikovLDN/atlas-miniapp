"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { openTelegramLink } from "@/lib/openTelegramLink";
import { useI18n } from "@/lib/i18n";
import { getHappCryptoLink } from "@/lib/clientApps";
import { openDeepLink } from "@/lib/openDeepLink";
import QRCode from "qrcode";

type AddDeviceScreenProps = {
  subUrl?: string;
  hasActiveSubscription: boolean;
  buySubscriptionUrl: string;
  onBack: () => void;
  onOpenSupport: () => void;
};

type AppId = "happ" | "v2raytun" | "hiddify" | "streisand";

type AppInfo = {
  id: AppId;
  name: string;
  steps: string[];
  deeplink: ((subUrl: string) => string) | null;
  asyncDeeplink?: boolean;
};

const APPS: AppInfo[] = [
  {
    id: "happ",
    name: "Happ\u26A1\uFE0F",
    deeplink: null,
    asyncDeeplink: true,
    steps: [
      "Установите Happ из App Store на другом устройстве (iPhone, iPad, Mac).",
      "Отсканируйте QR-код выше камерой устройства или скопируйте ссылку подписки.",
      "Откройте Happ. Нажмите «+» в правом верхнем углу, затем вставьте скопированную ссылку.",
      "Выберите сервер из списка и нажмите кнопку подключения. Разрешите VPN-конфигурацию при первом запуске.",
    ],
  },
  {
    id: "v2raytun",
    name: "V2RayTun",
    deeplink: (subUrl: string) => `v2raytun://import/${subUrl}`,
    steps: [
      "Установите V2RayTun из App Store или Google Play на другом устройстве.",
      "Отсканируйте QR-код выше камерой устройства или скопируйте ссылку подписки.",
      "Откройте V2RayTun. Нажмите «+» в правом верхнем углу → «Импорт из буфера обмена» или «Импорт из QR».",
      "Выберите добавленный сервер в списке и нажмите кнопку подключения.",
    ],
  },
  {
    id: "hiddify",
    name: "Hiddify",
    deeplink: (subUrl: string) => `hiddify://import/${subUrl}`,
    steps: [
      "Установите Hiddify из App Store, Google Play или скачайте с GitHub (Windows/macOS/Linux).",
      "Отсканируйте QR-код выше камерой устройства или скопируйте ссылку подписки.",
      "Откройте Hiddify. На главном экране нажмите «+» → «Добавить из буфера обмена». Подписка добавится автоматически.",
      "Выберите сервер и нажмите круглую кнопку подключения. Разрешите VPN при первом запуске.",
    ],
  },
  {
    id: "streisand",
    name: "Streisand",
    deeplink: (subUrl: string) => `streisand://import/${subUrl}`,
    steps: [
      "Установите Streisand из App Store на другом устройстве (iPhone, iPad, Mac).",
      "Отсканируйте QR-код выше камерой устройства или скопируйте ссылку подписки.",
      "Откройте Streisand. Нажмите «+» → «Импорт из буфера обмена». Конфигурация будет добавлена автоматически.",
      "Выберите сервер из списка и нажмите кнопку подключения. Разрешите VPN-конфигурацию.",
    ],
  },
];

export default function AddDeviceScreen({
  subUrl,
  hasActiveSubscription,
  buySubscriptionUrl,
  onBack,
  onOpenSupport,
}: AddDeviceScreenProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppId | null>(null);
  const [autoSetupLoading, setAutoSetupLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const subscriptionUrl = hasActiveSubscription && subUrl ? subUrl : "";

  useEffect(() => {
    if (!subscriptionUrl || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, subscriptionUrl, {
      width: 180,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [subscriptionUrl]);

  const handleCopy = async () => {
    if (!subscriptionUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(subscriptionUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = subscriptionUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleAutoSetup = useCallback(
    async (app: AppInfo) => {
      if (!subscriptionUrl) return;

      if (app.asyncDeeplink) {
        setAutoSetupLoading(true);
        const link = await getHappCryptoLink(subscriptionUrl);
        setAutoSetupLoading(false);
        if (link) openDeepLink(link);
        return;
      }

      if (app.deeplink) {
        openDeepLink(app.deeplink(subscriptionUrl));
      }
    },
    [subscriptionUrl]
  );

  const devCredit = (
    <p
      className="mt-6 mb-2 text-center text-[11px] font-medium tracking-wide"
      style={{ color: "var(--text-muted)", opacity: 0.6 }}
    >
      developed by{" "}
      <span style={{ color: "#00e676", fontWeight: 700, textShadow: "0 0 8px rgba(0,230,118,0.4)" }}>Q</span>
      <span style={{ color: "var(--text-primary)" }}>oDev</span>
    </p>
  );

  if (!hasActiveSubscription) {
    return (
      <div
        style={{ background: "var(--bg-dark)", minHeight: "100dvh" }}
        className="overflow-y-auto"
      >
        <div className="app-container flex min-h-[100dvh] flex-col items-center justify-center px-6 py-8 page-fade">
          <div className="flex w-full max-w-[340px] flex-col items-center text-center">
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px]"
              style={{ background: "var(--bg-card)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
                <line x1="17" y1="6" x2="23" y2="6" />
                <line x1="20" y1="3" x2="20" y2="9" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-[var(--text-primary)]">
              {t.addDeviceTitle}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {t.activeSubscriptionRequired}
            </p>
            <button
              type="button"
              onClick={() => openTelegramLink(buySubscriptionUrl)}
              className="btn-green mt-6 w-full"
            >
              {t.buySubscription}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 border-0 bg-transparent p-2 px-4 text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {t.backArrow}
            </button>
            {devCredit}
          </div>
        </div>
      </div>
    );
  }

  const currentApp = APPS.find((a) => a.id === selectedApp);

  return (
    <div
      style={{ background: "var(--bg-dark)", minHeight: "100dvh" }}
      className="overflow-y-auto"
    >
      <div className="app-container flex min-h-[100dvh] flex-col px-5 py-6 page-fade">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {t.addDeviceTitle}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t.copyAndPasteLink}
          </p>
        </div>

        {/* QR Code card */}
        {subscriptionUrl && (
          <div
            className="mx-auto mt-4 flex flex-col items-center rounded-[var(--radius-card)] p-5"
            style={{ background: "var(--bg-card)" }}
          >
            <div
              className="rounded-[12px] p-3"
              style={{ background: "#ffffff" }}
            >
              <canvas ref={canvasRef} style={{ display: "block" }} />
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              {t.addDeviceOnSecondDevice}
            </p>
          </div>
        )}

        {/* Copy button */}
        <button
          type="button"
          className="glass-button mt-4 w-full"
          onClick={handleCopy}
          disabled={!subscriptionUrl}
        >
          {copied ? t.copiedCheck : t.copyLink}
        </button>

        {/* App selector */}
        <p
          className="mt-5 mb-2 text-[13px] font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          {t.addDeviceChooseApp}
        </p>

        <div className="flex flex-wrap gap-2">
          {APPS.map((app) => {
            const isActive = selectedApp === app.id;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setSelectedApp(isActive ? null : app.id)}
                className="setup-client-chip"
                data-active={isActive || undefined}
              >
                {app.name}
              </button>
            );
          })}
        </div>

        {/* Expandable instructions per app */}
        {currentApp && (
          <div
            className="mt-3 w-full rounded-[var(--radius-card)] p-4 text-left"
            style={{ background: "var(--bg-card)" }}
          >
            <h3
              className="text-[14px] font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              {t.addDeviceInstructionTitle(currentApp.name)}
            </h3>

            <ol className="setup-steps">
              {currentApp.steps.map((step, i) => (
                <li key={i}>
                  <div className="setup-step-number">{i + 1}</div>
                  <p
                    className="text-[13px] leading-[1.6]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            {/* Auto-setup button */}
            {subscriptionUrl && (currentApp.deeplink || currentApp.asyncDeeplink) && (
              <button
                type="button"
                onClick={() => handleAutoSetup(currentApp)}
                disabled={autoSetupLoading}
                className="btn-accent w-full mt-3 disabled:opacity-50"
              >
                {autoSetupLoading ? (
                  <span className="animate-pulse">&#x23F3;</span>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                )}
                {autoSetupLoading ? t.loading : t.setupAutomatically}
              </button>
            )}
          </div>
        )}

        {/* Link display */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!subscriptionUrl}
          className="mt-3 w-full cursor-pointer rounded-[12px] p-3 text-left font-mono text-[11px]"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-muted)",
            border: "none",
            wordBreak: "break-all",
          }}
        >
          {subscriptionUrl || t.linkAfterActivation}
        </button>

        {/* Actions */}
        <div className="mt-4 w-full space-y-2">
          <button type="button" onClick={onBack} className="glass-button-secondary w-full">
            {t.backArrow}
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className="glass-button-secondary w-full text-center"
          >
            {t.support}
          </button>
        </div>

        {/* Spacer + credit */}
        <div className="flex-1" />
        {devCredit}
      </div>

      {copied && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium slide-up"
          style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}
        >
          {t.linkCopied}
        </div>
      )}
    </div>
  );
}
