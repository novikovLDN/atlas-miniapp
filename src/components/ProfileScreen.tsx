"use client";

import { useState } from "react";
import { openTelegramLink } from "@/lib/openTelegramLink";
import { useI18n, type Locale } from "@/lib/i18n";

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
  onOpenPayment: () => void;
};

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
  onOpenPayment,
}: ProfileScreenProps) {
  const { t, locale, setLocale } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopySubUrl = async () => {
    if (!subUrl) return;
    try {
      await navigator.clipboard.writeText(subUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    <div className="flex flex-col px-5 pb-4 page-enter">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <div
          className="flex h-[56px] w-[56px] items-center justify-center rounded-full"
          style={{ background: "var(--bg-card)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="var(--text-secondary)">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
          </svg>
        </div>
        <h2 className="mt-3 text-lg font-bold text-[var(--text-primary)]">{name}</h2>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">ID: {telegramId}</p>
      </div>

      {/* Subscription info card */}
      <div
        className="rounded-[var(--radius-card)] p-4"
        style={{ background: "var(--bg-card)" }}
      >
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">
          {t.subscription}
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--text-secondary)]">{t.status}</dt>
            <dd>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background: isActive ? "rgba(52,199,89,0.15)" : "rgba(255,59,48,0.1)",
                  color: isActive ? "#34c759" : "#ff3b30",
                }}
              >
                <span
                  className="inline-block h-[6px] w-[6px] rounded-full"
                  style={{ background: isActive ? "#34c759" : "#ff3b30" }}
                />
                {isActive ? t.active : t.inactive}
              </span>
            </dd>
          </div>
          {isActive && (
            <>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">{t.tariff}</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {tariff === "plus" ? "Plus" : "Basic"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">{t.activeUntil}</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {expiresFormatted ?? "\u2014"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--text-secondary)]">{t.remaining}</dt>
                <dd className="font-semibold text-[var(--text-primary)]">
                  {daysLeft ?? 0} {t.days}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Language selector */}
      <div
        className="mt-3 rounded-[var(--radius-card)] p-4"
        style={{ background: "var(--bg-card)" }}
      >
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">
          {t.language}
        </h3>
        <div className="lang-switcher">
          {([
            { key: "ru" as Locale, label: t.russian },
            { key: "en" as Locale, label: t.english },
          ]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setLocale(key)}
              className={`lang-btn${locale === key ? " lang-btn--active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={onOpenPayment}
          className="glass-button w-full"
        >
          {isActive ? t.renewSubscription : t.buySubscription}
        </button>

        {subUrl && (
          <button
            type="button"
            onClick={handleCopySubUrl}
            className="glass-button-secondary w-full"
          >
            {copied ? t.copied : t.copyKey}
          </button>
        )}

        {/* Invite friend */}
        <button
          type="button"
          onClick={() => {
            const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "atlassecure_bot";
            const refLink = `https://t.me/${botUsername}?start=ref_${telegramId}`;
            const shareText = t.inviteShareText;
            const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;
            openTelegramLink(shareUrl);
          }}
          className="glass-button-secondary w-full"
        >
          {t.inviteFriend}
        </button>

        <button
          type="button"
          onClick={onOpenSupport}
          className="w-full rounded-[14px] py-3 text-center text-[14px] font-medium"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "none" }}
        >
          {t.support}
        </button>
      </div>

      {/* Developer credit */}
      <p
        className="mt-6 mb-2 text-center text-[11px] font-medium tracking-wide"
        style={{ color: "var(--text-muted)", opacity: 0.6 }}
      >
        developed by{" "}
        <span style={{ color: "#00e676", fontWeight: 700, textShadow: "0 0 8px rgba(0,230,118,0.4)" }}>Q</span>
        <span style={{ color: "var(--text-primary)" }}>oDev</span>
      </p>
    </div>
  );
}
