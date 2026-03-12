"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import ShieldHero from "@/components/ShieldHero";
import SubscriptionCard from "@/components/SubscriptionCard";
import SetupFlow from "@/components/SetupFlow";
import DownloadSection from "@/components/DownloadSection";
import SupportLinks from "@/components/SupportLinks";
import AddDeviceScreen from "@/components/AddDeviceScreen";
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
  const [deviceType, setDeviceType] =
    useState<ReturnType<typeof detectDevice>>("unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type ViewState =
    | "main"
    | "setup"
    | "device_select"
    | "setup_manual"
    | "add_device";
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

    const base =
      typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/subscription?telegram_id=${userId}`, {
      headers: { "x-telegram-init-data": initData },
    })
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 401 ? "Не авторизован" : "Ошибка загрузки"
          );
        return res.json();
      })
      .then((json: SubscriptionResponse) => {
        setData(json);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Ошибка загрузки подписки");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const buyUrl =
    process.env.NEXT_PUBLIC_BOT_DEEP_LINK || "https://t.me/your_bot";

  const openSupport = () => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      Telegram?: {
        WebApp?: { openTelegramLink?: (u: string) => void };
      };
    };
    const tg = w.Telegram?.WebApp;
    if (tg && typeof tg.openTelegramLink === "function") {
      tg.openTelegramLink("https://t.me/asc_support");
    } else {
      window.open("https://t.me/asc_support", "_blank");
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg-dark)" }}>
        <div className="app-container flex min-h-screen w-full flex-col items-center justify-center gap-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-[var(--text-primary)]"
            aria-hidden
          />
          <p className="text-sm text-[var(--text-secondary)]">Загрузка…</p>
        </div>
      </main>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <main style={{ background: "var(--bg-dark)" }}>
        <div className="app-container flex min-h-screen flex-col items-center justify-center gap-5 px-8 page-enter">
          <p className="text-center text-lg font-bold text-[var(--text-primary)]">
            {error}
          </p>
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-button max-w-[240px] text-center no-underline"
          >
            Открыть бота
          </a>
        </div>
      </main>
    );
  }

  /* ─── Add device ─── */
  if (view === "add_device" && telegramId !== null) {
    const hasActive = data?.is_active ?? false;
    return (
      <AddDeviceScreen
        telegramId={telegramId}
        hasActiveSubscription={hasActive}
        subUrl={
          hasActive ? (data as { sub_url?: string }).sub_url : undefined
        }
        buySubscriptionUrl={buyUrl}
        onBack={() => setView("main")}
        onOpenSupport={openSupport}
      />
    );
  }

  /* ─── Device selector ─── */
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

  /* ─── Setup flow ─── */
  if (
    (view === "setup" || view === "setup_manual") &&
    telegramId !== null
  ) {
    const setupDeviceType =
      view === "setup_manual" ? selectedDevice : deviceType;
    return (
      <SetupFlow
        telegramId={telegramId}
        onClose={() => setView("main")}
        vpnKey={data?.is_active ? data.vpn_key : ""}
        vpnKeyPlus={data?.is_active ? (data.vpn_key_plus ?? null) : null}
        tariff={data?.is_active ? data.tariff : "basic"}
        subUrl={
          data?.is_active
            ? (data as { sub_url?: string }).sub_url
            : undefined
        }
        deviceType={setupDeviceType}
        onSelectOtherDevice={() => setView("device_select")}
        onBackFromStep1={
          view === "setup_manual"
            ? () => setView("device_select")
            : undefined
        }
      />
    );
  }

  /* ─── Main view ─── */
  const name = data?.name ?? "Пользователь";
  const isActive = data?.is_active ?? false;

  return (
    <main style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="app-container page-enter" style={{ minHeight: "100vh" }}>
        <ShieldHero />

        <div className="px-5 pb-8">
          {telegramId !== null && (
            <SubscriptionCard
              telegramId={telegramId}
              name={name}
              isActive={isActive}
              tariff={data?.is_active ? data.tariff : undefined}
              expiresFormatted={
                data?.is_active ? data.expires_formatted : undefined
              }
              daysLeft={data?.is_active ? data.days_left : undefined}
              buySubscriptionUrl={buyUrl}
              vpnKey={data?.is_active ? data.vpn_key : undefined}
              vpnKeyPlus={data?.is_active ? data.vpn_key_plus : undefined}
              subUrl={
                data?.is_active
                  ? (data as { sub_url?: string }).sub_url
                  : undefined
              }
              onOpenSetup={() => setView("setup")}
              onOpenSupport={openSupport}
              onOpenAddDevice={() => setView("add_device")}
            />
          )}

          <div className="mt-5 space-y-4">
            <DownloadSection deviceType={deviceType} />
            <SupportLinks />
          </div>
        </div>

        {/* Bottom pill navigation (decorative, like reference) */}
        <div className="sticky bottom-0 flex justify-center pb-6 pt-2" style={{ background: "linear-gradient(transparent, var(--bg-container) 30%)" }}>
          <div className="bottom-pill">
            <div className="bottom-pill-item active">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12.5L12 3.5L21 12.5H18V20.5H14V14.5H10V20.5H6V12.5H3Z"/>
              </svg>
            </div>
            <div className="bottom-pill-item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3H10V10H3V3ZM14 3H21V10H14V3ZM14 14H21V21H14V14ZM3 14H10V21H3V14Z" opacity="0.85"/>
              </svg>
            </div>
            <div className="bottom-pill-item">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
