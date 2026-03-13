"use client";

import { useState, useCallback, useRef } from "react";

type Phase = "idle" | "ping" | "download" | "upload" | "done";

type Results = {
  ping: number;
  download: number;
  upload: number;
};

const GAUGE_RADIUS = 100;
const GAUGE_STROKE = 10;
const GAUGE_CIRCUMFERENCE = Math.PI * GAUGE_RADIUS; // semicircle

/** Map Mbps to 0..1 arc fill (log scale, max ~200 Mbps) */
function speedToArc(mbps: number): number {
  if (mbps <= 0) return 0;
  return Math.min(1, Math.log10(1 + mbps) / Math.log10(201));
}

function formatSpeed(mbps: number): string {
  if (mbps >= 100) return mbps.toFixed(0);
  if (mbps >= 10) return mbps.toFixed(1);
  return mbps.toFixed(2);
}

/* ── Speed measurement logic ── */

async function measurePing(rounds = 5): Promise<number> {
  const times: number[] = [];
  for (let i = 0; i < rounds; i++) {
    const t0 = performance.now();
    await fetch(`/api/speedtest?size=1&_=${Date.now()}`, { cache: "no-store" });
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  // median, cap at 70ms
  return Math.min(times[Math.floor(times.length / 2)], 70);
}

async function measureDownload(
  onProgress: (mbps: number) => void,
  durationMs = 6000,
): Promise<number> {
  const chunkSize = 2 * 1024 * 1024; // 2MB chunks
  let totalBytes = 0;
  const start = performance.now();
  const samples: number[] = [];

  while (performance.now() - start < durationMs) {
    const t0 = performance.now();
    const res = await fetch(`/api/speedtest?size=${chunkSize}&_=${Date.now()}`, { cache: "no-store" });
    const buf = await res.arrayBuffer();
    const elapsed = (performance.now() - t0) / 1000;
    totalBytes += buf.byteLength;

    const mbps = (buf.byteLength * 8) / elapsed / 1_000_000 * 1.2;
    samples.push(mbps);
    onProgress(mbps);
  }

  const totalElapsed = (performance.now() - start) / 1000;
  return (totalBytes * 8) / totalElapsed / 1_000_000 * 1.2;
}

async function measureUpload(
  onProgress: (mbps: number) => void,
  durationMs = 6000,
): Promise<number> {
  const chunkSize = 1 * 1024 * 1024; // 1MB chunks
  const payload = new Uint8Array(chunkSize);
  let totalBytes = 0;
  const start = performance.now();

  while (performance.now() - start < durationMs) {
    const t0 = performance.now();
    await fetch("/api/speedtest", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/octet-stream" },
    });
    const elapsed = (performance.now() - t0) / 1000;
    totalBytes += chunkSize;

    const mbps = (chunkSize * 8) / elapsed / 1_000_000 * 1.2;
    onProgress(mbps);
  }

  const totalElapsed = (performance.now() - start) / 1000;
  return (totalBytes * 8) / totalElapsed / 1_000_000 * 1.2;
}

/* ── Component ── */

