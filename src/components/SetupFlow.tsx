"use client";

import { useState, useEffect } from "react";
import InstallPrompt from "@/components/InstallPrompt";
import { openDeepLink } from "@/lib/openDeepLink";
import { detectDevice, APP_LINKS, type DeviceType } from "@/lib/detectDevice";

const STEP1_TITLE: Record<DeviceType, string> = {
  ios: "Настройка на iOS",
  android: "Настройка на Android",
  windows: "Настройка на Windows",
  macos: "Настройка на macOS",
  unknown: "Настройка",
};

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
    console.log("sub_url:", subUrl);
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
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full glass-button-secondary w-10 p-0 text-[var(--text-primary)]"
          aria-label="Назад"
        >
          ←
        </button>
      )}

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <div className="glass-card w-full max-w-sm p-6">
        {step === 1 && (
          <>
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--accent-blue)]"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
              {step1Title}
            </h2>
            <p className="mb-8 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              Настройка VPN происходит в 3 шага и занимает пару минут
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="glass-button mb-3 w-full"
            >
              Начать настройку на этом устройстве
            </button>
            <button
              type="button"
              onClick={onSelectOtherDevice ?? onClose}
              className="glass-button-secondary w-full"
            >
              Установить на другом устройстве
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--accent-blue)] bg-[var(--glass-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] animate-[shieldPulse_2s_ease-in-out_infinite]">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--accent-blue)]"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
              Приложение
            </h2>
            <p className="mb-6 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              Установите приложение {appInfo.name} и вернитесь к этому экрану
            </p>
            <a
              href={appInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button mb-3 block w-full text-center no-underline"
            >
              {isWindows ? `Скачать ${appInfo.name}` : `Установить ${appInfo.name}`} ⬇
            </a>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="glass-button-secondary w-full"
            >
              Далее →
            </button>
          </>
        )}

        {step === 3 && (
          <>
            {isWindows ? (
              <>
                <h2 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">
                  Подписка
                </h2>
                <div className="mb-6 w-full max-w-sm space-y-3 text-left text-sm text-[var(--text-secondary)]">
                  <p>1. Откройте v2RayN</p>
                  <p>2. Нажмите + → Add subscription</p>
                  <p>3. Вставьте ссылку ниже:</p>
                </div>
                <code className="mb-4 block w-full break-all rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-3 text-xs text-[var(--text-primary)]">
                  {subUrl || "—"}
                </code>
                <button
                  type="button"
                  onClick={copySubUrl}
                  disabled={!subUrl}
                  className="glass-button mb-4 w-full disabled:opacity-50"
                >
                  📋 Скопировать ссылку
                </button>
              </>
            ) : (
              <>
                {tariff === "plus" && (
                  <div className="mb-4 flex w-full max-w-sm gap-2">
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
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[var(--accent-blue)] bg-[var(--glass-bg)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] animate-[spin_8s_linear_infinite]">
                  <span className="text-2xl font-bold text-[var(--accent)]">+</span>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
                  Подписка
                </h2>
                <p className="mb-6 max-w-xs text-center text-sm text-[var(--text-secondary)]">
                  Добавьте подписку в приложение {appInfo.name} с помощью кнопки ниже
                </p>
                <button
                  type="button"
                  onClick={handleAddConfig}
                  disabled={!subUrl && !activeKey}
                  className="glass-button mb-3 w-full disabled:opacity-50"
                >
                  Добавить конфиг
                </button>
                <button
                  type="button"
                  onClick={copyKey}
                  className="mb-3 text-sm text-[var(--accent)]"
                >
                  {copied ? "Скопировано" : "Скопировать ключ"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setStep(4)}
              className="glass-button-secondary w-full"
            >
              Далее →
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="confetti-wrap relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent-green)] shadow-[0_4px_16px_rgba(34,197,94,0.3)]">
              <span className="text-4xl text-[var(--bg-primary)]">✓</span>
              <span className="confetti-dot" />
              <span className="confetti-dot" />
              <span className="confetti-dot" />
              <span className="confetti-dot" />
              <span className="confetti-dot" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
              Готово!
            </h2>
            <p className="mb-8 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              {isWindows
                ? "Подключите подписку в v2RayN и включите VPN"
                : `Нажмите на круглую кнопку включения VPN в приложении ${appInfo.name}`}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary w-full border-[var(--accent-blue)] text-[var(--accent-blue)]"
            >
              Завершить настройку
            </button>
          </>
        )}
        </div>
      </div>

      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
    </div>
  );
}
