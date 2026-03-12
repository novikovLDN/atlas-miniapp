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

  const displayKey =
    tariff === "plus" && vpnKeyPlus ? (vpnKeyPlus ?? vpnKey) : vpnKey;
  const maskedKey = displayKey
    ? `${displayKey.slice(0, 20)}...${displayKey.slice(-8)}`
    : "—";

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
    const deepLink = `v2raytun://import/${subUrl}`;
    setShowInstallPrompt(false);
    openDeepLink(deepLink);
    setTimeout(() => setShowInstallPrompt(true), 3000);
  };

  return (
    <>
      {/* ─── Main subscription card (dark, like reference active card) ─── */}
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
          <a
            href={buySubscriptionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-green mb-3 block text-center no-underline"
          >
            Купить подписку от 199 ₽
          </a>
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
          className="mb-4 w-full rounded-[14px] py-3.5 text-center text-[15px] font-medium"
          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}
        >
          Добавить устройство
        </button>

        {/* Quick actions row */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex-1 rounded-[14px] py-3 text-center text-[14px] font-medium"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
          >
            Профиль
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className="flex-1 rounded-[14px] py-3 text-center text-[14px] font-medium"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
          >
            Поддержка
          </button>
        </div>
      </div>

      {/* ─── Profile modal ─── */}
      {showProfile && (
        <>
          <div
            className="overlay-backdrop fixed inset-0 z-40 page-fade"
            onClick={() => setShowProfile(false)}
            aria-hidden
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] p-6 page-enter"
            style={{ background: "var(--bg-container)" }}
          >
            <h3 className="mb-5 text-xl font-bold text-[var(--text-primary)]">
              Профиль
            </h3>
            <dl className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Тариф</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {tariff === "plus" ? "Plus" : "Basic"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Активна до</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {expiresFormatted ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">Осталось дней</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {daysLeft ?? 0}
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="text-[var(--text-secondary)]">Ключ</dt>
                <dd
                  className="break-all rounded-[14px] p-3 font-mono text-xs"
                  style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
                >
                  {maskedKey}
                </dd>
                <button
                  type="button"
                  onClick={copyKey}
                  className="text-left text-sm font-semibold"
                  style={{ color: "var(--accent-blue)" }}
                >
                  {copied ? "Скопировано ✓" : "Скопировать ключ"}
                </button>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="glass-button mt-5"
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
