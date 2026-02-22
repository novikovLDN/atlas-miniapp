"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import ShieldHero from "@/components/ShieldHero";
import SubscriptionCard from "@/components/SubscriptionCard";
import SetupFlow from "@/components/SetupFlow";
import DownloadSection from "@/components/DownloadSection";
import SupportLinks from "@/components/SupportLinks";
import { detectDevice, type DeviceType } from "@/lib/detectDevice";
import DeviceSelector from "@/components/DeviceSelector";

type SubscriptionResponse =
  | {
      is_active: true;
      name: string;
      tariff: "basic" | "plus";
      expires_at: string;
      expires_formatted: string;
      days_left: number;
      vpn_key: string;
      vpn_key_plus: string | null;
      sub_url?: string;
    }
  | { is_active: false; name: string };

export default function HomeClient() {
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [telegramId, setTelegramId] = useState<number | null>(null);
  const [deviceType, setDeviceType] = useState<ReturnType<typeof detectDevice>>("unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type ViewState = "main" | "setup" | "device_select" | "setup_manual";
  const [view, setView] = useState<ViewState>("main");
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("ios");

  useEffect(() => {
    setDeviceType(detectDevice());
  }, []);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    const user = WebApp.initDataUnsafe?.user;
    const userId = user?.id;
    const initData = WebApp.initData;

    if (!userId || !initData) {
      setError("Откройте приложение из Telegram.");
      setLoading(false);
      return;
    }

    setTelegramId(userId);

    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/subscription?telegram_id=${userId}`, {
      headers: { "x-telegram-init-data": initData },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Не авторизован" : "Ошибка загрузки");
        return res.json();
      })
      .then((json: SubscriptionResponse) => {
        setData(json);
        setError(null);
        if (json && "sub_url" in json && json.sub_url) {
          console.log("sub_url:", json.sub_url);
        }
      })
      .catch((err) => {
        setError(err.message || "Ошибка загрузки подписки");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const buyUrl =
    process.env.NEXT_PUBLIC_BOT_DEEP_LINK ||
    "https://t.me/your_bot";

  const openSupport = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } };
    const tg = w.Telegram?.WebApp;
    if (tg && typeof tg.openTelegramLink === "function") {
      tg.openTelegramLink("https://t.me/asc_support");
    } else {
      window.open("https://t.me/asc_support", "_blank");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] p-6">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-[var(--text-secondary)]">Загрузка…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] p-6">
        <p className="text-center text-[var(--text-primary)]">{error}</p>
        <a
          href={buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[var(--radius-button)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
        >
          Открыть бота
        </a>
      </main>
    );
  }

  if (view === "device_select") {
    return (
      <DeviceSelector
        onSelectDevice={(device) => {
          setSelectedDevice(device);
          setView("setup_manual");
        }}
        onBack={() => setView("main")}
        detectedDevice={deviceType === "unknown" ? undefined : deviceType}
      />
    );
  }

  if ((view === "setup" || view === "setup_manual") && telegramId !== null) {
    const setupDeviceType = view === "setup_manual" ? selectedDevice : deviceType;
    return (
      <SetupFlow
        telegramId={telegramId}
        onClose={() => setView("main")}
        vpnKey={data?.is_active ? data.vpn_key : ""}
        vpnKeyPlus={data?.is_active ? data.vpn_key_plus ?? null : null}
        tariff={data?.is_active ? data.tariff : "basic"}
        subUrl={data?.is_active ? (data as { sub_url?: string }).sub_url : undefined}
        deviceType={setupDeviceType}
        onSelectOtherDevice={() => setView("device_select")}
        onBackFromStep1={view === "setup_manual" ? () => setView("device_select") : undefined}
      />
    );
  }

  const name = data?.name ?? "Пользователь";
  const isActive = data?.is_active ?? false;

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <ShieldHero />
      <div className="flex-1 min-h-0 overflow-auto px-4">
        {telegramId !== null && (
          <SubscriptionCard
            telegramId={telegramId}
            name={name}
            isActive={isActive}
            tariff={data?.is_active ? data.tariff : undefined}
            expiresFormatted={data?.is_active ? data.expires_formatted : undefined}
            daysLeft={data?.is_active ? data.days_left : undefined}
            buySubscriptionUrl={buyUrl}
            vpnKey={data?.is_active ? data.vpn_key : undefined}
            vpnKeyPlus={data?.is_active ? data.vpn_key_plus : undefined}
            subUrl={data?.is_active ? (data as { sub_url?: string }).sub_url : undefined}
            onOpenSetup={() => setView("setup")}
            onOpenSupport={openSupport}
          />
        )}
        <div className="py-6 space-y-6">
          <DownloadSection deviceType={deviceType} />
          <SupportLinks />
        </div>
      </div>
    </main>
  );
}
