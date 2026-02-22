"use client";

const LINKS = [
  {
    label: "📱 iOS",
    url: "https://apps.apple.com/app/v2raytun/id6476628951",
  },
  {
    label: "🤖 Android",
    url: "https://play.google.com/store/apps/details?id=com.v2raytun.android",
  },
  {
    label: "🖥 Windows",
    url: "https://github.com/2dust/v2rayN/releases/latest",
  },
  {
    label: "🍎 macOS",
    url: "https://apps.apple.com/app/v2raytun/id6476628951",
  },
] as const;

export default function DownloadSection() {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:bg-[var(--tg-theme-secondary-bg-color,#1c1c1e)]">
      <h3 className="mb-4 text-base font-semibold text-[var(--tg-theme-text-color,#171717)]">
        Скачать приложение
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {LINKS.map(({ label, url }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-[var(--tg-theme-hint-color,#e5e5e5)] bg-[var(--tg-theme-bg-color,#fafafa)] px-3 py-3 text-sm font-medium text-[var(--tg-theme-text-color,#171717)]"
          >
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}
