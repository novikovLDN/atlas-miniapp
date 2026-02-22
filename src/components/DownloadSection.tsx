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
    <section className="glass-card p-5">
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
              className={`flex items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                isCurrent
                  ? "border-[var(--accent-green)] bg-[var(--accent-green)]/15 text-[var(--text-primary)]"
                  : "glass-button-secondary"
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
