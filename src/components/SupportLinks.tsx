"use client";

import { openTelegramLink } from "@/lib/openTelegramLink";

const LINKS = [
  { label: "Поддержка", url: "https://t.me/asc_support" },
  { label: "Канал", url: "https://t.me/atlas_secure" },
] as const;

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
