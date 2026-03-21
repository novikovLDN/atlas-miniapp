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
      width: 200,
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

  if (!hasActiveSubscription) {
    return (
      <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
        <div className="app-container fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center px-8 page-fade">
          <div className="flex w-full max-w-[340px] flex-col items-center text-center">
            <div
              className="flex h-[80px] w-[80px] items-center justify-center rounded-[20px]"
              style={{ background: "var(--bg-card)" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
                <line x1="17" y1="6" x2="23" y2="6" />
                <line x1="20" y1="3" x2="20" y2="9" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
              {t.addDeviceTitle}
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
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
              className="mt-6 border-0 bg-transparent p-2 px-4 text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              {t.backArrow}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="app-container fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center px-8 page-fade">
        <div className="flex w-full max-w-[340px] flex-col items-center text-center">
          <div
            className="flex h-[80px] w-[80px] items-center justify-center rounded-[20px]"
            style={{ background: "var(--bg-card)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-primary)" }}>
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
              <line x1="17" y1="6" x2="23" y2="6" />
              <line x1="20" y1="3" x2="20" y2="9" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
            {t.addDeviceTitle}
          </h2>
          <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
            {t.copyAndPasteLink}
          </p>

          {/* QR Code */}
          {subscriptionUrl && (
            <div
              className="mt-4 rounded-[16px] p-4"
              style={{ background: "#ffffff" }}
            >
              <canvas ref={canvasRef} />
            </div>
          )}

          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {t.addDeviceOnSecondDevice}
          </p>

          <div
            className="mt-4 w-full rounded-[14px] p-4 text-left text-sm leading-relaxed"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}>1</span>
              <span>{t.addDeviceStep1}</span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}>2</span>
              <span>{t.addDeviceStep2}</span>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}>3</span>
              <span>{t.addDeviceStep3}</span>
            </div>
          </div>

          <button
            type="button"
            className="glass-button mt-5 w-full"
            onClick={handleCopy}
            disabled={!subscriptionUrl}
          >
            {copied ? t.copiedCheck : t.copyLink}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!subscriptionUrl}
            className="mt-3 w-full cursor-pointer rounded-[14px] p-3 text-left font-mono text-xs"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "none",
              wordBreak: "break-word",
            }}
          >
            {subscriptionUrl || t.linkAfterActivation}
          </button>

          <div className="mt-5 w-full space-y-2">
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
    </div>
  );
}
