"use client";

import type { DeviceType } from "@/lib/detectDevice";
import { APP_LINKS } from "@/lib/detectDevice";
import { useI18n } from "@/lib/i18n";

const DEVICE_ORDER: DeviceType[] = ["ios", "android", "windows", "macos"];

const LABELS: Record<DeviceType, string> = {
  ios: "iOS",
  android: "Android",
  windows: "Windows",
  macos: "macOS",
  unknown: "",
};

const ICONS: Record<DeviceType, string> = {
  ios: "📱",
  android: "🤖",
  windows: "🖥",
  macos: "🍎",
  unknown: "📱",
};

type DownloadSectionProps = {
  deviceType?: DeviceType;
};

export default function DownloadSection({
  deviceType = "unknown",
}: DownloadSectionProps) {
  const { t } = useI18n();

  const ordered =
    deviceType !== "unknown" && DEVICE_ORDER.includes(deviceType)
      ? [deviceType, ...DEVICE_ORDER.filter((d) => d !== deviceType)]
      : DEVICE_ORDER;

  return (
    <section>
      <h3 className="mb-3 text-lg font-bold text-[var(--text-primary)]">
        {t.downloadApplication}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ordered.map((d) => {
          const info = APP_LINKS[d];
          const label = LABELS[d];
          const icon = ICONS[d];
          const isCurrent = d === deviceType;
          return (
            <a
              key={d}
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-[var(--radius-card)] px-3 py-4 text-sm font-semibold no-underline transition-all"
              style={{
                background: isCurrent ? "#d8ff00" : "var(--bg-card)",
                color: isCurrent ? "#0a0a0a" : "var(--text-primary)",
              }}
            >
              <span>{icon}</span>
              {label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
