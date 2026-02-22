"use client";

const V2RAYTUN_IOS = "https://apps.apple.com/app/v2raytun/id6476628951";
const V2RAYTUN_ANDROID = "https://play.google.com/store/apps/details?id=com.v2raytun.android";

type InstallPromptProps = {
  onClose: () => void;
};

export default function InstallPrompt({ onClose }: InstallPromptProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] bg-[var(--bg-card)] border border-[var(--border-card)] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
        <h3 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">
          v2RayTun не установлен
        </h3>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Установите приложение для подключения к VPN
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={V2RAYTUN_IOS}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-button)] bg-[var(--accent)] px-4 py-3 text-center font-medium text-white transition-all hover:opacity-90"
          >
            📱 Установить для iOS
          </a>
          <a
            href={V2RAYTUN_ANDROID}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-button)] border border-[var(--border-card)] bg-[var(--bg-primary)] px-4 py-3 text-center text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--text-muted)]"
          >
            🤖 Установить для Android
          </a>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-[var(--radius-button)] border border-[var(--border-card)] py-2.5 text-sm text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-primary)]"
        >
          Закрыть
        </button>
      </div>
    </>
  );
}
