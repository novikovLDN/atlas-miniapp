"use client";

import type { DeviceType } from "@/lib/detectDevice";

const DEVICES = [
  { id: "ios" as DeviceType, icon: "📱", name: "iOS", subtitle: "iPhone / iPad" },
  { id: "android" as DeviceType, icon: "🤖", name: "Android", subtitle: "Samsung, Xiaomi..." },
  { id: "windows" as DeviceType, icon: "🖥", name: "Windows", subtitle: "ПК / Ноутбук" },
  { id: "macos" as DeviceType, icon: "🍎", name: "macOS", subtitle: "MacBook / iMac" },
];

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
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="app-container fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center px-6 page-fade">
        <div className="flex w-full max-w-[320px] flex-col items-center">
          <h2 className="text-center text-2xl font-bold text-[var(--text-primary)]">
            Выберите устройство
          </h2>

          <div className="mt-8 grid w-full grid-cols-2 gap-3">
            {DEVICES.map(({ id, icon, name, subtitle }) => {
              const isDetected = detectedDevice === id;
              return (
                <div key={id} className="relative flex flex-col items-center">
                  {isDetected && (
                    <span
                      className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: "rgba(52, 199, 89, 0.12)",
                        color: "#2da44e",
                      }}
                    >
                      Ваше устройство
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectDevice(id)}
                    className={`device-card flex w-full min-h-[140px] flex-col items-center justify-center rounded-[var(--radius-card)] px-3 py-5 text-center ${
                      isDetected ? "device-card--detected" : ""
                    }`}
                  >
                    <span className="text-[32px] leading-none" aria-hidden>
                      {icon}
                    </span>
                    <span
                      className="mt-3 text-base font-bold"
                      style={{
                        color: isDetected ? "var(--text-on-dark)" : "var(--text-primary)",
                      }}
                    >
                      {name}
                    </span>
                    <span
                      className="mt-1 text-xs"
                      style={{
                        color: isDetected ? "rgba(255,255,255,0.5)" : "var(--text-secondary)",
                      }}
                    >
                      {subtitle}
                    </span>

                    {/* Toggle (like reference) */}
                    <div className={`toggle-track mt-3 ${isDetected ? "active" : ""}`}>
                      <div className="toggle-thumb" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-8 border-0 bg-transparent p-2 px-4 text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
            aria-label="Назад"
          >
            ← Назад
          </button>
        </div>
      </div>
    </div>
  );
}
