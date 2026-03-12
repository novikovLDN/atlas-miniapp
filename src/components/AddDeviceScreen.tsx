\"use client\";

import { useState } from "react";

type AddDeviceScreenProps = {
  telegramId: number;
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
      // ignore copy errors
    }
  };

  if (!hasActiveSubscription) {
    return (
      <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-6">
        <div className="flex w-full max-w-[360px] flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-white">Добавить устройство</h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Для подключения устройства необходима активная подписка.
          </p>
          <a
            href={buySubscriptionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button mt-6 w-full text-center"
          >
            💳 Купить подписку
          </a>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 border-0 bg-transparent p-2 px-4 text-sm text-[var(--text-secondary)]"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}
          >
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-6">
      <div className="flex w-full max-w-[360px] flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-white">Добавить устройство</h2>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Скопируйте ссылку и вставьте её в V2RayTun или Hiddify на другом устройстве.
        </p>

        <button
          type="button"
          className="glass-button mt-6 w-full"
          onClick={handleCopy}
          disabled={!subscriptionUrl}
        >
          📋 Скопировать ссылку
        </button>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!subscriptionUrl}
          className="mt-3 w-full cursor-pointer rounded-[16px] border border-[var(--glass-border)] bg-[rgba(15,25,40,0.85)] p-3 text-left font-mono text-xs text-[var(--text-secondary)]"
          style={{ wordBreak: "break-word" }}
        >
          {subscriptionUrl || "Ссылка появится после активации подписки"}
        </button>

        <div className="mt-8 w-full space-y-2">
          <button
            type="button"
            onClick={onBack}
            className="glass-button-secondary w-full"
          >
            ← Назад
          </button>
          <button
            type="button"
            onClick={onOpenSupport}
            className="mt-1 w-full border-0 bg-transparent text-sm text-[var(--accent)]"
          >
            💬 Поддержка
          </button>
        </div>
      </div>

      {copied && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-xs text-white">
          Ссылка скопирована ✓
        </div>
      )}
    </div>
  );
}

