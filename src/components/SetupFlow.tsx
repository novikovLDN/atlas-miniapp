"use client";

import { useState, useEffect } from "react";
import InstallPrompt from "@/components/InstallPrompt";
import { openDeepLink } from "@/lib/openDeepLink";
import { detectDevice, APP_LINKS, type DeviceType } from "@/lib/detectDevice";

const CONFETTI_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#ffffff",
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

const STEP1_TITLE: Record<DeviceType, string> = {
  ios: "Настройка на iOS",
  android: "Настройка на Android",
  windows: "Настройка на Windows",
  macos: "Настройка на macOS",
  unknown: "Настройка",
};

const STEP1_ICON: Record<DeviceType, string> = {
  ios: "📱",
  android: "🤖",
  windows: "🖥",
  macos: "🍎",
  unknown: "📱",
};

const iconCircleBase =
  "flex h-[100px] w-[100px] items-center justify-center rounded-full border text-[40px] shadow-[0_0_30px_rgba(59,130,246,0.2)]";
const iconCircleBlue = `${iconCircleBase} border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.15)]`;
const iconCircleGreen =
  "confetti-wrap relative flex h-[100px] w-[100px] items-center justify-center rounded-full border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.2)] text-[40px] shadow-[0_0_30px_rgba(34,197,94,0.3)]";

type SetupFlowProps = {
  telegramId: number;
  onClose: () => void;
  vpnKey: string;
  vpnKeyPlus: string | null;
  tariff: "basic" | "plus";
  subUrl?: string;
  deviceType?: DeviceType;
  onSelectOtherDevice?: () => void;
  onBackFromStep1?: () => void;
};

