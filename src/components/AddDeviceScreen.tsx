"use client";

import { useState } from "react";
import { openTelegramLink } from "@/lib/openTelegramLink";

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
              📲
            </div>
            <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
              Добавить устройство
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Для подключения устройства необходима активная подписка.
            </p>
            <button
              type="button"
              onClick={() => openTelegramLink(buySubscriptionUrl)}
              className="btn-green mt-6 w-full"
            >
              Купить подписку
            </button>
            <button
              type="button"
              onClick={onBack}
              className="mt-6 border-0 bg-transparent p-2 px-4 text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              ← Назад
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
            📲
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
            Добавить устройство
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Скопируйте ссылку и вставьте её в V2RayTun или Hiddify на другом устройстве.
          </p>

          <button
            type="button"
            className="glass-button mt-6 w-full"
            onClick={handleCopy}
            disabled={!subscriptionUrl}
          >
            {copied ? "Скопировано ✓" : "Скопировать ссылку"}
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
            {subscriptionUrl || "Ссылка появится после активации подписки"}
          </button>

          <div className="mt-6 w-full space-y-2">
            <button type="button" onClick={onBack} className="glass-button-secondary w-full">
              ← Назад
            </button>
            <button
              type="button"
              onClick={onOpenSupport}
              className="glass-button-secondary w-full text-center"
            >
              Поддержка
            </button>
          </div>
        </div>

        {copied && (
          <div
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium slide-up"
            style={{ background: "var(--bg-card-active)", color: "var(--text-on-dark)" }}
          >
            Ссылка скопирована ✓
          </div>
        )}
      </div>
    </div>
  );
}
