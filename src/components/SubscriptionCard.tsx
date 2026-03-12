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
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleConnect = () => {
    if (typeof window === "undefined") return;
    if (!subUrl) {
      setShowInstallPrompt(true);
      return;
    }
    const deepLink = `v2raytun://import/${subUrl}`;
    setShowInstallPrompt(false);
    openDeepLink(deepLink);
    setTimeout(() => setShowInstallPrompt(true), 3000);
  };

  return (
    <>
      <div
        className="rounded-[var(--radius-card)] p-5"
        style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}
      >
        {/* Header */}
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-base font-bold">{name}</span>
          <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            до {expiresFormatted ?? "—"}
          </span>
        </div>

        {/* Status row */}
        <div className="mb-5 flex items-center justify-between text-sm">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: isActive ? "rgba(52,199,89,0.2)" : "rgba(255,59,48,0.2)",
              color: isActive ? "#4ade80" : "#ff6b6b",
            }}
          >
            <span
              className="inline-block h-[7px] w-[7px] rounded-full"
              style={{ background: isActive ? "#34c759" : "#ff3b30" }}
            />
            {isActive ? "Активна" : "Неактивна"}
            {isActive && tariff && ` · ${tariff === "plus" ? "Plus" : "Basic"}`}
          </span>
          {isActive ? (
            <span className="font-semibold" style={{ color: "#4ade80" }}>
              {daysLeft} дн.
            </span>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.4)" }}>подписка истекла</span>
          )}
        </div>

        {/* Main action */}
        {isActive ? (
          <button
            type="button"
            onClick={handleConnect}
            className="mb-3 w-full rounded-[14px] py-4 text-center text-[15px] font-semibold"
            style={{ background: "#ffffff", color: "var(--bg-card-active)" }}
          >
            Подключиться
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const w = window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } };
              const tg = w.Telegram?.WebApp;
              if (tg?.openTelegramLink) {
                tg.openTelegramLink(buySubscriptionUrl);
              } else {
                window.open(buySubscriptionUrl, "_blank");
              }
            }}
            className="btn-green mb-3 w-full"
          >
            Купить подписку от 149 ₽
          </button>
        )}

        {/* Secondary actions */}
        <button
          type="button"
          onClick={onOpenSetup}
          className="mb-2 w-full rounded-[14px] py-3.5 text-center text-[15px] font-medium"
          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
        >
          Установка и настройка
        </button>

        <button
          type="button"
          onClick={onOpenAddDevice}
          className="mb-2 w-full rounded-[14px] py-3.5 text-center text-[15px] font-medium"
          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
        >
          Добавить устройство
        </button>

        <button
          type="button"
          onClick={onOpenSupport}
          className="w-full rounded-[14px] py-3.5 text-center text-[14px] font-medium"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        >
          Поддержка
        </button>
      </div>

      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}
    </>
  );
}
