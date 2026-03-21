"use client";

import { useState, useEffect, useRef } from "react";
import { openTelegramLink } from "@/lib/openTelegramLink";
import { useI18n } from "@/lib/i18n";
import QRCode from "qrcode";

type AddDeviceScreenProps = {
  subUrl?: string;
  hasActiveSubscription: boolean;
  buySubscriptionUrl: string;
  onBack: () => void;
  onOpenSupport: () => void;
};

export default function AddDeviceScreen({
  subUrl,
  hasActiveSubscription,
  buySubscriptionUrl,
  onBack,
  onOpenSupport,
}: AddDeviceScreenProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const subscriptionUrl = hasActiveSubscription && subUrl ? subUrl : "";

  useEffect(() => {
    if (!subscriptionUrl || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, subscriptionUrl, {
      width: 180,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
  }, [subscriptionUrl]);

  const handleCopy = async () => {
    if (!subscriptionUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(subscriptionUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = subscriptionUrl;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const devCredit = (
    <p
      className="mt-6 mb-2 text-center text-[11px] font-medium tracking-wide"
      style={{ color: "var(--text-muted)", opacity: 0.6 }}
    >
      developed by{" "}
      <span style={{ color: "#00e676", fontWeight: 700, textShadow: "0 0 8px rgba(0,230,118,0.4)" }}>Q</span>
      <span style={{ color: "var(--text-primary)" }}>oDev</span>
    </p>
  );

  if (!hasActiveSubscription) {
    return (
      <div
        style={{ background: "var(--bg-dark)", minHeight: "100dvh" }}
        className="overflow-y-auto"
      >
        <div className="app-container flex min-h-[100dvh] flex-col items-center justify-center px-6 py-8 page-fade">
          <div className="flex w-full max-w-[340px] flex-col items-center text-center">
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-[18px]"
              style={{ background: "var(--bg-card)" }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
                <line x1="17" y1="6" x2="23" y2="6" />
                <line x1="20" y1="3" x2="20" y2="9" />
              </svg>
            </div>
            <h2 className="mt-5 text-xl font-bold text-[var(--text-primary)]">
              {t.addDeviceTitle}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {t.activeSubscriptionRequired}
            </p>
            <button
              type="button"
              onClick={() => openTelegramLink(buySubscriptionUrl)}
              className="btn-green mt-6 w-full"
            >
              {t.buySubscription}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 border-0 bg-transparent p-2 px-4 text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {t.backArrow}
            </button>
            {devCredit}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ background: "var(--bg-dark)", minHeight: "100dvh" }}
      className="overflow-y-auto"
    >
      <div className="app-container flex min-h-[100dvh] flex-col px-5 py-6 page-fade">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {t.addDeviceTitle}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t.copyAndPasteLink}
          </p>
        </div>

        {/* QR Code card */}
        {subscriptionUrl && (
          <div
            className="mx-auto mt-4 flex flex-col items-center rounded-[var(--radius-card)] p-5"
            style={{ background: "var(--bg-card)" }}
          >
            <div
              className="rounded-[12px] p-3"
              style={{ background: "#ffffff" }}
            >
              <canvas ref={canvasRef} style={{ display: "block" }} />
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              {t.addDeviceOnSecondDevice}
            </p>
          </div>
        )}

        {/* Steps */}
        <div
          className="mt-3 w-full rounded-[var(--radius-card)] p-4 text-left text-[13px] leading-relaxed"
          style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}>1</span>
            <span>{t.addDeviceStep1}</span>
          </div>
          <div className="mt-2.5 flex items-start gap-3">
            <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}>2</span>
            <span>{t.addDeviceStep2}</span>
          </div>
          <div className="mt-2.5 flex items-start gap-3">
            <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}>3</span>
            <span>{t.addDeviceStep3}</span>
          </div>
        </div>

        {/* Copy button */}
        <button
          type="button"
          className="glass-button mt-4 w-full"
          onClick={handleCopy}
          disabled={!subscriptionUrl}
        >
          {copied ? t.copiedCheck : t.copyLink}
        </button>

        {/* Link display */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!subscriptionUrl}
          className="mt-2 w-full cursor-pointer rounded-[12px] p-3 text-left font-mono text-[11px]"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-muted)",
            border: "none",
            wordBreak: "break-all",
          }}
        >
          {subscriptionUrl || t.linkAfterActivation}
        </button>

        {/* Actions */}
        <div className="mt-4 w-full space-y-2">
          <button type="button" onClick={onBack} className="glass-button-secondary w-full">
            {t.backArrow}
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className="glass-button-secondary w-full text-center"
          >
            {t.support}
          </button>
        </div>

        {/* Spacer + credit */}
        <div className="flex-1" />
        {devCredit}
      </div>

      {copied && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium slide-up"
          style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}
        >
          {t.linkCopied}
        </div>
      )}
    </div>
  );
}
