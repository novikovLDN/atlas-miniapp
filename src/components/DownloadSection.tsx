"use client";

import type { DeviceType } from "@/lib/detectDevice";
import { APP_LINKS } from "@/lib/detectDevice";

const DEVICE_ORDER: DeviceType[] = ["ios", "android", "windows", "macos"];

const LABELS: Record<DeviceType, string> = {
  ios: "📱 iOS",
  android: "🤖 Android",
  windows: "🖥 Windows",
  macos: "🍎 macOS",
  unknown: "📱 Установить",
};

type DownloadSectionProps = {
  deviceType?: DeviceType;
};

export default function DownloadSection({ deviceType = "unknown" }: DownloadSectionProps) {
  const ordered =
    deviceType !== "unknown" && DEVICE_ORDER.includes(deviceType)
      ? [deviceType, ...DEVICE_ORDER.filter((d) => d !== deviceType)]
      : DEVICE_ORDER;

  return (
    <section className="rounded-[var(--radius-card)] bg-[var(--bg-card)] border border-[var(--border-card)] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
      <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
        Скачать приложение
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ordered.map((d) => {
          const info = APP_LINKS[d];
          const label = LABELS[d];
          const isCurrent = d === deviceType;
          return (
            <a
              key={d}
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center rounded-[var(--radius-button)] border px-3 py-3 text-sm font-medium transition-all ${
                isCurrent
                  ? "border-[var(--accent-green)] bg-[var(--accent-green)]/10 text-[var(--text-primary)]"
                  : "border-[var(--border-card)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
