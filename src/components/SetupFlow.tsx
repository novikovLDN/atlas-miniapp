"use client";

import { useState } from "react";
import InstallPrompt from "@/components/InstallPrompt";
import { openDeepLink } from "@/lib/openDeepLink";

const V2RAYTUN_IOS = "https://apps.apple.com/app/v2raytun/id6476628951";

type SetupFlowProps = {
  telegramId: number;
  onClose: () => void;
  vpnKey: string;
  vpnKeyPlus: string | null;
  tariff: "basic" | "plus";
  subUrl?: string;
};

export default function SetupFlow({
  telegramId,
  onClose,
  vpnKey,
  vpnKeyPlus,
  tariff,
  subUrl,
}: SetupFlowProps) {
  const [step, setStep] = useState(1);
  const [plusKeyChoice, setPlusKeyChoice] = useState<"de" | "plus">("de");
  const [copied, setCopied] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const activeKey = tariff === "plus" && plusKeyChoice === "plus" ? (vpnKeyPlus ?? vpnKey) : vpnKey;

  const copyKey = () => {
    navigator.clipboard.writeText(activeKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddConfig = () => {
    if (typeof window === "undefined") return;
    if (!subUrl) {
      setShowInstallPrompt(true);
      return;
    }
    console.log("sub_url:", subUrl);
    const deepLink = `v2raytun://import/${subUrl}`;
    setShowInstallPrompt(false);
    openDeepLink(deepLink);
    setTimeout(() => setShowInstallPrompt(true), 3000);
  };

  const showBack = step >= 2 && step <= 4;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
      {showBack && (
        <button
          type="button"
          onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] transition-all hover:border-[var(--text-muted)]"
          aria-label="Назад"
        >
          ←
        </button>
      )}

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        {step === 1 && (
          <>
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--accent)]"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
              Настройка на iOS
            </h2>
            <p className="mb-8 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              Настройка VPN происходит в 3 шага и занимает пару минут
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mb-3 w-full max-w-sm rounded-[var(--radius-button)] bg-[var(--accent)] px-4 py-3.5 font-semibold text-white transition-all hover:opacity-90"
            >
              Начать настройку на этом устройстве
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-sm rounded-[var(--radius-button)] border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--text-muted)]"
            >
              Установить на другом устройстве
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="ring-pulse mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--bg-card)] shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[var(--accent)]"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
              Приложение
            </h2>
            <p className="mb-8 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              Установите приложение v2RayTun и вернитесь к этому экрану
            </p>
            <a
              href={V2RAYTUN_IOS}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 w-full max-w-sm rounded-[var(--radius-button)] bg-[var(--accent)] px-4 py-3.5 text-center font-semibold text-white transition-all hover:opacity-90"
            >
              Установить ⬇
            </a>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full max-w-sm rounded-[var(--radius-button)] border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--text-muted)]"
            >
              Далее →
            </button>
          </>
        )}

        {step === 3 && (
          <>
            {tariff === "plus" && (
              <div className="mb-4 flex w-full max-w-sm gap-2">
                <button
                  type="button"
                  onClick={() => setPlusKeyChoice("de")}
                  className={`flex-1 rounded-[var(--radius-button)] py-2 text-sm font-medium transition-all ${
                    plusKeyChoice === "de"
                      ? "bg-[var(--accent-green)] text-[var(--bg-primary)]"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-card)]"
                  }`}
                >
                  🇩🇪 Atlas DE
                </button>
                <button
                  type="button"
                  onClick={() => setPlusKeyChoice("plus")}
                  className={`flex-1 rounded-[var(--radius-button)] py-2 text-sm font-medium transition-all ${
                    plusKeyChoice === "plus"
                      ? "bg-[var(--accent-green)] text-[var(--bg-primary)]"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-card)]"
                  }`}
                >
                  ⚪️ White List
                </button>
              </div>
            )}
            <div className="ring-rotate mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[var(--accent)] bg-[var(--bg-card)] shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
              <span className="text-2xl font-bold text-[var(--accent)]">+</span>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
              Подписка
            </h2>
            <p className="mb-6 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              Добавьте подписку в приложение v2RayTun с помощью кнопки ниже
            </p>
            <button
              type="button"
              onClick={handleAddConfig}
              disabled={!subUrl && !activeKey}
              className="mb-3 w-full max-w-sm rounded-[var(--radius-button)] bg-[var(--accent)] px-4 py-3.5 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              Добавить ⊕
            </button>
            <button
              type="button"
              onClick={copyKey}
              className="mb-3 text-sm text-[var(--accent)]"
            >
              {copied ? "Скопировано" : "Скопировать ключ"}
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full max-w-sm rounded-[var(--radius-button)] border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--text-muted)]"
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
              Нажмите на круглую кнопку включения VPN в приложении v2RayTun
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-sm rounded-[var(--radius-button)] border-2 border-[var(--accent)] bg-[var(--bg-primary)] px-4 py-3.5 font-medium text-[var(--accent)] transition-all hover:bg-[var(--bg-card)]"
            >
              Завершить настройку
            </button>
          </>
        )}
      </div>

      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
    </div>
  );
}
