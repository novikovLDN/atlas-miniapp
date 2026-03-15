"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import ShieldHero from "@/components/ShieldHero";
import SubscriptionCard from "@/components/SubscriptionCard";
import SetupFlow from "@/components/SetupFlow";
import DownloadSection from "@/components/DownloadSection";
import SupportLinks from "@/components/SupportLinks";
import AddDeviceScreen from "@/components/AddDeviceScreen";
import ProfileScreen from "@/components/ProfileScreen";

import { detectDevice, type DeviceType } from "@/lib/detectDevice";
import { openTelegramLink } from "@/lib/openTelegramLink";
import DeviceSelector from "@/components/DeviceSelector";
import {
  I18nContext,
  getSavedLocale,
  saveLocale,
  getTranslations,
  type Locale,
} from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";

type SubscriptionResponse =
  | {
      is_active: true;
      name: string;
      tariff: "basic" | "plus";
      expires_at: string;
      expires_formatted: string;
      days_left: number;
      sub_url?: string;
    }
  | { is_active: false; name: string };

type Tab = "home" | "profile";

const TAB_INDEX: Record<Tab, number> = { home: 0, profile: 1 };
const BLOB_STEP = 52; // 48px item + 4px gap

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
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [blobAnim, setBlobAnim] = useState<"" | "to-right" | "to-left">("");

  // i18n state
  const [locale, setLocaleState] = useState<Locale>("ru");
  const t = getTranslations(locale);

  // Theme state
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setLocaleState(getSavedLocale());
    const saved = localStorage.getItem("atlas_theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("atlas_theme", next ? "dark" : "light");
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocale(newLocale);
    document.documentElement.lang = newLocale;
  };

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    const dir = TAB_INDEX[tab] > TAB_INDEX[activeTab] ? "to-right" : "to-left";
    setBlobAnim(dir);
    setActiveTab(tab);
    setTimeout(() => setBlobAnim(""), 400);
  };

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
      setError("no_telegram");
      setLoading(false);
      return;
    }

    setTelegramId(userId);

    fetch(`/api/subscription?telegram_id=${userId}`, {
      headers: { "x-telegram-init-data": initData },
    })
      .then((res) => {
        if (!res.ok)
          throw new Error(
            res.status === 401 ? "unauthorized" : "load_error"
          );
        return res.json();
      })
      .then((json: SubscriptionResponse) => {
        setData(json);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "subscription_error");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const buyUrl =
    process.env.NEXT_PUBLIC_BOT_DEEP_LINK || "https://t.me/atlassecure_bot?start=buy";

  const openSupport = () => openTelegramLink("https://t.me/asc_support");

  const getErrorMessage = (err: string) => {
    switch (err) {
      case "no_telegram": return t.openFromTelegram;
      case "unauthorized": return t.unauthorized;
      case "load_error": return t.loadError;
      case "subscription_error": return t.subscriptionLoadError;
      default: return err;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return `${d.getDate()} ${t.months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const i18nValue = { locale, t, setLocale: handleSetLocale };

  const themeToggle = <ThemeToggle dark={dark} onToggle={toggleTheme} />;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <I18nContext.Provider value={i18nValue}>
        {themeToggle}
        <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg-dark)" }}>
          <div className="app-container flex min-h-screen w-full flex-col items-center justify-center gap-4">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-[var(--text-primary)]"
              aria-hidden
            />
            <p className="text-sm text-[var(--text-secondary)]">{t.loading}</p>
          </div>
        </main>
      </I18nContext.Provider>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <I18nContext.Provider value={i18nValue}>
        {themeToggle}
        <main style={{ background: "var(--bg-dark)" }}>
          <div className="app-container flex min-h-screen flex-col items-center justify-center gap-5 px-8 page-enter">
            <p className="text-center text-lg font-bold text-[var(--text-primary)]">
              {getErrorMessage(error)}
            </p>
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button max-w-[240px] text-center no-underline"
            >
              {t.openBot}
            </a>
          </div>
        </main>
      </I18nContext.Provider>
    );
  }

  /* ─── Add device ─── */
  if (view === "add_device" && telegramId !== null) {
    const hasActive = data?.is_active ?? false;
    return (
      <I18nContext.Provider value={i18nValue}>
        {themeToggle}
        <AddDeviceScreen
          hasActiveSubscription={hasActive}
          subUrl={
            hasActive ? (data as { sub_url?: string }).sub_url : undefined
          }
          buySubscriptionUrl={buyUrl}
          onBack={() => setView("main")}
          onOpenSupport={openSupport}
        />
      </I18nContext.Provider>
    );
  }

  /* ─── Device selector ─── */
  if (view === "device_select") {
    return (
      <I18nContext.Provider value={i18nValue}>
        {themeToggle}
        <DeviceSelector
          onSelectDevice={(device) => {
            setSelectedDevice(device);
            setView("setup_manual");
          }}
          onBack={() => setView("main")}
          detectedDevice={deviceType === "unknown" ? undefined : deviceType}
        />
      </I18nContext.Provider>
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
      <I18nContext.Provider value={i18nValue}>
        {themeToggle}
        <SetupFlow
          telegramId={telegramId}
          onClose={() => setView("main")}
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
      </I18nContext.Provider>
    );
  }

  /* ─── Main view (with tabs) ─── */
  const name = data?.name ?? t.user;
  const isActive = data?.is_active ?? false;
  const blobX = TAB_INDEX[activeTab] * BLOB_STEP;

  return (
    <I18nContext.Provider value={i18nValue}>
      {themeToggle}
      <main style={{ background: "var(--bg-dark)", height: "100vh", overflow: "hidden" }}>
        <div
          className="app-container"
          style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          {/* ─── Tab content (scrollable area) ─── */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Home tab */}
            <div
              style={{
                display: activeTab === "home" ? "block" : "none",
                animation: activeTab === "home" ? "tabFadeIn 0.3s ease forwards" : "none",
              }}
            >
              <ShieldHero />
              <div className="px-5 pb-4">
                {telegramId !== null && (
                  <SubscriptionCard
                    name={name}
                    isActive={isActive}
                    tariff={data?.is_active ? data.tariff : undefined}
                    expiresFormatted={
                      data?.is_active ? formatDate(data.expires_at) : undefined
                    }
                    daysLeft={data?.is_active ? data.days_left : undefined}
                    buySubscriptionUrl={buyUrl}
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

                <div className="mt-4 space-y-3">
                  <DownloadSection deviceType={deviceType} />
                  <SupportLinks />
                </div>
              </div>
            </div>

            {/* Profile tab */}
            <div
              style={{
                display: activeTab === "profile" ? "block" : "none",
                animation: activeTab === "profile" ? "tabFadeIn 0.3s ease forwards" : "none",
              }}
            >
              {telegramId !== null && (
                <ProfileScreen
                  name={name}
                  telegramId={telegramId}
                  isActive={isActive}
                  tariff={data?.is_active ? data.tariff : undefined}
                  expiresFormatted={
                    data?.is_active ? formatDate(data.expires_at) : undefined
                  }
                  daysLeft={data?.is_active ? data.days_left : undefined}
                  subUrl={
                    data?.is_active
                      ? (data as { sub_url?: string }).sub_url
                      : undefined
                  }
                  buyUrl={buyUrl}
                  onOpenSupport={openSupport}
                />
              )}
            </div>
          </div>

          {/* ─── Bottom bar ─── */}
          <div
            className="flex-shrink-0 flex justify-center pb-4 pt-2"
            style={{ background: "var(--bg-container)" }}
          >
            <div className="bottom-pill">
              {/* Liquid blob indicator */}
              <div
                className={`bottom-pill-blob ${blobAnim}`}
                style={{ "--blob-target": `${blobX}px` } as React.CSSProperties}
              />
              <button
                type="button"
                className={`bottom-pill-item ${activeTab === "home" ? "active" : ""}`}
                onClick={() => switchTab("home")}
                aria-label={t.tabHome}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 12.5L12 3.5L21 12.5H18V20.5H14V14.5H10V20.5H6V12.5H3Z" />
                </svg>
              </button>
<button
                type="button"
                className={`bottom-pill-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => switchTab("profile")}
                aria-label={t.tabProfile}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </I18nContext.Provider>
  );
}