export default function SetupFlow({
  telegramId,
  onClose,
  vpnKey,
  vpnKeyPlus,
  tariff,
  subUrl,
  deviceType: deviceTypeProp,
  onSelectOtherDevice,
  onBackFromStep1,
}: SetupFlowProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>(deviceTypeProp ?? "unknown");
  const [step, setStep] = useState(1);
  const [plusKeyChoice, setPlusKeyChoice] = useState<"de" | "plus">("de");
  const [copied, setCopied] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (step !== 4) return;
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (deviceTypeProp) setDeviceType(deviceTypeProp);
    else setDeviceType(detectDevice());
  }, [deviceTypeProp]);

  const activeKey = tariff === "plus" && plusKeyChoice === "plus" ? (vpnKeyPlus ?? vpnKey) : vpnKey;
  const appInfo = APP_LINKS[deviceType];
  const isWindows = deviceType === "windows";

  const copyKey = () => {
    navigator.clipboard.writeText(activeKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
    const deepLink = appInfo.deeplink ? appInfo.deeplink(subUrl) : `v2raytun://import/${subUrl}`;
    setShowInstallPrompt(false);
    openDeepLink(deepLink);
    setTimeout(() => setShowInstallPrompt(true), 3000);
  };

  const step1Title = STEP1_TITLE[deviceType];
  const showBack = step >= 1 && step <= 4;
  const handleBack = () => {
    if (step === 1) {
      if (onBackFromStep1) onBackFromStep1();
      else onClose();
    } else {
      setStep((s) => s - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-6"
      style={{ minHeight: "100vh" }}
    >
      <div className="flex w-full max-w-[320px] flex-col items-center">
        {/* Step 1 */}
        {step === 1 && (
          <>
            <div className={iconCircleBlue} aria-hidden>
              {STEP1_ICON[deviceType]}
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-white">
              {step1Title}
            </h2>
            <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
              Настройка VPN происходит в 3 шага и занимает пару минут
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="glass-button mt-8 w-full"
            >
              Начать настройку на этом устройстве
            </button>
            <button
              type="button"
              onClick={onSelectOtherDevice ?? onClose}
              className="glass-button-secondary mt-3 w-full"
            >
              Установить на другом устройстве
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div className={`${iconCircleBlue} animate-[shieldPulse_2s_ease-in-out_infinite]`} aria-hidden>
              ⬇️
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-white">
              Приложение
            </h2>
            <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
              Установите приложение {appInfo.name} и вернитесь к этому экрану
            </p>
            <a
              href={appInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button mt-8 block w-full text-center no-underline"
            >
              {isWindows ? `Скачать ${appInfo.name}` : `Установить ${appInfo.name}`} ⬇
            </a>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="glass-button-secondary mt-3 w-full"
            >
              Далее →
            </button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <div className={`${iconCircleBlue} animate-[spin_8s_linear_infinite]`} aria-hidden>
              ➕
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-white">
              Подписка
            </h2>

            {isWindows ? (
              <>
                <p className="mt-2 max-w-[280px] text-left text-sm text-[var(--text-secondary)]">
                  <span className="block">1. Откройте v2RayN</span>
                  <span className="block">2. Нажмите + → Add subscription</span>
                  <span className="block">3. Вставьте ссылку ниже:</span>
                </p>
                <code className="mt-4 block w-full break-all rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-xs text-[var(--text-primary)]">
                  {subUrl || "—"}
                </code>
                <button
                  type="button"
                  onClick={copySubUrl}
                  disabled={!subUrl}
                  className="glass-button mt-6 w-full disabled:opacity-50"
                >
                  📋 Скопировать ссылку
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="glass-button-secondary mt-3 w-full"
                >
                  Далее →
                </button>
              </>
            ) : (
              <>
                <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
                  Добавьте подписку в приложение {appInfo.name} с помощью кнопки ниже
                </p>
                {tariff === "plus" && (
                  <div className="mt-4 flex w-full gap-2">
                    <button
                      type="button"
                      onClick={() => setPlusKeyChoice("de")}
                      className={`flex-1 rounded-2xl py-2 text-sm font-medium transition-all ${
                        plusKeyChoice === "de"
                          ? "bg-[var(--accent-green)] text-[var(--bg-primary)]"
                          : "glass-button-secondary"
                      }`}
                    >
                      🇩🇪 Atlas DE
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlusKeyChoice("plus")}
                      className={`flex-1 rounded-2xl py-2 text-sm font-medium transition-all ${
                        plusKeyChoice === "plus"
                          ? "bg-[var(--accent-green)] text-[var(--bg-primary)]"
                          : "glass-button-secondary"
                      }`}
                    >
                      ⚪️ White List
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAddConfig}
                  disabled={!subUrl && !activeKey}
                  className="glass-button mt-6 w-full disabled:opacity-50"
                >
                  Добавить конфиг
                </button>
                <button
                  type="button"
                  onClick={copyKey}
                  className="mt-2 text-sm text-[var(--accent)]"
                >
                  {copied ? "Скопировано" : "Скопировать ключ"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="glass-button-secondary mt-3 w-full"
                >
                  Далее →
                </button>
              </>
            )}
          </>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <>
            {showConfetti && (
              <div
                className="fixed inset-0 z-[999] overflow-hidden pointer-events-none"
                style={{ top: 0, left: 0, right: 0, bottom: 0 }}
                aria-hidden
              >
                {confettiPieces.map((p) => (
                  <div
                    key={p.id}
                    className="absolute -top-5 opacity-90"
                    style={{
                      left: `${p.x}%`,
                      width: p.shape === "rect-wide" ? `${p.size * 2}px` : `${p.size}px`,
                      height: `${p.size}px`,
                      borderRadius: p.shape === "circle" ? "50%" : "2px",
                      background: p.color,
                      animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                      transform: `rotate(${p.rotation}deg)`,
                    }}
                  />
                ))}
              </div>
            )}
            <div
              className="success-check-circle flex items-center justify-center"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.15)",
                border: "2px solid rgba(34, 197, 94, 0.4)",
                boxShadow: "0 0 40px rgba(34,197,94,0.3)",
              }}
              aria-hidden
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M12 24 L20 32 L36 16"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="success-check-path"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-white">
              Готово!
            </h2>
            <p className="mt-2 max-w-[280px] text-center text-sm text-[var(--text-secondary)]">
              {isWindows
                ? "Подключите подписку в v2RayN и включите VPN"
                : `Нажмите на круглую кнопку включения VPN в приложении ${appInfo.name}`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="glass-button mt-8 w-full"
            >
              Завершить настройку
            </button>
          </>
        )}

        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="mt-6 border-0 bg-transparent p-2 px-4 text-sm text-[var(--text-secondary)]"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}
            aria-label="Назад"
          >
            ← Назад
          </button>
        )}
      </div>

      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
    </div>
  );
}
