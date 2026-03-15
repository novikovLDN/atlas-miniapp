"use client";

import { openTelegramLink } from "@/lib/openTelegramLink";
import { useI18n } from "@/lib/i18n";

export default function SupportLinks() {
  const { t } = useI18n();

  const LINKS = [
    { label: t.support, url: "https://t.me/Atlas_SupportSecurity" },
    { label: t.channel, url: "https://t.me/atlas_secure" },
  ] as const;

  return (
    <div className="flex gap-3">
      {LINKS.map(({ label, url }) => (
        <button
          key={url}
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
