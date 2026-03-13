"use client";

import { useState, useEffect } from "react";
import { openTelegramLink } from "@/lib/openTelegramLink";
import { useI18n, type Locale } from "@/lib/i18n";
import WebApp from "@twa-dev/sdk";

type ReferralStats = {
  total_invited: number;
  active_referrals: number;
  total_cashback: number;
  current_level: string;
  cashback_percent: number;
  next_level: {
    name: string;
    min_referrals: number;
    referrals_needed: number;
  } | null;
};

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
  const { t, locale, setLocale } = useI18n();
  const [copied, setCopied] = useState(false);
  const [refStats, setRefStats] = useState<ReferralStats | null>(null);

  useEffect(() => {
    const initData = WebApp.initData;
    if (!initData) return;
    fetch(`/api/referral-stats?telegram_id=${telegramId}`, {
      headers: { "x-telegram-init-data": initData },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ReferralStats | null) => {
        if (data) setRefStats(data);
      })
      .catch(() => {});
  }, [telegramId]);

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

  const levelProgress = refStats?.next_level
    ? ((refStats.total_invited) / refStats.next_level.min_referrals) * 100
    : 100;

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
                  background: isActive ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.1)",
                  color: isActive ? "#2da44e" : "#ff3b30",
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

      {/* Referral stats card */}
      {refStats && (
        <div
          className="mt-3 rounded-[var(--radius-card)] p-4"
          style={{ background: "var(--bg-card)" }}
        >
          <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">
            {t.referralStats}
          </h3>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex flex-col items-center rounded-[14px] py-2.5" style={{ background: "rgba(52,199,89,0.08)" }}>
              <span className="text-lg font-bold text-[var(--text-primary)]">{refStats.total_invited}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">{t.totalInvited}</span>
            </div>
            <div className="flex flex-col items-center rounded-[14px] py-2.5" style={{ background: "rgba(52,120,246,0.08)" }}>
              <span className="text-lg font-bold text-[var(--text-primary)]">{refStats.active_referrals}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">{t.activeReferrals}</span>
            </div>
            <div className="flex flex-col items-center rounded-[14px] py-2.5" style={{ background: "rgba(139,92,246,0.08)" }}>
              <span className="text-lg font-bold text-[var(--text-primary)]">{refStats.total_cashback.toFixed(0)} \u20BD</span>
              <span className="text-[10px] text-[var(--text-secondary)]">{t.totalCashback}</span>
            </div>
          </div>

          {/* Level + progress */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[var(--text-primary)]">
              {refStats.current_level}
            </span>
            <span className="text-[var(--text-secondary)]">
              {refStats.cashback_percent}% {t.cashbackPercent}
            </span>
          </div>
          <div
            className="h-[6px] w-full rounded-full overflow-hidden"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(levelProgress, 100)}%`,
                background: levelProgress >= 100 ? "#34c759" : "#3478f6",
              }}
            />
          </div>
          {refStats.next_level && (
            <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">
              {refStats.next_level.referrals_needed} {t.referralsToNext} ({refStats.next_level.name})
            </p>
          )}
        </div>
      )}

      {/* Language selector */}
      <div
        className="mt-3 rounded-[var(--radius-card)] p-4"
        style={{ background: "var(--bg-card)" }}
      >
        <h3 className="mb-3 text-sm font-bold text-[var(--text-primary)]">
          {t.language}
        </h3>
        <div className="flex gap-2">
          {([
            { key: "ru" as Locale, label: t.russian },
            { key: "en" as Locale, label: t.english },
          ]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setLocale(key)}
              className="flex-1 rounded-[14px] py-2.5 text-center text-sm font-semibold transition-all"
              style={{
                background: locale === key ? "var(--bg-card-active)" : "rgba(0,0,0,0.04)",
                color: locale === key ? "var(--text-on-dark)" : "var(--text-primary)",
                border: "none",
              }}
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
          onClick={() => openTelegramLink(buyUrl)}
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
          style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "none" }}
        >
          {t.support}
        </button>
      </div>
    </div>
  );
}
