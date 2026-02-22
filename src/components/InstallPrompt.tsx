"use client";

const V2RAYTUN_IOS = "https://apps.apple.com/app/v2raytun/id6476628951";
const V2RAYTUN_ANDROID = "https://play.google.com/store/apps/details?id=com.v2raytun.android";

type InstallPromptProps = {
  onClose: () => void;
};

export default function InstallPrompt({ onClose }: InstallPromptProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-[999] bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed bottom-6 left-4 right-4 z-[1000]"
        style={{
          background: "rgba(15, 25, 40, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        <p className="mb-2 font-semibold text-white">
          Установите v2RayTun
        </p>
        <p
          className="mb-4 text-sm"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Для подключения необходимо приложение v2RayTun
        </p>
        <a
          href={V2RAYTUN_IOS}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button block w-full text-center no-underline"
        >
          📱 Установить для iOS
        </a>
        <a
          href={V2RAYTUN_ANDROID}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button-secondary mt-2 block w-full text-center no-underline"
        >
          🤖 Установить для Android
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full cursor-pointer border-0 bg-transparent text-sm"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Закрыть
        </button>
      </div>
    </>
  );
}
