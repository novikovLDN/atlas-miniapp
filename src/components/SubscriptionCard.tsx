"use client";

import { useI18n } from "@/lib/i18n";

type SubscriptionCardProps = {
  name: string;
  isActive: boolean;
  tariff?: "basic" | "plus" | "business";
  expiresFormatted?: string;
  daysLeft?: number;
  buySubscriptionUrl: string;
  subUrl?: string;
  onOpenSetup: () => void;
  onOpenSupport: () => void;
  onOpenAddDevice: () => void;
  onOpenPayment: () => void;
};

export default function SubscriptionCard({
  name,
  isActive,
  tariff,
  expiresFormatted,
  daysLeft = 0,
  buySubscriptionUrl,
  subUrl,
  onOpenSetup,
  onOpenSupport,
  onOpenAddDevice,
  onOpenPayment,
}: SubscriptionCardProps) {
  const { t } = useI18n();

  const handleConnectVPN = () => {
    onOpenSetup();
  };

  return (
    <div
      className="rounded-[var(--radius-card)] p-4"
      style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}
    >
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-base font-bold">{name}</span>
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          {t.until} {expiresFormatted ?? "\u2014"}
        </span>
      </div>

      {/* Status row */}
      <div className="mb-4 flex items-center justify-between text-sm">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: isActive ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.1)",
            color: isActive ? "#22c55e" : "#ef4444",
          }}
        >
          <span
            className="inline-block h-[7px] w-[7px] rounded-full"
            style={{ background: isActive ? "#22c55e" : "#ef4444" }}
          />
          {isActive ? t.active : t.inactive}
          {isActive && tariff && ` \u00B7 ${tariff === "business" ? "Business" : tariff === "plus" ? "Plus" : "Basic"}`}
        </span>
        {isActive ? (
          <span className="font-semibold" style={{ color: "#22c55e" }}>
            {daysLeft} {t.days}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>{t.subscriptionExpired}</span>
        )}
      </div>

      {/* Main action */}
      {isActive ? (
        <button
          type="button"
          onClick={handleConnectVPN}
          className="btn-accent mb-2 w-full"
        >
          {t.connectVPN}
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenPayment}
          className="btn-accent mb-2 w-full"
          style={{ background: "var(--accent-green)" }}
        >
          {t.buySubscriptionFrom}
        </button>
      )}

      {/* Secondary actions */}
      <button
        type="button"
        onClick={onOpenAddDevice}
        className="mb-2 w-full rounded-[14px] py-3 text-center text-[15px] font-medium"
        style={{
          background: "color-mix(in srgb, var(--accent-blue) 10%, transparent)",
          color: "var(--accent-blue)",
        }}
      >
        {t.addDevice}
      </button>

      <button
        type="button"
        onClick={onOpenSupport}
        className="w-full rounded-[14px] py-3 text-center text-[14px] font-medium"
        style={{
          background: "var(--bg-container)",
          color: "var(--text-secondary)",
        }}
      >
        {t.support}
      </button>
    </div>
  );
}
