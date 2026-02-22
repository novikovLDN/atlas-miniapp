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
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-primary)]">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full glass-button-secondary w-10 p-0"
          aria-label="Назад"
        >
          ←
        </button>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
          Установить на другом устройстве
        </h2>
        <p className="mb-8 max-w-xs text-center text-sm text-[var(--text-secondary)]">
          Выберите устройство для настройки
        </p>

        <div className="grid w-full max-w-sm grid-cols-2 gap-4">
          {DEVICES.map(({ type, label, icon }) => {
            const info = APP_LINKS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSelectDevice(type)}
                className="glass-card flex flex-col items-center justify-center gap-3 p-6 text-[var(--text-primary)] transition-all hover:border-[var(--accent-cyan)]"
              >
                <span className="text-4xl" aria-hidden>
                  {icon}
                </span>
                <span className="font-medium">{label}</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {info.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
