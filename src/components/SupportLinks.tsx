"use client";

const LINKS = [
  { label: "💬 Поддержка", url: "https://t.me/asc_support" },
  { label: "📢 Канал", url: "https://t.me/atlas_secure" },
] as const;

function openTelegramLink(url: string) {
  if (typeof window === "undefined") return;
  const tg = (window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } }).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

export default function SupportLinks() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      {LINKS.map(({ label, url }) => (
        <button
          key={label}
          type="button"
          onClick={() => openTelegramLink(url)}
          className="rounded-[var(--radius-button)] border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--text-muted)]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
