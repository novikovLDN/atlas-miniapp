"use client";

import { useState } from "react";

type ProfileScreenProps = {
  name: string;
  telegramId: number;
  isActive: boolean;
  tariff?: "basic" | "plus";
  expiresFormatted?: string;
  daysLeft?: number;
  subUrl?: string;
  buyUrl: string;
  onOpenSupport: () => void;
};

function openTelegramLink(url: string) {
  const w = window as unknown as {
    Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } };
  };
  const tg = w.Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

export default function ProfileScreen({
  name,
  telegramId,
  isActive,
  tariff,
  expiresFormatted,
  daysLeft,
  subUrl,
  buyUrl,
  onOpenSupport,
}: ProfileScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySubUrl = async () => {
    if (!subUrl) return;
    try {
      await navigator.clipboard.writeText(subUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = subUrl;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col px-5 pb-8 page-enter">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-10 pb-6">
        <div
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[28px]"
          style={{ background: "var(--bg-card)" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-secondary)">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">{name}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">ID: {telegramId}</p>
      </div>

      {/* Subscription info card */}
      <div
        className="rounded-[var(--radius-card)] p-5"
        style={{ background: "var(--bg-card)" }}
      >
        <h3 className="mb-4 text-base font-bold text-[var(--text-primary)]">
          Подписка
        </h3>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--text-secondary)]">Статус</dt>
            <dd>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background: isActive ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.1)",
                  color: isActive ? "#2da44e" : "#ff3b30",
                }}
              >
                <span
                  className="inline-block h-[6px] w-[6px] rounded-full"
                  style={{ background: isActive ? "#34c759" : "#ff3b30" }}
                />
                {isActive ? "Активна" : "Неактивна"}
              </span>
            </dd>
          </div>

          {isActive && (
            <>
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
                <dt className="text-[var(--text-secondary)]">Осталось</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {daysLeft ?? 0} дн.
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-3">
        {/* Buy / Renew */}
        <button
          type="button"
          onClick={() => openTelegramLink(buyUrl)}
          className="glass-button w-full"
        >
          {isActive ? "Продлить подписку" : "Купить подписку"}
        </button>

        {/* Copy subscription URL */}
        {subUrl && (
          <button
            type="button"
            onClick={handleCopySubUrl}
            className="glass-button-secondary w-full"
          >
            {copied ? "Скопировано ✓" : "Скопировать ключ"}
          </button>
        )}

        {/* Support */}
        <button
          type="button"
          onClick={onOpenSupport}
          className="w-full rounded-[14px] py-3.5 text-center text-[14px] font-medium"
          style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "none" }}
        >
          Поддержка
        </button>
      </div>
    </div>
  );
}