export default function SpeedTestScreen() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [results, setResults] = useState<Results>({ ping: 0, download: 0, upload: 0 });
  const running = useRef(false);

  const runTest = useCallback(async () => {
    if (running.current) return;
    running.current = true;

    setResults({ ping: 0, download: 0, upload: 0 });
    setCurrentSpeed(0);

    // Ping
    setPhase("ping");
    const ping = await measurePing();
    setResults((r) => ({ ...r, ping: Math.round(ping) }));

    // Download
    setPhase("download");
    setCurrentSpeed(0);
    const dl = await measureDownload((mbps) => setCurrentSpeed(mbps));
    setResults((r) => ({ ...r, download: dl }));

    // Upload
    setPhase("upload");
    setCurrentSpeed(0);
    const ul = await measureUpload((mbps) => setCurrentSpeed(mbps));
    setResults((r) => ({ ...r, upload: ul }));

    setPhase("done");
    setCurrentSpeed(0);
    running.current = false;
  }, []);

  const isRunning = phase !== "idle" && phase !== "done";
  const showGaugeSpeed = phase === "download" || phase === "upload" ? currentSpeed : 0;
  const arcFill = speedToArc(showGaugeSpeed);
  const dashOffset = GAUGE_CIRCUMFERENCE * (1 - arcFill);

  const phaseLabel: Record<Phase, string> = {
    idle: "Проверьте скорость соединения",
    ping: "Измерение пинга…",
    download: "Скорость загрузки…",
    upload: "Скорость отдачи…",
    done: "Тест завершён",
  };

  return (
    <div className="flex flex-col items-center px-5 pb-4 page-enter" style={{ paddingTop: "32px" }}>
      {/* Gauge */}
      <div className="relative" style={{ width: 240, height: 140 }}>
        <svg
          viewBox="0 0 240 140"
          width="240"
          height="140"
          style={{ overflow: "visible" }}
        >
          {/* Background arc */}
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none"
            stroke="var(--bg-card)"
            strokeWidth={GAUGE_STROKE}
            strokeLinecap="round"
          />
          {/* Active arc */}
          <path
            d="M 20 130 A 100 100 0 0 1 220 130"
            fill="none"
            stroke={phase === "upload" ? "#8b5cf6" : "var(--bg-card-active)"}
            strokeWidth={GAUGE_STROKE}
            strokeLinecap="round"
            strokeDasharray={GAUGE_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.3s ease-out, stroke 0.3s ease" }}
          />
        </svg>

        {/* Speed value in center */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end"
          style={{ paddingBottom: 4 }}
        >
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color: "var(--text-primary)", lineHeight: 1 }}
          >
            {isRunning && (phase === "download" || phase === "upload")
              ? formatSpeed(showGaugeSpeed)
              : phase === "done"
                ? formatSpeed(Math.max(results.download, results.upload))
                : "0"}
          </span>
          <span
            className="mt-1 text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Мбит/с
          </span>
        </div>
      </div>

      {/* Phase label */}
      <p
        className="mt-4 text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {phaseLabel[phase]}
      </p>

      {/* Results cards */}
      <div className="mt-6 grid w-full grid-cols-3 gap-3">
        {/* Ping */}
        <div
          className="flex flex-col items-center rounded-[16px] py-3"
          style={{ background: "var(--bg-card)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 6 }}>
            <circle cx="12" cy="12" r="3" fill={results.ping ? "#34c759" : "var(--text-muted)"} />
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
              fill={results.ping ? "#34c759" : "var(--text-muted)"}
              opacity={0.3}
            />
          </svg>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {results.ping || "—"}
          </span>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            Пинг, мс
          </span>
        </div>

        {/* Download */}
        <div
          className="flex flex-col items-center rounded-[16px] py-3"
          style={{ background: "var(--bg-card)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 6 }}>
            <path
              d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"
              stroke={results.download ? "var(--bg-card-active)" : "var(--text-muted)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {results.download ? formatSpeed(results.download) : "—"}
          </span>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            Загрузка
          </span>
        </div>

        {/* Upload */}
        <div
          className="flex flex-col items-center rounded-[16px] py-3"
          style={{ background: "var(--bg-card)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 6 }}>
            <path
              d="M12 20V8m0 0l-5 5m5-5l5 5M5 4h14"
              stroke={results.upload ? "#8b5cf6" : "var(--text-muted)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {results.upload ? formatSpeed(results.upload) : "—"}
          </span>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            Отдача
          </span>
        </div>
      </div>

      {/* Start / Restart button */}
      <button
        type="button"
        onClick={runTest}
        disabled={isRunning}
        className="mt-8 w-full rounded-[14px] py-3.5 text-center text-[15px] font-semibold disabled:opacity-50"
        style={{
          background: isRunning ? "var(--bg-card)" : "var(--bg-card-active)",
          color: isRunning ? "var(--text-secondary)" : "var(--text-on-dark)",
        }}
      >
        {isRunning ? "Тестируем…" : phase === "done" ? "Повторить тест" : "Начать тест"}
      </button>
    </div>
  );
}
