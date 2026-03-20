"use client";

import type { DeviceType } from "@/lib/detectDevice";
import { useI18n } from "@/lib/i18n";
import { DEVICE_ICON_MAP } from "@/components/DeviceIcons";

type DeviceSelectorProps = {
  onSelectDevice: (device: DeviceType) => void;
  onBack: () => void;
  detectedDevice?: DeviceType;
};

export default function DeviceSelector({
  onSelectDevice,
  onBack,
  detectedDevice,
}: DeviceSelectorProps) {
  const { t } = useI18n();

  const DEVICES: { id: DeviceType; name: string; subtitle: string }[] = [
    { id: "ios", name: "iOS", subtitle: "iPhone / iPad" },
    { id: "android", name: "Android", subtitle: "Samsung, Xiaomi..." },
    { id: "windows", name: "Windows", subtitle: t.pcLaptop },
    { id: "macos", name: "macOS", subtitle: "MacBook / iMac" },
  ];

  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="app-container fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center px-6 page-fade">
        <div className="flex w-full max-w-[320px] flex-col items-center">
          <h2 className="text-center text-2xl font-bold text-[var(--text-primary)]">
            {t.selectDevice}
          </h2>

          <div className="mt-8 grid w-full grid-cols-2 gap-3">
            {DEVICES.map(({ id, name, subtitle }) => {
              const isDetected = detectedDevice === id;
              const Icon = DEVICE_ICON_MAP[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectDevice(id)}
                  className={`device-card flex w-full min-h-[140px] flex-col items-center justify-center rounded-[var(--radius-card)] px-3 py-5 text-center ${
                    isDetected ? "device-card--detected" : ""
                  }`}
                >
                  <span className="flex items-center justify-center leading-none" style={{ color: isDetected ? "var(--text-on-dark)" : "var(--text-primary)" }} aria-hidden>
                    <Icon size={32} />
                  </span>
                  <span
                    className="mt-2 text-base font-bold"
                    style={{
                      color: isDetected ? "var(--text-on-dark)" : "var(--text-primary)",
                    }}
                  >
                    {name}
                  </span>
                  <span
                    className="mt-0.5 text-xs"
                    style={{
                      color: isDetected ? "rgba(255,255,255,0.5)" : "var(--text-secondary)",
                    }}
                  >
                    {subtitle}
                  </span>

                  {isDetected ? (
                    <span
                      className="mt-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: "rgba(52, 199, 89, 0.18)",
                        color: "#34c759",
                      }}
                    >
                      {t.yourDevice}
                    </span>
                  ) : (
                    <div className={`toggle-track mt-3`}>
                      <div className="toggle-thumb" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-8 border-0 bg-transparent p-2 px-4 text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
            aria-label={t.back}
          >
            {t.backArrow}
          </button>
        </div>
      </div>
    </div>
  );
}
