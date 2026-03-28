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

const TvDeviceIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="3" y="4" width="26" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 24h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 20v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

type ViewState = "devices" | "clients" | "instructions";

const DEVICES: { id: DeviceType | "tv"; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "android", label: "Android", Icon: DEVICE_ICON_MAP.android },
  { id: "ios", label: "iPhone / iPad", Icon: DEVICE_ICON_MAP.ios },
  { id: "windows", label: "Windows", Icon: DEVICE_ICON_MAP.windows },
  { id: "macos", label: "macOS", Icon: DEVICE_ICON_MAP.macos },
  { id: "tv", label: "Android/Google TV", Icon: TvDeviceIcon },
];

export default function SetupFlow({
  onClose,
  subUrl,
  deviceType: deviceTypeProp,
}: SetupFlowProps) {
  const { t } = useI18n();
  const [deviceType, setDeviceType] = useState<DeviceType>(deviceTypeProp ?? "unknown");
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
    if (!selectedClient?.deeplink || !subUrl) return;
    openDeepLink(selectedClient.deeplink(subUrl));
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
    const actualDevice = device === "tv" ? "android" : device;
    const clients = CLIENT_APPS[actualDevice];
    if (clients.length === 1) {
      setSelectedClient(clients[0]);
      setView("instructions");
    } else {
      setSelectedClient(null);
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

  const actualDeviceForClients = selectedDevice === "tv" ? "android" : (selectedDevice ?? deviceType);
  const availableClients = CLIENT_APPS[actualDeviceForClients] ?? CLIENT_APPS.unknown;

  /* ── Reusable device grid ── */
  const renderDeviceGrid = (highlightKey: "detected" | "selected") => {
    const activeId = highlightKey === "detected" ? deviceType : selectedDevice;
    return (
      <>
        <div className="grid grid-cols-2 gap-2.5">
          {DEVICES.slice(0, 4).map(({ id, label, Icon }) => {
            const isActive = id === activeId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSelectDevice(id)}
                className="setup-device-btn"
                data-active={isActive || undefined}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => handleSelectDevice("tv")}
          className="setup-device-btn w-full mt-2.5"
          data-active={(activeId === "tv") || undefined}
        >
          <TvDeviceIcon size={20} />
          <span>{DEVICES[4].label}</span>
        </button>
      </>
    );
  };

  /* ── Reusable bottom section ── */
  const renderBottomSection = () => (
    <>
      <button
        type="button"
        onClick={handleShareSubscription}
        className="setup-action-btn mt-5 w-full"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {t.shareSubscription}
      </button>

      <div className="setup-info-card mt-3">
        <div className="setup-info-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        className="setup-action-btn mt-2.5 w-full"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Нужна помощь?
      </button>
    </>
  );

  /* ── Client chips ── */
  const renderClientChips = () => (
    <div className="glass-card p-4">
      <p className="text-[13px] mb-3" style={{ color: "var(--text-secondary)" }}>
        {t.chooseClientApp}
      </p>
      <div className="flex flex-wrap gap-2">
        {availableClients.map((client) => {
          const isActive = selectedClient?.id === client.id;
          return (
            <button
              key={client.id}
              type="button"
              onClick={() => handleSelectClient(client)}
              className="setup-client-chip"
              data-active={isActive || undefined}
            >
              {client.name}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div
        className="app-container"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "visible" }}
      >
        {/* Header */}
        <div className="setup-header">
          <button type="button" onClick={handleBack} className="setup-back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t.back}
          </button>
          <button type="button" onClick={onClose} className="setup-notify-btn" aria-label={t.close}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ WebkitOverflowScrolling: "touch" }}>

          {/* Title */}
          <h1 className="text-[22px] font-bold mt-1 mb-1" style={{ color: "var(--text-primary)" }}>
            {t.deviceSelectTitle}
          </h1>

          {view === "devices" && (
            <p className="text-[13px] mb-4" style={{ color: "var(--text-secondary)" }}>
              {t.deviceSelectSubtitle}
            </p>
          )}

          {/* Device grid (always visible) */}
          {renderDeviceGrid(view === "devices" ? "detected" : "selected")}

          {/* Client chips (visible on clients + instructions views) */}
          {(view === "clients" || view === "instructions") && (
            <div className="mt-3">
              {renderClientChips()}
            </div>
          )}

          {/* Instruction card */}
          {view === "instructions" && selectedClient && (
            <div className="glass-card p-4 mt-3">
              {/* Client header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedClient.name}
                  </h3>
                  <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                    {selectedClient.subtitle}
                  </p>
                </div>
                <a
                  href={selectedClient.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold no-underline"
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
                    <p className="text-[13px] leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
                      {stepText}
                    </p>

                    {i === 0 && (
                      <a
                        href={selectedClient.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="setup-download-btn mt-2.5"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {t.downloadClient(selectedClient.name)}
                      </a>
                    )}

                    {i === 1 && (
                      <div className="mt-2.5 space-y-2">
                        {selectedClient.deeplink && (
                          <button
                            type="button"
                            onClick={handleAutoSetup}
                            disabled={!subUrl}
                            className="btn-accent w-full disabled:opacity-50"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

              {/* QR code */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setQrExpanded(!qrExpanded)}
                  className="setup-secondary-action w-full"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="3" height="3" />
                    <path d="M21 14h-3v3" />
                    <path d="M21 21h-3v-3" />
                  </svg>
                  {qrExpanded ? t.hideQrCode : t.addOtherDeviceByQR}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    style={{ marginLeft: "auto", transform: qrExpanded ? "rotate(180deg)" : "none" }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {qrExpanded && subUrl && (
                  <div className="mt-2.5 rounded-[16px] p-4" style={{ background: "var(--bg-card)" }}>
                    <p className="text-[12px] text-center mb-3" style={{ color: "var(--text-secondary)" }}>
                      {t.scanQrToImport}
                    </p>
                    {qrDataUrl && (
                      <div className="flex justify-center mb-3">
                        <img src={qrDataUrl} alt="QR" width={180} height={180} className="rounded-xl" />
                      </div>
                    )}
                    <p className="text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
                      {t.scanQrHint}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom section */}
          {renderBottomSection()}
        </div>

        {/* Footer */}
        <div className="setup-footer">
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span>Все услуги и тарифы</span>
            <span>Условия предоставления услуг</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span>Политика конфиденциальности</span>
          </div>
          <p className="text-[10px] text-center mt-0.5" style={{ color: "var(--text-muted)", opacity: 0.4 }}>Atlas Secure Service</p>
        </div>
      </div>
    </div>
  );
}
