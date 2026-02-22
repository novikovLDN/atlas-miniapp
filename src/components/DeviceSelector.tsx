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
    <div
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-6"
      style={{ minHeight: "100vh" }}
    >
      <div className="flex w-full max-w-[320px] flex-col items-center">
        <h2 className="text-center text-2xl font-bold text-white">
          Выберите устройство
        </h2>

        <div className="mt-8 grid w-full grid-cols-2 gap-4">
          {DEVICES.map(({ id, icon, name, subtitle }) => {
            const isDetected = detectedDevice === id;
            return (
              <div key={id} className="relative flex flex-col items-center">
                {isDetected && (
                  <span
                    className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      color: "#22c55e",
                    }}
                  >
                    Ваше устройство
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onSelectDevice(id)}
                  className={`device-card flex w-full min-h-[120px] flex-col items-center justify-center rounded-[20px] px-3 py-5 text-center transition-all duration-200 ease-out hover:scale-[0.98] active:scale-[0.98] ${
                    isDetected ? "device-card--detected" : ""
                  }`}
                >
                  <span className="text-[36px] leading-none" aria-hidden>
                    {icon}
                  </span>
                  <span
                    className="mt-2 text-base font-bold text-white"
                    style={{ fontSize: 16 }}
                  >
                    {name}
                  </span>
                  <span
                    className="mt-1 text-xs"
                    style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}
                  >
                    {subtitle}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-8 border-0 bg-transparent p-2 px-4 text-sm"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}
          aria-label="Назад"
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}
