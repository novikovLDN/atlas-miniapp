"use client";

import { useState, useEffect } from "react";
import InstallPrompt from "@/components/InstallPrompt";
import { openDeepLink } from "@/lib/openDeepLink";
import { detectDevice, APP_LINKS, type DeviceType } from "@/lib/detectDevice";
import { useI18n } from "@/lib/i18n";

const CONFETTI_COLORS = [
  "#d8ff00", "#1d1d1d", "#fafafa", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4",
];

const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 1.5,
  duration: 2 + Math.random() * 1.5,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + Math.random() * 8,
  rotation: Math.random() * 360,
  shape: (i % 3 === 0 ? "circle" : i % 3 === 1 ? "rect" : "rect-wide") as
    | "circle"
    | "rect"
    | "rect-wide",
}));

const STEP1_ICON: Record<DeviceType, string> = {
  ios: "📱",
  android: "🤖",
  windows: "🖥",
  macos: "🍎",
  unknown: "📱",
};

type SetupFlowProps = {
  telegramId: number;
  onClose: () => void;
  tariff: "basic" | "plus";
  subUrl?: string;
  deviceType?: DeviceType;
  onSelectOtherDevice?: () => void;
  onBackFromStep1?: () => void;
};

export default function SetupFlow({
  telegramId,
  onClose,
  tariff,
  subUrl,
  deviceType: deviceTypeProp,
  onSelectOtherDevice,
  onBackFromStep1,
}: SetupFlowProps) {
  const { t } = useI18n();
  const [deviceType, setDeviceType] = useState<DeviceType>(
    deviceTypeProp ?? "unknown"
  );
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (step !== 4) return;
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (deviceTypeProp) setDeviceType(deviceTypeProp);
    else setDeviceType(detectDevice());
  }, [deviceTypeProp]);

  const appInfo = APP_LINKS[deviceType];
  const isWindows = deviceType === "windows";

  const step1TitleMap: Record<DeviceType, string> = {
    ios: t.setupIOS,
    android: t.setupAndroid,
    windows: t.setupWindows,
    macos: t.setupMacOS,
    unknown: t.setupGeneric,
  };

  const copySubUrl = () => {
    if (!subUrl) return;
    navigator.clipboard.writeText(subUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddConfig = () => {
    if (typeof window === "undefined") return;
    if (isWindows) return;
    if (!subUrl) {
      setShowInstallPrompt(true);
      return;
    }
    const deepLink = appInfo.deeplink
      ? appInfo.deeplink(subUrl)
      : `v2raytun://import/${subUrl}`;
    setShowInstallPrompt(false);
    openDeepLink(deepLink);
    setTimeout(() => setShowInstallPrompt(true), 3000);
  };

  const step1Title = step1TitleMap[deviceType];
  const showBack = step >= 1 && step <= 4;
  const handleBack = () => {
    if (step === 1) {
      if (onBackFromStep1) onBackFromStep1();
      else onClose();
    } else {
      setStep((s) => s - 1);
    }
  };

  const iconBox =
    "flex h-[80px] w-[80px] items-center justify-center rounded-[20px] text-[34px]";

  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="app-container fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center px-8 page-fade">
        <div className="flex w-full max-w-[320px] flex-col items-center">
          {/* Progress dots */}
          <div className="mb-8 flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="rounded-full transition-all duration-300"
                style={{
                  width: s === step ? "28px" : "8px",
                  height: "8px",
                  background:
                    s === step
                      ? "#d8ff00"
                      : s < step
                        ? "#d8ff00"
                        : "var(--bg-card-active)",
                  opacity: s <= step ? 1 : 0.4,
                }}
              />
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="step-enter flex w-full flex-col items-center">
              <div className={iconBox} style={{ background: "var(--bg-card)" }} aria-hidden>
                {STEP1_ICON[deviceType]}
              </div>
              <h2 className="mt-6 text-center text-2xl font-bold text-[var(--text-primary)]">
                {step1Title}
              </h2>
              <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
                {t.setupDescription}
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="glass-button mt-8 w-full"
              >
                {t.startSetupThisDevice}
              </button>
              <button
                type="button"
                onClick={onSelectOtherDevice ?? onClose}
                className="glass-button-secondary mt-3 w-full"
              >
                {t.installOnOtherDevice}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="step-enter flex w-full flex-col items-center">
              <div className={iconBox} style={{ background: "var(--bg-card)" }} aria-hidden>
                {"⬇️"}
              </div>
              <h2 className="mt-6 text-center text-2xl font-bold text-[var(--text-primary)]">
                {t.application}
              </h2>
              <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
                {t.installAppAndReturn(appInfo.name)}
              </p>
              <a
                href={appInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button mt-8 block w-full text-center no-underline"
              >
                {isWindows ? t.downloadApp(appInfo.name) : t.installApp(appInfo.name)}
              </a>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="glass-button-secondary mt-3 w-full"
              >
                {t.next}
              </button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="step-enter flex w-full flex-col items-center">
              <div className={iconBox} style={{ background: "var(--bg-card)" }} aria-hidden>
                {"➕"}
              </div>
              <h2 className="mt-6 text-center text-2xl font-bold text-[var(--text-primary)]">
                {t.subscriptionStep}
              </h2>

              {isWindows ? (
                <>
                  <p className="mt-2 max-w-[280px] text-left text-sm leading-relaxed text-[var(--text-secondary)]">
                    <span className="block">{t.openV2RayN}</span>
                    <span className="block">{t.clickAddSubscription}</span>
                    <span className="block">{t.pasteLinkBelow}</span>
                  </p>
                  <code
                    className="mt-4 block w-full break-all rounded-[14px] p-3 text-xs"
                    style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
                  >
                    {subUrl || "\u2014"}
                  </code>
                  <button
                    type="button"
                    onClick={copySubUrl}
                    disabled={!subUrl}
                    className="glass-button mt-6 w-full disabled:opacity-50"
                  >
                    {t.copyLink}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="glass-button-secondary mt-3 w-full"
                  >
                    {t.next}
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
                    {t.addSubscriptionViaButton(appInfo.name)}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddConfig}
                    disabled={!subUrl}
                    className="glass-button mt-6 w-full disabled:opacity-50"
                  >
                    {t.addConfig}
                  </button>
                  <button
                    type="button"
                    onClick={copySubUrl}
                    disabled={!subUrl}
                    className="mt-2 text-sm font-semibold"
                    style={{ color: "#d8ff00", background: "transparent", border: "none" }}
                  >
                    {copied ? t.copied : t.copyKey}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="glass-button-secondary mt-3 w-full"
                  >
                    {t.next}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Fullscreen confetti (outside step container) */}
          {step === 4 && showConfetti && (
            <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none" style={{ top: 0, left: 0, width: "100vw", height: "100vh" }} aria-hidden>
              {confettiPieces.map((p) => (
                <div
                  key={p.id}
                  className="absolute -top-5"
                  style={{
                    left: `${p.x}%`,
                    width: p.shape === "rect-wide" ? `${p.size * 2}px` : `${p.size}px`,
                    height: `${p.size}px`,
                    borderRadius: p.shape === "circle" ? "50%" : "2px",
                    background: p.color,
                    opacity: 0.9,
                    animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                    transform: `rotate(${p.rotation}deg)`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="step-enter flex w-full flex-col items-center">
              <div
                className="success-check-circle flex items-center justify-center"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "20px",
                  background: "rgba(216, 255, 0, 0.12)",
                }}
                aria-hidden
              >
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M12 24 L20 32 L36 16"
                    stroke="#d8ff00"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="success-check-path"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-center text-2xl font-bold text-[var(--text-primary)]">
                {t.done}
              </h2>
              <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
                {isWindows
                  ? t.connectV2RayN
                  : t.clickVpnButton(appInfo.name)}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="glass-button mt-8 w-full"
              >
                {t.completeSetup}
              </button>
            </div>
          )}

          {/* Back */}
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-6 border-0 bg-transparent p-2 px-4 text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
              aria-label={t.back}
            >
              {t.backArrow}
            </button>
          )}
        </div>

        {showInstallPrompt && (
          <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
        )}
      </div>
    </div>
  );
}
