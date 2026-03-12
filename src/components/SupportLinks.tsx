"use client";

const LINKS = [
  { label: "Поддержка", url: "https://t.me/asc_support" },
  { label: "Канал", url: "https://t.me/atlas_secure" },
] as const;

function openTelegramLink(url: string) {
  if (typeof window === "undefined") return;
  const tg = (
    window as unknown as {
      Telegram?: {
        WebApp?: { openTelegramLink?: (u: string) => void };
      };
    }
  ).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

export default function SupportLinks() {
  return (
    <div className="flex gap-3">
      {LINKS.map(({ label, url }) => (
        <button
          key={label}
          type="button"
          onClick={() => openTelegramLink(url)}
          className="flex-1 rounded-[var(--radius-card)] py-3.5 text-center text-[14px] font-semibold"
          style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "none" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
