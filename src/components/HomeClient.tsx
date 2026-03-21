"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import WebApp from "@twa-dev/sdk";
import SubscriptionCard from "@/components/SubscriptionCard";
import SupportLinks from "@/components/SupportLinks";

import { detectDevice, type DeviceType } from "@/lib/detectDevice";
import { openTelegramLink } from "@/lib/openTelegramLink";
import { I18nContext, t } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import SetupBanner from "@/components/SetupBanner";

/* Lazy-loaded components (not needed on first render) */
const ShieldHero = lazy(() => import("@/components/ShieldHero"));
const DownloadSection = lazy(() => import("@/components/DownloadSection"));
const TouchRipple = lazy(() => import("@/components/TouchRipple"));
const SetupFlow = lazy(() => import("@/components/SetupFlow"));
const AddDeviceScreen = lazy(() => import("@/components/AddDeviceScreen"));
const ProfileScreen = lazy(() => import("@/components/ProfileScreen"));
const GuideScreen = lazy(() => import("@/components/GuideScreen"));
const DeviceSelector = lazy(() => import("@/components/DeviceSelector"));
const PaymentModal = dynamic(() => import("@/components/PaymentModal"), { ssr: false });

type SubscriptionResponse =
  | {
      is_active: true;
      name: string;
      tariff: "basic" | "plus" | "business";
      expires_at: string;
      expires_formatted: string;
      days_left: number;
      sub_url?: string;
    }
  | { is_active: false; name: string };

type Tab = "home" | "guide" | "profile";

const TAB_INDEX: Record<Tab, number> = { home: 0, guide: 1, profile: 2 };
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
  // Resolve initial tab from Telegram startapp param (before first render)
  // WebApp.initDataUnsafe.start_param works for deep links (t.me/bot/app?startapp=guide)
  // URL query param works for WebAppInfo(url="...?startapp=guide")
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      const startParam =
        WebApp.initDataUnsafe?.start_param ||
        new URLSearchParams(window.location.search).get("startapp");
      if (startParam === "guide") return "guide";
      if (startParam === "profile") return "profile";
    } catch { /* SSR safety */ }
    return "home";
  });
  const [blobAnim, setBlobAnim] = useState<"" | "to-right" | "to-left">("");
  const [showPayment, setShowPayment] = useState(false);

  // Theme state
  const [dark, setDark] = useState(false);

  useEffect(() => {
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

  const openSupport = () => openTelegramLink("https://t.me/Atlas_SupportSecurity");

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

  const i18nValue = { t };

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

  const suspenseFallback = (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg-dark)" }}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-[var(--text-primary)]" />
    </div>
  );

  /* ─── Add device ─── */
  if (view === "add_device" && telegramId !== null) {
    const hasActive = data?.is_active ?? false;
    return (
      <I18nContext.Provider value={i18nValue}>
        {themeToggle}
        <Suspense fallback={suspenseFallback}>
          <AddDeviceScreen
            hasActiveSubscription={hasActive}
            subUrl={
              hasActive ? (data as { sub_url?: string }).sub_url : undefined
            }
            buySubscriptionUrl={buyUrl}
            onBack={() => setView("main")}
            onOpenSupport={openSupport}
          />
        </Suspense>
      </I18nContext.Provider>
    );
  }

  /* ─── Device selector ─── */
  if (view === "device_select") {
    return (
      <I18nContext.Provider value={i18nValue}>
        {themeToggle}
        <Suspense fallback={suspenseFallback}>
          <DeviceSelector
            onSelectDevice={(device) => {
              setSelectedDevice(device);
              setView("setup_manual");
            }}
            onBack={() => setView("main")}
            detectedDevice={deviceType === "unknown" ? undefined : deviceType}
          />
        </Suspense>
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
        <Suspense fallback={suspenseFallback}>
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
        </Suspense>
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
      <Suspense fallback={null}><TouchRipple /></Suspense>
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
              <Suspense fallback={<div style={{ height: 200 }} />}><ShieldHero /></Suspense>
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
                    onOpenPayment={() => setShowPayment(true)}
                  />
                )}

                <div className="mt-4 space-y-3">
                  <Suspense fallback={null}><DownloadSection deviceType={deviceType} /></Suspense>
                  <SupportLinks />
                </div>
              </div>
            </div>

            {/* Guide tab */}
            <div
              style={{
                display: activeTab === "guide" ? "block" : "none",
                animation: activeTab === "guide" ? "tabFadeIn 0.3s ease forwards" : "none",
              }}
            >
              <Suspense fallback={suspenseFallback}>
                <GuideScreen onSetup={() => setView("setup")} />
              </Suspense>
            </div>

            {/* Profile tab */}
            <div
              style={{
                display: activeTab === "profile" ? "block" : "none",
                animation: activeTab === "profile" ? "tabFadeIn 0.3s ease forwards" : "none",
              }}
            >
              {telegramId !== null && (
                <Suspense fallback={suspenseFallback}>
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
                    onOpenPayment={() => setShowPayment(true)}
                  />
                </Suspense>
              )}
            </div>
          </div>

          {/* ─── Setup banner ─── */}
          <SetupBanner onSetup={() => setView("setup")} />

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
                className={`bottom-pill-item ${activeTab === "guide" ? "active" : ""}`}
                onClick={() => switchTab("guide")}
                aria-label={t.tabGuide}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM6 20V4H13V9H18V20H6ZM8 15.01V17H16V15.01H8ZM8 11.01V13H16V11.01H8Z" />
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

        {showPayment && (
          <PaymentModal onClose={() => setShowPayment(false)} />
        )}
      </main>
    </I18nContext.Provider>
  );
}
