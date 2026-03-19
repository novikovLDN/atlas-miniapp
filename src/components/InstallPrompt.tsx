"use client";

import { useI18n } from "@/lib/i18n";

const V2RAYTUN_IOS = "https://apps.apple.com/app/v2raytun/id6476628951";
const V2RAYTUN_ANDROID =
  "https://play.google.com/store/apps/details?id=com.v2raytun.android";

type InstallPromptProps = {
  onClose: () => void;
};

export default function InstallPrompt({ onClose }: InstallPromptProps) {
  const { t } = useI18n();

  return (
    <>
      <div
        className="overlay-backdrop fixed inset-0 z-[999] page-fade"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-[1000] slide-up"
        style={{
          background: "var(--bg-container, #ffffff)",
          borderRadius: "24px 24px 0 0",
          padding: "20px 20px 36px",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Handle bar */}
        <div
          className="mx-auto mb-5 rounded-full"
          style={{ width: "36px", height: "4px", background: "#d1d1d6" }}
        />

        <p className="mb-1 text-base font-bold text-[var(--text-primary)]">
          {t.installV2RayTun}
        </p>
        <p className="mb-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          {t.v2RayTunRequired}
        </p>

        <a
          href={V2RAYTUN_IOS}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button block w-full text-center no-underline"
        >
          {t.installForIOS}
        </a>
        <a
          href={V2RAYTUN_ANDROID}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button-secondary mt-2 block w-full text-center no-underline"
        >
          {t.installForAndroid}
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full cursor-pointer border-0 bg-transparent text-sm font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {t.close}
        </button>
      </div>
    </>
  );
}
