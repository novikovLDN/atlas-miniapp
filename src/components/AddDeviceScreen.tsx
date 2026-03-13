"use client";

import { useState } from "react";
import { openTelegramLink } from "@/lib/openTelegramLink";
import { useI18n } from "@/lib/i18n";

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

  const subscriptionUrl = hasActiveSubscription && subUrl ? subUrl : "";

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
              className="flex h-[80px] w-[80px] items-center justify-center rounded-[20px] text-[34px]"
              style={{ background: "var(--bg-card)" }}
            >
              \uD83D\uDCF2
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
            className="flex h-[80px] w-[80px] items-center justify-center rounded-[20px] text-[34px]"
            style={{ background: "var(--bg-card)" }}
          >
            \uD83D\uDCF2
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
            {t.addDeviceTitle}
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {t.copyAndPasteLink}
          </p>

          <button
            type="button"
            className="glass-button mt-6 w-full"
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

          <div className="mt-6 w-full space-y-2">
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
