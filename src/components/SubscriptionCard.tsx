"use client";

import { useState } from "react";
import InstallPrompt from "@/components/InstallPrompt";
import { openDeepLink } from "@/lib/openDeepLink";

type SubscriptionCardProps = {
  telegramId: number;
  name: string;
  isActive: boolean;
  tariff?: "basic" | "plus";
  expiresFormatted?: string;
  daysLeft?: number;
  buySubscriptionUrl: string;
  vpnKey?: string;
  vpnKeyPlus?: string | null;
  subUrl?: string;
  onOpenSetup: () => void;
  onOpenSupport: () => void;
  onOpenAddDevice: () => void;
};

export default function SubscriptionCard({
  telegramId,
  name,
  isActive,
  tariff,
  expiresFormatted,
  daysLeft = 0,
  buySubscriptionUrl,
  vpnKey = "",
  vpnKeyPlus,
  subUrl,
  onOpenSetup,
  onOpenSupport,
  onOpenAddDevice,
}: SubscriptionCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const displayKey = tariff === "plus" && vpnKeyPlus ? (vpnKeyPlus ?? vpnKey) : vpnKey;
  const maskedKey = displayKey ? `${displayKey.slice(0, 20)}...${displayKey.slice(-8)}` : "—";

  const copyKey = () => {
    if (!displayKey) return;
    navigator.clipboard.writeText(displayKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleConnect = () => {
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

  return (
    <>
      <div className="glass-card rounded-t-[24px] border-b-0 p-5 pb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-bold text-[var(--text-primary)]">{name}</span>
          <span className="text-sm font-bold text-[var(--text-primary)]">
            до {expiresFormatted ?? "—"}
          </span>
        </div>
        <div className="mb-5 flex items-center justify-between text-sm">
          <span className={isActive ? "badge-active" : "badge-inactive"}>
            {isActive ? "Активна" : "Неактивна"}
            {isActive && tariff && ` · ${tariff === "plus" ? "Plus" : "Basic"}`}
          </span>
          {isActive ? (
            <span className="text-[var(--accent-green)]">{daysLeft} дн.</span>
          ) : (
            <span className="text-[var(--text-secondary)]">подписка истекла</span>
          )}
        </div>

        {isActive ? (
          <button type="button" onClick={handleConnect} className="glass-button mb-3">
            🚀 Подключиться
          </button>
        ) : (
          <a
            href={buySubscriptionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button mb-3 block text-center"
            style={{ background: "rgba(34, 197, 94, 0.85)", boxShadow: "0 4px 20px rgba(34,197,94,0.4)" }}
          >
            Купить подписку от 199 ₽
          </a>
        )}

        <button type="button" onClick={onOpenSetup} className="glass-button-secondary mb-2">
          ⚙️ Установка и настройка
        </button>

        <button
          type="button"
          onClick={onOpenAddDevice}
          className="glass-button-secondary mb-4"
        >
          📲 Добавить другое устройство
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="glass-button-secondary flex-1 py-2.5"
          >
            👤 Профиль
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className="glass-button-secondary flex-1 py-2.5"
          >
            💬 Поддержка
          </button>
        </div>
      </div>

      {showProfile && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setShowProfile(false)}
            aria-hidden
          />
          <div className="glass-card fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 p-5">
            <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
              Профиль
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Тариф</dt>
                <dd className="text-[var(--text-primary)]">
                  {tariff === "plus" ? "Plus" : "Basic"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Активна до</dt>
                <dd className="text-[var(--text-primary)]">{expiresFormatted ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Осталось дней</dt>
                <dd className="text-[var(--text-primary)]">{daysLeft ?? 0}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-[var(--text-secondary)]">Ключ</dt>
                <dd className="break-all font-mono text-xs text-[var(--text-muted)]">
                  {maskedKey}
                </dd>
                <button
                  type="button"
                  onClick={copyKey}
                  className="mt-1 text-left text-sm text-[var(--accent)]"
                >
                  {copied ? "Скопировано" : "Скопировать ключ"}
                </button>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="glass-button-secondary mt-4"
            >
              Закрыть
            </button>
          </div>
        </>
      )}

      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
    </>
  );
}
