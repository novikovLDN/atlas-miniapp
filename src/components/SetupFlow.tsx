"use client";

import { useState, useEffect } from "react";
import { openDeepLink } from "@/lib/openDeepLink";
import { detectDevice, type DeviceType } from "@/lib/detectDevice";
import { useI18n } from "@/lib/i18n";
import { CLIENT_APPS, type ClientApp } from "@/lib/clientApps";
import { DEVICE_ICON_MAP } from "@/components/DeviceIcons";

type SetupFlowProps = {
  telegramId: number;
  onClose: () => void;
  tariff: "basic" | "plus" | "business";
  subUrl?: string;
  deviceType?: DeviceType;
  onSelectOtherDevice?: () => void;
  onBackFromStep1?: () => void;
};

type TvIcon = React.FC<{ size?: number }>;

const TvDeviceIcon: TvIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="3" y="4" width="26" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 24h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 20v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

type ViewState = "devices" | "clients" | "instructions";

export default function SetupFlow({
  onClose,
  tariff,
  subUrl,
  deviceType: deviceTypeProp,
}: SetupFlowProps) {
  const { t } = useI18n();
  const [deviceType, setDeviceType] = useState<DeviceType>(
    deviceTypeProp ?? "unknown"
  );
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | "tv" | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientApp | null>(null);
  const [view, setView] = useState<ViewState>("devices");
  const [copied, setCopied] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (deviceTypeProp) setDeviceType(deviceTypeProp);
    else setDeviceType(detectDevice());
  }, [deviceTypeProp]);

  // Generate QR code when expanded
  useEffect(() => {
    if (!qrExpanded || !subUrl || qrDataUrl) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(subUrl, {
        width: 240,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      }).then(setQrDataUrl);
    });
  }, [qrExpanded, subUrl, qrDataUrl]);

  const copySubUrl = () => {
    if (!subUrl) return;
    navigator.clipboard.writeText(subUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAutoSetup = () => {
    if (!selectedClient || !subUrl) return;
    if (selectedClient.deeplink) {
      openDeepLink(selectedClient.deeplink(subUrl));
    }
  };

  const handleShareSubscription = () => {
    if (!subUrl) return;
    if (navigator.share) {
      navigator.share({ text: subUrl });
    } else {
      copySubUrl();
    }
  };

  const handleSelectDevice = (device: DeviceType | "tv") => {
    setSelectedDevice(device);
    // TV maps to android client list
    const actualDevice = device === "tv" ? "android" : device;
    const clients = CLIENT_APPS[actualDevice];
    if (clients.length === 1) {
      setSelectedClient(clients[0]);
      setView("instructions");
    } else {
      setView("clients");
    }
  };

  const handleSelectClient = (client: ClientApp) => {
    setSelectedClient(client);
    setView("instructions");
  };

  const handleBack = () => {
    if (view === "instructions") {
      const actualDevice = selectedDevice === "tv" ? "android" : (selectedDevice ?? deviceType);
      const clients = CLIENT_APPS[actualDevice];
      if (clients.length > 1) {
        setSelectedClient(null);
        setView("clients");
      } else {
        setSelectedDevice(null);
        setView("devices");
      }
    } else if (view === "clients") {
      setSelectedDevice(null);
      setView("devices");
    } else {
      onClose();
    }
  };

  const DEVICES: { id: DeviceType | "tv"; label: string; Icon: React.FC<{ size?: number }> }[] = [
    { id: "android", label: "Android", Icon: DEVICE_ICON_MAP.android },
    { id: "ios", label: "iPhone / iPad", Icon: DEVICE_ICON_MAP.ios },
    { id: "windows", label: "Windows", Icon: DEVICE_ICON_MAP.windows },
    { id: "macos", label: "macOS", Icon: DEVICE_ICON_MAP.macos },
    { id: "tv", label: t.androidTv, Icon: TvDeviceIcon },
  ];

  const actualDeviceForClients = selectedDevice === "tv" ? "android" : (selectedDevice ?? deviceType);
  const availableClients = CLIENT_APPS[actualDeviceForClients] ?? CLIENT_APPS.unknown;

  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="app-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 bg-transparent border-none text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t.back}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center bg-transparent border-none"
            style={{ color: "var(--text-secondary)" }}
            aria-label={t.close}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18.5 5.5 12 12m0 0L5.5 18.5M12 12l6.5 6.5M12 12 5.5 5.5" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* ─── Device selection ─── */}
          {view === "devices" && (
            <div>
              <h1 className="text-2xl font-bold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>
                {t.deviceSelectTitle}
              </h1>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                {t.deviceSelectSubtitle}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {DEVICES.slice(0, 4).map(({ id, label, Icon }) => {
                  const isDetected = id === deviceType;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectDevice(id)}
                      className="setup-device-btn"
                      style={{
                        background: isDetected ? "var(--bg-card-active)" : "var(--bg-card)",
                        color: isDetected ? "var(--text-on-dark)" : "var(--text-primary)",
                        borderColor: isDetected ? "var(--accent-blue)" : "transparent",
                      }}
                    >
                      <Icon size={24} />
                      <span className="font-semibold text-[15px]">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Android TV - full width */}
              {(() => {
                const tv = DEVICES[4];
                return (
                  <button
                    type="button"
                    onClick={() => handleSelectDevice(tv.id)}
                    className="setup-device-btn mt-3 w-full"
                    style={{
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <tv.Icon size={24} />
                    <span className="font-semibold text-[15px]">{tv.label}</span>
                  </button>
                );
              })()}

              {/* Share subscription button */}
              <button
                type="button"
                onClick={handleShareSubscription}
                className="setup-share-btn mt-5 w-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {t.shareSubscription}
              </button>

              {/* Device limit info */}
              <div className="setup-info-card mt-4">
                <div className="setup-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12" y2="18.01" />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {t.tariffDeviceLimit}
                </p>
              </div>

              {/* Help button */}
              <button
                type="button"
                onClick={onClose}
                className="setup-help-btn mt-3 w-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Нужна помощь?
              </button>
            </div>
          )}

          {/* ─── Client app selection ─── */}
          {view === "clients" && (
            <div>
              <h1 className="text-2xl font-bold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>
                {t.deviceSelectTitle}
              </h1>

              {/* Device buttons row (show which device is selected) */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {DEVICES.slice(0, 4).map(({ id, label, Icon }) => {
                  const isSelected = id === selectedDevice;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectDevice(id)}
                      className="setup-device-btn"
                      style={{
                        background: isSelected ? "var(--bg-card-active)" : "var(--bg-card)",
                        color: isSelected ? "var(--text-on-dark)" : "var(--text-primary)",
                        borderColor: isSelected ? "var(--accent-blue)" : "transparent",
                      }}
                    >
                      <Icon size={24} />
                      <span className="font-semibold text-[15px]">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TV row */}
              {(() => {
                const tv = DEVICES[4];
                const isSelected = selectedDevice === "tv";
                return (
                  <button
                    type="button"
                    onClick={() => handleSelectDevice(tv.id)}
                    className="setup-device-btn w-full mb-5"
                    style={{
                      background: isSelected ? "var(--bg-card-active)" : "var(--bg-card)",
                      color: isSelected ? "var(--text-on-dark)" : "var(--text-primary)",
                      borderColor: isSelected ? "var(--accent-blue)" : "transparent",
                    }}
                  >
                    <tv.Icon size={24} />
                    <span className="font-semibold text-[15px]">{tv.label}</span>
                  </button>
                );
              })()}

              {/* Client apps */}
              <div className="glass-card p-4">
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                  {t.chooseClientApp}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="setup-client-chip"
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Share, info, help */}
              <button
                type="button"
                onClick={handleShareSubscription}
                className="setup-share-btn mt-5 w-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {t.shareSubscription}
              </button>

              <div className="setup-info-card mt-4">
                <div className="setup-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12" y2="18.01" />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {t.tariffDeviceLimit}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="setup-help-btn mt-3 w-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Нужна помощь?
              </button>
            </div>
          )}

          {/* ─── Instructions view ─── */}
          {view === "instructions" && selectedClient && (
            <div>
              <h1 className="text-2xl font-bold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>
                {t.deviceSelectTitle}
              </h1>

              {/* Device buttons row (compact) */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {DEVICES.slice(0, 4).map(({ id, label, Icon }) => {
                  const isSelected = id === selectedDevice;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectDevice(id)}
                      className="setup-device-btn"
                      style={{
                        background: isSelected ? "var(--bg-card-active)" : "var(--bg-card)",
                        color: isSelected ? "var(--text-on-dark)" : "var(--text-primary)",
                        borderColor: isSelected ? "var(--accent-blue)" : "transparent",
                      }}
                    >
                      <Icon size={24} />
                      <span className="font-semibold text-[15px]">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TV row */}
              {(() => {
                const tv = DEVICES[4];
                const isSelected = selectedDevice === "tv";
                return (
                  <button
                    type="button"
                    onClick={() => handleSelectDevice(tv.id)}
                    className="setup-device-btn w-full mb-4"
                    style={{
                      background: isSelected ? "var(--bg-card-active)" : "var(--bg-card)",
                      color: isSelected ? "var(--text-on-dark)" : "var(--text-primary)",
                      borderColor: isSelected ? "var(--accent-blue)" : "transparent",
                    }}
                  >
                    <tv.Icon size={24} />
                    <span className="font-semibold text-[15px]">{tv.label}</span>
                  </button>
                );
              })()}

              {/* Client chips */}
              <div className="glass-card p-4 mb-4">
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                  {t.chooseClientApp}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableClients.map((client) => {
                    const isSelected = client.id === selectedClient.id;
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="setup-client-chip"
                        style={isSelected ? {
                          background: "transparent",
                          color: "var(--accent-blue)",
                          borderColor: "var(--accent-blue)",
                        } : undefined}
                      >
                        {client.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instruction card */}
              <div className="glass-card p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                      {selectedClient.name}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {selectedClient.subtitle}
                    </p>
                  </div>
                  <a
                    href={selectedClient.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold no-underline"
                    style={{ color: "var(--accent-blue)" }}
                  >
                    {selectedClient.storeLabel}
                  </a>
                </div>

                {/* Steps */}
                <ol className="setup-steps">
                  {selectedClient.steps.map((stepText, i) => (
                    <li key={i}>
                      <div className="setup-step-number">{i + 1}</div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {stepText}
                      </p>

                      {/* Download button after step 1 */}
                      {i === 0 && (
                        <a
                          href={selectedClient.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="setup-download-btn mt-3"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {t.downloadClient(selectedClient.name)}
                        </a>
                      )}

                      {/* Auto setup + copy key after step 2 */}
                      {i === 1 && (
                        <div className="mt-3 space-y-2">
                          {selectedClient.deeplink && (
                            <button
                              type="button"
                              onClick={handleAutoSetup}
                              disabled={!subUrl}
                              className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                              {t.setupAutomatically}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={copySubUrl}
                            disabled={!subUrl}
                            className="setup-secondary-action w-full disabled:opacity-50"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                            {copied ? t.copied : t.copyKeyManually}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>

                {/* QR code section */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setQrExpanded(!qrExpanded)}
                    className="setup-secondary-action w-full"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="3" height="3" />
                      <path d="M21 14h-3v3" />
                      <path d="M21 21h-3v-3" />
                    </svg>
                    {qrExpanded ? t.hideQrCode : t.addOtherDeviceByQR}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ marginLeft: "auto", transform: qrExpanded ? "rotate(180deg)" : "none" }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {qrExpanded && subUrl && (
                    <div className="mt-3 rounded-[var(--radius-card)] p-4" style={{ background: "var(--bg-card)" }}>
                      <p className="text-xs text-center mb-3" style={{ color: "var(--text-secondary)" }}>
                        {t.scanQrToImport}
                      </p>
                      {qrDataUrl && (
                        <div className="flex justify-center mb-3">
                          <img
                            src={qrDataUrl}
                            alt="QR"
                            width={200}
                            height={200}
                            className="rounded-xl"
                          />
                        </div>
                      )}
                      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                        {t.scanQrHint}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Share subscription */}
              <button
                type="button"
                onClick={handleShareSubscription}
                className="setup-share-btn w-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {t.shareSubscription}
              </button>

              {/* Device limit info */}
              <div className="setup-info-card mt-4">
                <div className="setup-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12" y2="18.01" />
                  </svg>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {t.tariffDeviceLimit}
                </p>
              </div>

              {/* Help */}
              <button
                type="button"
                onClick={onClose}
                className="setup-help-btn mt-3 w-full"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Нужна помощь?
              </button>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="flex-shrink-0 py-3 px-5 text-center">
          <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>Все услуги и тарифы</span>
            <span>Условия предоставления услуг</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <span>Политика конфиденциальности</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)", opacity: 0.5 }}>Atlas Secure Service</p>
        </div>
      </div>
    </div>
  );
}
