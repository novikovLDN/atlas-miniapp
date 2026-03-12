export function openTelegramLink(url: string) {
  if (typeof window === "undefined") return;
  const tg = (
    window as unknown as {
      Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } };
    }
  ).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}
