/**
 * Reliable way to open custom URL scheme (e.g. v2raytun://) from Telegram Mini App.
 * WebView blocks window.location.href for custom schemes; openLink or link click works.
 */
export function openDeepLink(url: string): void {
  if (typeof window === "undefined") return;

  const tg = (window as unknown as { Telegram?: { WebApp?: { openLink?: (url: string) => void } } })
    .Telegram?.WebApp;

  if (tg?.openLink) {
    try {
      tg.openLink(url);
      return;
    } catch (e) {
      console.warn("openLink failed:", e);
    }
  }

  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("target", "_blank");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
