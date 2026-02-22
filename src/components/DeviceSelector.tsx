"use client";

import type { DeviceType } from "@/lib/detectDevice";
import { APP_LINKS } from "@/lib/detectDevice";

const DEVICES: { type: DeviceType; label: string; icon: string }[] = [
  { type: "ios", label: "iOS", icon: "📱" },
  { type: "android", label: "Android", icon: "🤖" },
  { type: "windows", label: "Windows", icon: "🖥" },
  { type: "macos", label: "macOS", icon: "🍎" },
];

type DeviceSelectorProps = {
  onSelectDevice: (device: DeviceType) => void;
  onBack: () => void;
};

export default function DeviceSelector({ onSelectDevice, onBack }: DeviceSelectorProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[var(--bg-primary)] p-6"
      style={{ minHeight: "100vh" }}
    >
      <div className="flex w-full max-w-[320px] flex-col items-center">
        <h2 className="text-center text-2xl font-bold text-white">
          Выберите устройство
        </h2>

        <div className="mt-8 grid w-full max-w-[280px] grid-cols-2 gap-4">
          {DEVICES.map(({ type, label, icon }) => {
            const info = APP_LINKS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectDevice(type)}
                className="glass-card flex h-[120px] min-h-[120px] flex-col items-center justify-center gap-2 transition-all hover:border-[var(--accent-cyan)]"
              >
                <span className="text-3xl" aria-hidden>
                  {icon}
                </span>
                <span className="font-medium text-[var(--text-primary)]">{label}</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {info.name}
                </span>
              </button>
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
